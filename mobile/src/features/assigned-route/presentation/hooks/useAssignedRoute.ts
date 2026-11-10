import {useCallback, useState} from 'react';

import type {GetAssignedRouteUseCase} from '../../application/getAssignedRouteUseCase';
import type {AssignedRoute} from '../../domain/assignedRoute';

export type AssignedRouteState =
  | {readonly kind: 'idle'}
  | {readonly kind: 'loading'}
  | {readonly kind: 'empty'}
  | {readonly kind: 'ready'; readonly route: AssignedRoute}
  | {readonly kind: 'error'; readonly message: string};

export function useAssignedRoute() {
  const [state, setState] = useState<AssignedRouteState>({kind: 'idle'});

  const load = useCallback(
    async (getAssignedRoute: GetAssignedRouteUseCase, courierId: string) => {
      setState({kind: 'loading'});
      try {
        const route = await getAssignedRoute.execute(courierId);
        setState(route === null ? {kind: 'empty'} : {kind: 'ready', route});
      } catch (error) {
        setState({
          kind: 'error',
          message: error instanceof Error ? error.message : 'No fue posible consultar la ruta.',
        });
      }
    },
    [],
  );

  return {load, state};
}
