export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly details?: unknown,
  ) {
    const detailMessage =
      typeof details === 'object' && details !== null && 'message' in details
        ? String((details as { message: unknown }).message)
        : undefined;

    super(detailMessage || `Error HTTP ${status}: ${statusText}`);
    this.name = 'HttpError';
  }
}

export type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string> | undefined;
};

export interface HttpClient {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T>;
  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T>;
  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T>;
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T>;
}

function isTimeout(error: unknown): boolean {
  return error instanceof Error && error.name === 'TimeoutError';
}

export class FetchHttpClient implements HttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string, private readonly timeoutMs = 15_000) {
    if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 2_147_483_647) {
      throw new Error('El timeout HTTP debe ser un entero positivo en milisegundos.');
    }
    const rawBaseUrl = baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:3000';
    this.baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  }

  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.baseUrl}${cleanEndpoint}`;
  }

  private async readResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const text = await response.text();
      let details: unknown = text;
      try { details = JSON.parse(text); } catch { /* Preserve text/HTML proxy errors. */ }
      throw new HttpError(response.status, response.statusText, details);
    }
    if (response.status === 204) return undefined as T;
    return response.headers.get('content-type')?.includes('application/json')
      ? await response.json() as T
      : await response.text() as T;
  }

  private async request<T>(endpoint: string, init: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint);

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...init.headers,
    };

    let body = init.body;
    if (init.body && typeof init.body === 'object' && !(init.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(init.body);
    }

    const { headers: _ignoredHeaders, body: _ignoredBody, ...restInit } = init;
    const fetchConfig: RequestInit = {
      ...restInit,
      headers,
      signal: init.signal
        ? AbortSignal.any([init.signal, AbortSignal.timeout(this.timeoutMs)])
        : AbortSignal.timeout(this.timeoutMs),
    };

    if (body !== undefined) {
      fetchConfig.body = body;
    }

    try {
      const response = await fetch(url, fetchConfig);

      return await this.readResponse<T>(response);
    } catch (networkError) {
      if (networkError instanceof HttpError) throw networkError;
      if (isTimeout(networkError) ||
          (fetchConfig.signal?.aborted && isTimeout(fetchConfig.signal.reason))) {
        const uncertainWrite = init.method !== 'GET';
        const message = uncertainWrite
          ? 'No se recibió confirmación del servidor. Consulta el listado antes de volver a registrar la operación.'
          : 'El servidor superó el tiempo de espera. Intenta consultar nuevamente.';
        throw new HttpError(0, 'TimeoutError', { message });
      }
      const message = networkError instanceof Error ? networkError.message : 'Error de red';
      throw new HttpError(0, 'NetworkError', { message: `No se pudo conectar con el servidor: ${message}` });
    }
  }

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const init: RequestOptions = {
      ...options,
      method: 'POST',
    };
    if (body !== undefined) {
      init.body = body as BodyInit;
    }
    return this.request<T>(endpoint, init);
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const init: RequestOptions = {
      ...options,
      method: 'PUT',
    };
    if (body !== undefined) {
      init.body = body as BodyInit;
    }
    return this.request<T>(endpoint, init);
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const defaultHttpClient = new FetchHttpClient();
