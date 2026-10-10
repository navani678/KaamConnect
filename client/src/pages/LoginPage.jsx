import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { Zap, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const from = location.state?.from?.pathname || '/customer/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setServerError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      const user = await login(email, password);
      if (user.role === 'worker') {
        navigate('/worker/dashboard');
      } else {
        navigate(from.includes('/worker') ? '/customer/dashboard' : from);
      }
    } catch (err) {
      setServerError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    setLoading(true);
    setServerError(null);
    try {
      const user = await quickDemoLogin(role);
      if (user.role === 'worker') {
        navigate('/worker/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setServerError(err.message || 'Failed to sign in with demo user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-sm">
              <Zap className="w-5 h-5 text-stone-950 fill-stone-950" />
            </div>
            <span className="font-extrabold text-xl text-stone-900 tracking-tight font-display">
              Kaam<span className="text-amber-500">Connect</span> AI
            </span>
          </Link>
          <h2 className="text-xl font-bold text-stone-900 mt-2">
            Welcome back
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Sign in to manage your jobs, bookings, and worker leads
          </p>
        </div>

        {/* 1-Click Demo Buttons for Fast Evaluation */}
        <div className="mb-6 p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
            <span>Instant 1-Click Demo Logins</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="py-2 px-2 text-xs font-bold bg-white text-stone-900 hover:bg-stone-50 border border-amber-300 rounded-xl shadow-sm text-center"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('worker')}
              className="py-2 px-2 text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 rounded-xl shadow-sm text-center"
            >
              Demo Worker (Raju)
            </button>
          </div>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@demo.com"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-amber-600 hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
