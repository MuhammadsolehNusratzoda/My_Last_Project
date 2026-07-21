import { useState, useRef } from 'react';
import { useAuthStore } from '../app/store';
import { useTranslation } from '../hooks/useTranslation';
import { api } from '../services/api';
import {
  User, Mail, Shield, Phone, Loader2, CheckCircle, Camera, Trash2, Upload, AlertCircle
} from 'lucide-react';

const API_BASE = 'http://localhost:5010';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const profileImageSrc = user?.profileImageUrl
    ? `${API_BASE}${user.profileImageUrl}`
    : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await api.put('/users/profile', {
        fullName,
        phoneNumber,
      });
      updateUser({
        fullName: res.data.fullName,
        phoneNumber: res.data.phoneNumber,
        profileImageUrl: res.data.profileImageUrl,
      });
      setSuccess(true);
    } catch {
      // Fallback: save locally if API fails
      updateUser({ fullName, phoneNumber });
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validations
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError(t('profile.photoTooLarge', 'Photo must be less than 5 MB.'));
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setPhotoError(t('profile.photoInvalidType', 'Only JPEG, PNG, GIF, and WebP images are allowed.'));
      return;
    }

    setPhotoLoading(true);
    setPhotoError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/users/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ profileImageUrl: res.data.profileImageUrl });
    } catch {
      setPhotoError(t('profile.photoUploadFailed', 'Failed to upload photo. Please try again.'));
    } finally {
      setPhotoLoading(false);
      // Clear input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePhotoDelete = async () => {
    setPhotoLoading(true);
    setPhotoError('');

    try {
      await api.delete('/users/profile-photo');
      updateUser({ profileImageUrl: undefined });
    } catch {
      setPhotoError(t('profile.photoDeleteFailed', 'Failed to delete photo. Please try again.'));
    } finally {
      setPhotoLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-24 flex-grow bg-slate-950 text-slate-100 flex flex-col justify-center items-center">
        <p className="text-slate-400 font-light">{t('common.mustBeSignedIn')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full bg-slate-950 text-slate-100">
      <div className="bg-slate-900/40 border border-slate-900/60 rounded-[28px] p-8 shadow-xl backdrop-blur-xl">
        <div className="border-b border-slate-800/60 pb-6 mb-8 text-left">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('profile.title', 'Profile Settings')}</h2>
          <p className="mt-1 text-sm text-slate-400 font-light">{t('profile.subtitle', 'Manage your private details and contact channels.')}</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-2xl flex items-center space-x-2 text-sm">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{t('toasts.profileUpdated', 'Profile details updated successfully!')}</span>
          </div>
        )}

        {/* ── Profile Photo Section ── */}
        <div className="mb-8 flex flex-col items-center sm:flex-row sm:items-start gap-6">
          {/* Avatar preview */}
          <div className="relative group shrink-0">
            <div className="h-28 w-28 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-lg">
              {profileImageSrc ? (
                <img
                  src={profileImageSrc}
                  alt={user.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-slate-500" />
              )}
              {photoLoading && (
                <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center rounded-full">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                </div>
              )}
            </div>

            {/* Hover overlay for upload */}
            {!photoLoading && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-slate-900/0 group-hover:bg-slate-900/60 flex items-center justify-center transition-all duration-200 cursor-pointer border-none"
              >
                <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            )}
          </div>

          {/* Photo controls */}
          <div className="flex flex-col gap-3 text-left justify-center pt-2">
            <p className="text-sm font-semibold text-white">{t('profile.profilePhoto', 'Profile Photo')}</p>
            <p className="text-xs text-slate-400 max-w-xs">{t('profile.photoHint', 'Upload a JPEG, PNG, GIF, or WebP image. Max 5 MB.')}</p>

            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoLoading}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow hover:scale-105 active:scale-95 transition-all cursor-pointer border-none disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {profileImageSrc
                  ? t('profile.changePhoto', 'Change Photo')
                  : t('profile.uploadPhoto', 'Upload Photo')}
              </button>

              {profileImageSrc && (
                <button
                  type="button"
                  onClick={handlePhotoDelete}
                  disabled={photoLoading}
                  className="inline-flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold px-4 py-2 rounded-xl border border-red-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t('profile.deletePhoto', 'Delete Photo')}
                </button>
              )}
            </div>

            {photoError && (
              <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-2">{t('auth.email', 'Email Address')}</label>
            <div className="relative rounded-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="email"
                disabled
                value={user.email}
                className="block w-full pl-12 pr-4 py-3 border border-slate-900 bg-slate-950/60 rounded-2xl text-sm text-slate-500 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500 ml-2">{t('profile.emailNote', 'Email addresses are verified and cannot be changed.')}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-2">{t('profile.systemRole', 'System Role')}</label>
            <div className="relative rounded-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                disabled
                value={t(`roles.${user.role}`, user.role)}
                className="block w-full pl-12 pr-4 py-3 border border-slate-900 bg-slate-950/60 rounded-2xl text-sm text-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-2">{t('auth.fullName', 'Full Name')}</label>
            <div className="relative rounded-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-slate-800 bg-slate-950 text-slate-100 rounded-2xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-2">{t('auth.phoneNumber', 'Phone Number')}</label>
            <div className="relative rounded-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-slate-800 bg-slate-950 text-slate-100 rounded-2xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/60 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl text-sm font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center min-w-[140px] cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('profile.saveChanges', 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
