import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [interests, setInterests] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const list = interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await register(name, email, password, list);
      navigate('/notes');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="container form-narrow">
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ width: '100%' }}
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%' }}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%' }}
          required
        />
        <input
          placeholder="Interests (comma separated, e.g. chess, reading)"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          style={{ width: '100%' }}
        />
        <button type="submit" style={{ width: '100%' }}>
          Create account
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};
