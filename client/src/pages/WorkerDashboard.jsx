import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Calendar,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  User,
  Power
} from 'lucide-react';
import * as bookingsApi from '../api/bookings.js';
import * as workersApi from '../api/workers.js';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function WorkerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'negotiating' | 'confirmed' | 'completed'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, profileRes] = await Promise.all([
          bookingsApi.getMyBookings().catch(() => ({ items: [] })),
          workersApi.getWorkerProfileMe().catch(() => null)
        ]);
        setBookings(bookingsRes.items || []);
        if (profileRes) {
          setProfile(profileRes);
          setIsAvailable(profileRes.availability?.isAvailableNow ?? true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleAvailability = async () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    await workersApi.updateAvailability({ isAvailableNow: nextState }).catch(() => null);
  };

  const incomingRequests = bookings.filter(b => b.status === 'pending');
  const negotiating = bookings.filter(b => b.status === 'countered');
  const confirmed = bookings.filter(b => b.status === 'accepted');
  const completed = bookings.filter(b => b.status === 'completed');

  const totalEarnings = completed.reduce((acc, b) => acc + (b.finalPrice || b.proposedPrice || 0), 0);

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Worker Header with Availability Toggle */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
                Namaste, {user?.name || 'Worker'}!
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200 capitalize">
                Skilled Worker
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Manage incoming customer requests, propose counter offers, and track your jobs.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
            {/* Live Availability Switch */}
            <button
              onClick={handleToggleAvailability}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all shadow-sm ${
                isAvailable
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-stone-100 text-stone-600 border-stone-300'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`}></span>
              <span>{isAvailable ? 'Available for Jobs' : 'Unavailable (Off Duty)'}</span>
            </button>

            <Link
              to="/worker/profile"
              className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow transition-all"
            >
              Edit Rates & Skills
            </Link>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Incoming Leads
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1 font-display">
              {incomingRequests.length}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Negotiating
            </div>
            <div className="text-2xl font-black text-purple-600 mt-1 font-display">
              {negotiating.length}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Confirmed Upcoming
            </div>
            <div className="text-2xl font-black text-blue-600 mt-1 font-display">
              {confirmed.length}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm">
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Total Revenue (Est.)
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1 font-display">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-3 mb-6 overflow-x-auto">
          {[
            { id: 'incoming', label: `Incoming Requests (${incomingRequests.length})` },
            { id: 'negotiating', label: `Negotiating (${negotiating.length})` },
            { id: 'confirmed', label: `Confirmed (${confirmed.length})` },
            { id: 'completed', label: `Completed (${completed.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of Bookings per Active Tab */}
        <div>
          {(() => {
            let list = [];
            if (activeTab === 'incoming') list = incomingRequests;
            if (activeTab === 'negotiating') list = negotiating;
            if (activeTab === 'confirmed') list = confirmed;
            if (activeTab === 'completed') list = completed;

            if (list.length === 0 && !loading) {
              return (
                <EmptyState
                  icon={Briefcase}
                  title="No bookings in this category"
                  description="When nearby customers post jobs and request bookings, they will appear here immediately."
                />
              );
            }

            return (
              <div className="space-y-3">
                {list.map((booking) => {
                  const customerName = booking.customer?.name || 'Customer';
                  const title = booking.job?.title || 'Job Request';
                  const price = booking.finalPrice || booking.proposedPrice || 0;

                  return (
                    <div
                      key={booking._id}
                      className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-300 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="font-bold text-stone-900 text-base">
                            {title}
                          </h3>
                          <StatusBadge status={booking.status} />
                        </div>

                        <p className="text-xs text-stone-500">
                          Customer: <strong className="text-stone-800">{customerName}</strong> • Scheduled: {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'Flexible'} ({booking.timeSlot || 'anytime'})
                        </p>

                        {booking.scope && (
                          <p className="text-xs text-stone-600 mt-1 italic">
                            Scope: "{booking.scope}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                        <div className="text-left sm:text-right">
                          <div className="text-lg font-black text-stone-950 font-display">
                            ₹{price.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-stone-400 font-semibold uppercase">
                            {booking.status === 'accepted' ? 'Agreed Price' : 'Offered Price'}
                          </div>
                        </div>

                        <Link
                          to={`/bookings/${booking._id}`}
                          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm flex items-center gap-1 transition-all"
                        >
                          <span>Manage Request</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
