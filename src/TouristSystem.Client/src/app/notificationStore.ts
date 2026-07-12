import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface INotification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  role: 'Admin' | 'Owner' | 'Tourist';
  type: 'registration' | 'booking' | 'system' | 'moderation';
}

interface NotificationState {
  notifications: INotification[];
  addNotification: (
    title: string,
    message: string,
    role: 'Admin' | 'Owner' | 'Tourist',
    type: 'registration' | 'booking' | 'system' | 'moderation'
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (userRole: string) => void;
  clearAll: (userRole: string) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [
        // Admin Notifications
        {
          id: 'adm_1',
          title: 'New Tourist Registration',
          message: 'Tourist John Doe has successfully registered on the platform.',
          time: '5 mins ago',
          isRead: false,
          role: 'Admin',
          type: 'registration'
        },
        {
          id: 'adm_2',
          title: 'Attraction Pending Review',
          message: 'Hisor Fortress attraction has been submitted for moderation.',
          time: '1 hour ago',
          isRead: false,
          role: 'Admin',
          type: 'moderation'
        },
        {
          id: 'adm_3',
          title: 'Security System Alert',
          message: 'System audit log entry recorded for client authentication state transition.',
          time: '2 hours ago',
          isRead: false,
          role: 'Admin',
          type: 'system'
        },
        // Owner Notifications (Hotel, Restaurant, Transport owners)
        {
          id: 'own_1',
          title: 'New Hotel Booking',
          message: 'Muhammadsoleh Nusratzoda placed a booking request for Serena Hotel Room 102.',
          time: '12 mins ago',
          isRead: false,
          role: 'Owner',
          type: 'booking'
        },
        {
          id: 'own_2',
          title: 'Restaurant Table Booked',
          message: 'Pamir Transit Services booked a table at Toqi Restaurant for 4 guests.',
          time: '3 hours ago',
          isRead: false,
          role: 'Owner',
          type: 'booking'
        },
        // Tourist Notifications
        {
          id: 'tou_1',
          title: 'Booking Confirmed',
          message: 'Your hotel room booking request at Serena Hotel has been approved!',
          time: '8 mins ago',
          isRead: false,
          role: 'Tourist',
          type: 'booking'
        },
        {
          id: 'tou_2',
          title: 'Review Moderation Approved',
          message: 'Your comment on Toqi Restaurant has successfully passed review moderation.',
          time: '4 hours ago',
          isRead: false,
          role: 'Tourist',
          type: 'system'
        }
      ],

      addNotification: (title, message, role, type) => set((state) => {
        const newNotif: INotification = {
          id: `${type}_${Date.now()}`,
          title,
          message,
          time: 'Just now',
          isRead: false,
          role,
          type
        };
        return {
          notifications: [newNotif, ...state.notifications]
        };
      }),

      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        )
      })),

      markAllAsRead: (userRole) => set((state) => {
        const targetGroup = getTargetGroup(userRole);
        return {
          notifications: state.notifications.map((n) =>
            n.role === targetGroup ? { ...n, isRead: true } : n
          )
        };
      }),

      clearAll: (userRole) => set((state) => {
        const targetGroup = getTargetGroup(userRole);
        return {
          notifications: state.notifications.filter((n) => n.role !== targetGroup)
        };
      })
    }),
    {
      name: 'tourist-notification-storage'
    }
  )
);

// Helper to categorize roles into Admin, Owner, and Tourist groups
export function getTargetGroup(role: string): 'Admin' | 'Owner' | 'Tourist' {
  if (role === 'Admin' || role === 'SuperAdmin') return 'Admin';
  if (role === 'HotelOwner' || role === 'RestaurantOwner' || role === 'TransportOwner' || role === 'Guide') return 'Owner';
  return 'Tourist';
}
