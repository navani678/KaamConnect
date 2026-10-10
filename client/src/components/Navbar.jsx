import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import {
  Zap,
  Briefcase,
  PlusCircle,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleDemoSwitch = async (role) => {
    await quickDemoLogin(role);
    setDemoMenuOpen(false);
    setMobileMenuOpen(false);
    if (role === 'worker') {
      navigate('/worker/dashboard');
    } else {
      navigate('/customer/dashboard');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-stone-950 fill-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl text-stone-900 tracking-tight font-display">
                Kaam<span className="text-amber-500">Connect</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md border border-amber-200">
                AI
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium hidden sm:block">
              {t('common.tagline', 'Right Worker • Near You • Right Price')}
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {!isAuthenticated && (
            <>
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isActive('/') ? 'text-amber-600 bg-amber-50' : 'text-stone-700 hover:text-amber-600 hover:bg-stone-50'
                }`}
              >
                {t('nav.home', 'Home')}
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 rounded-lg text-stone-700 hover:text-amber-600 hover:bg-stone-50 transition-colors"
              >
                {t('landing.howItWorks', 'How it Works')}
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'customer' && (
            <>
              <Link
                to="/customer/dashboard"
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                  isActive('/customer/dashboard') ? 'text-amber-600 bg-amber-50 font-semibold' : 'text-stone-700 hover:text-amber-600 hover:bg-stone-50'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                {t('nav.dashboard', 'My Jobs')}
              </Link>
              <Link
                to="/customer/jobs/new"
                className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold shadow-sm flex items-center gap-1.5 transition-all hover:shadow"
              >
                <PlusCircle className="w-4 h-4" />
                {t('nav.postJob', 'Post a Job')}
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'worker' && (
            <>
              <Link
                to="/worker/dashboard"
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                  isActive('/worker/dashboard') ? 'text-amber-600 bg-amber-50 font-semibold' : 'text-stone-700 hover:text-amber-600 hover:bg-stone-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {t('nav.dashboard', 'Incoming Leads')}
              </Link>
              <Link
                to="/worker/profile"
                className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                  isActive('/worker/profile') ? 'text-amber-600 bg-amber-50 font-semibold' : 'text-stone-700 hover:text-amber-600 hover:bg-stone-50'
                }`}
              >
                <User className="w-4 h-4" />
                {t('workerProfile.editProfile', 'Profile & Rates')}
              </Link>
            </>
          )}
        </nav>

        {/* Right Action Items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Quick Demo Login Menu for Hackathon Evaluators */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-300 transition-all"
              title="1-Click Demo Login"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Demo Logins</span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-200 p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-2 py-1 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                  Instant 1-Click Login
                </div>
                <button
                  onClick={() => handleDemoSwitch('customer')}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-amber-50 text-stone-800 font-medium flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-stone-900">Demo Customer</div>
                    <div className="text-[10px] text-stone-500">customer@demo.com</div>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">Try</span>
                </button>
                <button
                  onClick={() => handleDemoSwitch('worker')}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-amber-50 text-stone-800 font-medium flex items-center justify-between mt-1"
                >
                  <div>
                    <div className="font-semibold text-stone-900">Demo Worker (Raju)</div>
                    <div className="text-[10px] text-stone-500">worker@demo.com</div>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">Try</span>
                </button>
              </div>
            )}
          </div>

          {/* User Account or Auth Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-stone-900">{user?.name}</span>
                <span className="text-[10px] font-medium text-amber-700 capitalize bg-amber-100 px-1.5 py-0.2 rounded self-end">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                title={t('auth.logout', 'Log out')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              >
                {t('auth.login', 'Sign In')}
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-lg shadow-sm transition-colors"
              >
                {t('auth.register', 'Get Started')}
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {isAuthenticated ? (
            <>
              <div className="p-3 bg-stone-50 rounded-xl mb-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-stone-900 text-sm">{user?.name}</div>
                  <div className="text-xs text-stone-500">{user?.email}</div>
                </div>
                <span className="text-xs font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded capitalize">
                  {user?.role}
                </span>
              </div>

              {user?.role === 'customer' ? (
                <>
                  <Link
                    to="/customer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-stone-800 font-medium hover:bg-stone-50"
                  >
                    {t('nav.dashboard', 'My Jobs & Bookings')}
                  </Link>
                  <Link
                    to="/customer/jobs/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg bg-amber-500 text-stone-950 font-bold text-center mt-2"
                  >
                    + {t('nav.postJob', 'Post a Job')}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/worker/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-stone-800 font-medium hover:bg-stone-50"
                  >
                    {t('nav.dashboard', 'Incoming Leads & Jobs')}
                  </Link>
                  <Link
                    to="/worker/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-stone-800 font-medium hover:bg-stone-50"
                  >
                    {t('workerProfile.editProfile', 'Edit Profile & Rates')}
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg mt-2 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t('auth.logout', 'Sign Out')}
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center font-semibold text-stone-800 bg-stone-100 rounded-xl"
              >
                {t('auth.login', 'Sign In')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow"
              >
                {t('auth.register', 'Join KaamConnect AI')}
              </Link>
              <div className="pt-2 border-t border-stone-200">
                <div className="text-xs text-stone-400 font-semibold mb-2">QUICK DEMO ACCESS:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDemoSwitch('customer')}
                    className="py-2 text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-900 rounded-lg"
                  >
                    Customer Demo
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('worker')}
                    className="py-2 text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-900 rounded-lg"
                  >
                    Worker Demo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
