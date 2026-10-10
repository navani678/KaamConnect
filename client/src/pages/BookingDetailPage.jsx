import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Phone,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  Sparkles,
  Star,
  Flag,
  Calendar,
  Clock
} from 'lucide-react';
import * as bookingsApi from '../api/bookings.js';
import * as reportsApi from '../api/reports.js';
import StatusBadge from '../components/StatusBadge.jsx';
import BookingTimeline from '../components/BookingTimeline.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function BookingDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals state
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('other');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const res = await bookingsApi.getBookingById(id);
      setBooking(res);
      setCounterPrice(res.proposedPrice || 3000);
    } catch (e) {
      setError(e.message || 'Failed to load booking.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const isWorker = user?.role === 'worker';
  const isCustomer = user?.role === 'customer';
  const status = booking?.status?.toLowerCase() || 'pending';

  // State machine actions
  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await bookingsApi.acceptBooking(id);
      await fetchBooking();
    } catch (e) {
      setError(e.message || 'Could not accept booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCounter = async (e) => {
    e.preventDefault();
    if (!counterPrice || Number(counterPrice) <= 0) return;
    setActionLoading(true);
    try {
      await bookingsApi.counterBooking(id, {
        price: Number(counterPrice),
        message: counterMessage
      });
      setCounterModalOpen(false);
      await fetchBooking();
    } catch (e) {
      setError(e.message || 'Could not submit counter offer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCounter = async () => {
    setActionLoading(true);
    try {
      await bookingsApi.confirmCounter(id);
      await fetchBooking();
    } catch (e) {
      setError(e.message || 'Could not confirm counter offer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await bookingsApi.rejectBooking(id, rejectReason);
      setRejectModalOpen(false);
      await fetchBooking();
    } catch (e) {
      setError(e.message || 'Could not reject booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await bookingsApi.completeBooking(id);
      await fetchBooking();
    } catch (e) {
      setError(e.message || 'Could not complete booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await reportsApi.createReport({
        booking: id,
        against: isWorker ? booking.customer?._id : booking.worker?._id,
        reason: reportReason,
        details: reportDetails
      });
      setReportSubmitted(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSubmitted(false);
      }, 1500);
    } catch (e) {
      setError(e.message || 'Could not submit report.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-stone-50 p-8 text-center">
        <p className="text-stone-600">Booking not found.</p>
        <Link to="/" className="text-amber-600 font-bold mt-2 inline-block">
          ← Return to Home
        </Link>
      </div>
    );
  }

  const otherPerson = isWorker ? booking.customer : booking.worker;
  const currentPrice = booking.finalPrice || booking.proposedPrice || 0;

  return (
    <div className="min-h-screen bg-stone-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          to={isWorker ? '/worker/dashboard' : '/customer/dashboard'}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs sm:text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold text-xs underline">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left Column: Timeline & Action Control */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Box */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Booking #{booking._id.slice(-6)}
                    </span>
                    <StatusBadge status={booking.status} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                    {booking.job?.title || 'Job Service'}
                  </h1>
                </div>

                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-black text-stone-950 font-display">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-stone-400 font-semibold uppercase">
                    {status === 'accepted' || status === 'completed' ? 'Agreed Price' : 'Current Offer'}
                  </div>
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="pt-6">
                {/* WORKER ACTIONS */}
                {isWorker && status === 'pending' && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-stone-700">Action Required: Respond to this offer</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleAccept}
                        disabled={actionLoading}
                        className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Offer at ₹{currentPrice}</span>
                      </button>

                      <button
                        onClick={() => setCounterModalOpen(true)}
                        disabled={actionLoading}
                        className="py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        Counter Offer
                      </button>

                      <button
                        onClick={() => setRejectModalOpen(true)}
                        disabled={actionLoading}
                        className="py-3 px-4 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-700 font-bold text-xs rounded-xl border border-stone-200 transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {/* CUSTOMER ACTIONS (When worker countered) */}
                {isCustomer && status === 'countered' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 font-medium">
                      Worker proposed a counter price of <strong>₹{currentPrice}</strong>. Would you like to confirm?
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirmCounter}
                        disabled={actionLoading}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Counter (₹{currentPrice})</span>
                      </button>

                      <button
                        onClick={() => setRejectModalOpen(true)}
                        disabled={actionLoading}
                        className="py-3 px-4 bg-stone-100 text-stone-700 font-bold text-xs rounded-xl hover:bg-red-50 hover:text-red-700 transition-all"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {/* ACCEPTED ACTIONS */}
                {status === 'accepted' && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-emerald-900 text-xs font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Booking Confirmed! You can now contact each other directly.</span>
                    </div>

                    <button
                      onClick={handleComplete}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                      Mark Job as Completed
                    </button>
                  </div>
                )}

                {/* COMPLETED ACTIONS */}
                {status === 'completed' && isCustomer && (
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-stone-900 text-xs">Job Completed!</div>
                      <p className="text-[11px] text-stone-500">Rate your experience to help the worker build reputation.</p>
                    </div>

                    <Link
                      to={`/customer/bookings/${booking._id}/review`}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 fill-stone-950" />
                      <span>Leave Review</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Negotiation & Timeline */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-black text-stone-900 font-display mb-6">
                Booking Status & State Progression
              </h3>
              <BookingTimeline booking={booking} />
            </div>
          </div>

          {/* Right Sidebar: Details & Counterpart Card */}
          <div className="space-y-6">
            {/* Counterpart Card */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                {isWorker ? 'Customer Information' : 'Worker Information'}
              </h3>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-base">
                  {otherPerson?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-sm">{otherPerson?.name || 'User'}</div>
                  <div className="text-xs text-stone-500 capitalize">{isWorker ? 'Job Creator' : 'Assigned Tradesman'}</div>
                </div>
              </div>

              {/* Privacy protection: phone only after accepted */}
              <div className="pt-3 border-t border-stone-100">
                {status === 'accepted' || status === 'completed' ? (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-bold">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>+91 {otherPerson?.phone || '9848012345'}</span>
                  </div>
                ) : (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Phone number revealed once booking is accepted</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scope Summary */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-3 text-xs">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Agreed Scope & Schedule
              </h3>
              <div className="space-y-2 text-stone-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>{booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'Date flexible'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="capitalize">{booking.timeSlot || 'anytime'} slot</span>
                </div>
                {booking.scope && (
                  <div className="pt-2 border-t border-stone-100 italic text-stone-600">
                    "{booking.scope}"
                  </div>
                )}
              </div>
            </div>

            {/* Report Button */}
            <button
              onClick={() => setReportModalOpen(true)}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report an Issue / Misconduct</span>
            </button>
          </div>
        </div>
      </div>

      {/* COUNTER OFFER MODAL */}
      <Modal isOpen={counterModalOpen} onClose={() => setCounterModalOpen(false)} title="Make a Counter Offer">
        <form onSubmit={handleCounter} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Your Counter Price (₹ INR)
            </label>
            <input
              type="number"
              required
              min="100"
              value={counterPrice}
              onChange={(e) => setCounterPrice(e.target.value)}
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Reason / Message for Customer
            </label>
            <textarea
              rows={3}
              value={counterMessage}
              onChange={(e) => setCounterMessage(e.target.value)}
              placeholder="e.g. Requires additional heavy-duty cables or helper..."
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCounterModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow"
            >
              Send Counter Offer
            </button>
          </div>
        </form>
      </Modal>

      {/* REJECT MODAL */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Decline Booking Request">
        <form onSubmit={handleReject} className="space-y-4">
          <p className="text-xs text-stone-600">
            Are you sure you want to decline this booking? Please provide a brief reason.
          </p>
          <input
            type="text"
            required
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Schedule clash / out of station..."
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow"
            >
              Confirm Decline
            </button>
          </div>
        </form>
      </Modal>

      {/* REPORT ISSUE MODAL */}
      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Report an Issue">
        {reportSubmitted ? (
          <div className="p-6 text-center text-xs font-bold text-emerald-600">
            ✓ Report submitted successfully. Our safety team will review it.
          </div>
        ) : (
          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Reason</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
              >
                <option value="misconduct">Misconduct / Unprofessional Behavior</option>
                <option value="no_show">No Show / Unreachable</option>
                <option value="overcharging">Overcharging / Unagreed Demands</option>
                <option value="poor_quality">Poor Work Quality</option>
                <option value="safety">Safety / Hazard Concerns</option>
                <option value="other">Other Issue</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Details</label>
              <textarea
                rows={3}
                required
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Describe what occurred..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
