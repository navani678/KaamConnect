import React from 'react';
import { Sparkles, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  actionLink,
  onAction
}) {
  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center max-w-md mx-auto shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200/60 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="font-bold text-stone-900 text-lg sm:text-xl mb-1">
        {title}
      </h3>
      <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mb-6">
        {description}
      </p>

      {actionLabel && (
        actionLink ? (
          <Link
            to={actionLink}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow transition-all"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm shadow transition-all"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
