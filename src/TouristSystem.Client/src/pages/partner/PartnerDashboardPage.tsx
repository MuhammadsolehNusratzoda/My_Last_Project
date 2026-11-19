import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck, CheckCircle2, Clock, Loader2, RefreshCw, Store, XCircle } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuthStore } from '../../app/store';
import { partnerApi, apiErrorMessage } from '../../services/partnerApi';
import type { IPartnerBooking, IPartnerSummary } from '../../types/partner';
import ErrorState from '../../components/common/ErrorState';
import ActionDialog from '../../components/partner/ActionDialog';

type PendingAction = { booking: IPartnerBooking; kind: 'confirm' | 'reject' } | null;

export default function PartnerDashboardPage() {
  const { t, formatDate, formatCurrency, formatNumber } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [summary, setSummary] = useState<IPartnerSummary | null>(null);
  const [pending, setPending] = useState<IPartnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [action, setAction] = useState<PendingAction>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [s, p] = await Promise.all([
        partnerApi.getSummary(),
        partnerApi.getBookings({ status: 'Pending', pageSize: 5 }),
      ]);
      setSummary(s);
      setPending(p.items);
    } catch (err) {
      console.error('Error loading partner dashboard:', err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runAction = async (reason: string) => {
    if (!action) return;
    setActionBusy(true);
    setActionError(null);
    try {
      if (action.kind === 'confirm') await partnerApi.confirm(action.booking.id);
      else await partnerApi.reject(action.booking.id, reason);
      setAction(null);
      await loadData();
    } catch (err) {
      setActionError(apiErrorMessage(err, t('partner.actionFailed', 'Action failed. Please try again.')));
    } finally {
      setActionBusy(false);
    }
  };

  const cards = summary
    ? [
        { label: t('partner.kpi.pending', 'Awaiting confirmation'), value: summary.pendingCount, icon: Clock, tone: 'text-amber-500 bg-amber-500/10' },
        { label: t('partner.kpi.confirmed', 'Confirmed bookings'), value: summary.confirmedCount, icon: CalendarCheck, tone: 'text-blue-500 bg-blue-500/10' },
        { label: t('partner.kpi.completed30', 'Completed (30 days)'), value: summary.completedLast30Days, icon: CheckCircle2, tone: 'text-emerald-500 bg-emerald-500/10' },
        { label: t('partner.kpi.cancelled30', 'Cancelled (30 days)'), value: summary.cancelledLast30Days, icon: XCircle, tone: 'text-red-500 bg-red-500/10' },
      ]
    : [];

  const cardClass = 'bg-white dark:bg-[#0d1627] border border-gray-100 dark:border-slate-800/40 rounded-2xl shadow-sm';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {t('partner.welcome', 'Welcome')}, {user?.fullName}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('partner.dashboardSubtitle', 'Your bookings and listings at a glance.')}</p>
        </div>
        <button onClick={loadData} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 self-start">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('partner.refresh', 'Refresh')}</span>
        </button>
      </div>

      {loading && !summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`${cardClass} h-28 animate-pulse`} />
          ))}
        </div>
      ) : loadError ? (
        <ErrorState onRetry={loadData} />
      ) : summary && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className={`${cardClass} p-5 flex items-center justify-between`}>
                  <div>
                    <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{c.label}</span>
                    <span className="block text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{formatNumber(c.value)}</span>
                  </div>
                  <div className={`p-3 rounded-2xl ${c.tone}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Pending bookings with quick actions */}
            <section className={`${cardClass} p-5 xl:col-span-2`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-500">{t('partner.pendingTitle', 'Awaiting your confirmation')}</h2>
                <Link to="/partner/bookings" className="text-sm font-semibold text-blue-500 hover:text-blue-400 inline-flex items-center gap-1">
                  <span>{t('partner.viewAll', 'View all')}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              {pending.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">{t('partner.noPending', 'No bookings are waiting for confirmation.')}</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-slate-800">
                  {pending.map((b) => (
                    <li key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 dark:text-slate-100 truncate">{b.travelerName}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {b.listingName} · {formatDate(b.startDate)} → {formatDate(b.endDate)} · {b.guestsCount} {t('partner.guests', 'guests')} · {formatCurrency(b.totalPrice)}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => { setActionError(null); setAction({ booking: b, kind: 'confirm' }); }} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white">
                          {t('partner.actions.confirm', 'Confirm')}
                        </button>
                        <button onClick={() => { setActionError(null); setAction({ booking: b, kind: 'reject' }); }} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/40 text-red-500 hover:bg-red-500/10">
                          {t('partner.actions.reject', 'Reject')}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Today */}
            <section className={`${cardClass} p-5`}>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-500 mb-4">{t('partner.todayTitle', 'Arriving today')}</h2>
              {summary.todayArrivals.length === 0 ? (
                <p className="text-sm text-gray-400 py-8 text-center">{t('partner.noArrivals', 'No arrivals today.')}</p>
              ) : (
                <ul className="space-y-3">
                  {summary.todayArrivals.map((a) => (
                    <li key={a.bookingId} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100 dark:border-slate-800">
                      <p className="font-bold text-gray-800 dark:text-slate-100">{a.travelerName}</p>
                      <p className="text-xs text-gray-500">{a.listingName} · {a.guestsCount} {t('partner.guests', 'guests')}</p>
                      {a.travelerPhone && <p className="text-xs text-blue-500 mt-1">{a.travelerPhone}</p>}
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/partner/listings" className="mt-6 flex items-center justify-between p-3 rounded-xl border border-dashed border-gray-200 dark:border-slate-700 text-sm text-gray-500 hover:text-blue-500">
                <span className="inline-flex items-center gap-2"><Store className="h-4 w-4" />{t('partner.myListingsCount', 'My listings')}: {summary.listingsCount}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          </div>
        </>
      )}

      {loading && summary && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}

      <ActionDialog
        open={action !== null}
        title={action?.kind === 'confirm' ? t('partner.confirmTitle', 'Confirm booking?') : t('partner.rejectTitle', 'Reject booking?')}
        message={action ? `${action.booking.travelerName} · ${action.booking.listingName} · ${formatDate(action.booking.startDate)}` : ''}
        confirmLabel={action?.kind === 'confirm' ? t('partner.actions.confirm', 'Confirm') : t('partner.actions.reject', 'Reject')}
        danger={action?.kind === 'reject'}
        withReason={action?.kind === 'reject'}
        reasonRequired={action?.kind === 'reject'}
        busy={actionBusy}
        error={actionError}
        onConfirm={runAction}
        onClose={() => setAction(null)}
      />
    </div>
  );
}
