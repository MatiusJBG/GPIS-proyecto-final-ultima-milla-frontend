import type { FC, ReactNode } from 'react';
import './Alert.css';

export interface AlertProps {
  type?: 'info' | 'success' | 'error' | 'warning' | undefined;
  title?: string | undefined;
  children: ReactNode;
  onClose?: (() => void) | undefined;
}

export const Alert: FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
}) => {
  return (
    <div
      className={`ui-alert ui-alert--${type}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      <div className="ui-alert__icon" aria-hidden="true">
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </div>

      <div className="ui-alert__body">
        {title && <strong className="ui-alert__title">{title}</strong>}
        <div className="ui-alert__content">{children}</div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ui-alert__close"
          aria-label="Cerrar notificación"
        >
          ×
        </button>
      )}
    </div>
  );
};
