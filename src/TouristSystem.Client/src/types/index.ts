export interface IUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'Tourist' | 'Guide' | 'HotelOwner' | 'RestaurantOwner' | 'TransportOwner' | 'Admin' | 'SuperAdmin';
}

export interface IPlace {
  id: string;
  name: string;
  description: string;
  city: string;
  coordinates: string;
  ratingAverage: number;
  reviewsCount: number;
  imageUrl?: string;
  status: string;
  createdAt: string;
}

export interface IHotel {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  city: string;
  address: string;
  stars: number;
  pricePerNight: number;
  availableRooms: number;
  amenities: string;
  ratingAverage: number;
  reviewsCount: number;
  imageUrl?: string;
  status: string;
}

export interface IRestaurant {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  city: string;
  address: string;
  cuisineType: string;
  priceRange: string;
  workingHours: string;
  ratingAverage: number;
  reviewsCount: number;
  imageUrl?: string;
  status: string;
}

export interface ITransport {
  id: string;
  ownerId: string;
  name: string;
  type: 'Bus' | 'Taxi' | 'Car' | 'Train' | 'Van';
  originCity: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  pricePerSeat: number;
  totalSeats: number;
  availableSeats: number;
  vehicleNumber: string;
  contactPhone: string;
  status: string;
}

export interface IGuide {
  id: string;
  userId: string;
  guideName: string;
  guideEmail: string;
  bio: string;
  languages: string;
  city: string;
  pricePerDay: number;
  experienceYears: number;
  ratingAverage: number;
  reviewsCount: number;
  imageUrl?: string;
  isAvailable: boolean;
  status: string;
  createdAt: string;
}

export interface IBooking {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  bookingType: 'Hotel' | 'Transport' | 'Guide';
  referenceId: string;
  referenceName: string;
  startDate: string;
  endDate: string;
  guestsCount: number;
  quantity: number;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Expired' | 'Completed';
  notes?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface IReview {
  id: string;
  userId: string;
  userName: string;
  userImageUrl?: string;
  reviewType: 'Place' | 'Hotel' | 'Restaurant' | 'Guide';
  referenceId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface IFavorite {
  id: string;
  userId: string;
  favoriteType: 'Place' | 'Hotel' | 'Restaurant' | 'Guide';
  referenceId: string;
  itemName: string;
  itemImageUrl?: string;
  createdAt: string;
}
