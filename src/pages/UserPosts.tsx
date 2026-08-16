import { FormEvent, useState } from 'react';
import { api } from '../api/client';
import { Button } from '../components/Button';

interface PostView {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}
interface UserPostsResult {
  _id: string;
  name: string;
  email: string;
  postCount: number;
  posts: PostView[];
}

/** Scenario 2 view: all posts for a user, fetched via the server's $lookup pipeline. */
export const UserPosts = () => {
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState<UserPostsResult | null>(null);
  const [error, setError] = useState('');

  const [fetching, setFetching] = useState(false);

  // Optional helper: create a post for the current user to have data to look up.
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchPosts = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setFetching(true);
    try {
      const res = await api<{ data: UserPostsResult }>(`/aggregations/users/${userId}/posts`);
      setResult(res.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setFetching(false);
    }
  };

  const createPost = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setPosting(true);
    try {
      await api('/posts', { method: 'POST', body: { title, body } });
      setTitle('');
      setBody('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="container">
      <h2>Posts by user ($lookup)</h2>

      <form onSubmit={createPost} className="card">
        <h3>Create a post (as yourself)</h3>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: '100%' }}
          required
        />
        <textarea
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          style={{ width: '100%' }}
        />
        <Button type="submit" loading={posting}>
          Add post
        </Button>
      </form>

      <form onSubmit={fetchPosts} className="card row">
        <input
          placeholder="User id to look up"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ flex: 1 }}
          required
        />
        <Button type="submit" loading={fetching}>
          Fetch posts
        </Button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="card">
          <strong>
            {result.name} ({result.email}) — {result.postCount} post(s)
          </strong>
          {result.posts.map((p) => (
            <div key={p.id} style={{ borderTop: '1px solid #eee', paddingTop: 8, marginTop: 8 }}>
              <strong>{p.title}</strong>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
