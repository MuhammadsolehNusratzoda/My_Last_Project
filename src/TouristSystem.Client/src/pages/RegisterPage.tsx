import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../services/api';
import { useAuthStore } from '../app/store';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { KeyRound, Mail, AlertCircle, Loader2, User, Phone } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const registerSchema = z.object({
  fullName: z.string().min(2, 'validation.fullNameMin'),
  email: z.string().email('validation.email'),
  password: z.string().min(6, 'validation.passwordMin'),
  phoneNumber: z.string().min(6, 'validation.phoneMin'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      const { userId, fullName, email, token } = response.data;

      setAuth(token, '', {
        id: userId,
        fullName,
        email,
        role: 'Tourist', // Newly registered accounts default to 'Tourist' role
        phoneNumber: data.phoneNumber,
      });

      navigate('/');
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || 'auth.registrationFailed';
      setError(t(rawMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto w-full max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          {t('auth.signUp', 'Create your account')}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          {t('auth.or', 'Or')}{' '}
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
            {t('auth.orSignIn', 'sign in to your account')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md">
        <div className="bg-slate-900/40 border border-slate-900/60 py-8 px-4 shadow-xl sm:rounded-[28px] sm:px-10 backdrop-blur-xl">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-2xl flex items-center space-x-2 text-sm text-left">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-2">{t('auth.fullName', 'Full Name')}</label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  {...register('fullName')}
                  type="text"
                  className={`block w-full pl-12 pr-4 py-3 border rounded-2xl bg-slate-950 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors text-sm ${
                    errors.fullName ? 'border-red-550' : 'border-slate-800'
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-400 ml-2">{t(errors.fullName.message || '')}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-2">{t('auth.email', 'Email Address')}</label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className={`block w-full pl-12 pr-4 py-3 border rounded-2xl bg-slate-950 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors text-sm ${
                    errors.email ? 'border-red-550' : 'border-slate-800'
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400 ml-2">{t(errors.email.message || '')}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-2">{t('auth.phoneNumber', 'Phone Number')}</label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  {...register('phoneNumber')}
                  type="text"
                  className={`block w-full pl-12 pr-4 py-3 border rounded-2xl bg-slate-950 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors text-sm ${
                    errors.phoneNumber ? 'border-red-550' : 'border-slate-800'
                  }`}
                  placeholder="+992 90 123 4567"
                />
              </div>
              {errors.phoneNumber && (
                <p className="mt-1 text-xs text-red-400 ml-2">{t(errors.phoneNumber.message || '')}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-2">{t('auth.password', 'Password')}</label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  className={`block w-full pl-12 pr-4 py-3 border rounded-2xl bg-slate-950 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-blue-500 transition-colors text-sm ${
                    errors.password ? 'border-red-550' : 'border-slate-800'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400 ml-2">{t(errors.password.message || '')}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  t('auth.signUpBtn', 'Sign Up')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
