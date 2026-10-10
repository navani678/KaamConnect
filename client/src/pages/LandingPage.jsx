import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  Search,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  ArrowRight,
  TrendingUp,
  Clock,
  Coins
} from 'lucide-react';
import ProfessionCard from '../components/ProfessionCard.jsx';
import * as metaApi from '../api/meta.js';

export default function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [professions, setProfessions] = useState([]);
  const [selectedProfession, setSelectedProfession] = useState('');
  const [searchLocation, setSearchLocation] = useState('Warangal, TS');

  useEffect(() => {
    metaApi.getProfessions().then((res) => {
      const list = Array.isArray(res) ? res : res?.professions || [];
      setProfessions(list);
    }).catch(() => {
      // Fallback professions list
      setProfessions([
        { id: 'electrician', name: 'Electrician' },
        { id: 'plumber', name: 'Plumber' },
        { id: 'carpenter', name: 'Carpenter' },
        { id: 'painter', name: 'Painter' },
        { id: 'mason', name: 'Mason' },
        { id: 'tiles_flooring', name: 'Tiles & Flooring' },
        { id: 'welder', name: 'Welder' },
        { id: 'roofer', name: 'Roofer' },
        { id: 'house_cleaning', name: 'Deep Cleaning' },
        { id: 'construction_labourer', name: 'Labourer' }
      ]);
    });
  }, []);

  const handleStartPosting = (profId) => {
    navigate(`/customer/jobs/new?profession=${profId || selectedProfession || 'electrician'}`);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-amber-50/40 to-stone-50 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Live Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-300 text-amber-900 text-xs font-bold mb-6 shadow-sm animate-in fade-in slide-in-from-top-3">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>{t('common.tagline', 'Find the Right Worker. Near You. At the Right Price.')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black text-stone-950 tracking-tight leading-tight font-display">
              {t('landing.heroTitle', 'Local Skilled Workers.')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600">
                Matched by AI. Near You.
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
              {t('landing.heroSubtitle', 'Post your home or site job in 60 seconds. Our 5-factor AI matching engine connects you with trusted, nearby electricians, plumbers, masons and painters with transparent quotes.')}
            </p>

            {/* Quick Job Search Bar */}
            <div className="mt-8 max-w-xl mx-auto bg-white p-2 rounded-2xl shadow-xl border border-stone-200 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-xl border border-stone-100">
                <Search className="w-4 h-4 text-stone-400" />
                <select
                  value={selectedProfession}
                  onChange={(e) => setSelectedProfession(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-stone-800 focus:outline-none capitalize"
                >
                  <option value="">Choose Skill / Profession...</option>
                  {professions.map((p) => {
                    const val = typeof p === 'string' ? p : (p.value || p.id || '');
                    const label = typeof p === 'string' ? p : (p.label || p.name || val);
                    return (
                      <option key={val} value={val}>
                        {t(`professions.${val}`, label)}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-xl border border-stone-100 hidden sm:flex">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-stone-700">Warangal, TS</span>
              </div>

              <button
                onClick={() => handleStartPosting(selectedProfession)}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Find Workers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-stone-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ID Verified Tradesmen</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>5-Factor AI Geo-Matching</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-blue-600" />
                <span>Zero Commission Booking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10 Professions Grid */}
      <section className="py-16 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-display">
              {t('landing.professionsTitle', 'Find Verified Workers by Trade')}
            </h2>
            <p className="mt-2 text-sm text-stone-500">
              Choose a category to find high-rated skilled professionals in your neighbourhood
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {professions.map((prof) => {
              const profId = typeof prof === 'string' ? prof : (prof.value || prof.id || '');
              return (
                <ProfessionCard
                  key={profId}
                  profession={profId}
                  workerCount={prof.count || (profId === 'electrician' ? 18 : 12)}
                  isSelected={selectedProfession === profId}
                  onClick={() => handleStartPosting(profId)}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl font-black text-stone-900 mt-3 font-display">
              How KaamConnect AI Works
            </h2>
            <p className="text-sm text-stone-500 mt-2">
              From posting your job to having the worker at your doorstep — transparent and quick.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Post Job & GPS Location',
                desc: 'Select your trade, upload photos/videos, pick your budget and tap "Use My GPS".'
              },
              {
                step: '02',
                title: 'AI Ranks Nearby Workers',
                desc: 'Our engine evaluates Skill, Distance, Quote, Availability, and Reputation in real-time.'
              },
              {
                step: '03',
                title: 'Compare & Send Booking',
                desc: 'Review match explanations, portfolio photos, ratings, and send booking requests.'
              },
              {
                step: '04',
                title: 'Negotiate & Complete',
                desc: 'Worker can accept or counter offer. Confirm with transparent OTP, finish work, and leave a review.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative group hover:border-amber-400 hover:shadow-md transition-all"
              >
                <div className="text-4xl font-black text-amber-500/30 group-hover:text-amber-500 transition-colors font-display mb-3">
                  {item.step}
                </div>
                <h3 className="font-bold text-stone-900 text-base mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Matching Engine Explanation Box */}
      <section className="py-16 bg-stone-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explainable AI Geo-Scoring</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display leading-tight">
                No Black Box Algorithms.
                <br />
                <span className="text-amber-500">100% Fact-Based Scoring.</span>
              </h2>
              <p className="mt-4 text-stone-300 text-sm leading-relaxed">
                KaamConnect AI calculates matching scores strictly using verified database records. We evaluate:
              </p>

              <div className="mt-6 space-y-3">
                {[
                  { name: 'Skill & Keyword Overlap', weight: '30%', desc: 'Profession match + specialisation overlap in job requirements' },
                  { name: 'Proximity (Geo-Distance)', weight: '25%', desc: 'Radial distance calculated via MongoDB 2dsphere indexing' },
                  { name: 'Price Quote Compatibility', weight: '20%', desc: 'Estimated hourly/daily rate matched against your budget bracket' },
                  { name: 'Slot & Date Availability', weight: '15%', desc: 'Weekly schedule match and immediate on-demand readiness' },
                  { name: 'Bayesian Reputation & Trust', weight: '10%', desc: 'Verified identity, experience years, and weighted 5-star reviews' }
                ].map((factor, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-stone-900/80 border border-stone-800">
                    <div className="w-12 text-center text-xs font-extrabold text-amber-400 bg-amber-500/10 py-1 rounded-lg border border-amber-500/20">
                      {factor.weight}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{factor.name}</div>
                      <div className="text-[11px] text-stone-400">{factor.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Explanation Sample Preview */}
            <div className="bg-gradient-to-br from-stone-900 to-stone-950 p-6 sm:p-8 rounded-3xl border border-stone-800 shadow-2xl relative">
              <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Live Generated Explanation
              </div>
              <div className="p-4 rounded-2xl bg-stone-800/90 border border-stone-700 text-stone-200 text-sm leading-relaxed italic">
                "Matches your required electrical skills in concealed wiring and fan installation, is 2.1 km away in Hanamkonda, is confirmed available this Saturday, quoted ₹3,200 within your ₹3,000–₹5,000 budget, rated 4.9/5 from 28 reviews, ID verified."
              </div>

              <div className="mt-6 pt-6 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <span>Centred in Warangal / Kazipet</span>
                <span className="text-emerald-400 font-semibold">✓ Zero Invented Facts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-amber-500 text-stone-950">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight">
            Ready to Find the Best Skilled Worker Near You?
          </h2>
          <p className="mt-3 text-stone-900 font-medium text-sm sm:text-base max-w-xl mx-auto">
            Join thousands of customers and skilled craftsmen across Telangana and India.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/customer/jobs/new"
              className="px-8 py-3.5 rounded-2xl bg-stone-950 hover:bg-stone-900 text-white font-extrabold text-sm shadow-xl transition-all"
            >
              Post a Job for Free
            </Link>
            <Link
              to="/register?role=worker"
              className="px-8 py-3.5 rounded-2xl bg-white hover:bg-stone-100 text-stone-950 font-extrabold text-sm shadow-xl transition-all"
            >
              Join as a Worker
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
