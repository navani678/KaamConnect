import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  Clock,
  MapPin,
  Sparkles,
  ChevronRight,
  User,
  Image as ImageIcon
} from 'lucide-react';
import * as jobsApi from '../api/jobs.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function JobDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsApi.getJobById(id).then((res) => {
      setJob(res);
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-stone-50 p-8 text-center">
        <p className="text-stone-600">Job post not found.</p>
        <Link to="/customer/dashboard" className="text-amber-600 font-bold mt-2 inline-block">
          ← Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          to="/customer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Dashboard</span>
        </Link>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 capitalize">
                  {t(`professions.${job.profession}`, job.profession)}
                </span>
                <StatusBadge status={job.status} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
                {job.title}
              </h1>
            </div>

            <Link
              to={`/customer/jobs/${job._id}/matches`}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>View AI Matches</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Work Description
            </h3>
            <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100">
              {job.description || 'No detailed notes provided.'}
            </p>
          </div>

          {/* Media Attachments */}
          {job.media && job.media.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
                Site Photos ({job.media.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {job.media.map((item, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                    <img src={item.url} alt={`Site photo ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Job Specifics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100 text-xs">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <div className="text-stone-400 font-semibold mb-1">Budget Bracket</div>
              <div className="text-base font-extrabold text-stone-900">
                ₹{job.budgetMin?.toLocaleString('en-IN')} - ₹{job.budgetMax?.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <div className="text-stone-400 font-semibold mb-1">Schedule</div>
              <div className="text-base font-extrabold text-stone-900">
                {job.preferredDate ? new Date(job.preferredDate).toLocaleDateString() : 'Flexible'} ({job.preferredTimeSlot || 'Anytime'})
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <div className="text-stone-400 font-semibold mb-1">Work Location</div>
              <div className="text-sm font-bold text-stone-900 truncate">
                📍 {job.addressText || 'Warangal Coordinates'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
