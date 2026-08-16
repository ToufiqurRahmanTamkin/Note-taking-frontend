import { Pagination } from '../types';

interface Props {
  pagination: Pagination;
  onChange: (page: number) => void;
}

/** Reusable prev/next pager driven by the backend pagination metadata. */
export const Pager = ({ pagination, onChange }: Props) => (
  <div className="pager">
    <button
      className="btn-ghost"
      disabled={!pagination.hasPrevPage}
      onClick={() => onChange(pagination.page - 1)}
    >
      ‹ Prev
    </button>
    <span>
      Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
    </span>
    <button
      className="btn-ghost"
      disabled={!pagination.hasNextPage}
      onClick={() => onChange(pagination.page + 1)}
    >
      Next ›
    </button>
  </div>
);
