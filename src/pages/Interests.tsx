import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { InterestGroup } from '../types';
import { Spinner } from '../components/Spinner';

/** Scenario 1 view: users grouped by interest (single $aggregate on the server). */
export const Interests = () => {
  const [groups, setGroups] = useState<InterestGroup[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ data: InterestGroup[] }>('/aggregations/users-by-interest')
      .then((res) => setGroups(res.data))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <h2>Users grouped by interest</h2>
      {loading && (
        <div className="loading-wrap">
          <Spinner size="lg" dark />
          Loading…
        </div>
      )}
      {error && <p className="error">{error}</p>}
      {!loading && groups.length === 0 && !error && <p>No interests recorded yet.</p>}
      {groups.map((g) => (
        <div key={g.interest} className="card">
          <strong>
            {g.interest} — {g.userCount} user(s)
          </strong>
          <ul>
            {g.users.map((u) => (
              <li key={u.id}>
                {u.name} ({u.email})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
