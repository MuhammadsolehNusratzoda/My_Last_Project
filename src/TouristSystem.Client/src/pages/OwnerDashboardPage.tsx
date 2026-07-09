import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { IBooking } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { Calendar, CheckCircle, Clock, Loader2, RefreshCw } from 'lucide-react';

export default function OwnerDashboardPage() {
  const { t, formatDate, formatCurrency, formatNumber } = useTranslation();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings', {
        params: { pageNumber: 1, pageSize: 100 },
      });
      setBookings(response.data.items || []);
    } catch (error) {
      console.error('Error fetching owner bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/confirm`);
      fetchBookings(); // Reload to refresh capacity boundaries
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert(t('bookings.confirmFailed', 'Failed to confirm booking.'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow bg-slate-950 text-slate-100 transition-colors">
      {/* Title */}
      <div className="md:flex md:items-center md:justify-between mb-12 text-left">
        <div className="flex-grow">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('navbar.ownerDashboard')}</h2>
          <p className="mt-1 text-sm text-slate-400 font-light">{t('bookings.ownerSubtitle', 'Confirm pending tourist room/seat allocations.')}</p>
        </div>
        <button
          onClick={fetchBookings}
          className="mt-4 md:mt-0 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center space-x-2 shadow-lg cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{t('common.refresh', 'Refresh List')}</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 inline-block" />
          <p className="mt-2 text-sm text-slate-400 font-light">{t('common.pleaseWait')}</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-left">
            <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-3xl backdrop-blur-xl shadow-xl flex items-center space-x-4">
              <div className="bg-yellow-500/10 p-3.5 rounded-2xl border border-yellow-500/20">
                <Clock className="h-6 w-6 text-yellow-500 animate-pulse" />
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider">{t('bookings.pendingReview', 'Pending Review')}</span>
                <span className="text-2xl font-extrabold text-white">{formatNumber(pendingCount)} {t('bookings.requests', 'requests')}</span>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-3xl backdrop-blur-xl shadow-xl flex items-center space-x-4">
              <div className="bg-green-500/10 p-3.5 rounded-2xl border border-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-455 uppercase tracking-wider">{t('bookings.confirmedTrans', 'Confirmed Transactions')}</span>
                <span className="text-2xl font-extrabold text-white">
                  {formatNumber(bookings.filter((b) => b.status === 'Confirmed').length)} {t('bookings.approvals', 'approvals')}
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900/40 border border-slate-900/60 rounded-3xl shadow-xl p-6 text-left">
            <h3 className="text-lg font-bold text-white mb-6">{t('bookings.reservationLog', 'Reservation Log')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase bg-slate-950/40">
                    <th className="px-4 py-3 rounded-l-xl">{t('bookings.refItem', 'Reference Item')}</th>
                    <th className="px-4 py-3">{t('bookings.customer', 'Customer')}</th>
                    <th className="px-4 py-3">{t('common.dateRange', 'Dates')}</th>
                    <th className="px-4 py-3">{t('bookings.details', 'Details')}</th>
                    <th className="px-4 py-3">{t('bookings.totalCost', 'Total Cost')}</th>
                    <th className="px-4 py-3">{t('bookings.status', 'Status')}</th>
                    <th className="px-4 py-3 text-right rounded-r-xl">{t('bookings.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-light">
                        {t('bookings.noRecords', 'No reservation records.')}
                      </td>
                    </tr>
                  ) : (
                    bookings.map((book) => (
                      <tr key={book.id} className="hover:bg-slate-950/30 transition-colors">
                        <td className="px-4 py-4 font-semibold text-white">
                          {book.referenceName}
                          <span className="block text-xs font-normal text-slate-500">
                            {t(`bookings.types.${book.bookingType}`, book.bookingType)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {book.userName}
                          <span className="block text-xs text-slate-500 font-light">{book.userEmail || ''}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="flex items-center text-xs">
                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-550" />
                            <span>
                              {formatDate(book.startDate)} - {formatDate(book.endDate)}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs font-light">
                          {t('common.qty', 'Qty')}: {formatNumber(book.quantity)} / {t('common.guests', 'Guests')}: {formatNumber(book.guestsCount)}
                        </td>
                        <td className="px-4 py-4 font-semibold text-blue-400">{formatCurrency(book.totalPrice)}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              book.status === 'Confirmed'
                                ? 'bg-green-500/10 text-green-400'
                                : book.status === 'Cancelled'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-yellow-500/10 text-yellow-400 animate-pulse'
                            }`}
                          >
                            {t(`bookings.statusBadge.${book.status}`, book.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {book.status === 'Pending' && (
                            <button
                              onClick={() => handleConfirm(book.id)}
                              disabled={actionLoadingId === book.id}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-2xl text-xs font-semibold shadow-md cursor-pointer disabled:opacity-50"
                            >
                              {actionLoadingId === book.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                t('common.confirm', 'Confirm')
                              )}
                            </button>
                          )}
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
