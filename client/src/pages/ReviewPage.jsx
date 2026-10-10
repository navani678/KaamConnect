import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import * as reviewsApi from '../api/reviews.js';
import * as bookingsApi from '../api/bookings.js';
import StarRating from '../components/StarRating.jsx';

export default function ReviewPage() {
  const { id: bookingId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    bookingsApi.getBookingById(bookingId).then((res) => {
      setBooking(res);
    }).catch(() => null);
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await reviewsApi.createReview({
        booking: bookingId,
        rating,
        comment
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-xl mx-auto px-4">
        <Link
          to={`/bookings/${bookingId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Booking</span>
        </Link>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-stone-900 font-display">
              Rate Your Experience
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Your feedback directly updates the worker's reputation score on KaamConnect AI
            </p>
          </div>

          {success ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-stone-900 text-lg">Thank You!</h3>
              <p className="text-xs text-stone-500">Your review has been published.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Interactive Stars Selector */}
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-2">
                <div className="text-xs font-bold text-stone-700">Select Star Rating</div>
                <div className="flex justify-center">
                  <StarRating rating={rating} size="lg" interactive={true} onChange={setRating} />
                </div>
                <div className="text-xs font-extrabold text-amber-700">
                  {rating === 5 && 'Outstanding & Prompt Work'}
                  {rating === 4 && 'Good Work Quality'}
                  {rating === 3 && 'Average Service'}
                  {rating === 2 && 'Below Expectations'}
                  {rating === 1 && 'Poor Experience'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Write Your Feedback (Max 500 characters)
                </label>
                <textarea
                  rows={4}
                  maxLength={500}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details regarding punctuality, skill level, and price fairness..."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Verified Review</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
