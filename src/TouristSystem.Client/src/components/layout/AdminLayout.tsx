import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../app/store';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  BarChart2, Users, MapPin, ClipboardList, LogOut, Search, 
  HelpCircle, Compass, ArrowLeft, Sun, Moon, Plus, Globe
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const theme = useAuthStore((state) => state.theme);
  const setTheme = useAuthStore((state) => state.setTheme);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const selectLanguage = (selectedLang: 'en' | 'ru' | 'tj') => {
    setLang(selectedLang);
    setShowLangDropdown(false);
  };

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      label: t('admin.statsOverview', 'Analytics'),
      icon: BarChart2
    },
    {
      path: '/admin/places',
      label: t('admin.moderatePlaces', 'Inventory'),
      icon: MapPin
    },
    {
      path: '/admin/users',
      label: t('admin.manageUsers', 'Users'),
      icon: Users
    },
    {
      path: '/admin/audit-logs',
      label: t('admin.auditLogs', 'Support / Logs'),
      icon: ClipboardList
    }
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-64 shrink-0 bg-[#0b1b33] dark:bg-[#070f1e] text-slate-300 flex flex-col justify-between border-r border-slate-800/20 shadow-2xl relative z-20">
        
        {/* Top brand */}
        <div>
          <div className="p-6 border-b border-slate-800/40">
            <Link to="/" className="flex items-center space-x-2.5 text-white hover:opacity-90 transition-opacity">
              <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">
                <Compass className="h-5 w-5 animate-spin-slow" />
              </div>
              <div className="text-left">
                <h1 className="text-lg font-extrabold tracking-tight leading-none">Tajikistan Travel</h1>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold font-sans">Partner Dashboard</span>
              </div>
            </Link>
          </div>

          {/* Action button */}
          <div className="px-4 pt-6 pb-2">
            <Link 
              to="/admin/places"
              className="w-full flex items-center justify-center space-x-2 bg-[#fbe7c6] hover:bg-[#fad8a0] text-[#784f18] px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>{t('admin.addNewTour', 'Add New Tour')}</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-4 space-y-1 text-left">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 ${
                    active 
                      ? 'bg-[#152e54] text-white shadow-inner border-l-4 border-blue-500 pl-3' 
                      : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="p-4 border-t border-slate-800/40 space-y-1">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('common.backToHome', 'Back to Home')}</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('common.signOut', 'Logout')}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 shrink-0 bg-white dark:bg-[#0d1627] border-b border-slate-100 dark:border-slate-800/40 flex items-center justify-between px-8 shadow-sm relative z-10 transition-colors duration-300">
          
          {/* Search bar */}
          <div className="flex items-center space-x-2.5 max-w-md w-full">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder={t('hero.searchPlaceholder', 'Search...')}
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 dark:text-slate-350 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-0"
            />
          </div>

          {/* User & Actions */}
          <div className="flex items-center space-x-6">
            
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center space-x-1 focus:outline-none cursor-pointer"
                title={t('common.changeLanguage', 'Change Language')}
              >
                <Globe className="h-5 w-5" />
                <span className="text-xs uppercase font-bold ml-1">{lang}</span>
              </button>

              <AnimatePresence>
                {showLangDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-2xl shadow-xl py-1.5 z-50 backdrop-blur-xl"
                  >
                    <button
                      onClick={() => selectLanguage('en')}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-705 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                      🇬🇧 {t('langEnglish', 'English')}
                    </button>
                    <button
                      onClick={() => selectLanguage('ru')}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-750 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                      🇷🇺 {t('langRussian', 'Russian')}
                    </button>
                    <button
                      onClick={() => selectLanguage('tj')}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-750 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                      🇹🇯 {t('langTajik', 'Tajik')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <NotificationBell />

            {/* Help */}
            <button className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer">
              <HelpCircle className="h-5 w-5" />
            </button>

            <span className="w-px h-5 bg-slate-200 dark:bg-slate-800" />

            {/* Admin Profile */}
            <div className="flex items-center space-x-3 text-left">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.fullName || 'Admin User'}</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-sans">
                  {user?.role === 'SuperAdmin' ? 'Super Admin' : 'System Admin'}
                </span>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950/65 border border-blue-200 dark:border-blue-800/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm shadow-sm">
                {getInitials(user?.fullName || 'Admin')}
              </div>
            </div>

          </div>
        </header>

        {/* WORKSPACE CONTENT BODY */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-[#070d19] p-8 text-left transition-colors duration-300">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
