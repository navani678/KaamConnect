import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  MapPin,
  Calendar,
  IndianRupee,
  ShieldCheck,
  Upload
} from 'lucide-react';
import * as workersApi from '../api/workers.js';
import * as metaApi from '../api/meta.js';
import LocationPicker from '../components/LocationPicker.jsx';
import MediaUploader from '../components/MediaUploader.jsx';

export default function WorkerProfileEditor() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [availableProfessions, setAvailableProfessions] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [formData, setFormData] = useState({
    professions: ['electrician'],
    specializations: ['wiring', 'fan installation', 'MCB repair'],
    bio: '',
    experienceYears: 5,
    rateType: 'daily',
    rate: 800,
    serviceRadiusKm: 15,
    location: { lat: 17.9689, lng: 79.5941 },
    addressText: 'Subedari, Hanamkonda',
    availability: {
      weeklyDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      slots: ['morning', 'afternoon', 'evening'],
      isAvailableNow: true
    },
    languages: ['te', 'hi', 'en'],
    portfolio: []
  });

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [profRes, meRes] = await Promise.all([
          metaApi.getProfessions().catch(() => []),
          workersApi.getWorkerProfileMe().catch(() => null)
        ]);

        setAvailableProfessions(Array.isArray(profRes) ? profRes : profRes?.professions || []);

        if (meRes) {
          setFormData({
            professions: meRes.professions || ['electrician'],
            specializations: meRes.specializations || [],
            bio: meRes.bio || '',
            experienceYears: meRes.experienceYears || 5,
            rateType: meRes.rateType || 'daily',
            rate: meRes.rate || 800,
            serviceRadiusKm: meRes.serviceRadiusKm || 15,
            location: {
              lat: meRes.location?.coordinates?.[1] || 17.9689,
              lng: meRes.location?.coordinates?.[0] || 79.5941
            },
            addressText: meRes.addressText || 'Subedari, Hanamkonda',
            availability: meRes.availability || {
              weeklyDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
              slots: ['morning', 'afternoon', 'evening'],
              isAvailableNow: true
            },
            languages: meRes.languages || ['te', 'hi', 'en'],
            portfolio: meRes.portfolio || []
          });
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleToggleProfession = (profId) => {
    const exists = formData.professions.includes(profId);
    if (exists && formData.professions.length === 1) {
      setError('You must keep at least one primary profession.');
      return;
    }
    setError(null);
    const updated = exists
      ? formData.professions.filter(p => p !== profId)
      : [...formData.professions, profId];
    setFormData({ ...formData, professions: updated });
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    if (!formData.specializations.includes(newSkillInput.trim())) {
      setFormData({
        ...formData,
        specializations: [...formData.specializations, newSkillInput.trim()]
      });
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      specializations: formData.specializations.filter(s => s !== skill)
    });
  };

  const handleToggleWeekday = (day) => {
    const current = formData.availability.weeklyDays || [];
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    setFormData({
      ...formData,
      availability: { ...formData.availability, weeklyDays: updated }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await workersApi.updateWorkerProfileMe(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const weekdays = [
    { id: 'mon', label: 'Mon' },
    { id: 'tue', label: 'Tue' },
    { id: 'wed', label: 'Wed' },
    { id: 'thu', label: 'Thu' },
    { id: 'fri', label: 'Fri' },
    { id: 'sat', label: 'Sat' },
    { id: 'sun', label: 'Sun' }
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          to="/worker/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Worker Dashboard</span>
        </Link>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-4 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-stone-900 font-display">
                Edit Worker Profile & Rates
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Configure your trade skills, hourly/daily quotes, service radius, and portfolio
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile changes saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Primary Professions Selection */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                Your Primary Trades / Professions (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'electrician', 'plumber', 'carpenter', 'painter', 'mason',
                  'tiles_flooring', 'welder', 'roofer', 'house_cleaning', 'construction_labourer'
                ].map((prof) => {
                  const isSelected = formData.professions.includes(prof);
                  return (
                    <button
                      key={prof}
                      type="button"
                      onClick={() => handleToggleProfession(prof)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all capitalize ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {t(`professions.${prof}`, prof.replace('_', ' '))}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specialization Chips */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Specialised Skills & Keywords (Helps AI match you to specific customer jobs)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="e.g. Inverter wiring, False ceiling, CPVC pipes..."
                  className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800"
                >
                  + Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {formData.specializations.map((spec, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold"
                  >
                    <span>{spec}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(spec)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Rates & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Rate Type
                </label>
                <select
                  value={formData.rateType}
                  onChange={(e) => setFormData({ ...formData, rateType: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-semibold"
                >
                  <option value="daily">Daily Wage (₹ / day)</option>
                  <option value="hourly">Hourly Rate (₹ / hr)</option>
                  <option value="project">Project Baseline (₹ / job)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Standard Rate (₹ INR)
                </label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="45"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            {/* Service Radius Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1.5">
                <span>Maximum Travel Distance / Service Radius</span>
                <span className="text-amber-600">{formData.serviceRadiusKm} km radius</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={formData.serviceRadiusKm}
                onChange={(e) => setFormData({ ...formData, serviceRadiusKm: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Base GPS Location */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                Your Home Base / Workshop Location (Kazipet / Warangal)
              </label>
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

            {/* Weekly Available Days */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                Weekly Working Days
              </label>
              <div className="grid grid-cols-7 gap-2">
                {weekdays.map((d) => {
                  const active = formData.availability.weeklyDays?.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleToggleWeekday(d.id)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        active
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-stone-50 text-stone-600 border-stone-200'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bio Textarea */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Short Professional Bio (Max 500 characters)
              </label>
              <textarea
                rows={3}
                maxLength={500}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Share your work experience, past commercial clients, or certifications..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Portfolio Photos */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Work Portfolio Photos
              </label>
              <MediaUploader
                media={formData.portfolio}
                maxFiles={6}
                onChange={(newMedia) => setFormData({ ...formData, portfolio: newMedia })}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile & Update Rates</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
