import React, { useState } from 'react';
import { UploadCloud, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as uploadsApi from '../api/uploads.js';

export default function MediaUploader({ media = [], maxFiles = 6, onChange }) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (media.length + files.length > maxFiles) {
      setError(`You can upload at most ${maxFiles} photos or videos.`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const res = await uploadsApi.uploadFiles(formData);
      const newItems = res.files || [];
      onChange([...media, ...newItems]);
    } catch (err) {
      setError(err.message || 'Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index) => {
    const updated = media.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Upload Dropzone */}
      <div className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl p-6 text-center bg-stone-50/50 hover:bg-amber-50/20 transition-colors cursor-pointer relative group">
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          disabled={uploading || media.length >= maxFiles}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-xs font-semibold text-stone-700">Uploading photos/videos...</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                <UploadCloud className="w-5 h-5 text-stone-600 group-hover:text-amber-600" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-stone-800">
                  {t('jobForm.uploadPrompt', 'Click or drag photos/videos of the work needed')}
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  PNG, JPG, MP4 up to 10MB (max {maxFiles} files)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          {error}
        </p>
      )}

      {/* Previews Grid */}
      {media.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
          {media.map((item, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden border border-stone-200 aspect-square bg-stone-100 shadow-sm">
              {item.type === 'video' ? (
                <div className="w-full h-full flex items-center justify-center bg-stone-900 text-white">
                  <Video className="w-6 h-6" />
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={`Upload ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              )}

              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1 right-1 bg-stone-900/80 hover:bg-red-600 text-white p-1 rounded-full opacity-90 group-hover:opacity-100 transition-all shadow"
                title="Remove photo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
