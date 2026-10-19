import type { FC, HTMLAttributes } from 'react';
import './Card.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'outlined' | 'flat' | undefined;
}

export const Card: FC<CardProps> = ({
  children,
  variant = 'elevated',
  className = '',
  ...rest
}) => {
  return (
    <div className={`ui-card ui-card--${variant} ${className}`} {...rest}>
      {children}
    </div>
  );
};
