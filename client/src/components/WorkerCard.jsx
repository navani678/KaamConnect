import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import StarRating from './StarRating.jsx';
import ScoreBar from './ScoreBar.jsx';

export default function WorkerCard({ worker, jobId, showBookAction = true }) {
  const { t } = useTranslation();

  const user = worker.user || {};
  const photo = user.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;
  const name = user.name || 'Skilled Worker';
  const profession = worker.professions?.[0] || 'worker';
  const distance = worker.distanceKm !== undefined ? Number(worker.distanceKm).toFixed(1) : '2.5';
  const quote = worker.estimatedQuote || (worker.rateType === 'hourly' ? worker.rate * 8 : worker.rate) || 1200;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:border-amber-300">
      <div>
        {/* Header: Photo + Info */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={photo}
              alt={name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-stone-100 shadow-sm group-hover:scale-105 transition-transform"
            />
            {worker.verification?.idVerified && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow">
                <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-bold text-stone-900 text-base truncate group-hover:text-amber-600 transition-colors">
                {name}
              </h3>
              {worker.verification?.idVerified && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>

            <p className="text-xs font-semibold text-amber-700 capitalize mt-0.5">
              {t(`professions.${profession}`, profession.replace('_', ' '))} • {worker.experienceYears || 5}+ yrs exp
            </p>

            <div className="flex items-center gap-3 text-xs text-stone-500 mt-1.5 flex-wrap">
              <StarRating rating={worker.ratingAvg || 4.8} count={worker.ratingCount || 12} />
              <span className="flex items-center gap-1 text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                {distance} km
              </span>
            </div>
          </div>
        </div>

        {/* Specialization Chips */}
        {worker.specializations && worker.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {worker.specializations.slice(0, 3).map((spec, i) => (
              <span
                key={i}
                className="text-[11px] bg-stone-50 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200"
              >
                {spec}
              </span>
            ))}
            {worker.specializations.length > 3 && (
              <span className="text-[10px] text-stone-400 self-center">
                +{worker.specializations.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* AI Explanation Box */}
        {worker.explanation && (
          <div className="mt-3.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-stone-700 leading-relaxed">
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900 mb-1">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Why matched:</span>
            </div>
            <p className="text-[11px] text-stone-700 line-clamp-3">
              {worker.explanation}
            </p>
          </div>
        )}

        {/* Score Bar if available */}
        {worker.score !== undefined && (
          <div className="mt-3.5">
            <ScoreBar score={worker.score} breakdown={worker.scoreBreakdown} />
          </div>
        )}
      </div>

      {/* Footer: Price Quote & Actions */}
      <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
            {t('matches.estimatedQuote', 'Estimated Quote')}
          </div>
          <div className="text-lg font-extrabold text-stone-950 font-display">
            ₹{quote.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/workers/${worker._id}`}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors border border-stone-200"
          >
            {t('matches.viewProfile', 'Profile')}
          </Link>

          {showBookAction && jobId && (
            <Link
              to={`/customer/jobs/${jobId}/book/${worker.user?._id || worker._id}`}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm hover:shadow transition-all flex items-center gap-1"
            >
              <span>{t('matches.bookNow', 'Book Now')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
