import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { HardHat, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@safetybelt.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) navigate('/');
    else setError(res.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mine-dark px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-mine-accent/15 mb-4">
            <HardHat className="text-mine-accent" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white">Smart Mining Safety Belt</h1>
          <p className="text-slate-400 text-sm mt-1">Control Room Access Portal</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-mine-panel border border-mine-border rounded-xl p-6 space-y-4 shadow-xl"
        >
          {error && (
            <div className="bg-critical/10 border border-critical/30 text-red-300 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-mine-dark border border-mine-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-mine-accent/50"
              placeholder="admin@safetybelt.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-mine-dark border border-mine-border rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-mine-accent/50"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mine-accent text-mine-dark font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 hover:brightness-95 transition disabled:opacity-60"
          >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
          <p className="text-center text-xs text-slate-500 pt-1">
            Demo credentials pre-filled — run <code className="text-mine-accent">npm run seed</code> in backend first.
          </p>
        </form>
      </div>
    </div>
  );
}
