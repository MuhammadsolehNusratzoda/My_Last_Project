import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../app/store';
import { useTranslation } from '../../hooks/useTranslation';
import { Home, MapPin, Hotel, Utensils, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNavigation() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const navItems = [
    {
      path: '/',
      label: t('navbar.home', 'Home'),
      icon: Home,
    },
    {
      path: '/places',
      label: t('navbar.places', 'Places'),
      icon: MapPin,
    },
    {
      path: '/hotels',
      label: t('navbar.hotels', 'Hotels'),
      icon: Hotel,
    },
    {
      path: '/restaurants',
      label: t('navbar.restaurants', 'Restaurants'),
      icon: Utensils,
    },
    {
      path: user ? '/profile' : '/login',
      label: t('navbar.profile', 'Profile'),
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-slate-950/80 backdrop-blur-lg border-t border-slate-800/60 px-4 py-2 flex justify-around items-center shadow-2xl safe-bottom">
      {navItems.map((item) => {
        // Matches exact root path or prefix match for other routes
        const isActive = item.path === '/' 
          ? location.pathname === '/' 
          : location.pathname.startsWith(item.path.split('?')[0]);

        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            to={item.path}
            className="relative flex flex-col items-center justify-center w-16 py-1 text-slate-400 focus:outline-none select-none active:scale-95 transition-transform"
          >
            {isActive && (
              <motion.span
                layoutId="activeBottomTab"
                className="absolute inset-0 bg-blue-500/10 dark:bg-sky-500/10 rounded-2xl -z-10 scale-90"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
            <Icon 
              className={`h-5 w-5 transition-colors duration-200 ${
                isActive ? 'text-blue-500 dark:text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
              }`} 
            />
            <span 
              className={`text-[10px] mt-1 font-semibold transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-slate-500'
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
