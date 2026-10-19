import type { ButtonHTMLAttributes, FC, ReactNode } from 'react';
import { Spinner } from '../Spinner/Spinner.js';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
  isLoading?: boolean | undefined;
  leftIcon?: ReactNode | undefined;
  rightIcon?: ReactNode | undefined;
}

export const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  type = 'button',
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={`ui-btn ui-btn--${variant} ui-btn--${size} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <span className="ui-btn__loader">
          <Spinner size={size === 'lg' ? 'md' : 'sm'} />
        </span>
      ) : (
        leftIcon && <span className="ui-btn__icon ui-btn__icon--left">{leftIcon}</span>
      )}
      <span className="ui-btn__content">{children}</span>
      {!isLoading && rightIcon && (
        <span className="ui-btn__icon ui-btn__icon--right">{rightIcon}</span>
      )}
    </button>
  );
};
