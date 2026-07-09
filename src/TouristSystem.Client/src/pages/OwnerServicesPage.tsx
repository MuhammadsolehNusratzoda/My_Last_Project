import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuthStore } from '../app/store';
import { useTranslation } from '../hooks/useTranslation';
import { Building, Utensils, Bus, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';

export default function OwnerServicesPage() {
  const { user } = useAuthStore();
  const { t, formatCurrency, formatNumber } = useTranslation();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Hotel specific
  const [stars, setStars] = useState(3);
  const [pricePerNight, setPricePerNight] = useState(100);
  const [availableRooms, setAvailableRooms] = useState(10);
  const [amenities, setAmenities] = useState('WiFi, Parking, Pool');

  // Restaurant specific
  const [cuisineType, setCuisineType] = useState('Local');
  const [priceRange, setPriceRange] = useState('$$');
  const [workingHours, setWorkingHours] = useState('09:00 - 22:00');

  // Transport specific
  const [transportType, setTransportType] = useState('Bus');
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [pricePerSeat, setPricePerSeat] = useState(15);
  const [totalSeats, setTotalSeats] = useState(40);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    fetchServices();
  }, [user]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      if (user?.role === 'HotelOwner') {
        const res = await api.get('/hotels');
        // Filter locally by owner
        const filtered = (res.data.items || []).filter((h: any) => h.ownerId === user.id);
        setServices(filtered);
      } else if (user?.role === 'RestaurantOwner') {
        const res = await api.get('/restaurants');
        const filtered = (res.data.items || []).filter((r: any) => r.ownerId === user.id);
        setServices(filtered);
      } else if (user?.role === 'TransportOwner') {
        const res = await api.get('/transports');
        const filtered = (res.data.items || []).filter((t: any) => t.ownerId === user.id);
        setServices(filtered);
      }
    } catch (error) {
      console.error('Error fetching owner services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      if (user?.role === 'HotelOwner') {
        await api.post('/hotels', {
          ownerId: user.id,
          name,
          description,
          city,
          address,
          stars,
          pricePerNight,
          availableRooms,
          amenities,
          imageUrl: imageUrl || undefined,
        });
      } else if (user?.role === 'RestaurantOwner') {
        await api.post('/restaurants', {
          ownerId: user.id,
          name,
          description,
          city,
          address,
          cuisineType,
          priceRange,
          workingHours,
          imageUrl: imageUrl || undefined,
        });
      } else if (user?.role === 'TransportOwner') {
        await api.post('/transports', {
          ownerId: user.id,
          name,
          type: transportType,
          originCity,
          destinationCity,
          departureTime,
          arrivalTime,
          pricePerSeat,
          totalSeats,
          availableSeats: totalSeats,
          vehicleNumber,
          contactPhone,
        });
      }

      setSuccess(true);
      setName('');
      setDescription('');
      setCity('');
      setAddress('');
      setImageUrl('');
      fetchServices();
    } catch (error) {
      console.error('Error creating service:', error);
      alert(t('bookings.registerServiceError', 'Error registering service. Verify properties.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('bookings.deleteConfirm', 'Delete this listing permanently?'))) {
      return;
    }

    try {
      if (user?.role === 'HotelOwner') {
        await api.delete(`/hotels/${id}`);
      } else if (user?.role === 'RestaurantOwner') {
        await api.delete(`/restaurants/${id}`);
      } else if (user?.role === 'TransportOwner') {
        await api.delete(`/transports/${id}`);
      }
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      alert(t('bookings.deleteFailed', 'Failed to delete service.'));
    }
  };

  if (!user || !['HotelOwner', 'RestaurantOwner', 'TransportOwner'].includes(user.role)) {
    return (
      <div className="text-center py-24 flex-grow bg-slate-950 text-slate-100 flex flex-col justify-center items-center">
        <p className="text-slate-400 font-light">{t('errors.unauthorized', 'Access Restricted.')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 bg-slate-950 text-slate-100">
      {/* Services List */}
      <div className="lg:col-span-2 space-y-6 text-left">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          {user.role === 'HotelOwner' && <Building className="h-6 w-6 text-blue-500" />}
          {user.role === 'RestaurantOwner' && <Utensils className="h-6 w-6 text-blue-500" />}
          {user.role === 'TransportOwner' && <Bus className="h-6 w-6 text-blue-500" />}
          <span>{t('bookings.myListings', 'My Registered Listings')} ({formatNumber(services.length)})</span>
        </h2>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 inline-block" />
          </div>
        ) : services.length === 0 ? (
          <div className="py-12 border border-dashed border-slate-800 rounded-3xl text-center text-slate-500 font-light bg-slate-900/10">
            {t('bookings.noListings', 'No registered listings yet. Use the form to publish one.')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((item) => (
              <div key={item.id} className="bg-slate-900/40 border border-slate-900/60 p-5 rounded-[24px] shadow-lg flex flex-col justify-between hover:border-slate-850">
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">{item.name}</h3>
                  <p className="text-xs text-slate-450 mb-2">{t(item.city)} - {item.address || ''}</p>
                  <p className="text-sm text-slate-400 font-light line-clamp-3 mb-4">{item.description}</p>
                </div>
                <div className="border-t border-slate-800/60 pt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-450 font-light">
                    {user.role === 'HotelOwner' && `${formatCurrency(item.pricePerNight)} / ${t('common.perNight')}`}
                    {user.role === 'RestaurantOwner' && `${t('restaurants.cuisine')}: ${item.cuisineType}`}
                    {user.role === 'TransportOwner' && `${formatCurrency(item.pricePerSeat)} / ${t('transports.seat')}`}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 p-2 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Creation form */}
      <div>
        <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-3xl shadow-xl sticky top-24 text-left backdrop-blur-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2 pb-3 border-b border-slate-800/60">
            <Plus className="h-5 w-5 text-blue-500" />
            <span>{t('bookings.addListing', 'Add New Listing')}</span>
          </h3>

          {success && (
            <div className="mb-4 bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-2xl text-xs flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{t('toasts.serviceRegistered', 'Service registered successfully!')}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4 text-xs font-semibold text-slate-400">
            <div>
              <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('bookings.serviceName', 'Service Name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('transports.city', 'City')}</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('bookings.addressStreet', 'Address / Street')}</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('bookings.imageUrl', 'Image URL')}</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div>
              <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('common.description', 'Description')}</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Hotel specific fields */}
            {user.role === 'HotelOwner' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('hotels.starsFilter', 'Stars')}</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={stars}
                      onChange={(e) => setStars(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('hotels.pricePerNight', 'Price / Night')}</label>
                    <input
                      type="number"
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('bookings.roomsCount', 'Rooms Count')}</label>
                  <input
                    type="number"
                    value={availableRooms}
                    onChange={(e) => setAvailableRooms(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('hotels.amenities', 'Amenities')}</label>
                  <input
                    type="text"
                    value={amenities}
                    onChange={(e) => setAmenities(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Restaurant specific fields */}
            {user.role === 'RestaurantOwner' && (
              <>
                <div>
                  <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('restaurants.cuisine', 'Cuisine Type')}</label>
                  <input
                    type="text"
                    value={cuisineType}
                    onChange={(e) => setCuisineType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('restaurants.priceRange', 'Price Range')}</label>
                    <input
                      type="text"
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('restaurants.workingHours', 'Hours')}</label>
                    <input
                      type="text"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Transport specific fields */}
            {user.role === 'TransportOwner' && (
              <>
                <div>
                  <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('transports.type', 'Type')}</label>
                  <select
                    value={transportType}
                    onChange={(e) => setTransportType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Bus">Bus</option>
                    <option value="Taxi">Taxi</option>
                    <option value="Train">Train</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('transports.originCity', 'Origin City')}</label>
                    <input
                      type="text"
                      value={originCity}
                      onChange={(e) => setOriginCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('transports.destinationCity', 'Dest City')}</label>
                    <input
                      type="text"
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('transports.departure', 'Dep Time')}</label>
                    <input
                      type="datetime-local"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('transports.arrival', 'Arr Time')}</label>
                    <input
                      type="datetime-local"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('transports.pricePerSeat', 'Price / Seat')}</label>
                    <input
                      type="number"
                      value={pricePerSeat}
                      onChange={(e) => setPricePerSeat(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('transports.totalSeats', 'Total Seats')}</label>
                    <input
                      type="number"
                      value={totalSeats}
                      onChange={(e) => setTotalSeats(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('transports.vehicleNo', 'Vehicle No')}</label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 ml-2 uppercase tracking-wider">{t('footer.contact', 'Phone')}</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 font-normal text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl text-sm font-semibold shadow-lg flex justify-center items-center cursor-pointer transition-colors"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('bookings.publishListing', 'Publish Listing')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
