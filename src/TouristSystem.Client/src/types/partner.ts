// Types for the Partner Portal API (/api/partner/*). Mirrors TouristSystem.Application.Features.Partner DTOs.

export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Expired' | 'Completed';
export type ListingType = 'Hotel' | 'Restaurant' | 'Transport' | 'Guide';

export interface IPartnerArrival {
  bookingId: string;
  travelerName: string;
  travelerPhone?: string | null;
  listingName: string;
  bookingType: string;
  startDate: string;
  endDate: string;
  guestsCount: number;
  quantity: number;
}

export interface IPartnerSummary {
  pendingCount: number;
  confirmedCount: number;
  completedLast30Days: number;
  cancelledLast30Days: number;
  listingsCount: number;
  todayArrivals: IPartnerArrival[];
  generatedAtUtc: string;
}

export interface IPartnerBooking {
  id: string;
  bookingType: string;
  referenceId: string;
  listingName: string;
  travelerName: string;
  travelerEmail: string;
  travelerPhone?: string | null;
  startDate: string;
  endDate: string;
  nights: number;
  guestsCount: number;
  quantity: number;
  totalPrice: number;
  status: BookingStatus;
  isNoShow: boolean;
  createdAt: string;
}

export interface IBookingHistoryItem {
  fromStatus: BookingStatus;
  toStatus: BookingStatus;
  changedBy: string;
  reason?: string | null;
  changedAt: string;
}

export interface IPartnerBookingDetail extends IPartnerBooking {
  listingCity?: string | null;
  notes?: string | null;
  rejectionReason?: string | null;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  completedAt?: string | null;
  history: IBookingHistoryItem[];
}

export interface IPartnerListing {
  id: string;
  type: ListingType;
  name: string;
  city?: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  imageUrl?: string | null;
  price?: number | null;
  priceUnit?: 'night' | 'seat' | 'day' | null;
  capacity?: number | null;
  available?: number | null;
  ratingAverage: number;
  createdAt: string;
}

export interface IPagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface IPartnerBookingFilters {
  status?: string;
  from?: string; // yyyy-MM-dd
  to?: string;   // yyyy-MM-dd
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}
