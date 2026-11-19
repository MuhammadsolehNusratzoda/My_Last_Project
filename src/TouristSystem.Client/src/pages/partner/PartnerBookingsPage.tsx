import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Loader2, Mail, Phone, Search, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { partnerApi, apiErrorMessage } from '../../services/partnerApi';
import type { IPagedResult, IPartnerBooking, IPartnerBookingDetail, IPartnerBookingFilters } from '../../types/partner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/partner/StatusBadge';
import ActionDialog from '../../components/partner/ActionDialog';

type ActionKind = 'confirm' | 'reject' | 'complete' | 'noShow';
const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Expired'];
const PAGE_SIZE = 20;

export default function PartnerBookingsPage() {
  const { t, formatDate, formatCurrency } = useTranslation();

  const [filters, setFilters] = useState<IPartnerBookingFilters>({ pageNumber: 1, pageSize: PAGE_SIZE });
  const [searchInput, setSearchInput] = useState('');
  const [result, setResult] = useState<IPagedResult<IPartnerBooking> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<IPartnerBookingDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [action, setAction] = useState<ActionKind | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      setResult(await partnerApi.getBookings(filters));
    } catch (err) {
      console.error('Error loading partner bookings:', err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  // Debounced search: wait until the user stops typing
  useEffect(() => {
    const handle = setTimeout(() => {
      setFilters((f) => (f.search === (searchInput || undefined) ? f : { ...f, search: searchInput || undefined, pageNumber: 1 }));
    }, 400);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const openDetail = async (id: string) => {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      setDetail(await partnerApi.getBooking(id));
    } catch (err) {
      console.error('Error loading booking detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const runAction = async (reason: string) => {
    if (!action || !detail) return;
    setActionBusy(true);
    setActionError(null);
    try {
      if (action === 'confirm') await partnerApi.confirm(detail.id);
      if (action === 'reject') await partnerApi.reject(detail.id, reason);
      if (action === 'complete') await partnerApi.complete(detail.id);
      if (action === 'noShow') await partnerApi.noShow(detail.id, reason);
      setAction(null);
      await Promise.all([openDetail(detail.id), fetchBookings()]);
    } catch (err) {
      setActionError(apiErrorMessage(err, t('partner.actionFailed', 'Action failed. Please try again.')));
    } finally {
      setActionBusy(false);
    }
  };

  const setFilter = (patch: Partial<IPartnerBookingFilters>) => setFilters((f) => ({ ...f, ...patch, pageNumber: 1 }));

  const now = Date.now();
  const canComplete = detail?.status === 'Confirmed' && new Date(detail.endDate).getTime() <= now;
  const canNoShow = detail?.status === 'Confirmed' && new Date(detail.startDate).getTime() <= now;

  const dialogText: Record<ActionKind, { title: string; label: string; danger?: boolean; reason?: boolean; required?: boolean }> = {
    confirm: { title: t('partner.confirmTitle', 'Confirm booking?'), label: t('partner.actions.confirm', 'Confirm') },
    reject: { title: t('partner.rejectTitle', 'Reject booking?'), label: t('partner.actions.reject', 'Reject'), danger: true, reason: true, required: true },
    complete: { title: t('partner.completeTitle', 'Mark as completed?'), label: t('partner.actions.complete', 'Complete') },
    noShow: { title: t('partner.noShowTitle', 'Mark as no-show?'), label: t('partner.actions.noShow', 'No-show'), danger: true, reason: true },
  };

  const inputClass = 'w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('partner.menu.bookings', 'Bookings')}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('partner.bookingsSubtitle', 'Who booked, when, for how many people and for how much.')}</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-[#0d1627] border border-gray-100 dark:border-slate-800/40 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder={t('partner.searchGuest', 'Guest name or email')} className={`${inputClass} pl-9`} />
        </div>
        <select value={filters.status ?? ''} onChange={(e) => setFilter({ status: e.target.value || undefined })} className={inputClass}>
          <option value="">{t('partner.allStatuses', 'All statuses')}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{t(`partner.status.${s}`, s)}</option>
          ))}
        </select>
        <input type="date" value={filters.from ?? ''} onChange={(e) => setFilter({ from: e.target.value || undefined })} className={inputClass} aria-label={t('partner.from', 'From')} />
        <input type="date" value={filters.to ?? ''} onChange={(e) => setFilter({ to: e.target.value || undefined })} className={inputClass} aria-label={t('partner.to', 'To')} />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#0d1627] border border-gray-100 dark:border-slate-800/40 rounded-2xl overflow-hidden">
        {loading && !result ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((n) => <div key={n} className="h-12 rounded-xl bg-gray-100 dark:bg-slate-800/60 animate-pulse" />)}
          </div>
        ) : loadError ? (
          <div className="p-6"><ErrorState onRetry={fetchBookings} /></div>
        ) : result && result.items.length === 0 ? (
          <p className="p-12 text-center text-sm text-gray-400">{t('partner.noBookings', 'No bookings match these filters.')}</p>
        ) : result && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-slate-800">
                  <th className="px-4 py-3">{t('partner.col.guest', 'Guest')}</th>
                  <th className="px-4 py-3">{t('partner.col.listing', 'Listing')}</th>
                  <th className="px-4 py-3">{t('partner.col.dates', 'Dates')}</th>
                  <th className="px-4 py-3">{t('partner.col.people', 'People')}</th>
                  <th className="px-4 py-3 text-right">{t('partner.col.total', 'Total')}</th>
                  <th className="px-4 py-3">{t('partner.col.status', 'Status')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {result.items.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-slate-900/40 cursor-pointer" onClick={() => openDetail(b.id)}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-800 dark:text-slate-100">{b.travelerName}</p>
                      <p className="text-xs text-gray-500">{b.travelerPhone || b.travelerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{b.listingName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-slate-300">
                      {formatDate(b.startDate, { day: 'numeric', month: 'short' })} → {formatDate(b.endDate, { day: 'numeric', month: 'short', year: 'numeric' })}
                      <span className="block text-xs text-gray-400">{b.nights} {t(b.bookingType === 'Guide' ? 'partner.days' : 'partner.nights', b.bookingType === 'Guide' ? 'days' : 'nights')}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                      {b.guestsCount}{b.quantity > 1 ? ` · ×${b.quantity}` : ''}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800 dark:text-slate-100 whitespace-nowrap">{formatCurrency(b.totalPrice)}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} noShow={b.isNoShow} /></td>
                    <td className="px-4 py-3 text-right"><Eye className="h-4 w-4 text-gray-400 inline" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result && result.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-800 text-sm text-gray-500">
            <span>{t('partner.pageOf', 'Page')} {result.pageNumber} / {result.totalPages} · {result.totalCount}</span>
            <div className="flex gap-2">
              <button disabled={result.pageNumber <= 1} onClick={() => setFilters((f) => ({ ...f, pageNumber: (f.pageNumber ?? 1) - 1 }))} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
              <button disabled={result.pageNumber >= result.totalPages} onClick={() => setFilters((f) => ({ ...f, pageNumber: (f.pageNumber ?? 1) + 1 }))} className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedId(null)} />
          <aside className="relative w-full max-w-md h-full overflow-y-auto bg-white dark:bg-[#0d1627] border-l border-gray-200 dark:border-slate-800 shadow-2xl p-6 text-left">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">{t('partner.bookingDetails', 'Booking details')}</h2>
              <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>

            {detailLoading || !detail ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <StatusBadge status={detail.status} noShow={detail.isNoShow} />
                  <span className="text-xs text-gray-400">{t('partner.bookedOn', 'Booked on')} {formatDate(detail.createdAt)}</span>
                </div>

                <section className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{t('partner.col.guest', 'Guest')}</p>
                  <p className="font-bold text-gray-800 dark:text-slate-100">{detail.travelerName}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-2"><Mail className="h-4 w-4" />{detail.travelerEmail}</p>
                  {detail.travelerPhone && <p className="text-sm text-gray-500 flex items-center gap-2"><Phone className="h-4 w-4" />{detail.travelerPhone}</p>}
                </section>

                <section className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 text-sm">
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">{t('partner.col.listing', 'Listing')}</p>
                    <p className="font-semibold text-gray-800 dark:text-slate-100">{detail.listingName}{detail.listingCity ? ` · ${detail.listingCity}` : ''}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t('partner.checkIn', 'From')}</p>
                    <p className="font-semibold text-gray-800 dark:text-slate-100">{formatDate(detail.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t('partner.checkOut', 'To')}</p>
                    <p className="font-semibold text-gray-800 dark:text-slate-100">{formatDate(detail.endDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t(detail.bookingType === 'Guide' ? 'partner.daysLabel' : 'partner.nightsLabel', detail.bookingType === 'Guide' ? 'Days' : 'Nights')}</p>
                    <p className="font-semibold text-gray-800 dark:text-slate-100">{detail.nights}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{t('partner.col.people', 'People')}</p>
                    <p className="font-semibold text-gray-800 dark:text-slate-100">{detail.guestsCount}</p>
                  </div>
                  {detail.quantity > 1 && (
                    <div>
                      <p className="text-xs text-gray-400">{t(detail.bookingType === 'Transport' ? 'partner.seats' : 'partner.rooms', detail.bookingType === 'Transport' ? 'Seats' : 'Rooms')}</p>
                      <p className="font-semibold text-gray-800 dark:text-slate-100">{detail.quantity}</p>
                    </div>
                  )}
                  <div className="col-span-2 pt-2 border-t border-gray-200 dark:border-slate-800 flex justify-between">
                    <span className="text-gray-500">{t('partner.col.total', 'Total')}</span>
                    <span className="text-lg font-extrabold text-gray-900 dark:text-white">{formatCurrency(detail.totalPrice)}</span>
                  </div>
                </section>

                {detail.notes && (
                  <section>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t('partner.guestNotes', 'Guest notes')}</p>
                    <p className="text-sm text-gray-600 dark:text-slate-300">{detail.notes}</p>
                  </section>
                )}
                {detail.rejectionReason && (
                  <p className="text-sm text-red-500"><b>{t('partner.reason', 'Reason')}:</b> {detail.rejectionReason}</p>
                )}

                {/* Actions allowed by the state machine */}
                <div className="flex flex-wrap gap-2">
                  {detail.status === 'Pending' && (
                    <>
                      <button onClick={() => { setActionError(null); setAction('confirm'); }} className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white">{t('partner.actions.confirm', 'Confirm')}</button>
                      <button onClick={() => { setActionError(null); setAction('reject'); }} className="px-4 py-2 rounded-xl text-sm font-bold border border-red-500/40 text-red-500 hover:bg-red-500/10">{t('partner.actions.reject', 'Reject')}</button>
                    </>
                  )}
                  {canComplete && (
                    <button onClick={() => { setActionError(null); setAction('complete'); }} className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white">{t('partner.actions.complete', 'Complete')}</button>
                  )}
                  {canNoShow && (
                    <button onClick={() => { setActionError(null); setAction('noShow'); }} className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-300">{t('partner.actions.noShow', 'No-show')}</button>
                  )}
                </div>

                <section>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">{t('partner.history', 'History')}</p>
                  {detail.history.length === 0 ? (
                    <p className="text-sm text-gray-400">{t('partner.noHistory', 'No status changes yet.')}</p>
                  ) : (
                    <ol className="space-y-3 border-l-2 border-gray-200 dark:border-slate-800 pl-4">
                      {detail.history.map((h, i) => (
                        <li key={i} className="text-sm">
                          <p className="font-semibold text-gray-700 dark:text-slate-200">
                            {t(`partner.status.${h.fromStatus}`, h.fromStatus)} → {t(`partner.status.${h.toStatus}`, h.toStatus)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(h.changedAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {h.changedBy === 'System' ? t('partner.system', 'System') : h.changedBy}
                          </p>
                          {h.reason && <p className="text-xs text-gray-500 mt-0.5">{h.reason}</p>}
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </div>
            )}
          </aside>
        </div>
      )}

      <ActionDialog
        open={action !== null}
        title={action ? dialogText[action].title : ''}
        message={detail ? `${detail.travelerName} · ${detail.listingName} · ${formatDate(detail.startDate)}` : ''}
        confirmLabel={action ? dialogText[action].label : ''}
        danger={action ? dialogText[action].danger : false}
        withReason={action ? dialogText[action].reason : false}
        reasonRequired={action ? dialogText[action].required : false}
        busy={actionBusy}
        error={actionError}
        onConfirm={runAction}
        onClose={() => setAction(null)}
      />
    </div>
  );
}
