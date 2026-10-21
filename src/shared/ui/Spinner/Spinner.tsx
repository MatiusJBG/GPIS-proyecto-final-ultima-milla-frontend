import type { FC } from 'react';
import './Spinner.css';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | undefined;
  label?: string | undefined;
}

export const Spinner: FC<SpinnerProps> = ({ size = 'md', label = 'Cargando...' }) => {
  return (
    <output className={`ui-spinner-wrapper ui-spinner--${size}`}>
      <svg
        className="ui-spinner-svg"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          className="ui-spinner-track"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="ui-spinner-indicator"
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </output>
  );
};
