import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { InterestGroup } from '../types';

/** Scenario 1 view: users grouped by interest (single $aggregate on the server). */
export const Interests = () => {
  const [groups, setGroups] = useState<InterestGroup[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api<{ data: InterestGroup[] }>('/aggregations/users-by-interest')
      .then((res) => setGroups(res.data))
      .catch((err) => setError((err as Error).message));
  }, []);

  return (
    <div className="container">
      <h2>Users grouped by interest</h2>
      {error && <p className="error">{error}</p>}
      {groups.length === 0 && !error && <p>No interests recorded yet.</p>}
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
