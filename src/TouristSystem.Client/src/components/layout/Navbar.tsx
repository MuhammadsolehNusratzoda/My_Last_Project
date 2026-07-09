import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../app/store';
import { useTranslation, type Language } from '../../hooks/useTranslation';
import { Compass, User, LogOut, Menu, X, Heart, Calendar, Sun, Moon, Globe, Map } from 'lucide-react';
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
  };

  const navItems = [
    { path: '/places', label: t('navbar.places') },
    { path: '/hotels', label: t('navbar.hotels') },
    { path: '/restaurants', label: t('navbar.restaurants') },
    { path: '/transports', label: t('navbar.transports') },
    { path: '/guides', label: t('navbar.guides') },
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
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border border-blue-100/50 dark:border-slate-800 hover:scale-105 transition-all text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full text-sm font-medium focus:outline-none cursor-pointer"
                >
                  <User className="h-4 w-4 text-blue-600 dark:text-sky-400" />
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
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-200/50 dark:border-slate-800/40 bg-white/95 dark:bg-slate-950/95 px-4 pt-2 pb-4 space-y-1"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-base font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-900 transition-all"
              >
                {item.label}
              </Link>
            ))}
            
            <div className="border-t border-gray-100 dark:border-slate-800/60 pt-4 pb-2 space-y-3">
              {/* Language toggles for mobile */}
              <div className="flex justify-around py-1">
                <button onClick={() => selectLanguage('en')} className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800'}`}>🇬🇧 EN</button>
                <button onClick={() => selectLanguage('ru')} className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${lang === 'ru' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800'}`}>🇷🇺 RU</button>
                <button onClick={() => selectLanguage('tj')} className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${lang === 'tj' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800'}`}>🇹🇯 TJ</button>
              </div>

              {/* Theme toggle for mobile */}
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 w-full px-4 py-2 rounded-2xl bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-300 font-medium cursor-pointer"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span>{theme === 'light' ? t('common.darkMode', 'Dark Mode') : t('common.lightMode', 'Light Mode')}</span>
              </button>

              {user ? (
                <div className="space-y-1 pt-2">
                  <div className="px-4">
                    <div className="text-base font-bold text-gray-800 dark:text-slate-200">{user.fullName}</div>
                    <div className="text-xs text-gray-500">{t(`roles.${user.role}`, user.role)}</div>
                  </div>
                  
                  {user.role === 'Tourist' && (
                    <>
                      <Link
                        to="/my-bookings"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-base text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-900"
                      >
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span>{t('navbar.myBookings')}</span>
                      </Link>
                      <Link
                        to="/favorites"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-base text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-900"
                      >
                        <Heart className="h-4 w-4 text-red-500" />
                        <span>{t('navbar.favorites')}</span>
                      </Link>
                    </>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center space-x-2 px-4 py-2.5 text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('navbar.signOut')}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-2 px-4">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-center py-2.5 rounded-2xl text-base font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-900 border border-gray-200 dark:border-slate-800"
                  >
                    {t('navbar.signIn')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block text-center bg-blue-600 text-white py-2.5 rounded-2xl text-base font-medium hover:bg-blue-700 shadow-md shadow-blue-500/15"
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
