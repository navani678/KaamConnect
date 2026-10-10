import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ScoreBar({ score, breakdown }) {
  // Score is out of 100
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score || 0)));

  const getScoreColor = (val) => {
    if (val >= 85) return 'from-emerald-500 to-teal-500 text-emerald-700 bg-emerald-50 border-emerald-200';
    if (val >= 70) return 'from-amber-500 to-orange-500 text-amber-800 bg-amber-50 border-amber-200';
    return 'from-stone-500 to-stone-600 text-stone-700 bg-stone-50 border-stone-200';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>AI Match Score</span>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-xs font-extrabold border ${getScoreColor(normalizedScore)}`}>
          {normalizedScore}%
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200 p-0.5">
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
            normalizedScore >= 85 ? 'from-emerald-400 to-teal-500' : 'from-amber-400 to-amber-600'
          }`}
          style={{ width: `${normalizedScore}%` }}
        ></div>
      </div>

      {/* Breakdown Tooltips or Badges if available */}
      {breakdown && (
        <div className="grid grid-cols-5 gap-1 text-[10px] text-stone-500 mt-2 font-medium text-center">
          <div className="bg-stone-50 py-0.5 rounded border border-stone-100" title="Skill Match (max 30)">
            Skill: <span className="font-bold text-stone-800">{breakdown.skill || 0}</span>
          </div>
          <div className="bg-stone-50 py-0.5 rounded border border-stone-100" title="Proximity (max 25)">
            Dist: <span className="font-bold text-stone-800">{breakdown.distance || 0}</span>
          </div>
          <div className="bg-stone-50 py-0.5 rounded border border-stone-100" title="Price Quote (max 20)">
            Price: <span className="font-bold text-stone-800">{breakdown.price || 0}</span>
          </div>
          <div className="bg-stone-50 py-0.5 rounded border border-stone-100" title="Availability (max 15)">
            Avail: <span className="font-bold text-stone-800">{breakdown.availability || 0}</span>
          </div>
          <div className="bg-stone-50 py-0.5 rounded border border-stone-100" title="Reputation & Reviews (max 10)">
            Rep: <span className="font-bold text-stone-800">{breakdown.reputation || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}
