import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Clock,
  Sparkles,
  MapPin,
  AlertCircle
} from 'lucide-react';
import ProfessionCard from '../components/ProfessionCard.jsx';
import LocationPicker from '../components/LocationPicker.jsx';
import MediaUploader from '../components/MediaUploader.jsx';
import * as jobsApi from '../api/jobs.js';
import * as metaApi from '../api/meta.js';

export default function PostJobPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [professions, setProfessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initialProfession = searchParams.get('profession') || 'electrician';

  const [formData, setFormData] = useState({
    profession: initialProfession,
    title: '',
    description: '',
    media: [],
    budgetMin: 2000,
    budgetMax: 5000,
    preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    preferredTimeSlot: 'morning',
    estimatedDuration: { value: 1, unit: 'days' },
    location: { lat: 17.9689, lng: 79.5941 },
    addressText: 'Subedari, Hanamkonda'
  });

  useEffect(() => {
    metaApi.getProfessions().then((res) => {
      const list = Array.isArray(res) ? res : res?.professions || [];
      setProfessions(list);
    }).catch(() => {
      setProfessions([
        { id: 'electrician', name: 'Electrician' },
        { id: 'plumber', name: 'Plumber' },
        { id: 'carpenter', name: 'Carpenter' },
        { id: 'painter', name: 'Painter' },
        { id: 'mason', name: 'Mason' },
        { id: 'tiles_flooring', name: 'Tiles & Flooring' },
        { id: 'welder', name: 'Welder' },
        { id: 'roofer', name: 'Roofer' },
        { id: 'house_cleaning', name: 'Deep Cleaning' },
        { id: 'construction_labourer', name: 'Labourer' }
      ]);
    });
  }, []);

  const handleNextStep = () => {
    if (step === 2 && !formData.title.trim()) {
      setError('Please provide a brief job title or summary.');
      return;
    }
    setError(null);
    setStep(s => Math.min(5, s + 1));
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(s => Math.max(1, s - 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        profession: formData.profession,
        title: formData.title || `Need ${formData.profession} services`,
        description: formData.description,
        media: formData.media,
        location: {
          lat: formData.location.lat,
          lng: formData.location.lng
        },
        addressText: formData.addressText,
        budgetMin: Number(formData.budgetMin) || 1000,
        budgetMax: Number(formData.budgetMax) || 5000,
        preferredDate: formData.preferredDate ? new Date(formData.preferredDate).toISOString() : new Date().toISOString(),
        preferredTimeSlot: formData.preferredTimeSlot,
        estimatedDuration: formData.estimatedDuration
      };

      const created = await jobsApi.createJob(payload);
      const jobId = created._id || created.id;
      // Navigate directly to AI Matches page
      navigate(`/customer/jobs/${jobId}/matches`);
    } catch (err) {
      setError(err.message || 'Failed to submit job. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Wizard Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Step {step} of 5
            </span>
            <span className="text-xs font-semibold text-stone-500">
              {step === 1 && 'Select Profession'}
              {step === 2 && 'Work Scope & Photos'}
              {step === 3 && 'Budget & Timing'}
              {step === 4 && 'GPS Location'}
              {step === 5 && 'Review & Match'}
            </span>
          </div>

          <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Step Cards */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
          {/* STEP 1: Select Profession */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                  What trade professional do you need?
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Select the core skill required for your work request
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {professions.map((prof) => {
                  const profId = typeof prof === 'string' ? prof : (prof.value || prof.id || '');
                  return (
                    <ProfessionCard
                      key={profId}
                      profession={profId}
                      isSelected={formData.profession === profId}
                      onClick={() => setFormData({ ...formData, profession: profId })}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Description & Photos */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                  Describe your job requirements
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Clear details help workers provide accurate estimates and accurate AI matching
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Job Summary Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Install lights & ceiling fans in 3 rooms"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Detailed Description (Optional)
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe specific tasks, e.g. need concealed wiring check, 3 fan fixtures mounted on ceiling, 8 LED lights fitted..."
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Add Site Photos / Videos (Up to 6 files)
                </label>
                <MediaUploader
                  media={formData.media}
                  maxFiles={6}
                  onChange={(newMedia) => setFormData({ ...formData, media: newMedia })}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Budget & Preferred Date */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                  Budget & Schedule
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Set your expected budget range and convenient time slot
                </p>
              </div>

              {/* Budget Bracket */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
                <label className="block text-xs font-bold text-stone-800 mb-2">
                  Budget Range (₹ INR)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] text-stone-500 font-medium">Minimum (₹)</span>
                    <input
                      type="number"
                      min="500"
                      step="100"
                      value={formData.budgetMin}
                      onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-bold mt-1 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-500 font-medium">Maximum (₹)</span>
                    <input
                      type="number"
                      min="500"
                      step="100"
                      value={formData.budgetMax}
                      onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-bold mt-1 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Date & Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Preferred Time Slot
                  </label>
                  <select
                    value={formData.preferredTimeSlot}
                    onChange={(e) => setFormData({ ...formData, preferredTimeSlot: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 capitalize"
                  >
                    <option value="morning">Morning (8 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                    <option value="evening">Evening (4 PM - 8 PM)</option>
                    <option value="anytime">Anytime during day</option>
                  </select>
                </div>
              </div>

              {/* Duration Estimate */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Estimated Work Duration
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="1"
                    value={formData.estimatedDuration.value}
                    onChange={(e) => setFormData({
                      ...formData,
                      estimatedDuration: { ...formData.estimatedDuration, value: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                  <select
                    value={formData.estimatedDuration.unit}
                    onChange={(e) => setFormData({
                      ...formData,
                      estimatedDuration: { ...formData.estimatedDuration, unit: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: GPS Location Map */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                  Set Work Site Location
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Use your browser GPS or drag the pin to find nearest local tradesmen
                </p>
              </div>

              <LocationPicker
                initialLat={formData.location.lat}
                initialLng={formData.location.lng}
                addressText={formData.addressText}
                onChange={({ lat, lng, addressText }) => {
                  setFormData({
                    ...formData,
                    location: { lat, lng },
                    addressText
                  });
                }}
              />
            </div>
          )}

          {/* STEP 5: Review & Submit */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                  Review & Find Matches
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Verify your job request details before running the AI matching engine
                </p>
              </div>

              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4 text-xs sm:text-sm">
                <div className="flex justify-between pb-3 border-b border-stone-200">
                  <span className="text-stone-500">Profession:</span>
                  <span className="font-bold text-stone-900 capitalize bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    {t(`professions.${formData.profession}`, formData.profession)}
                  </span>
                </div>

                <div className="flex justify-between pb-3 border-b border-stone-200">
                  <span className="text-stone-500">Title:</span>
                  <span className="font-bold text-stone-900 text-right max-w-xs">{formData.title}</span>
                </div>

                <div className="flex justify-between pb-3 border-b border-stone-200">
                  <span className="text-stone-500">Budget Bracket:</span>
                  <span className="font-extrabold text-stone-950">
                    ₹{Number(formData.budgetMin).toLocaleString('en-IN')} - ₹{Number(formData.budgetMax).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between pb-3 border-b border-stone-200">
                  <span className="text-stone-500">Scheduled Date:</span>
                  <span className="font-bold text-stone-900">
                    {formData.preferredDate} ({formData.preferredTimeSlot})
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-stone-500">Work Site:</span>
                  <span className="font-bold text-stone-900 text-right max-w-xs">
                    📍 {formData.addressText || 'Warangal GPS Coordinates'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="px-6 py-3 rounded-xl bg-stone-950 hover:bg-stone-900 text-white font-black text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Matching Workers...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Post & Match Nearby Workers</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
