import type { ListingType } from '../../types/partner';

export type FieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'datetime';

export interface FieldDef {
  key: string;
  labelKey: string;
  label: string;
  type: FieldType;
  required?: boolean;
  /** Only shown when editing an existing listing (e.g. available rooms). */
  editOnly?: boolean;
  options?: string[];
  min?: number;
  step?: number;
}

export const CITIES = ['Dushanbe', 'Khujand', 'Panjakent', 'Hisor', 'Khorog', 'Kulob', 'Bokhtar'];

/** Form fields per listing type — they map 1:1 to the backend Create/Update DTOs. */
export const LISTING_FIELDS: Record<ListingType, FieldDef[]> = {
  Hotel: [
    { key: 'name', labelKey: 'partner.f.name', label: 'Name', type: 'text', required: true },
    { key: 'city', labelKey: 'partner.f.city', label: 'City', type: 'select', options: CITIES, required: true },
    { key: 'address', labelKey: 'partner.f.address', label: 'Address', type: 'text', required: true },
    { key: 'phoneNumber', labelKey: 'partner.f.phone', label: 'Phone', type: 'text', required: true },
    { key: 'pricePerNight', labelKey: 'partner.f.pricePerNight', label: 'Price per night', type: 'number', min: 0, step: 0.01, required: true },
    { key: 'stars', labelKey: 'partner.f.stars', label: 'Stars', type: 'number', min: 1, step: 1, required: true },
    { key: 'totalRooms', labelKey: 'partner.f.totalRooms', label: 'Total rooms', type: 'number', min: 1, step: 1, required: true },
    { key: 'availableRooms', labelKey: 'partner.f.availableRooms', label: 'Available rooms', type: 'number', min: 0, step: 1, editOnly: true },
    { key: 'imageUrl', labelKey: 'partner.f.imageUrl', label: 'Image URL', type: 'text' },
    { key: 'websiteUrl', labelKey: 'partner.f.website', label: 'Website', type: 'text' },
    { key: 'description', labelKey: 'partner.f.description', label: 'Description', type: 'textarea', required: true },
    { key: 'hasWifi', labelKey: 'partner.f.wifi', label: 'Wi-Fi', type: 'checkbox' },
    { key: 'hasParking', labelKey: 'partner.f.parking', label: 'Parking', type: 'checkbox' },
    { key: 'hasPool', labelKey: 'partner.f.pool', label: 'Pool', type: 'checkbox' },
    { key: 'hasGym', labelKey: 'partner.f.gym', label: 'Gym', type: 'checkbox' },
    { key: 'hasRestaurant', labelKey: 'partner.f.restaurant', label: 'Restaurant', type: 'checkbox' },
    { key: 'isFamilyFriendly', labelKey: 'partner.f.family', label: 'Family friendly', type: 'checkbox' },
    { key: 'isLuxury', labelKey: 'partner.f.luxury', label: 'Luxury', type: 'checkbox' },
    { key: 'isBudget', labelKey: 'partner.f.budget', label: 'Budget', type: 'checkbox' },
  ],
  Restaurant: [
    { key: 'name', labelKey: 'partner.f.name', label: 'Name', type: 'text', required: true },
    { key: 'city', labelKey: 'partner.f.city', label: 'City', type: 'select', options: CITIES, required: true },
    { key: 'address', labelKey: 'partner.f.address', label: 'Address', type: 'text', required: true },
    { key: 'phoneNumber', labelKey: 'partner.f.phone', label: 'Phone', type: 'text', required: true },
    { key: 'cuisineType', labelKey: 'partner.f.cuisine', label: 'Cuisine', type: 'text', required: true },
    { key: 'priceRange', labelKey: 'partner.f.priceRange', label: 'Price range', type: 'select', options: ['Low', 'Medium', 'High'], required: true },
    { key: 'openingHours', labelKey: 'partner.f.openingHours', label: 'Opening hours', type: 'text', required: true },
    { key: 'imageUrl', labelKey: 'partner.f.imageUrl', label: 'Image URL', type: 'text' },
    { key: 'websiteUrl', labelKey: 'partner.f.website', label: 'Website', type: 'text' },
    { key: 'description', labelKey: 'partner.f.description', label: 'Description', type: 'textarea', required: true },
    { key: 'hasDelivery', labelKey: 'partner.f.delivery', label: 'Delivery', type: 'checkbox' },
    { key: 'hasWifi', labelKey: 'partner.f.wifi', label: 'Wi-Fi', type: 'checkbox' },
    { key: 'hasParking', labelKey: 'partner.f.parking', label: 'Parking', type: 'checkbox' },
  ],
  Transport: [
    { key: 'name', labelKey: 'partner.f.name', label: 'Name', type: 'text', required: true },
    { key: 'type', labelKey: 'partner.f.transportType', label: 'Type', type: 'select', options: ['Bus', 'Taxi', 'Car', 'Train', 'Van'], required: true },
    { key: 'originCity', labelKey: 'partner.f.origin', label: 'From', type: 'select', options: CITIES, required: true },
    { key: 'destinationCity', labelKey: 'partner.f.destination', label: 'To', type: 'select', options: CITIES, required: true },
    { key: 'departureTime', labelKey: 'partner.f.departure', label: 'Departure', type: 'datetime', required: true },
    { key: 'arrivalTime', labelKey: 'partner.f.arrival', label: 'Arrival', type: 'datetime', required: true },
    { key: 'pricePerSeat', labelKey: 'partner.f.pricePerSeat', label: 'Price per seat', type: 'number', min: 0, step: 0.01, required: true },
    { key: 'totalSeats', labelKey: 'partner.f.totalSeats', label: 'Total seats', type: 'number', min: 1, step: 1, required: true },
    { key: 'availableSeats', labelKey: 'partner.f.availableSeats', label: 'Available seats', type: 'number', min: 0, step: 1, editOnly: true },
    { key: 'vehicleNumber', labelKey: 'partner.f.vehicleNumber', label: 'Vehicle number', type: 'text', required: true },
    { key: 'contactPhone', labelKey: 'partner.f.phone', label: 'Phone', type: 'text', required: true },
  ],
  Guide: [
    { key: 'city', labelKey: 'partner.f.city', label: 'City', type: 'select', options: CITIES, required: true },
    { key: 'languages', labelKey: 'partner.f.languages', label: 'Languages (comma separated)', type: 'text', required: true },
    { key: 'pricePerDay', labelKey: 'partner.f.pricePerDay', label: 'Price per day', type: 'number', min: 0, step: 0.01, required: true },
    { key: 'experienceYears', labelKey: 'partner.f.experience', label: 'Years of experience', type: 'number', min: 0, step: 1, required: true },
    { key: 'imageUrl', labelKey: 'partner.f.imageUrl', label: 'Photo URL', type: 'text' },
    { key: 'bio', labelKey: 'partner.f.bio', label: 'About me', type: 'textarea', required: true },
    { key: 'isAvailable', labelKey: 'partner.f.available', label: 'Available for bookings', type: 'checkbox', editOnly: true },
  ],
};

/** Default values for a new listing. */
export function emptyValues(type: ListingType): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const f of LISTING_FIELDS[type]) {
    values[f.key] = f.type === 'checkbox' ? false : f.type === 'select' ? f.options?.[0] ?? '' : '';
  }
  if (type === 'Hotel') values.stars = 3;
  if (type === 'Guide') values.isAvailable = true;
  return values;
}

/** datetime-local input <-> ISO string helpers (the input works in local time). */
export function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
