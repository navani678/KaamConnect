import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, count, size = 'sm', interactive = false, onChange }) {
  const rounded = Math.round((rating || 0) * 10) / 10;
  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSize = starSizes[size] || starSizes.sm;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= Math.round(rating);
          return (
            <button
              key={starIndex}
              type={interactive ? 'button' : undefined}
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starIndex)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            >
              <Star
                className={`${iconSize} ${
                  isFilled
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-stone-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      <span className="text-xs font-bold text-stone-900">
        {rounded > 0 ? rounded.toFixed(1) : 'New'}
      </span>

      {count !== undefined && (
        <span className="text-xs text-stone-500">
          ({count})
        </span>
      )}
    </div>
  );
}
