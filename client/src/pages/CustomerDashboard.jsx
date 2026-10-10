import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import * as jobsApi from '../api/jobs.js';
import * as bookingsApi from '../api/bookings.js';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import {
  Briefcase,
  PlusCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  MapPin,
  ChevronRight
} from 'lucide-react';

export default function CustomerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'bookings'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobsRes, bookingsRes] = await Promise.all([
          jobsApi.getMyJobs().catch(() => ({ items: [] })),
          bookingsApi.getMyBookings().catch(() => ({ items: [] }))
        ]);
        setJobs(jobsRes.items || []);
        setBookings(bookingsRes.items || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openJobsCount = jobs.filter(j => j.status === 'open').length;
  const activeBookingsCount = bookings.filter(b => b.status === 'pending' || b.status === 'countered' || b.status === 'accepted').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
                Namaste, {user?.name || 'Customer'}!
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                Customer
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Manage your posted tasks, view AI-matched workers, and track active bookings.
            </p>
          </div>

          <Link
            to="/customer/jobs/new"
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 self-stretch sm:self-auto justify-center"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a New Job</span>
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Open Jobs
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 font-display">
              {openJobsCount}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              In Negotiation
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 font-display">
              {activeBookingsCount}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-stone-200 shadow-sm">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Completed
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 font-display">
              {completedCount}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-stone-200 pb-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'jobs'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            My Job Posts ({jobs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === 'bookings'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            My Bookings ({bookings.length})
          </button>
        </div>

        {/* Tab 1: Jobs Content */}
        {activeTab === 'jobs' && (
          <div>
            {jobs.length === 0 && !loading ? (
              <EmptyState
                icon={Briefcase}
                title="No job posts yet"
                description="Post your first job to see top-ranked nearby workers and instant transparent quotes."
                actionLabel="+ Post Your First Job"
                actionLink="/customer/jobs/new"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 capitalize">
                          {t(`professions.${job.profession}`, job.profession)}
                        </span>
                        <StatusBadge status={job.status} />
                      </div>

                      <h3 className="font-bold text-stone-900 text-base sm:text-lg mb-1.5 line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3">
                        {job.description || 'No description provided'}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-stone-600 flex-wrap">
                        {job.budgetMin && job.budgetMax && (
                          <span className="font-bold text-stone-900">
                            Budget: ₹{job.budgetMin.toLocaleString('en-IN')} - ₹{job.budgetMax.toLocaleString('en-IN')}
                          </span>
                        )}
                        {job.addressText && (
                          <span className="flex items-center gap-1 text-stone-500">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            {job.addressText}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                      <Link
                        to={`/customer/jobs/${job._id}`}
                        className="text-xs font-bold text-stone-700 hover:text-stone-950"
                      >
                        Job Details
                      </Link>

                      <Link
                        to={`/customer/jobs/${job._id}/matches`}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>View AI Matches</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Bookings Content */}
        {activeTab === 'bookings' && (
          <div>
            {bookings.length === 0 && !loading ? (
              <EmptyState
                icon={Calendar}
                title="No active bookings"
                description="When you select and book a matched worker for your job, their status and negotiation will appear here."
              />
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const workerName = booking.worker?.name || 'Assigned Worker';
                  const jobTitle = booking.job?.title || 'Job Request';
                  const price = booking.finalPrice || booking.proposedPrice || 0;

                  return (
                    <Link
                      key={booking._id}
                      to={`/bookings/${booking._id}`}
                      className="block bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-stone-900 text-base group-hover:text-amber-600 transition-colors">
                              {jobTitle}
                            </h3>
                            <StatusBadge status={booking.status} />
                          </div>
                          <p className="text-xs text-stone-500">
                            Worker: <span className="font-semibold text-stone-800">{workerName}</span> • Scheduled: {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'Flexible'} ({booking.timeSlot || 'Anytime'})
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-left sm:text-right">
                            <div className="text-base font-extrabold text-stone-950 font-display">
                              ₹{price.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[10px] text-stone-400 font-semibold uppercase">
                              {booking.status === 'accepted' ? 'Agreed Price' : 'Proposed Price'}
                            </div>
                          </div>

                          <div className="p-2 rounded-xl bg-stone-50 group-hover:bg-amber-50 text-stone-400 group-hover:text-amber-600 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
