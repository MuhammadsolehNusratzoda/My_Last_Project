import { useState } from 'react';
import { useAuthStore } from '../app/store';
import { useTranslation } from '../hooks/useTranslation';
import { User, Mail, Shield, Phone, Loader2, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, token, setAuth } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    setTimeout(() => {
      if (user && token) {
        // Save updated details into Zustand store
        setAuth(token, '', {
          ...user,
          fullName,
          phoneNumber,
        });
      }
      setLoading(false);
      setSuccess(true);
    }, 800);
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
