import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-stone-200/80 rounded-xl ${className}`}></div>
  );
}

export function WorkerCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}
