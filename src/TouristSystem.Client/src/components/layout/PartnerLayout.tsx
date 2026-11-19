import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, CalendarCheck, Compass, Globe, LogOut, Menu, Moon, Store, Sun, X } from 'lucide-react';
import { useAuthStore } from '../../app/store';
import { useTranslation } from '../../hooks/useTranslation';
import NotificationBell from './NotificationBell';

/**
 * Shell of the Partner Portal (hotel / restaurant / transport owners and guides):
 * sidebar on desktop, slide-in drawer on mobile, header with language / theme / profile.
 */
export default function PartnerLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const theme = useAuthStore((s) => s.theme);
  const setTheme = useAuthStore((s) => s.setTheme);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const roleLabel = t(`partner.roles.${user?.role ?? 'Partner'}`, user?.role ?? 'Partner');

  const menuItems = [
    { path: '/partner/dashboard', label: t('partner.menu.overview', 'Overview'), icon: BarChart2 },
    { path: '/partner/bookings', label: t('partner.menu.bookings', 'Bookings'), icon: CalendarCheck },
    { path: '/partner/listings', label: t('partner.menu.listings', 'My Listings'), icon: Store },
  ];

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const cycleLanguage = () => setLang(lang === 'en' ? 'ru' : lang === 'ru' ? 'tj' : 'en');

  const initials = (user?.fullName || 'P').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const sidebar = (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="p-6 border-b border-gray-800/40 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5 text-white hover:opacity-90 transition-opacity">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Compass className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-lg font-extrabold tracking-tight leading-none">Tajikistan Travel</p>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">{t('partner.portal', 'Partner Portal')}</span>
            </div>
          </Link>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1 text-left">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
                  active
                    ? 'bg-[#152e54] text-white shadow-inner border-l-4 border-blue-500 pl-3'
                    : 'hover:bg-gray-800/40 text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-blue-400' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800/40 space-y-1">
        <Link to="/" className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>{t('common.backToHome', 'Back to Home')}</span>
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left">
          <LogOut className="h-4 w-4" />
          <span>{t('common.signOut', 'Logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-slate-950 font-sans text-gray-900 dark:text-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-[#0b1b33] dark:bg-[#070f1e] text-gray-300 border-r border-gray-800/20 shadow-2xl">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <aside className="relative w-72 max-w-[85%] h-full bg-[#0b1b33] text-gray-300 shadow-2xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <header className="h-16 shrink-0 bg-white dark:bg-[#0d1627] border-b border-gray-100 dark:border-slate-800/40 flex items-center justify-between px-4 sm:px-8 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button className="lg:hidden text-gray-500 dark:text-slate-300" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-sm font-bold text-gray-700 dark:text-slate-200 truncate">{t('partner.portal', 'Partner Portal')}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button onClick={cycleLanguage} className="text-gray-500 dark:text-slate-400 hover:text-blue-600 flex items-center gap-1" title={t('common.changeLanguage', 'Change Language')}>
              <Globe className="h-5 w-5" />
              <span className="text-xs uppercase font-bold">{lang}</span>
            </button>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white" title="Theme">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-3 text-left">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800 dark:text-slate-200">{user?.fullName}</span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{roleLabel}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/65 border border-blue-200 dark:border-blue-800/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-[#070d19] p-4 sm:p-8 text-left">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
