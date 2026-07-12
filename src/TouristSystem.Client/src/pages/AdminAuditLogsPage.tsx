import { useTranslation } from '../hooks/useTranslation';
import { FileText, Shield } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { t, formatDate } = useTranslation();

  const auditLogs = [
    { id: '1', action: 'ConfirmBooking', entity: 'Booking', userId: 'usr_812', timestamp: '2026-07-04 05:12:01' },
    { id: '2', action: 'UpdatePlaceStatus', entity: 'Place', userId: 'usr_admin', timestamp: '2026-07-04 05:08:44' },
    { id: '3', action: 'CreateReview', entity: 'Review', userId: 'usr_102', timestamp: '2026-07-04 04:55:12' },
    { id: '4', action: 'RegisterUser', entity: 'User', userId: 'usr_new', timestamp: '2026-07-04 04:12:30' },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center space-x-2.5">
          <Shield className="h-6 w-6 text-blue-500" />
          <span>{t('admin.securityAuditTitle', 'Security Audit Trail')}</span>
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 font-light mt-0.5 font-sans">
          {t('admin.securityAuditSubtitle', 'Immutable ledger of backend state transitions and administrator actions.')}
        </p>
      </div>

      {/* Audit Logs Card Table */}
      <div className="bg-white dark:bg-[#0d1627] border border-slate-100 dark:border-slate-800/40 rounded-2xl shadow-sm overflow-hidden text-left">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
            <thead>
              <tr className="text-left text-[10px] font-extrabold text-slate-400 uppercase bg-slate-50/40 dark:bg-slate-900/10">
                <th className="px-6 py-4 rounded-l-xl">{t('admin.logIdHeader', 'Log ID')}</th>
                <th className="px-6 py-4">{t('admin.cqrsActionHeader', 'Cqrs Action')}</th>
                <th className="px-6 py-4">{t('admin.targetSchemaHeader', 'Target Schema')}</th>
                <th className="px-6 py-4">{t('admin.actorIdHeader', 'Actor ID')}</th>
                <th className="px-6 py-4 text-right rounded-r-xl">{t('admin.timestampHeader', 'Timestamp')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-650 dark:text-slate-300">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/15 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">LOG_{log.id}</td>
                  <td className="px-6 py-4 font-semibold text-slate-850 dark:text-white">
                    <div className="flex items-center space-x-2.5">
                      <div className="bg-blue-50 dark:bg-blue-950/40 p-2 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-100/20">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="font-bold">{t(`admin.actions.${log.action}`, log.action)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-1 rounded-lg font-bold font-sans">
                      {t(`bookings.types.${log.entity}`, log.entity)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">{log.userId}</td>
                  <td className="px-6 py-4 text-right text-xs text-slate-450 dark:text-slate-500 font-sans">
                    {formatDate(log.timestamp, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
