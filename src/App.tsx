import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Notes } from './pages/Notes';
import { AdminUsers } from './pages/AdminUsers';
import { AdminNotes } from './pages/AdminNotes';
import { Interests } from './pages/Interests';
import { UserPosts } from './pages/UserPosts';

/** Route guard: requires a logged-in user, and optionally the admin role. */
const Protected = ({ children, adminOnly }: { children: ReactNode; adminOnly?: boolean }) => {
  const { user, loading } = useAuth();
  if (loading) return <p className="container">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/notes" replace />;
  return <>{children}</>;
};

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  return (
    <nav>
      <strong>Notes App</strong>
      <Link to="/notes">My Notes</Link>
      <Link to="/posts">Posts by User</Link>
      {user.role === 'admin' && <Link to="/admin/users">Users</Link>}
      {user.role === 'admin' && <Link to="/admin/notes">All Notes</Link>}
      {user.role === 'admin' && <Link to="/admin/interests">Interests</Link>}
      <span className="spacer" />
      <span>
        {user.name} ({user.role})
      </span>
      <button
        onClick={() => {
          logout();
          navigate('/login');
        }}
      >
        Logout
      </button>
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
              <UserPosts />
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
