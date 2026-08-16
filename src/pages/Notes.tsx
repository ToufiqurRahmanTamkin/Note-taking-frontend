import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { Note, Paginated } from '../types';
import { Pager } from '../components/Pager';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';

/** Deterministic accent per note so the board has gentle, stable colour variety. */
const ACCENTS = ['#6366f1', '#8b5cf6', '#ec4899', '#0ea5e9', '#10b981', '#f59e0b'];
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

  // Composer (create) state.
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit-modal state — editing happens in an overlay instead of scrolling away.
  const [editing, setEditing] = useState<Note | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const composerContentRef = useRef<HTMLTextAreaElement>(null);

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

  // Close the edit modal on Escape for keyboard users.
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setEditing(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing]);

  const closeComposer = () => {
    setComposerOpen(false);
    setTitle('');
    setContent('');
  };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api('/notes', { method: 'POST', body: { title, content } });
      closeComposer();
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
        <h2>My Notes</h2>
        {result && <span className="note-count">{result.pagination.total} total</span>}
      </div>

      {/* ---------- Composer ---------- */}
      <form className={`composer ${composerOpen ? 'is-open' : ''}`} onSubmit={create}>
        {!composerOpen ? (
          <button
            type="button"
            className="composer-trigger"
            onClick={() => {
              setComposerOpen(true);
              setTimeout(() => composerContentRef.current?.focus(), 0);
            }}
          >
            <span className="composer-trigger__icon">+</span>
            Take a note…
          </button>
        ) : (
          <>
            <input
              className="composer-title"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              ref={composerContentRef}
              className="composer-body"
              placeholder="Write something…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
            <div className="composer-actions">
              <button type="button" className="btn-ghost" onClick={closeComposer}>
                Cancel
              </button>
              <Button type="submit" loading={submitting}>
                Add note
              </Button>
            </div>
          </>
        )}
      </form>

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
            {notes.map((note) => (
              <article
                key={note._id}
                className="note-card"
                style={{ ['--accent' as string]: accentFor(note._id) }}
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

      {/* ---------- Edit modal ---------- */}
      {editing && (
        <div className="modal-overlay" onMouseDown={() => setEditing(null)}>
          <form
            className="modal"
            onMouseDown={(e) => e.stopPropagation()}
            onSubmit={saveEdit}
          >
            <div className="modal-header">
              <h3>Edit note</h3>
              <button
                type="button"
                className="icon-btn"
                aria-label="Close"
                onClick={() => setEditing(null)}
              >
                ✕
              </button>
            </div>
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
        </div>
      )}
    </div>
  );
};
