import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { IBooking } from '../types';
import { useAuthStore } from '../app/store';
import { useTranslation } from '../hooks/useTranslation';
import { Calendar, Building, Bus, User, XCircle, Loader2, Clock, CheckCircle } from 'lucide-react';

export default function MyBookingsPage() {
  const { user } = useAuthStore();
  const { t, formatDate, formatCurrency, formatNumber } = useTranslation();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings', {
        params: { userId: user?.id, pageNumber: 1, pageSize: 100 },
      });
      setBookings(response.data.items || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm(t('bookings.cancelConfirm', 'Are you sure you want to cancel this booking?'))) return;
    setCancelLoadingId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(t('bookings.cancelFailed', 'Failed to cancel booking.'));
    } finally {
      setCancelLoadingId(null);
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'Hotel')     return <Building className="h-5 w-5 text-blue-500" />;
    if (type === 'Transport') return <Bus      className="h-5 w-5 text-sky-500" />;
    return <User className="h-5 w-5 text-emerald-500" />;
  };

  const getStatusBadge = (status: string) => {
    const base = 'px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1.5 w-max ';
    if (status === 'Confirmed') return (
      <span className={base + 'bg-green-500/10 border border-green-500/30 text-green-400'}>
        <CheckCircle className="h-3.5 w-3.5 mr-1" />{t('bookings.statusConfirmed', 'Confirmed')}
      </span>
    );
    if (status === 'Cancelled') return (
      <span className={base + 'bg-red-500/10 border border-red-500/30 text-red-400'}>
        <XCircle className="h-3.5 w-3.5 mr-1" />{t('bookings.statusCancelled', 'Cancelled')}
      </span>
    );
    return (
      <span className={base + 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 animate-pulse'}>
        <Clock className="h-3.5 w-3.5 mr-1" />{t('bookings.statusPending', 'Pending')}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow bg-slate-950 text-slate-100 transition-colors">
      <div className="mb-12 text-left">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('bookings.title')}</h2>
        <p className="mt-1 text-sm text-slate-400 font-light">{t('bookings.subtitle')}</p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 inline-block" />
          <p className="mt-2 text-sm text-slate-400 font-light">{t('common.pleaseWait')}</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-[28px] bg-slate-900/25">
          <p className="text-sm text-slate-400 font-light">{t('bookings.noBookings')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((book) => (
            <div key={book.id} className="bg-slate-900/40 border border-slate-900/60 rounded-[24px] p-6 shadow-lg hover:shadow-2xl transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-6 hover:border-slate-800 text-left">
              <div className="flex items-start space-x-4">
                <div className="bg-slate-950 border border-slate-900/60 p-3.5 rounded-2xl shrink-0">
                  {getTypeIcon(book.bookingType)}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <h3 className="text-lg font-bold text-white leading-snug">{book.referenceName}</h3>
                    <span className="text-xs text-slate-400">({t(`bookings.types.${book.bookingType}`, book.bookingType)})</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-450 font-light">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>
                        {formatDate(book.startDate)} - {formatDate(book.endDate)}
                      </span>
                    </span>
                    <span>{t('common.quantity')}: <span className="font-semibold text-slate-200">{formatNumber(book.quantity)}</span></span>
                    <span>{t('common.guests')}: <span className="font-semibold text-slate-200">{formatNumber(book.guestsCount)}</span></span>
                  </div>
                  {book.notes && (
                    <p className="mt-2 text-xs text-slate-400 italic">{t('common.notes')}: "{book.notes}"</p>
                  )}
                </div>
              </div>

              <div className="mt-6 md:mt-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800/60">
                <div className="text-left md:text-right">
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{t('bookings.totalPrice', 'Total Price')}</span>
                  <span className="text-xl font-extrabold text-blue-500 dark:text-sky-400">{formatCurrency(book.totalPrice)}</span>
                </div>

                <div className="flex items-center space-x-3">
                  {getStatusBadge(book.status)}
                  {book.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleCancel(book.id)}
                      disabled={cancelLoadingId === book.id}
                      className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                    >
                      {cancelLoadingId === book.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        t('bookings.cancelBooking', 'Cancel Booking')
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
