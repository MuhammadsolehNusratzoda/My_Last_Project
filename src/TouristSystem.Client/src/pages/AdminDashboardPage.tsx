import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import type { IReview, IBooking } from '../types';
import { Shield, MessageSquare, BarChart2, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, formatDate, formatCurrency, formatNumber } = useTranslation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const bookingsRes = await api.get('/bookings', { params: { pageSize: 100 } });
      setBookings(bookingsRes.data.items || []);

      const reviewsRes = await api.get('/reviews', { params: { pageSize: 100 } });
      setReviews(reviewsRes.data.items || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = bookings
    .filter((b) => b.status === 'Confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow bg-slate-950 text-slate-100 transition-colors">
      {/* Title */}
      <div className="md:flex md:items-center md:justify-between mb-8 text-left">
        <div className="flex-grow">
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-500" />
            <span>{t('admin.adminControlPanel')}</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-light">{t('admin.adminSubtitle')}</p>
        </div>
        <button
          onClick={fetchData}
          className="mt-4 md:mt-0 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center space-x-2 shadow-lg cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{t('admin.refreshData')}</span>
        </button>
      </div>

      {/* Admin Sub-navigation Links */}
      <div className="flex flex-wrap items-center gap-4 mb-8 bg-slate-900/40 border border-slate-900/60 p-4 rounded-2xl text-sm font-semibold">
        <Link to="/admin/dashboard" className="text-blue-400 hover:text-blue-300">
          {t('admin.statsOverview')}
        </Link>
        <span className="text-slate-800">|</span>
        <Link to="/admin/places" className="text-slate-400 hover:text-white transition-colors">
          {t('admin.moderatePlaces')}
        </Link>
        <span className="text-slate-800">|</span>
        <Link to="/admin/users" className="text-slate-400 hover:text-white transition-colors">
          {t('admin.manageUsers')}
        </Link>
        <span className="text-slate-800">|</span>
        <Link to="/admin/audit-logs" className="text-slate-400 hover:text-white transition-colors">
          {t('admin.auditLogs')}
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 inline-block" />
          <p className="mt-2 text-sm text-slate-400 font-light">{t('admin.loadingMetrics')}</p>
        </div>
      ) : (
        <>
          {/* Stats widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 text-left">
            <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-3xl backdrop-blur-xl shadow-xl flex items-center space-x-4">
              <div className="bg-blue-500/10 p-3.5 rounded-2xl border border-blue-500/20">
                <BarChart2 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider">{t('admin.totalReservations')}</span>
                <span className="text-2xl font-extrabold text-white">{formatNumber(bookings.length)}</span>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-3xl backdrop-blur-xl shadow-xl flex items-center space-x-4">
              <div className="bg-green-500/10 p-3.5 rounded-2xl border border-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider">{t('admin.platformRevenue')}</span>
                <span className="text-2xl font-extrabold text-white">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-3xl backdrop-blur-xl shadow-xl flex items-center space-x-4">
              <div className="bg-indigo-500/10 p-3.5 rounded-2xl border border-indigo-500/20">
                <MessageSquare className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider">{t('admin.userFeedback')}</span>
                <span className="text-2xl font-extrabold text-white">{formatNumber(reviews.length)} {t('admin.reviewsCountText')}</span>
              </div>
            </div>
          </div>

          {/* Reviews Audit List */}
          <div className="bg-slate-900/40 border border-slate-900/60 rounded-3xl shadow-xl p-6 text-left">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span>{t('admin.feedbackModerationQueue')}</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase bg-slate-950/40">
                    <th className="px-4 py-3 rounded-l-xl">{t('admin.userHeader')}</th>
                    <th className="px-4 py-3">{t('admin.ratingHeader')}</th>
                    <th className="px-4 py-3">{t('admin.targetModuleHeader')}</th>
                    <th className="px-4 py-3">{t('admin.commentHeader')}</th>
                    <th className="px-4 py-3 text-right rounded-r-xl">{t('admin.postedHeader')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-350">
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500 font-light">
                        {t('admin.noReviewsInQueue')}
                      </td>
                    </tr>
                  ) : (
                    reviews.map((rev) => (
                      <tr key={rev.id} className="hover:bg-slate-950/30 transition-colors">
                        <td className="px-4 py-4 font-semibold text-white">{rev.userName}</td>
                        <td className="px-4 py-4 font-semibold text-amber-500">{rev.rating} ★</td>
                        <td className="px-4 py-4">
                          <span className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-2.5 py-1 rounded-lg">
                            {t(`bookings.types.${rev.reviewType}`, rev.reviewType)}
                          </span>
                        </td>
                        <td className="px-4 py-4 max-w-xs truncate">{rev.comment}</td>
                        <td className="px-4 py-4 text-right text-xs text-slate-500">
                          {formatDate(rev.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
