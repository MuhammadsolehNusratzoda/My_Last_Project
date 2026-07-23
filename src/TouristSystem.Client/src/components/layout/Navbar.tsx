import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../app/store';
import { useTranslation, type Language } from '../../hooks/useTranslation';
import NotificationBell from './NotificationBell';
import { 
  Compass, User, LogOut, Menu, X, Heart, Calendar, Sun, Moon, Globe, Map, 
  MapPin, Hotel, Utensils, Car, Users 
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, clearAuth, theme, setTheme } = useAuthStore();
  const { t, lang, setLang } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const handleLogout = () => {
    clearAuth();
    setShowDropdown(false);
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const selectLanguage = (selectedLang: Language) => {
    setLang(selectedLang);
    setShowLangDropdown(false);
    setIsOpen(false);
  };

  const navItems = [
    { path: '/places', label: t('navbar.places'), icon: MapPin },
    { path: '/hotels', label: t('navbar.hotels'), icon: Hotel },
    { path: '/restaurants', label: t('navbar.restaurants'), icon: Utensils },
    { path: '/passenger-transports', label: 'Transport', icon: Car },
    { path: '/guides', label: t('navbar.guides'), icon: Users },
    { path: '/map', label: t('navbar.map'), icon: Map },
  ];


  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-800/40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl group">
              <Compass className="h-6 w-6 text-blue-600 dark:text-sky-400 group-hover:rotate-45 transition-transform duration-500" />
              <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400">
                TajikistanTravel
              </span>
            </Link>
            
            <div className="hidden md:flex ml-10 space-x-1 relative">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="relative text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-sky-400 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeNavBackground"
                        className="absolute inset-0 bg-blue-50 dark:bg-slate-900/80 rounded-full -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-sky-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-900 transition-all flex items-center space-x-1 focus:outline-none cursor-pointer"
                title={t('common.changeLanguage', 'Change Language')}
              >
                <Globe className="h-5 w-5" />
                <span className="text-xs uppercase font-bold">{lang}</span>
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
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                      🇬🇧 {t('langEnglish')}
                    </button>
                    <button
                      onClick={() => selectLanguage('ru')}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                      🇷🇺 {t('langRussian')}
                    </button>
                    <button
                      onClick={() => selectLanguage('tj')}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                      🇹🇯 {t('langTajik')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-sky-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-900 transition-all focus:outline-none cursor-pointer"
              title={t('common.toggleTheme', 'Toggle Theme')}
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <NotificationBell />
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border border-blue-100/50 dark:border-slate-800 hover:scale-105 transition-all text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full text-sm font-medium focus:outline-none cursor-pointer"
                  >
                    {user.profileImageUrl ? (
                      <img
                        src={`http://localhost:5010${user.profileImageUrl}`}
                        alt={user.fullName}
                        className="h-6 w-6 rounded-full object-cover border border-blue-200 dark:border-slate-700"
                      />
                    ) : (
                      <User className="h-4 w-4 text-blue-600 dark:text-sky-400" />
                    )}
                    <span>{user.fullName}</span>
                  </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-2xl shadow-xl py-2 z-50"
                    >
                      <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100 dark:border-slate-800/60">
                        {t('navbar.loggedAs', 'Logged as')}{' '}
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{t(`roles.${user.role}`, user.role)}</span>
                      </div>

                      {user.role === 'Tourist' && (
                        <>
                          <Link
                            to="/my-bookings"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span>{t('navbar.myBookings')}</span>
                          </Link>
                          <Link
                            to="/favorites"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <Heart className="h-4 w-4 text-red-500" />
                            <span>{t('navbar.favorites')}</span>
                          </Link>
                        </>
                      )}

                      {(user.role === 'HotelOwner' || user.role === 'RestaurantOwner' || user.role === 'TransportOwner') && (
                        <>
                          <Link
                            to="/owner/dashboard"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                          >
                            {t('navbar.ownerDashboard')}
                          </Link>
                          <Link
                            to="/owner/services"
                            onClick={() => setShowDropdown(false)}
                            className="block px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50 font-medium"
                          >
                            {t('navbar.manageServices')}
                          </Link>
                        </>
                      )}

                      {(user.role === 'Admin' || user.role === 'SuperAdmin') && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setShowDropdown(false)}
                          className="block px-4 py-2.5 text-sm text-blue-600 dark:text-sky-400 hover:bg-gray-50 dark:hover:bg-slate-800/50 font-medium"
                        >
                          {t('navbar.adminPanel')}
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-t border-gray-100 dark:border-slate-800/60 text-left cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('navbar.signOut')}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 px-3 py-2 text-sm font-medium transition-colors">
                  {t('navbar.signIn')}
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md shadow-blue-500/10 dark:shadow-none transition-all duration-200"
                >
                  {t('navbar.signUp')}
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(true)}
              className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none cursor-pointer p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Glassmorphic Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed inset-0 z-50 md:hidden bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between p-6 overflow-y-auto"
          >
            {/* Drawer Header */}
            <div className="flex justify-between items-center pb-6 border-b border-slate-900/60">
              <div className="flex items-center space-x-2 font-bold text-lg">
                <Compass className="h-6 w-6 text-blue-500 dark:text-sky-400" />
                <span className="bg-gradient-to-r from-blue-500 to-sky-400 bg-clip-text text-transparent">
                  TajikistanTravel
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border-none rounded-full text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links and Settings */}
            <div className="flex-grow py-6 space-y-8 text-left">
              {/* Main Links */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Menu</span>
                <div className="grid grid-cols-2 gap-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 p-4 bg-slate-900/40 hover:bg-slate-900/70 border border-slate-900 hover:border-slate-800/80 rounded-2xl text-slate-200 transition-all font-semibold"
                    >
                      {item.icon && <item.icon className="h-5 w-5 text-blue-400 shrink-0" />}
                      <span className="text-xs">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{t('common.changeLanguage', 'Change Language')}</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['en', 'ru', 'tj'] as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => selectLanguage(l)}
                      className={`py-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        lang === l
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/10'
                          : 'bg-slate-900 border-slate-900 text-slate-400'
                      }`}
                    >
                      {l === 'en' ? '🇬🇧 EN' : l === 'ru' ? '🇷🇺 RU' : '🇹🇯 TJ'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Settings */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Appearance</span>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-5 py-4 bg-slate-900/30 border border-slate-900 rounded-2xl text-slate-350 cursor-pointer hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {theme === 'light' ? <Moon className="h-5 w-5 text-indigo-400" /> : <Sun className="h-5 w-5 text-amber-400" />}
                    <span className="text-sm font-medium text-slate-200">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                  <span className="text-xs text-slate-500">Toggle</span>
                </button>
              </div>
            </div>

            {/* Footer Profile Details / Sign In */}
            <div className="pt-6 border-t border-slate-900/60">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center overflow-hidden">
                      {user.profileImageUrl ? (
                        <img
                          src={`http://localhost:5010${user.profileImageUrl}`}
                          alt={user.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-blue-400" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-white leading-tight">{user.fullName}</div>
                      <div className="text-xs text-slate-500">{t(`roles.${user.role}`, user.role)}</div>
                    </div>
                  </div>
                  
                  {user.role === 'Tourist' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/my-bookings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center space-x-2 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300"
                      >
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>{t('navbar.myBookings')}</span>
                      </Link>
                      <Link
                        to="/favorites"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center space-x-2 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300"
                      >
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>{t('navbar.favorites')}</span>
                      </Link>
                    </div>
                  )}

                  {/* Owner and Admin Dashboard shortcut links in mobile drawer */}
                  {user.role !== 'Tourist' && (
                    <div className="space-y-2">
                      {(user.role === 'HotelOwner' || user.role === 'RestaurantOwner' || user.role === 'TransportOwner') && (
                        <Link
                          to="/owner/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="w-full flex items-center justify-center py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300"
                        >
                          {t('navbar.ownerDashboard')}
                        </Link>
                      )}
                      {(user.role === 'Admin' || user.role === 'SuperAdmin') && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="w-full flex items-center justify-center py-3 bg-blue-900/20 border border-blue-800/30 rounded-xl text-xs font-bold text-sky-400"
                        >
                          {t('navbar.adminPanel')}
                        </Link>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 py-3.5 bg-red-950/20 hover:bg-red-950/30 border border-red-900/35 rounded-2xl text-sm font-semibold text-red-400 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('navbar.signOut')}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center py-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl text-sm font-semibold text-slate-200"
                  >
                    {t('navbar.signIn')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center py-3.5 bg-blue-600 hover:bg-blue-700 rounded-2xl text-sm font-semibold text-white shadow-lg shadow-blue-600/10"
                  >
                    {t('navbar.signUp')}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
