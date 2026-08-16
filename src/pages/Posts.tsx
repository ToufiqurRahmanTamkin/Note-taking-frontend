import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { Poster, Privacy, UserPostsResult } from '../types';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join('');

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

/** Directory of everyone who has posted, plus a form to share a new public/private post. */
export const Posts = () => {
  const { user } = useAuth();

  const [posters, setPosters] = useState<Poster[]>([]);
  const [loadingPosters, setLoadingPosters] = useState(true);
  const [error, setError] = useState('');

  // Create-post modal.
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [privacy, setPrivacy] = useState<Privacy>('public');
  const [posting, setPosting] = useState(false);

  // Viewing one poster's notes — by id, so it works both from a poster card
  // and from pasting a copied user id into the search box below.
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [viewResult, setViewResult] = useState<UserPostsResult | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState('');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search-by-user-id box (e.g. an id copied from a poster card below).
  const [searchId, setSearchId] = useState('');

  const loadPosters = useCallback(async () => {
    setError('');
    setLoadingPosters(true);
    try {
      const res = await api<{ data: Poster[] }>('/posts/posters');
      setPosters(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingPosters(false);
    }
  }, []);

  useEffect(() => {
    loadPosters();
  }, [loadPosters]);

  const openCreate = () => {
    setTitle('');
    setBody('');
    setPrivacy('public');
    setCreating(true);
  };

  const createPost = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setPosting(true);
    try {
      await api('/posts', { method: 'POST', body: { title, body, privacy } });
      setCreating(false);
      await loadPosters();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPosting(false);
    }
  };

  const openView = async (id: string) => {
    setViewingId(id);
    setViewResult(null);
    setViewError('');
    setViewLoading(true);
    try {
      const res = await api<{ data: UserPostsResult }>(`/aggregations/users/${id}/posts`);
      setViewResult(res.data);
    } catch (err) {
      setViewError((err as Error).message);
    } finally {
      setViewLoading(false);
    }
  };

  const searchById = (e: FormEvent) => {
    e.preventDefault();
    const id = searchId.trim();
    if (id) openView(id);
  };

  // If the id being viewed belongs to a poster already in the directory, use
  // their name for an instant modal title while the fetch is in flight.
  const knownPoster = posters.find((p) => p.id === viewingId);
  const viewTitle = viewResult ? `${viewResult.name}'s notes` : knownPoster ? `${knownPoster.name}'s notes` : 'Notes';

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
    } catch {
      setError('Could not copy to clipboard');
    }
  };

  return (
    <div className="container">
      <div className="notes-header">
        <div>
          <h2>Posts</h2>
          <p className="page-subtitle">Share a note publicly, or keep it private just for you.</p>
        </div>
        <div className="notes-header__actions">
          <Button onClick={openCreate} className="btn-cta">
            <span className="btn-plus">+</span> Share a note
          </Button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <form onSubmit={searchById} className="card">
        <h3>Search notes by user ID</h3>
        <p className="muted">Paste a user id copied from a poster card below to jump straight to their notes.</p>
        <div className="row">
          <input
            className="mono"
            placeholder="Paste a user id…"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button type="submit" loading={viewLoading && viewingId === searchId.trim()} disabled={!searchId.trim()}>
            View notes
          </Button>
        </div>
      </form>

      <h3 className="section-heading">Posters</h3>

      {loadingPosters ? (
        <div className="loading-wrap">
          <Spinner size="lg" dark />
          Loading posters…
        </div>
      ) : posters.length === 0 ? (
        <div className="note-empty">
          <div className="note-empty__icon">📭</div>
          <h3>No posts yet</h3>
          <p className="muted">Be the first to share a note.</p>
        </div>
      ) : (
        <div className="posters-grid">
          {posters.map((p, i) => (
            <article className="poster-card" key={p.id} style={{ ['--i' as string]: i }}>
              <div className="poster-card__top">
                <div className="poster-avatar">{initials(p.name)}</div>
                <div className="poster-card__who">
                  <strong>{p.name}</strong>
                  <span className="muted">{p.email}</span>
                </div>
                {user?.id === p.id && <span className="badge">you</span>}
              </div>

              <div className="poster-card__stat">
                <span className="poster-card__stat-num">{p.publicPostCount}</span>
                <span className="muted">public note{p.publicPostCount === 1 ? '' : 's'}</span>
              </div>

              <div className="poster-card__id">
                <span className="mono poster-card__id-text" title={p.id}>
                  {p.id}
                </span>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Copy user id"
                  title="Copy user id"
                  onClick={() => copyId(p.id)}
                >
                  {copiedId === p.id ? '✓' : '⧉'}
                </button>
              </div>

              <button type="button" className="btn-ghost poster-card__view" onClick={() => openView(p.id)}>
                View all notes
              </button>
            </article>
          ))}
        </div>
      )}

      {/* ---------- Create post modal ---------- */}
      {creating && (
        <Modal title="Share a note" onClose={() => setCreating(false)}>
          <form onSubmit={createPost} className="modal-form">
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
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
            />

            <div className="privacy-toggle" role="radiogroup" aria-label="Privacy">
              <button
                type="button"
                role="radio"
                aria-checked={privacy === 'public'}
                className={`privacy-option ${privacy === 'public' ? 'is-active' : ''}`}
                onClick={() => setPrivacy('public')}
              >
                🌐 Public
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={privacy === 'private'}
                className={`privacy-option ${privacy === 'private' ? 'is-active' : ''}`}
                onClick={() => setPrivacy('private')}
              >
                🔒 Private
              </button>
            </div>
            <p className="muted privacy-hint">
              {privacy === 'public'
                ? 'Anyone can see this note and it counts toward your public total.'
                : 'Only you (and admins) can see this note.'}
            </p>

            <div className="composer-actions">
              <button type="button" className="btn-ghost" onClick={() => setCreating(false)}>
                Cancel
              </button>
              <Button type="submit" loading={posting}>
                Post
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------- View a poster's notes ---------- */}
      {viewingId && (
        <Modal title={viewTitle} onClose={() => setViewingId(null)} wide>
          {viewLoading ? (
            <div className="loading-wrap">
              <Spinner size="lg" dark />
              Loading…
            </div>
          ) : viewError ? (
            <p className="error">{viewError}</p>
          ) : viewResult ? (
            <>
              <p className="muted view-summary">
                {viewResult.email} · {viewResult.postCount} note{viewResult.postCount === 1 ? '' : 's'} visible to you
              </p>
              {viewResult.posts.length === 0 ? (
                <div className="note-empty">
                  <div className="note-empty__icon">🗒️</div>
                  <h3>Nothing to show</h3>
                  <p className="muted">This user has no visible notes yet.</p>
                </div>
              ) : (
                <div className="view-list">
                  {viewResult.posts.map((p) => (
                    <div key={p.id} className="view-list__item">
                      <div className="view-list__head">
                        <strong>{p.title}</strong>
                        <span className={`badge ${p.privacy === 'private' ? 'private' : ''}`}>
                          {p.privacy === 'private' ? '🔒 private' : '🌐 public'}
                        </span>
                      </div>
                      {p.body && <p className="view-list__body">{p.body}</p>}
                      <span className="note-card__date">{formatDate(p.createdAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </Modal>
      )}
    </div>
  );
};
