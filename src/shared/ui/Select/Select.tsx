import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean | undefined;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string | undefined;
  error?: string | undefined;
  helperText?: string | undefined;
  isRequired?: boolean | undefined;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      placeholder,
      error,
      helperText,
      isRequired = false,
      id: providedId,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = providedId || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const describedBy = [
      error ? errorId : undefined,
      helperText ? helperId : undefined,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className={`ui-select-field ${error ? 'ui-select-field--error' : ''} ${className}`}>
        <label htmlFor={selectId} className="ui-select-label">
          {label}
          {isRequired && <span className="ui-select-required-mark" aria-hidden="true"> *</span>}
        </label>

        <div className="ui-select-wrapper">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className="ui-select-control"
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="ui-select-chevron" aria-hidden="true">
            ▼
          </span>
        </div>

        {error && (
          <p id={errorId} className="ui-select-message ui-select-message--error" role="alert">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="ui-select-message ui-select-message--helper">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
