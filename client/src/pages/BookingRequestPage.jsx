import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  Clock,
  Sparkles,
  Send,
  AlertCircle
} from 'lucide-react';
import * as jobsApi from '../api/jobs.js';
import * as workersApi from '../api/workers.js';
import * as bookingsApi from '../api/bookings.js';

export default function BookingRequestPage() {
  const { id: jobId, workerId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    proposedPrice: 3000,
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSlot: 'morning',
    scope: '',
    message: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobRes, workerRes] = await Promise.all([
          jobsApi.getJobById(jobId).catch(() => null),
          workersApi.getWorkerById(workerId).catch(() => null)
        ]);
        setJob(jobRes);
        setWorker(workerRes);

        if (jobRes) {
          setFormData(prev => ({
            ...prev,
            proposedPrice: jobRes.budgetMin || 2500,
            scope: jobRes.title || '',
            scheduledDate: jobRes.preferredDate ? new Date(jobRes.preferredDate).toISOString().split('T')[0] : prev.scheduledDate,
            timeSlot: jobRes.preferredTimeSlot || 'morning'
          }));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId, workerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.proposedPrice || formData.proposedPrice <= 0) {
      setError('Please provide a valid proposed offer price.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        job: jobId,
        worker: worker?.user?._id || workerId,
        workerProfile: worker?._id || workerId,
        scope: formData.scope || job?.title || 'Assigned Scope',
        proposedPrice: Number(formData.proposedPrice),
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        timeSlot: formData.timeSlot,
        message: formData.message || 'Looking forward to working with you.'
      };

      const res = await bookingsApi.createBooking(payload);
      const bookingId = res._id || res.id;
      navigate(`/bookings/${bookingId}`);
    } catch (err) {
      setError(err.message || 'Failed to submit booking request. Please check details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const workerUser = worker?.user || {};

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Link
          to={`/customer/jobs/${jobId}/matches`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Matches</span>
        </Link>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
          <div className="mb-6 pb-4 border-b border-stone-100">
            <h1 className="text-2xl font-black text-stone-900 font-display">
              Request Booking & Send Offer
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Send your preferred schedule and offer price directly to {workerUser.name || 'Worker'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Job & Worker Summary Strip */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 mb-6 flex items-center justify-between gap-4 text-xs">
            <div>
              <div className="font-bold text-stone-900">{job?.title || 'Job Request'}</div>
              <div className="text-stone-500 capitalize">Profession: {job?.profession}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-stone-900">Worker: {workerUser.name || 'Selected'}</div>
              <div className="text-amber-700 font-semibold">{worker?.experienceYears || 5}+ yrs experience</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Initial Offer Price (₹ INR) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-stone-400">₹</span>
                <input
                  type="number"
                  required
                  min="100"
                  step="50"
                  value={formData.proposedPrice}
                  onChange={(e) => setFormData({ ...formData, proposedPrice: e.target.value })}
                  className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Worker can accept this price or make a counter-offer in the chat.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Scheduled Work Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Time Slot
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 capitalize"
                >
                  <option value="morning">Morning (8 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                  <option value="evening">Evening (4 PM - 8 PM)</option>
                  <option value="anytime">Anytime</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Agreed Work Scope Summary
              </label>
              <input
                type="text"
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                placeholder="e.g. 3 room fan fixtures, wiring check, LED panels"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Note / Message for Worker (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Add landmark, arrival instructions, or specific tools needed..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Booking Request</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
