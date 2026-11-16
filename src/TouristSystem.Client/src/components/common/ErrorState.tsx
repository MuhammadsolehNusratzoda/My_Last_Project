import { RotateCw, WifiOff } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

interface ErrorStateProps {
  /** Optional custom message. Defaults to the translated "server unavailable" hint. */
  message?: string;
  /** When provided, a "Try again" button is shown that calls this function. */
  onRetry?: () => void;
  /** Smaller variant for side panels (e.g. the map page). */
  compact?: boolean;
}

/// <summary>
/// Shown when an API request fails (backend down, network error),
/// so users do not confuse a failed request with an empty result.
/// </summary>
export default function ErrorState({ message, onRetry, compact = false }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <div
      role="alert"
      className={`text-center bg-slate-900/35 border border-dashed border-red-500/30 rounded-3xl ${
        compact ? 'px-4 py-5' : 'px-6 py-16'
      }`}
    >
      <div
        className={`mx-auto mb-4 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 ${
          compact ? 'h-10 w-10' : 'h-14 w-14'
        }`}
      >
        <WifiOff className={compact ? 'h-5 w-5' : 'h-7 w-7'} />
      </div>
      <h3 className={`font-bold text-white ${compact ? 'text-sm' : 'text-lg'}`}>
        {t('errors.serverUnavailable', 'Server is unavailable')}
      </h3>
      <p className={`mt-1 text-slate-400 font-light ${compact ? 'text-xs' : 'text-sm'}`}>
        {message ?? t('errors.serverUnavailableSub', 'Please check your connection and try again.')}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors ${
            compact ? 'px-4 py-1.5 text-xs' : 'px-6 py-2.5 text-sm'
          }`}
        >
          <RotateCw className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
          <span>{t('errors.tryAgain', 'Try again')}</span>
        </button>
      )}
    </div>
  );
}
