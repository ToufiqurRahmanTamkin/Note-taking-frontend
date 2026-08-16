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
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo">N</div>
        <h2>Create account</h2>
        <p className="subtitle">Start capturing your notes in seconds</p>
        <form onSubmit={submit}>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            placeholder="Interests (comma separated, e.g. chess, reading)"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Create account</button>
        </form>
        <p className="switch">
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
