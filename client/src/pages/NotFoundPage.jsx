import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 text-center shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
        </div>
        <h1 className="text-4xl font-black text-stone-900 font-display">404</h1>
        <h2 className="text-lg font-bold text-stone-800 mt-1">Page Not Found</h2>
        <p className="text-xs text-stone-500 mt-2 leading-relaxed">
          The page you are looking for might have been moved, deleted, or does not exist.
        </p>

        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
