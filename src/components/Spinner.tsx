interface Props {
  size?: 'sm' | 'lg';
  /** Use the tinted (indigo) variant on light backgrounds. */
  dark?: boolean;
}

/** Small CSS spinner used inside buttons and as a section loading indicator. */
export const Spinner = ({ size = 'sm', dark }: Props) => (
  <span className={`spinner ${size === 'lg' ? 'lg' : ''} ${dark ? 'dark' : ''}`} aria-label="loading" />
);
