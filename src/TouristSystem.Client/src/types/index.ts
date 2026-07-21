export interface IUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl?: string;
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

export interface ITransportCompany {
  id: string;
  name: string;
  operatingCities: string[];
  isSystemDefault: boolean;
}

export interface IVehicleInfo {
  registrationNumber: string;
  brand: string;
  model: string;
  manufacturingYear: number;
  color: string;
  passengerSeats: number;
  hasAirConditioning: boolean;
  hasWifi: boolean;
  hasLuggageSpace: boolean;
  childSeatAvailable: boolean;
  wheelchairAccessible: boolean;
  petFriendly: boolean;
  smokingAllowed: boolean;
  registrationCertificateUrl: string;
  insuranceCertificateUrl: string;
  technicalInspectionCertificateUrl?: string;
  vehiclePhotos: string[];
}

export interface IServiceInfo {
  serviceTypes: string[];
  availableCities: string[];
  languagesSpoken: string[];
  paymentMethods: string[];
}

export interface IWorkingHour {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  is24Hours: boolean;
}

export interface ISaveProviderDraft {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email?: string;
  nationality: string;
  currentCity: string;
  currentAddress: string;
  profilePhotoUrl?: string;
  yearsDrivingExperience: number;
  isProfessionalDriver: boolean;
  previousCompany?: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseIssueDate: string;
  licenseExpirationDate: string;
  licenseFrontPhotoUrl?: string;
  licenseBackPhotoUrl?: string;
  companyId?: string;
  customCompanyName?: string;
  employmentType: 'Driver' | 'Owner' | 'Partner';
  yearsWithCompany: number;
  vehicle?: IVehicleInfo;
  service?: IServiceInfo;
  workingHours: IWorkingHour[];
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface IProviderApplicationDossier {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  nationality: string;
  currentCity: string;
  currentAddress: string;
  profilePhotoUrl?: string;
  yearsDrivingExperience: number;
  isProfessionalDriver: boolean;
  previousCompany?: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseIssueDate: string;
  licenseExpirationDate: string;
  licenseFrontPhotoUrl?: string;
  licenseBackPhotoUrl?: string;
  companyId?: string;
  companyName?: string;
  customCompanyName?: string;
  employmentType: string;
  yearsWithCompany: number;
  vehicle?: IVehicleInfo;
  service?: IServiceInfo;
  workingHours: IWorkingHour[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  applicationStatus: 'Draft' | 'PendingReview' | 'Approved' | 'Rejected' | 'Suspended';
  driverStatus: 'Available' | 'Busy' | 'Offline';
  ratingAverage: number;
  completedTripsCount: number;
  isIdentityVerified: boolean;
  isLicenseVerified: boolean;
  isVehicleVerified: boolean;
  isInsuranceVerified: boolean;
  isCompanyVerified: boolean;
  isFullyVerified: boolean;
  rejectionReason?: string;
  adminInternalNotes?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface IPassengerProviderSearchResult {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  currentCity: string;
  profilePhotoUrl: string;
  companyName: string;
  yearsDrivingExperience: number;
  ratingAverage: number;
  completedTripsCount: number;
  driverStatus: string;
  isFullyVerified: boolean;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  passengerSeats: number;
  vehicleRegNumber: string;
  vehiclePhotos: string[];
  hasAirConditioning: boolean;
  hasWifi: boolean;
  hasLuggageSpace: boolean;
  childSeatAvailable: boolean;
  wheelchairAccessible: boolean;
  serviceTypes: string[];
  availableCities: string[];
  languagesSpoken: string[];
  paymentMethods: string[];
}

