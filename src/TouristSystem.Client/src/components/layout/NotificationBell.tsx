import { useState, useRef, useEffect } from 'react';
import { useNotificationStore, getTargetGroup, type INotification } from '../../app/notificationStore';
import { useAuthStore } from '../../app/store';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Bell, Check, Trash2, UserPlus, Calendar, Shield, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const targetGroup = getTargetGroup(user.role);
  
  // Filter notifications for this user role
  const userNotifications = notifications.filter(
    (n) => n.role === targetGroup
  );

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const getNotifIcon = (type: INotification['type']) => {
    switch (type) {
      case 'registration':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'booking':
        return <Calendar className="h-4 w-4 text-indigo-500" />;
      case 'moderation':
        return <Compass className="h-4 w-4 text-amber-500" />;
      case 'system':
        default:
        return <Shield className="h-4 w-4 text-rose-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-sky-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-900 transition-all focus:outline-none cursor-pointer"
        title={t('navbar.notifications', 'Notifications')}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-red-500 text-[10px] font-extrabold text-white rounded-full flex items-center justify-center border border-white dark:border-slate-950">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown overlay panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/80 rounded-2xl shadow-xl z-50 overflow-hidden text-left"
          >
            
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-950/20 border-b border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                {t('navbar.notifications', 'Notifications')}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead(user.role)}
                  className="text-[10px] font-bold text-blue-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  {t('admin.markAllRead', 'Mark all read')}
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800/40">
              {userNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-500 font-sans">
                  {t('admin.noNotifications', 'No notifications yet.')}
                </div>
              ) : (
                userNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 flex space-x-3 transition-colors ${
                      !notif.isRead 
                        ? 'bg-blue-50/20 dark:bg-blue-950/10' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/30'
                    }`}
                  >
                    {/* Icon wrapper */}
                    <div className="shrink-0 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800/40 h-8 w-8 flex items-center justify-center">
                      {getNotifIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate leading-none ${notif.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-850 dark:text-white'}`}>
                          {notif.title}
                        </span>
                        <span className="text-[9px] font-sans text-slate-400 shrink-0 ml-2">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      
                      {/* Mark single as read */}
                      {!notif.isRead && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="mt-2 text-[10px] font-bold text-slate-400 hover:text-blue-500 dark:hover:text-sky-400 flex items-center space-x-1 cursor-pointer"
                        >
                          <Check className="h-3 w-3" />
                          <span>{t('admin.markRead', 'Mark read')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {userNotifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 dark:border-slate-800/60 bg-gray-50/50 dark:bg-slate-950/20 text-center">
                <button
                  onClick={() => clearAll(user.role)}
                  className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-red-500 hover:text-red-650 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{t('admin.clearAll', 'Clear All')}</span>
                </button>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
