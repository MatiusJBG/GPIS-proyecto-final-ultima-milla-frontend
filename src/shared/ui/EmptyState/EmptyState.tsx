import type { FC, ReactNode } from 'react';
import './EmptyState.css';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode | undefined;
  action?: ReactNode | undefined;
}

export const EmptyState: FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <div className="ui-empty-state">
      <div className="ui-empty-state__icon" aria-hidden="true">
        {icon || (
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        )}
      </div>
      <h3 className="ui-empty-state__title">{title}</h3>
      <p className="ui-empty-state__description">{description}</p>
      {action && <div className="ui-empty-state__action">{action}</div>}
    </div>
  );
};
