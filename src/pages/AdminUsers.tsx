import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { Paginated, User } from '../types';
import { Pager } from '../components/Pager';

const emptyForm = { name: '', email: '', password: '', role: 'user', interests: '' };

export const AdminUsers = () => {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<User> | null>(null);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const load = useCallback(async () => {
    setError('');
    try {
      setResult(await api<Paginated<User>>(`/users?page=${page}&limit=5`));
    } catch (err) {
      setError((err as Error).message);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const interests = form.interests
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      if (editingId) {
        const body: Record<string, unknown> = {
          name: form.name,
          email: form.email,
          role: form.role,
          interests,
        };
        if (form.password) body.password = form.password;
        await api(`/users/${editingId}`, { method: 'PUT', body });
      } else {
        await api('/users', {
          method: 'POST',
          body: { ...form, interests },
        });
      }
      resetForm();
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const edit = (u: User) => {
    setEditingId(u._id);
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      interests: u.interests.join(', '),
    });
  };

  const remove = async (id: string) => {
    try {
      await api(`/users/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="container">
      <h2>Manage Users</h2>

      <form onSubmit={submit} className="card">
        <h3>{editingId ? 'Edit user' : 'Add user'}</h3>
        <div className="row">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            placeholder={editingId ? 'New password (optional)' : 'Password'}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editingId}
          />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <input
          placeholder="Interests (comma separated)"
          value={form.interests}
          onChange={(e) => setForm({ ...form, interests: e.target.value })}
          style={{ width: '100%' }}
        />
        <div className="row">
          <button type="submit">{editingId ? 'Save' : 'Add user'}</button>
          {editingId && (
            <button type="button" className="btn-ghost" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Interests</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {result?.data.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'admin' : ''}`}>{u.role}</span>
                </td>
                <td>{u.interests.join(', ')}</td>
                <td>
                  <div className="row">
                    <button className="btn-ghost" onClick={() => edit(u)}>
                      Edit
                    </button>
                    <button className="btn-danger" onClick={() => remove(u._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result && <Pager pagination={result.pagination} onChange={setPage} />}
    </div>
  );
};
