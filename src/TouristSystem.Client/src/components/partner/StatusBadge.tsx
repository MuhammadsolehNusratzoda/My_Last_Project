import { useTranslation } from '../../hooks/useTranslation';

const styles: Record<string, string> = {
  Pending: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  Confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  Completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  Cancelled: 'bg-red-500/10 text-red-500 border-red-500/30',
  Expired: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  Approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  Rejected: 'bg-red-500/10 text-red-500 border-red-500/30',
};

/** Colored pill for booking and listing statuses. */
export default function StatusBadge({ status, noShow = false }: { status: string; noShow?: boolean }) {
  const { t } = useTranslation();
  const label = noShow ? t('partner.status.NoShow', 'No-show') : t(`partner.status.${status}`, status);
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${styles[status] ?? styles.Expired}`}>
      {label}
    </span>
  );
}
