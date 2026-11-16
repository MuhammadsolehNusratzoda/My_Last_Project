import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

/// <summary>
/// Fallback page for any URL that does not match a route.
/// </summary>
export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-24">
      <div className="max-w-lg w-full text-center">
        <div className="text-8xl sm:text-9xl font-extrabold bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent">
          404
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white">
          {t('errors.notFoundTitle', 'Page not found')}
        </h1>
        <p className="mt-3 text-slate-400 font-light">
          {t('errors.pageNotFoundSub', 'The page you are looking for does not exist or has been moved.')}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>{t('errors.backHome', 'Back to Home')}</span>
          </Link>
          <Link
            to="/places"
            className="inline-flex items-center gap-2 rounded-full border border-slate-700 hover:border-sky-500 px-6 py-3 text-sm font-semibold text-slate-300 hover:text-sky-400 transition-colors"
          >
            <Compass className="h-4 w-4" />
            <span>{t('errors.explorePlaces', 'Explore Places')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
