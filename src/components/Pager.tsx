import { Pagination } from '../types';

interface Props {
  pagination: Pagination;
  onChange: (page: number) => void;
}

/** Reusable prev/next pager driven by the backend pagination metadata. */
export const Pager = ({ pagination, onChange }: Props) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
    <button disabled={!pagination.hasPrevPage} onClick={() => onChange(pagination.page - 1)}>
      Prev
    </button>
    <span>
      Page {pagination.page} / {pagination.totalPages} ({pagination.total} total)
    </span>
    <button disabled={!pagination.hasNextPage} onClick={() => onChange(pagination.page + 1)}>
      Next
    </button>
  </div>
);
