import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { Note, Paginated } from '../types';
import { Pager } from '../components/Pager';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { Modal } from '../components/Modal';

/** Deterministic accent per note so the board has gentle, stable colour variety. */
const ACCENTS = ['#818cf8', '#a78bfa', '#f472b6', '#38bdf8', '#34d399', '#fbbf24'];
const accentFor = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export const Notes = () => {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<Note> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Create-modal state.
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit-modal state.
  const [editing, setEditing] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api<Paginated<Note>>(`/notes?page=${page}&limit=6`);
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

  const openCreate = () => {
    setTitle('');
    setContent('');
    setCreating(true);
  };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api('/notes', { method: 'POST', body: { title, content } });
      setCreating(false);
      if (page !== 1) setPage(1);
      else await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (note: Note) => {
    setEditing(note);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setError('');
    setSavingEdit(true);
    try {
      await api(`/notes/${editing._id}`, {
        method: 'PUT',
        body: { title: editTitle, content: editContent },
      });
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingEdit(false);
    }
  };

  const remove = async (id: string) => {
    setError('');
    setDeletingId(id);
    try {
      await api(`/notes/${id}`, { method: 'DELETE' });
      // If we just removed the last item on a page beyond the first, step back.
      if (result && result.data.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const notes = result?.data ?? [];

  return (
    <div className="container">
      <div className="notes-header">
        <div>
          <h2>My Notes</h2>
          <p className="page-subtitle">Your private workspace — only you can see these.</p>
        </div>
        <div className="notes-header__actions">
          {result && <span className="note-count">{result.pagination.total} total</span>}
          <Button onClick={openCreate} className="btn-cta">
            <span className="btn-plus">+</span> New note
          </Button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {/* ---------- Board ---------- */}
      {loading && !result ? (
        <div className="loading-wrap">
          <Spinner size="lg" dark />
          Loading notes…
        </div>
      ) : notes.length === 0 ? (
        <div className="note-empty">
          <div className="note-empty__icon">🗒️</div>
          <h3>No notes yet</h3>
          <p className="muted">Your notes will show up here. Create your first one above.</p>
        </div>
      ) : (
        <>
          <div className="notes-grid">
            {notes.map((note, i) => (
              <article
                key={note._id}
                className="note-card"
                style={{ ['--accent' as string]: accentFor(note._id), ['--i' as string]: i }}
              >
                <h3 className="note-card__title">{note.title}</h3>
                <p className="note-card__body">{note.content}</p>
                <div className="note-card__footer">
                  <span className="note-card__date">{formatDate(note.createdAt)}</span>
                  <div className="note-card__actions">
                    <button
                      className="icon-btn"
                      title="Edit note"
                      aria-label="Edit note"
                      onClick={() => openEdit(note)}
                    >
                      ✎
                    </button>
                    <button
                      className="icon-btn icon-btn--danger"
                      title="Delete note"
                      aria-label="Delete note"
                      disabled={deletingId === note._id}
                      onClick={() => remove(note._id)}
                    >
                      {deletingId === note._id ? <Spinner dark /> : '🗑'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {result && <Pager pagination={result.pagination} loading={loading} onChange={setPage} />}
        </>
      )}

      {/* ---------- Create modal ---------- */}
      {creating && (
        <Modal title="New note" onClose={() => setCreating(false)}>
          <form onSubmit={create} className="modal-form">
            <input
              className="composer-title"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
            <textarea
              className="composer-body"
              placeholder="Write something…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
            />
            <div className="composer-actions">
              <button type="button" className="btn-ghost" onClick={() => setCreating(false)}>
                Cancel
              </button>
              <Button type="submit" loading={submitting}>
                Add note
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------- Edit modal ---------- */}
      {editing && (
        <Modal title="Edit note" onClose={() => setEditing(null)}>
          <form onSubmit={saveEdit} className="modal-form">
            <input
              className="composer-title"
              placeholder="Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              autoFocus
            />
            <textarea
              className="composer-body"
              placeholder="Write something…"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
            />
            <div className="composer-actions">
              <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <Button type="submit" loading={savingEdit}>
                Save changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
