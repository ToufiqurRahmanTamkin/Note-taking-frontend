import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { Note, Paginated } from '../types';
import { Pager } from '../components/Pager';

/** Admin view of everyone's notes (optionally filtered by a user id). */
export const AdminNotes = () => {
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState<Paginated<Note> | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const q = new URLSearchParams({ page: String(page), limit: '5' });
      if (userId) q.set('userId', userId);
      setResult(await api<Paginated<Note>>(`/notes?${q.toString()}`));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [page, userId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="container">
      <h2>All Notes (admin)</h2>

      <div className="card row">
        <input
          placeholder="Filter by user id (optional)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          onClick={() => {
            setPage(1);
            load();
          }}
        >
          Apply
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Content</th>
            <th>Owner</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {result?.data.map((n) => (
            <tr key={n._id}>
              <td>{n.title}</td>
              <td>{n.content}</td>
              <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{n.owner}</td>
              <td>{new Date(n.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {result && <Pager pagination={result.pagination} onChange={setPage} />}
    </div>
  );
};
