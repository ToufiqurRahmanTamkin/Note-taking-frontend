import { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

/**
 * Button that shows a spinner and disables itself while `loading` is true,
 * so any action awaiting an API response has visible in-flight feedback.
 */
export const Button = ({ loading, disabled, children, className, ...rest }: Props) => (
  <button className={className} disabled={disabled || loading} {...rest}>
    <span className="btn-content">
      {loading && <Spinner dark={className?.includes('btn-ghost')} />}
      {children}
    </span>
  </button>
);
