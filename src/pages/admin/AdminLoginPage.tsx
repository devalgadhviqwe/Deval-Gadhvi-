import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Shield, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@newarkmedicalassociates.com');
  const [password, setPassword] = useState('AdminPassword2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.token, data.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const setCredentials = (role: 'admin' | 'editor' | 'viewer') => {
    if (role === 'admin') {
      setEmail('admin@newarkmedicalassociates.com');
      setPassword('AdminPassword2026!');
    } else if (role === 'editor') {
      setEmail('editor@newarkmedicalassociates.com');
      setPassword('EditorPassword2026!');
    } else {
      setEmail('viewer@newarkmedicalassociates.com');
      setPassword('ViewerPassword2026!');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-900 transition-colors mb-6 mx-auto block w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Newark Medical Website</span>
        </Link>

        <div className="w-12 h-12 rounded-2xl bg-blue-900 flex items-center justify-center text-white font-bold text-xl mx-auto shadow-md">
          NMA
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Clinical Portal &amp; CMS
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Authorized Newark Medical Associates staff and management
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-slate-200">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-60 rounded-lg shadow-xs hover:shadow-sm transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            </button>
          </form>

          {/* Quick Demo Role Switcher for Testing */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3 text-center">
              Quick Test Roles
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCredentials('admin')}
                className="py-1.5 px-2 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 rounded-lg border border-slate-200 transition-colors text-center"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => setCredentials('editor')}
                className="py-1.5 px-2 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 rounded-lg border border-slate-200 transition-colors text-center"
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setCredentials('viewer')}
                className="py-1.5 px-2 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 rounded-lg border border-slate-200 transition-colors text-center"
              >
                Viewer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
