import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  LayoutGrid,
  Map as MapIcon,
  SlidersHorizontal,
  ArrowLeft,
  AlertCircle,
  MapPin,
  RefreshCw
} from 'lucide-react';
import WorkerCard from '../components/WorkerCard.jsx';
import MapView from '../components/MapView.jsx';
import FilterPanel from '../components/FilterPanel.jsx';
import { WorkerCardSkeleton } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import * as jobsApi from '../api/jobs.js';

export default function MatchesPage() {
  const { id: jobId } = useParams();
  const { t } = useTranslation();

  const [job, setJob] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const [filters, setFilters] = useState({
    maxDistance: 25,
    minRating: 0,
    minExperience: 0,
    verifiedOnly: false,
    sortBy: 'best_match'
  });

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await jobsApi.getJobMatches(jobId, filters);
      setWorkers(res.items || []);
      if (res.job) setJob(res.job);
    } catch (e) {
      // If error or mock fallback
      const fallbackJob = await jobsApi.getJobById(jobId).catch(() => null);
      if (fallbackJob) setJob(fallbackJob);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [jobId]);

  // Client-side filtering & sorting for smooth UX
  const filteredWorkers = workers.filter((w) => {
    if (w.distanceKm !== undefined && w.distanceKm > filters.maxDistance) return false;
    if (filters.minRating > 0 && (w.ratingAvg || 0) < filters.minRating) return false;
    if (filters.minExperience > 0 && (w.experienceYears || 0) < filters.minExperience) return false;
    if (filters.verifiedOnly && !w.verification?.idVerified) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'distance') return (a.distanceKm || 0) - (b.distanceKm || 0);
    if (filters.sortBy === 'price_low') return (a.estimatedQuote || a.rate || 0) - (b.estimatedQuote || b.rate || 0);
    if (filters.sortBy === 'rating') return (b.ratingAvg || 0) - (a.ratingAvg || 0);
    if (filters.sortBy === 'experience') return (b.experienceYears || 0) - (a.experienceYears || 0);
    return (b.score || 0) - (a.score || 0); // Default: AI Best Match Score
  });

  return (
    <div className="min-h-screen bg-stone-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link & Job Header Strip */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/customer/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>

            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
                {job?.title || 'AI Worker Matches'}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 capitalize">
                {job?.profession || 'electrician'}
              </span>
            </div>

            <p className="text-xs text-stone-500 mt-1 flex items-center gap-2 flex-wrap">
              <span>📍 {job?.addressText || 'Warangal Site Location'}</span>
              {job?.budgetMin && (
                <span>• Budget: ₹{job.budgetMin.toLocaleString('en-IN')} - ₹{job.budgetMax.toLocaleString('en-IN')}</span>
              )}
            </p>
          </div>

          {/* View Mode Toggle & Mobile Filter Button */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold text-stone-700 flex items-center gap-1.5 shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <div className="flex items-center bg-stone-200/80 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map View</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Info Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-50 border border-amber-300/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-sm flex-shrink-0">
              <Sparkles className="w-5 h-5 text-stone-950 fill-stone-950" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-amber-950">
                AI Matched & Ranked {filteredWorkers.length} Tradesmen Near You
              </div>
              <p className="text-[11px] text-amber-800">
                Scores calculated using verified skill keywords, radial distance, budget quotes, schedule availability, and Bayesian ratings.
              </p>
            </div>
          </div>

          <button
            onClick={fetchMatches}
            className="p-2 text-amber-900 hover:bg-amber-200/60 rounded-xl transition-colors flex-shrink-0"
            title="Refresh Matches"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Main Grid Layout: Sidebar Filters + Match Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Filter Sidebar */}
          <div className={`lg:block ${showFiltersMobile ? 'block mb-4' : 'hidden'} lg:col-span-1`}>
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters({
                maxDistance: 25,
                minRating: 0,
                minExperience: 0,
                verifiedOnly: false,
                sortBy: 'best_match'
              })}
            />
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WorkerCardSkeleton />
                <WorkerCardSkeleton />
                <WorkerCardSkeleton />
                <WorkerCardSkeleton />
              </div>
            ) : filteredWorkers.length === 0 ? (
              <EmptyState
                icon={AlertCircle}
                title="No workers match current filters"
                description="Try expanding your maximum distance slider to 30 km or clearing specific filter criteria."
                actionLabel="Reset Filters"
                onAction={() => setFilters({
                  maxDistance: 35,
                  minRating: 0,
                  minExperience: 0,
                  verifiedOnly: false,
                  sortBy: 'best_match'
                })}
              />
            ) : viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWorkers.map((worker) => (
                  <WorkerCard
                    key={worker._id}
                    worker={worker}
                    jobId={jobId}
                  />
                ))}
              </div>
            ) : (
              <div className="h-[600px] w-full">
                <MapView
                  jobLocation={job?.location}
                  workers={filteredWorkers}
                  jobId={jobId}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
