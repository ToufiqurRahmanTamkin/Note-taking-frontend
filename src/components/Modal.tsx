import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Wider modal for content-heavy views (e.g. a poster's full post list). */
  wide?: boolean;
}

/**
 * Shared dark, glassy modal shell used across notes and posts. Closes on
 * Escape or backdrop click. Rendered via a portal straight into <body> so it
 * always sits above the navbar, regardless of any transform/animation on an
 * ancestor (a CSS transform creates a new stacking context that would
 * otherwise trap the modal's z-index below the nav's).
 */
export const Modal = ({ title, onClose, children, wide }: Props) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className={`modal ${wide ? 'modal--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
};
