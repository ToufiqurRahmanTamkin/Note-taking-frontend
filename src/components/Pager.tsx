import { Pagination } from '../types';

interface Props {
  pagination: Pagination;
  onChange: (page: number) => void;
  /** Disable navigation while a page fetch is in flight. */
  loading?: boolean;
}

/** Reusable prev/next pager driven by the backend pagination metadata. */
export const Pager = ({ pagination, onChange, loading }: Props) => (
  <div className="pager">
    <button
      className="btn-ghost"
      disabled={loading || !pagination.hasPrevPage}
      onClick={() => onChange(pagination.page - 1)}
    >
      ‹ Prev
    </button>
    <span>
      Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
    </span>
    <button
      className="btn-ghost"
      disabled={loading || !pagination.hasNextPage}
      onClick={() => onChange(pagination.page + 1)}
    >
      Next ›
    </button>
  </div>
);
