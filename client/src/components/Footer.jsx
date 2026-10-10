import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Heart, Shield, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4 text-stone-950 fill-stone-950" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Kaam<span className="text-amber-500">Connect</span> AI
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {t('landing.heroSubtitle', 'AI-powered local skilled worker matching platform. Direct booking, transparent rates, verified skills, and multilingual support for India.')}
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Direct Worker Connection</span>
            </div>
          </div>

          {/* Col 2: Top Skills */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Popular Trades
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/customer/jobs/new?profession=electrician" className="hover:text-amber-400 transition-colors">Electricians in Warangal</Link></li>
              <li><Link to="/customer/jobs/new?profession=plumber" className="hover:text-amber-400 transition-colors">Plumbers in Kazipet</Link></li>
              <li><Link to="/customer/jobs/new?profession=carpenter" className="hover:text-amber-400 transition-colors">Carpenters & Woodwork</Link></li>
              <li><Link to="/customer/jobs/new?profession=painter" className="hover:text-amber-400 transition-colors">Painters & Whitewash</Link></li>
              <li><Link to="/customer/jobs/new?profession=mason" className="hover:text-amber-400 transition-colors">Masons & Construction</Link></li>
            </ul>
          </div>

          {/* Col 3: For Workers */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              For Workers
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><Link to="/register" className="hover:text-amber-400 transition-colors">Join as a Skilled Worker</Link></li>
              <li><Link to="/login" className="hover:text-amber-400 transition-colors">Worker Dashboard</Link></li>
              <li><span className="text-stone-500">Zero Commission Policy</span></li>
              <li><span className="text-stone-500">Instant Direct Negotiations</span></li>
            </ul>
          </div>

          {/* Col 4: Trust & Local Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Trust & Support
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ID Verified Workers</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Geo-Radius Fair Pricing</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Telugu & Hindi Native UI</li>
              <li className="mt-3 text-[11px] text-stone-500">Centred in Warangal • Hanamkonda • Kazipet</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-3">
          <div>
            © 2026 KaamConnect AI. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for Bharat's Gig Workers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
