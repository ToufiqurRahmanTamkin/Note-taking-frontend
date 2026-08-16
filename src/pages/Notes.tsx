import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { Note, Paginated } from '../types';
import { Pager } from '../components/Pager';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';

export const Notes = () => {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<Note> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Create/edit form state.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api<Paginated<Note>>(`/notes?page=${page}&limit=5`);
      setResult(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (editingId) {
        await api(`/notes/${editingId}`, { method: 'PUT', body: { title, content } });
      } else {
        await api('/notes', { method: 'POST', body: { title, content } });
      }
      resetForm();
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const edit = (note: Note) => {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
  };

  const remove = async (id: string) => {
    setError('');
    setDeletingId(id);
    try {
      await api(`/notes/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container">
      <h2>My Notes</h2>

      <form onSubmit={submit} className="card">
        <h3>{editingId ? 'Edit note' : 'New note'}</h3>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        <div className="row">
          <Button type="submit" loading={submitting}>
            {editingId ? 'Save' : 'Add note'}
          </Button>
          {editingId && (
            <button type="button" className="btn-ghost" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      {loading && !result ? (
        <div className="loading-wrap">
          <Spinner size="lg" dark />
          Loading notes…
        </div>
      ) : (
        <>
          {result?.data.map((note) => (
            <div key={note._id} className="card">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>{note.title}</strong>
                <span className="muted">{new Date(note.createdAt).toLocaleString()}</span>
              </div>
              <p>{note.content}</p>
              <div className="row">
                <button className="btn-ghost" onClick={() => edit(note)}>
                  Edit
                </button>
                <Button
                  className="btn-danger"
                  loading={deletingId === note._id}
                  onClick={() => remove(note._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {result && result.data.length === 0 && <p>No notes yet.</p>}
          {result && <Pager pagination={result.pagination} loading={loading} onChange={setPage} />}
        </>
      )}
    </div>
  );
};
