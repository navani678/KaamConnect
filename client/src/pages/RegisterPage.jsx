import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import { Zap, User, Briefcase, Phone, Mail, Lock, Globe, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(searchParams.get('role') === 'worker' ? 'worker' : 'customer');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    language: 'en'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Valid email is required';
    if (!formData.phone.trim() || !/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      errs.phone = 'Valid 10-digit Indian mobile number starting with 6-9 required';
    }
    if (!formData.password || formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError(null);

    try {
      const user = await register({
        ...formData,
        role
      });
      if (user.role === 'worker') {
        navigate('/worker/profile');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check your credentials.');
      if (err.fields) {
        setErrors(err.fields);
      }
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
            Create your account
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Join the verified blue-collar network in Warangal & beyond
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              role === 'customer'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>I Need a Worker</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('worker')}
            className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              role === 'worker'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>I Am a Worker</span>
          </button>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Reddy"
                className={`w-full pl-9 pr-3 py-2 bg-stone-50 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.name ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                }`}
              />
            </div>
            {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className={`w-full pl-9 pr-3 py-2 bg-stone-50 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.email ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                }`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Mobile Number (10 digits)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-500">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                placeholder="9848012345"
                className={`w-full pl-11 pr-3 py-2 bg-stone-50 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.phone ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                }`}
              />
            </div>
            {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Password (min 8 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-2 bg-stone-50 border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.password ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                }`}
              />
            </div>
            {errors.password && <p className="text-[11px] text-red-600 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Preferred Language
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
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
                <span>Sign Up as {role === 'worker' ? 'Skilled Worker' : 'Customer'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-stone-100 text-center text-xs text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-amber-600 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
