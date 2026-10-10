import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  Wrench,
  Hammer,
  Paintbrush,
  Layers,
  Grid,
  Flame,
  Home,
  Sparkles,
  HardHat
} from 'lucide-react';

const ICON_MAP = {
  electrician: Zap,
  plumber: Wrench,
  carpenter: Hammer,
  painter: Paintbrush,
  mason: Layers,
  tiles_flooring: Grid,
  welder: Flame,
  roofer: Home,
  house_cleaning: Sparkles,
  construction_labourer: HardHat
};

const COLOR_MAP = {
  electrician: 'from-amber-500/20 to-amber-500/5 text-amber-600 border-amber-200 hover:border-amber-400',
  plumber: 'from-blue-500/20 to-blue-500/5 text-blue-600 border-blue-200 hover:border-blue-400',
  carpenter: 'from-orange-500/20 to-orange-500/5 text-orange-600 border-orange-200 hover:border-orange-400',
  painter: 'from-purple-500/20 to-purple-500/5 text-purple-600 border-purple-200 hover:border-purple-400',
  mason: 'from-stone-500/20 to-stone-500/5 text-stone-700 border-stone-200 hover:border-stone-400',
  tiles_flooring: 'from-teal-500/20 to-teal-500/5 text-teal-600 border-teal-200 hover:border-teal-400',
  welder: 'from-red-500/20 to-red-500/5 text-red-600 border-red-200 hover:border-red-400',
  roofer: 'from-cyan-500/20 to-cyan-500/5 text-cyan-600 border-cyan-200 hover:border-cyan-400',
  house_cleaning: 'from-emerald-500/20 to-emerald-500/5 text-emerald-600 border-emerald-200 hover:border-emerald-400',
  construction_labourer: 'from-yellow-500/20 to-yellow-500/5 text-yellow-700 border-yellow-200 hover:border-yellow-400'
};

export default function ProfessionCard({ profession, isSelected, onClick, workerCount }) {
  const { t } = useTranslation();
  const profKey = typeof profession === 'string' ? profession : (profession?.value || profession?.id || '');
  const IconComponent = ICON_MAP[profKey] || Zap;
  const colorClass = COLOR_MAP[profKey] || 'from-amber-500/20 to-amber-500/5 text-amber-600 border-amber-200 hover:border-amber-400';

  const defaultLabel = typeof profession === 'object' && profession?.label
    ? profession.label
    : String(profKey || '').replace(/_/g, ' ');
  const localizedName = t(`professions.${profKey}`, defaultLabel);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group text-left relative p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between bg-gradient-to-br ${
        isSelected
          ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-400/30 -translate-y-0.5'
          : `bg-white hover:shadow-md hover:-translate-y-0.5 ${colorClass}`
      }`}
    >
      <div className="flex items-center justify-between w-full mb-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
          isSelected ? 'bg-amber-500 text-stone-950' : 'bg-stone-50 text-stone-800'
        }`}>
          <IconComponent className="w-6 h-6" />
        </div>
        {workerCount !== undefined && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
            {workerCount} workers
          </span>
        )}
      </div>

      <div>
        <h3 className="font-bold text-stone-900 capitalize text-sm sm:text-base group-hover:text-amber-600 transition-colors">
          {localizedName}
        </h3>
        <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
          {t(`professionsDesc.${profession}`, `Book skilled ${localizedName} for home & commercial needs.`)}
        </p>
      </div>

      <div className="mt-3 pt-2 border-t border-stone-100/80 flex items-center justify-between text-[11px] font-semibold text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Find & Book</span>
        <span>→</span>
      </div>
    </button>
  );
}
