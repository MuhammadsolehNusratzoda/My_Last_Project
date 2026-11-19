import { api } from './api';
import type {
  IPagedResult, IPartnerBooking, IPartnerBookingDetail, IPartnerBookingFilters,
  IPartnerListing, IPartnerSummary, ListingType
} from '../types/partner';

// The partner is always identified by the JWT on the server — no owner id is ever sent from here.
export const partnerApi = {
  getSummary: () =>
    api.get<IPartnerSummary>('/partner/summary').then((r) => r.data),

  getBookings: (filters: IPartnerBookingFilters) => {
    // Drop empty values so the URL stays clean
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
    return api.get<IPagedResult<IPartnerBooking>>('/partner/bookings', { params }).then((r) => r.data);
  },

  getBooking: (id: string) =>
    api.get<IPartnerBookingDetail>(`/partner/bookings/${id}`).then((r) => r.data),

  confirm: (id: string) => api.post(`/partner/bookings/${id}/confirm`),
  reject: (id: string, reason: string) => api.post(`/partner/bookings/${id}/reject`, { reason }),
  complete: (id: string) => api.post(`/partner/bookings/${id}/complete`),
  noShow: (id: string, reason?: string) => api.post(`/partner/bookings/${id}/no-show`, { reason: reason || null }),

  getListings: () =>
    api.get<IPartnerListing[]>('/partner/listings').then((r) => r.data),
};

/** Public endpoints used to load / save a listing (ownership is checked by the server). */
export const listingEndpoint: Record<ListingType, string> = {
  Hotel: '/hotels',
  Restaurant: '/restaurants',
  Transport: '/transports',
  Guide: '/guides',
};

/** Extracts a readable message from an axios error. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: unknown } };
  const data = e?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string') {
    return (data as { message: string }).message;
  }
  return fallback;
}
