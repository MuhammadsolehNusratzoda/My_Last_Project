import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface ActionDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  /** Show a reason textarea; when `reasonRequired` the button stays disabled until it is filled. */
  withReason?: boolean;
  reasonRequired?: boolean;
  busy?: boolean;
  error?: string | null;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

/** In-app confirmation dialog (replaces window.confirm / alert, which block the page). */
export default function ActionDialog({
  open, title, message, confirmLabel, danger = false, withReason = false,
  reasonRequired = false, busy = false, error, onConfirm, onClose,
}: ActionDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  if (!open) return null;

  const disabled = busy || (reasonRequired && reason.trim().length === 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md bg-white dark:bg-[#0d1627] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-left">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200" aria-label={t('common.cancel', 'Cancel')}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">{message}</p>

        {withReason && (
          <div className="mt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              {t('partner.reason', 'Reason')}{reasonRequired ? ' *' : ''}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 px-3 py-2 text-sm text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800">
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={disabled}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 ${danger ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
