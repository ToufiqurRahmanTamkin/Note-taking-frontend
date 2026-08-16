import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { Note, Paginated } from '../types';
import { Pager } from '../components/Pager';

export const Notes = () => {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<Note> | null>(null);
  const [error, setError] = useState('');

  // Create/edit form state.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await api<Paginated<Note>>(`/notes?page=${page}&limit=5`);
      setResult(res);
    } catch (err) {
      setError((err as Error).message);
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
    }
  };

  const edit = (note: Note) => {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
  };

  const remove = async (id: string) => {
    try {
      await api(`/notes/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError((err as Error).message);
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
          style={{ width: '100%' }}
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          style={{ width: '100%' }}
        />
        <div className="row">
          <button type="submit">{editingId ? 'Save' : 'Add note'}</button>
          {editingId && (
            <button type="button" className="btn-ghost" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

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
            <button className="btn-danger" onClick={() => remove(note._id)}>
              Delete
            </button>
          </div>
        </div>
      ))}

      {result && result.data.length === 0 && <p>No notes yet.</p>}
      {result && <Pager pagination={result.pagination} onChange={setPage} />}
    </div>
  );
};
