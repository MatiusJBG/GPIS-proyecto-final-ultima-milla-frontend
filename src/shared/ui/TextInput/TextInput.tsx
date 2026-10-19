import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import './TextInput.css';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
  helperText?: string | undefined;
  isRequired?: boolean | undefined;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, helperText, isRequired = false, id: providedId, className = '', ...rest }, ref) => {
    const generatedId = useId();
    const inputId = providedId || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy = [
      error ? errorId : undefined,
      helperText ? helperId : undefined,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className={`ui-input-field ${error ? 'ui-input-field--error' : ''} ${className}`}>
        <label htmlFor={inputId} className="ui-input-label">
          {label}
          {isRequired && <span className="ui-input-required-mark" aria-hidden="true"> *</span>}
        </label>
        
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="ui-input-control"
          {...rest}
        />

        {error && (
          <p id={errorId} className="ui-input-message ui-input-message--error" role="alert">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="ui-input-message ui-input-message--helper">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';
