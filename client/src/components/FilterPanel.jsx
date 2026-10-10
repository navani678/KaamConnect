import React from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function FilterPanel({ filters, onChange, onReset }) {
  const { t } = useTranslation();

  const handleFilterChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
          <SlidersHorizontal className="w-4 h-4 text-amber-500" />
          <span>{t('matches.filterTitle', 'Filter & Refine')}</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-stone-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Max Distance Slider */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
          <span>{t('matches.maxDistance', 'Max Distance')}</span>
          <span className="font-bold text-amber-600">{filters.maxDistance || 15} km</span>
        </div>
        <input
          type="range"
          min="1"
          max="35"
          step="1"
          value={filters.maxDistance || 15}
          onChange={(e) => handleFilterChange('maxDistance', Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-stone-400 mt-1">
          <span>1 km</span>
          <span>15 km</span>
          <span>35 km</span>
        </div>
      </div>

      {/* Min Rating Filter */}
      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-2">
          {t('matches.minRating', 'Minimum Rating')}
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 4.0, 4.5, 4.8].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleFilterChange('minRating', rate)}
              className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                (filters.minRating || 0) === rate
                  ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {rate === 0 ? 'All' : `${rate}★+`}
            </button>
          ))}
        </div>
      </div>

      {/* Min Experience */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
          <span>Min Experience</span>
          <span className="font-bold text-stone-900">{filters.minExperience || 0} years</span>
        </div>
        <input
          type="range"
          min="0"
          max="20"
          step="1"
          value={filters.minExperience || 0}
          onChange={(e) => handleFilterChange('minExperience', Number(e.target.value))}
          className="w-full accent-amber-500 cursor-pointer"
        />
      </div>

      {/* Verified Only */}
      <div className="pt-2 border-t border-stone-100">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.verifiedOnly}
            onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
            className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
          />
          <span className="text-xs font-semibold text-stone-800">
            ID Verified Workers Only
          </span>
        </label>
      </div>

      {/* Sort By Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-stone-700 mb-1.5">
          {t('matches.sortBy', 'Sort By')}
        </label>
        <select
          value={filters.sortBy || 'best_match'}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="best_match">AI Best Match (Score)</option>
          <option value="distance">Proximity (Closest First)</option>
          <option value="price_low">Quote (Lowest First)</option>
          <option value="rating">Rating (Highest First)</option>
          <option value="experience">Experience (Highest First)</option>
        </select>
      </div>
    </div>
  );
}
