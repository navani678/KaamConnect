import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Award,
  Globe,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import * as workersApi from '../api/workers.js';
import StarRating from '../components/StarRating.jsx';
import Modal from '../components/Modal.jsx';

export default function WorkerProfilePage() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [workerRes, reviewsRes] = await Promise.all([
          workersApi.getWorkerById(id).catch(() => null),
          workersApi.getWorkerReviews(id).catch(() => ({ items: [] }))
        ]);
        setWorker(workerRes);
        setReviews(reviewsRes.items || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-stone-50 p-8 text-center">
        <p className="text-stone-600">Worker profile not found.</p>
        <Link to="/" className="text-amber-600 font-bold mt-2 inline-block">
          ← Return to Home
        </Link>
      </div>
    );
  }

  const user = worker.user || {};
  const photo = user.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80';
  const name = user.name || 'Skilled Professional';
  const profession = worker.professions?.[0] || 'worker';
  const rate = worker.rate || 800;
  const rateType = worker.rateType || 'daily';

  return (
    <div className="min-h-screen bg-stone-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          to={-1}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-stone-100">
            <div className="flex items-start gap-4">
              <img
                src={photo}
                alt={name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-stone-100 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
                    {name}
                  </h1>
                  {worker.verification?.idVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      ID Verified
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-bold text-amber-700 capitalize mt-1">
                  {t(`professions.${profession}`, profession)} • {worker.experienceYears || 5}+ Years Experience
                </p>

                <div className="flex items-center gap-4 text-xs text-stone-500 mt-2 flex-wrap">
                  <StarRating rating={worker.ratingAvg || 4.8} count={worker.ratingCount || reviews.length} size="md" />
                  <span className="flex items-center gap-1 text-stone-600">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {worker.addressText || 'Warangal & Hanamkonda'}
                  </span>
                </div>
              </div>
            </div>

            {/* Rate & Direct Action */}
            <div className="text-left sm:text-right bg-amber-50/60 p-4 rounded-2xl border border-amber-200 self-stretch sm:self-auto">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Standard Baseline Rate
              </div>
              <div className="text-2xl font-black text-stone-950 font-display">
                ₹{rate.toLocaleString('en-IN')} <span className="text-xs text-stone-500 font-medium">/{rateType}</span>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="mt-6">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              About & Experience
            </h3>
            <p className="text-sm text-stone-700 leading-relaxed">
              {worker.bio || 'Skilled certified technician available for home and commercial repair, maintenance, and new installations.'}
            </p>
          </div>

          {/* Specializations & Skills */}
          {worker.specializations && worker.specializations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2.5">
                Specialised Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {worker.specializations.map((spec, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-stone-100 text-stone-800 rounded-xl text-xs font-semibold border border-stone-200"
                  >
                    ✓ {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages & Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-stone-100 text-xs">
            <div className="flex items-center gap-2 text-stone-600">
              <Globe className="w-4 h-4 text-amber-500" />
              <span>Languages: <strong className="text-stone-900 font-semibold">{worker.languages?.join(', ').toUpperCase() || 'EN, TE, HI'}</strong></span>
            </div>

            <div className="flex items-center gap-2 text-stone-600">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Available Days: <strong className="text-stone-900 font-semibold">{worker.availability?.weeklyDays?.join(', ').toUpperCase() || 'MON-SAT'}</strong></span>
            </div>
          </div>
        </div>

        {/* Portfolio Gallery */}
        {worker.portfolio && worker.portfolio.length > 0 && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm mb-6">
            <h3 className="text-base font-black text-stone-900 font-display mb-4">
              Work Portfolio & Site Photos ({worker.portfolio.length})
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {worker.portfolio.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPhoto(item)}
                  className="group relative rounded-2xl overflow-hidden border border-stone-200 aspect-video bg-stone-100 cursor-pointer shadow-sm hover:shadow-md transition-all"
                >
                  <img
                    src={item.url}
                    alt={item.caption || 'Portfolio work'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {item.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-stone-950/80 backdrop-blur-sm p-2 text-[11px] text-white font-medium truncate">
                      {item.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews List */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
            <div>
              <h3 className="text-base font-black text-stone-900 font-display">
                Verified Customer Reviews
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Feedback from completed bookings in the region
              </p>
            </div>
            <div className="text-right">
              <StarRating rating={worker.ratingAvg || 4.8} size="md" />
            </div>
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-stone-400 italic">No reviews recorded yet for this profile.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">
                      {rev.customer?.name || 'Verified Customer'}
                    </span>
                    <StarRating rating={rev.rating} size="sm" />
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                  <div className="text-[10px] text-stone-400">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent review'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <Modal isOpen={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} title={selectedPhoto.caption || 'Work Preview'}>
          <div className="space-y-3">
            <img src={selectedPhoto.url} alt={selectedPhoto.caption} className="w-full rounded-2xl max-h-[70vh] object-contain mx-auto" />
            {selectedPhoto.caption && (
              <p className="text-xs text-stone-600 text-center font-medium">{selectedPhoto.caption}</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
