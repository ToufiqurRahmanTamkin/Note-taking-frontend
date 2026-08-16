import { Navigate, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Spinner } from './components/Spinner';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Notes } from './pages/Notes';
import { AdminUsers } from './pages/AdminUsers';
import { AdminNotes } from './pages/AdminNotes';
import { Interests } from './pages/Interests';
import { Posts } from './pages/Posts';

/** Route guard: requires a logged-in user, and optionally the admin role. */
const Protected = ({ children, adminOnly }: { children: ReactNode; adminOnly?: boolean }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="loading-wrap" style={{ minHeight: '60vh' }}>
        <Spinner size="lg" dark />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/notes" replace />;
  return <>{children}</>;
};

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  if (!user) return null;

  return (
    <nav>
      <div className="nav-row">
        <span className="brand">◆ Notes</span>
        <button
          type="button"
          className={`nav-toggle ${menuOpen ? 'is-open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
        <Link to="/notes">My Notes</Link>
        <Link to="/posts">Posts</Link>
        {user.role === 'admin' && <Link to="/admin/users">Users</Link>}
        {user.role === 'admin' && <Link to="/admin/notes">All Notes</Link>}
        {user.role === 'admin' && <Link to="/admin/interests">Interests</Link>}
        <span className="spacer" />
        <span className="who">{user.name}</span>
        <span className={`badge ${user.role === 'admin' ? 'admin' : ''}`}>{user.role}</span>
        <button
          className="btn-ghost"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/notes"
          element={
            <Protected>
              <Notes />
            </Protected>
          }
        />
        <Route
          path="/posts"
          element={
            <Protected>
              <Posts />
            </Protected>
          }
        />
        <Route
          path="/admin/users"
          element={
            <Protected adminOnly>
              <AdminUsers />
            </Protected>
          }
        />
        <Route
          path="/admin/notes"
          element={
            <Protected adminOnly>
              <AdminNotes />
            </Protected>
          }
        />
        <Route
          path="/admin/interests"
          element={
            <Protected adminOnly>
              <Interests />
            </Protected>
          }
        />

        <Route path="*" element={<Navigate to="/notes" replace />} />
      </Routes>
    </>
  );
}
