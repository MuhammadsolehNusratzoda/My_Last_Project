import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from './app/store';
import { useTranslation } from './hooks/useTranslation';
import { Providers } from './app/providers';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PlacesPage from './pages/PlacesPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailPage from './pages/HotelDetailPage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import TransportsPage from './pages/TransportsPage';
import GuidesPage from './pages/GuidesPage';
import GuideDetailPage from './pages/GuideDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyBookingsPage from './pages/MyBookingsPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminPlacesPage from './pages/AdminPlacesPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import OwnerServicesPage from './pages/OwnerServicesPage';
import ProfilePage from './pages/ProfilePage';
import { ProtectedRoute, RoleRoute } from './routes';
import { api } from './services/api';
import type { IPlace } from './types';
import { motion } from 'framer-motion';
import { 
  Search, MapPin, Compass, Star, ArrowRight, Sparkles, Navigation, ArrowUpRight
} from 'lucide-react';
import TajikistanRouteMap from './components/TajikistanRouteMap';
import NavigationPage from './pages/NavigationPage';

function LandingPage() {
  const navigate = useNavigate();
  const { t, getLocalized, formatNumber } = useTranslation();
  const [stats, setStats] = useState({ attractions: 120, hotels: 350, restaurants: 75, cities: 25, visitors: '15K+' });
  const [popularPlaces, setPopularPlaces] = useState<IPlace[]>([]);
  const [featuredHotels, setFeaturedHotels] = useState<any[]>([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<any[]>([]);
  const [mapOrigin, setMapOrigin] = useState('Dushanbe');
  const [mapDest, setMapDest] = useState('Khujand');

  // Search form state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/places?pageSize=6'),
      api.get('/hotels?pageSize=6'),
      api.get('/restaurants?pageSize=6')
    ]).then(([placesRes, hotelsRes, restaurantsRes]) => {
      const dbPlaces = placesRes.data.items || [];
      const dbHotels = hotelsRes.data.items || [];
      const dbRestaurants = restaurantsRes.data.items || [];

      setStats({
        attractions: Math.max(120, dbPlaces.length * 8),
        hotels: Math.max(350, dbHotels.length * 12),
        restaurants: Math.max(75, dbRestaurants.length * 15),
        cities: 25,
        visitors: '15K+'
      });

      setPopularPlaces(dbPlaces.slice(0, 3));
      setFeaturedHotels(dbHotels.slice(0, 3));
      setFeaturedRestaurants(dbRestaurants.slice(0, 3));
    }).catch(err => {
      console.error("Error loading landing page data", err);
    });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let url = '/places';
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (searchCity) params.append('city', searchCity);
    if (searchCategory) params.append('category', searchCategory);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    navigate(url);
  };

  const categories = [
    { name: 'Mountains', icon: '🏔', count: 42, labelKey: 'categories.Mountains' },
    { name: 'Lakes', icon: '🏞', count: 18, labelKey: 'categories.Lakes' },
    { name: 'Historical Sites', icon: '🏛', count: 27, labelKey: 'categories.Historical' },
    { name: 'Nature', icon: '🌲', count: 35, labelKey: 'categories.Nature' },
    { name: 'Culture', icon: '🕌', count: 15, labelKey: 'categories.Culture' },
    { name: 'Festivals', icon: '🎉', count: 8, labelKey: 'categories.Festivals' },
  ];

  const testimonials = [
    {
      name: 'Elena Rostova',
      role: 'Adventure Photographer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
      commentKey: 'testimonials.elena'
    },
    {
      name: 'James Wilson',
      role: 'Trekker & Travel Blogger',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      commentKey: 'testimonials.james'
    },
    {
      name: 'Mirzo Aliev',
      role: 'Cultural Historian',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
      commentKey: 'testimonials.mirzo'
    }
  ];

  const events = [
    {
      titleKey: 'events.nowruz.title',
      dateKey: 'events.nowruz.date',
      location: 'Dushanbe & Khujand',
      image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
      descriptionKey: 'events.nowruz.description'
    },
    {
      titleKey: 'events.roof.title',
      dateKey: 'events.roof.date',
      location: 'Khorog, Pamir',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      descriptionKey: 'events.roof.description'
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* Full-Screen Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=2000&q=80"
            alt={t('hero.imageAlt', 'Tajikistan Landscape')}
            className="w-full h-full object-cover scale-105 filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-sky-400 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">
              <Sparkles className="h-3 w-3 animate-spin" />
              <span>{t('hero.exploreBtn', 'Explore Tajikistan with us')}</span>
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
              {t('welcome', 'Tajikistan — Where the Sky Touches the Earth')}
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-light leading-relaxed">
              {t('tagline', 'Breathtaking landscapes, a rich ancient culture, and warm heartfelt hospitality — all in one unforgettable journey.')}
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/places"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3.5 rounded-full shadow-lg shadow-blue-500/20 hover:scale-105 transition-all flex items-center justify-center space-x-2"
            >
              <span>{t('hero.placesCategory', 'Places & Sights')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-100 font-medium px-8 py-3.5 rounded-full hover:scale-105 transition-all flex items-center justify-center space-x-2 backdrop-blur-md"
            >
              <span>{t('hero.watchVideo', 'Watch Video')}</span>
            </a>
          </motion.div>

          {/* Glassmorphic Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-4xl mx-auto bg-slate-900/60 border border-slate-800/80 p-4 rounded-3xl shadow-2xl backdrop-blur-xl"
          >
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              <div className="relative text-left">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-3">{t('hero.cityLabel', 'Where to go')}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('hero.searchPlaceholder', 'Search locations...')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="relative text-left">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-3">{t('hero.cityLabel', 'City')}</label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <select
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">{t('common.allCities')}</option>
                    <option value="Dushanbe">{t('Dushanbe')}</option>
                    <option value="Khujand">{t('Khujand')}</option>
                    <option value="Panjakent">{t('Panjakent')}</option>
                    <option value="Hisor">{t('Hisor')}</option>
                    <option value="Khorog">{t('Khorog')}</option>
                  </select>
                </div>
              </div>

              <div className="relative text-left">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 ml-3">{t('hero.categoryLabel', 'Category')}</label>
                <div className="relative">
                  <Compass className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">{t('common.allCategories', 'All Categories')}</option>
                    <option value="Mountains">{t('categories.Mountains', 'Mountains')}</option>
                    <option value="Lakes">{t('categories.Lakes', 'Lakes')}</option>
                    <option value="Historical">{t('categories.Historical', 'Historical Sites')}</option>
                    <option value="Nature">{t('categories.Nature', 'Nature')}</option>
                    <option value="Culture">{t('categories.Culture', 'Culture')}</option>
                  </select>
                </div>
              </div>

              <div className="text-left pt-5 sm:pt-0">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl shadow-lg hover:scale-105 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  <span>{t('common.search')}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {[
              { value: `${formatNumber(stats.attractions)}+`, label: t('navbar.places') },
              { value: `${formatNumber(stats.hotels)}+`, label: t('navbar.hotels') },
              { value: `${formatNumber(stats.restaurants)}+`, label: t('navbar.restaurants') },
              { value: `${formatNumber(stats.cities)}`, label: t('navbar.cities', 'Cities') },
              { value: stats.visitors, label: t('navbar.visitors', 'Visitors') },
            ].map((stat, i) => (
              <div key={i} className="p-6 bg-slate-900/40 border border-slate-900/60 rounded-3xl backdrop-blur-xs hover:border-slate-800 transition-colors text-slate-100">
                <div className="text-3xl sm:text-4xl font-extrabold text-blue-500 dark:text-sky-400 mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm text-slate-400 font-light tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <span className="text-sky-400 text-xs font-bold uppercase tracking-widest">{t('categories.title', 'Select Category')}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{t('categories.subtitle', 'How do you want to travel?')}</h2>
            <div className="h-1 w-12 bg-blue-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {categories.map((cat, i) => (
              <Link
                key={i}
                to={`/places?category=${cat.name}`}
                className="group p-6 bg-slate-900 border border-slate-800/80 rounded-3xl hover:border-blue-500/50 hover:bg-slate-900/80 text-center transition-all duration-300 hover:-translate-y-1.5"
              >
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">{cat.icon}</div>
                <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">{t(cat.labelKey, cat.name)}</h3>
                <span className="text-xs text-slate-500">{formatNumber(cat.count)} {t('common.listings', 'listings')}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations Section */}
      <section className="py-24 bg-slate-950 border-t border-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16">
            <div className="space-y-3">
              <span className="text-sky-400 text-xs font-bold uppercase tracking-widest">{t('places.title')}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{t('hero.placesCategory', 'Top Destinations in Tajikistan')}</h2>
            </div>
            <Link
              to="/places"
              className="mt-4 sm:mt-0 text-blue-400 hover:text-blue-300 flex items-center space-x-2 text-sm font-semibold group"
            >
              <span>{t('hero.viewAllPlaces', 'View All Places')}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularPlaces.length > 0 ? (
              popularPlaces.map((place) => (
                <div
                  key={place.id}
                  className="group bg-slate-900 border border-slate-800/80 rounded-[24px] overflow-hidden shadow-xl hover:-translate-y-2 transition-all duration-300 hover:border-slate-700/60"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-950">
                    <img
                      src={place.imageUrl || 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=600&q=80'}
                      alt={getLocalized(place, 'name')}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute top-4 right-4 bg-slate-950/70 border border-slate-800 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 backdrop-blur-md">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{place.ratingAverage.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4 text-left">
                    <div className="flex items-center text-xs text-slate-400 space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>{t(place.city)}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                      {getLocalized(place, 'name')}
                    </h3>
                    <p className="text-sm text-slate-400 font-light leading-relaxed line-clamp-2">
                      {getLocalized(place, 'description')}
                    </p>
                    <div className="pt-2 flex justify-between items-center">
                      <Link
                        to={`/places/${place.id}`}
                        className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-full transition-colors flex items-center space-x-1.5"
                      >
                        <span>{t('places.explorePlace', 'Explore Place')}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Loading skeletons
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-slate-900 border border-slate-800 rounded-[24px] h-[400px] animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16">
            <div className="space-y-3">
              <span className="text-sky-400 text-xs font-bold uppercase tracking-widest">{t('hero.hotelsCategory', 'Where to stay')}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{t('hotels.title', 'Luxury & Budget Stays')}</h2>
            </div>
            <Link
              to="/hotels"
              className="mt-4 sm:mt-0 text-blue-400 hover:text-blue-300 flex items-center space-x-2 text-sm font-semibold group"
            >
              <span>{t('hero.viewAllHotels', 'View All Hotels')}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredHotels.length > 0 ? (
              featuredHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="group bg-slate-900 border border-slate-800/80 rounded-[24px] overflow-hidden shadow-xl hover:-translate-y-2 transition-all duration-300 hover:border-slate-700/60"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-950">
                    <img
                      src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}
                      alt={getLocalized(hotel, 'name')}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute top-4 left-4 bg-blue-600/90 border border-blue-500/30 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                      ${hotel.pricePerNight} <span className="font-light text-[10px]">/ {t('common.perNight')}</span>
                    </div>
                    <div className="absolute top-4 right-4 bg-slate-950/70 border border-slate-800 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 backdrop-blur-md">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{hotel.stars} {t('common.stars')}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4 text-left">
                    <div className="flex items-center text-xs text-slate-400 space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>{t(hotel.city)}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                      {getLocalized(hotel, 'name')}
                    </h3>
                    <p className="text-sm text-slate-400 font-light leading-relaxed line-clamp-2">
                      {getLocalized(hotel, 'description')}
                    </p>
                    <div className="pt-2">
                      <Link
                        to={`/hotels/${hotel.id}`}
                        className="w-full block text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 py-3 rounded-xl transition-colors cursor-pointer"
                      >
                        {t('common.bookTicket', 'Book Now')}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-slate-900 border border-slate-800 rounded-[24px] h-[400px] animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="py-24 bg-slate-950 border-t border-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16">
            <div className="space-y-3">
              <span className="text-sky-400 text-xs font-bold uppercase tracking-widest">{t('hero.restaurantsCategory')}</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{t('restaurants.title', 'Restaurants & Food')}</h2>
            </div>
            <Link
              to="/restaurants"
              className="mt-4 sm:mt-0 text-blue-400 hover:text-blue-300 flex items-center space-x-2 text-sm font-semibold group"
            >
              <span>{t('hero.viewAllRestaurants', 'View All Restaurants')}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRestaurants.length > 0 ? (
              featuredRestaurants.map((rest) => (
                <div
                  key={rest.id}
                  className="group bg-slate-900 border border-slate-800/80 rounded-[24px] overflow-hidden shadow-xl hover:-translate-y-2 transition-all duration-300 hover:border-slate-700/60"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-950">
                    <img
                      src={rest.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'}
                      alt={getLocalized(rest, 'name')}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute top-4 right-4 bg-slate-950/70 border border-slate-800 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 backdrop-blur-md">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{rest.ratingAverage.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4 text-left">
                    <div className="flex items-center text-xs text-slate-400 space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>{t(rest.city)}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                      {getLocalized(rest, 'name')}
                    </h3>
                    <p className="text-sm text-slate-400 font-light leading-relaxed line-clamp-2">
                      {getLocalized(rest, 'description')}
                    </p>
                    <div className="pt-2">
                      <Link
                        to={`/restaurants/${rest.id}`}
                        className="w-full block text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 py-3 rounded-xl transition-colors cursor-pointer"
                      >
                        {t('restaurants.reserveTable', 'Reserve Table')}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-slate-900 border border-slate-800 rounded-[24px] h-[400px] animate-pulse" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <span className="text-sky-400 text-xs font-bold uppercase tracking-widest">{t('hero.eventsTitle')}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{t('hero.eventsSubtitle')}</h2>
            <div className="h-1 w-12 bg-blue-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {events.map((evt, i) => (
              <div
                key={i}
                className="group flex flex-col sm:flex-row bg-slate-900 border border-slate-800/80 rounded-[24px] overflow-hidden shadow-xl"
              >
                <div className="relative w-full sm:w-2/5 h-48 sm:h-auto overflow-hidden bg-slate-950">
                  <img
                    src={evt.image}
                    alt={t(evt.titleKey)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="w-full sm:w-3/5 p-6 flex flex-col justify-between space-y-4 text-left">
                  <div className="space-y-2">
                    <span className="text-xs text-blue-400 font-semibold">{t(evt.dateKey)}</span>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{t(evt.titleKey)}</h3>
                    <p className="text-xs text-slate-400 font-light leading-relaxed">{t(evt.descriptionKey)}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center text-xs text-slate-500 space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-blue-500" />
                      <span>{t(evt.location)}</span>
                    </div>
                    <button
                      onClick={() => alert(t('events.registrationSoon', 'Registration will open soon!'))}
                      className="text-xs font-bold text-white bg-slate-800 hover:bg-blue-600 border border-slate-700 px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      {t('common.register', 'Register')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 bg-slate-950 border-t border-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <span className="text-sky-400 text-xs font-bold uppercase tracking-widest">{t('hero.mapTitle')}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{t('hero.mapSubtitle')}</h2>
            <div className="h-1 w-12 bg-blue-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between text-left">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{t('transports.routeMap')}</h3>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    {t('transports.routeMapConfigure', 'Select origin and destination city to compute route distance, duration, and view real-time paths.')}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">{t('transports.from', 'From')}</label>
                    <select
                      value={mapOrigin}
                      onChange={(e) => setMapOrigin(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Dushanbe">{t('Dushanbe')}</option>
                      <option value="Khujand">{t('Khujand')}</option>
                      <option value="Panjakent">{t('Panjakent')}</option>
                      <option value="Hisor">{t('Hisor')}</option>
                      <option value="Khorog">{t('Khorog')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">{t('transports.to', 'To')}</label>
                    <select
                      value={mapDest}
                      onChange={(e) => setMapDest(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Dushanbe">{t('Dushanbe')}</option>
                      <option value="Khujand">{t('Khujand')}</option>
                      <option value="Panjakent">{t('Panjakent')}</option>
                      <option value="Hisor">{t('Hisor')}</option>
                      <option value="Khorog">{t('Khorog')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/60 mt-6 lg:mt-0">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <Navigation className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>Powered by OpenStreetMap</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 h-[450px] bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative z-10">
              <TajikistanRouteMap origin={mapOrigin} destination={mapDest} t={t} />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-950 border-t border-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <span className="text-sky-400 text-xs font-bold uppercase tracking-widest">{t('common.reviews')}</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">{t('testimonials.title', 'What Travelers Say')}</h2>
            <div className="h-1 w-12 bg-blue-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800/80 p-8 rounded-3xl shadow-xl flex flex-col justify-between hover:border-slate-700/60 transition-colors duration-300 text-left"
              >
                <div className="space-y-4">
                  <div className="flex text-amber-400 space-x-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-350 font-light leading-relaxed italic">
                    "{t(test.commentKey)}"
                  </p>
                </div>
                <div className="mt-8 flex items-center space-x-4 border-t border-slate-800/60 pt-4">
                  <img
                    src={test.avatar}
                    alt={test.name}
                    className="h-12 w-12 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{test.name}</h4>
                    <span className="text-xs text-slate-500">{t(`testimonials.role.${test.name}`, test.role)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function App() {
  const theme = useAuthStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Providers>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased transition-colors duration-300">
          <Navbar />
          <main className="flex-grow flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Business modules catalogs and details */}
              <Route path="/places" element={<PlacesPage />} />
              <Route path="/places/:id" element={<PlaceDetailPage />} />
              
              <Route path="/hotels" element={<HotelsPage />} />
              <Route path="/hotels/:id" element={<HotelDetailPage />} />
              
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
              
              <Route path="/transports" element={<TransportsPage />} />
              
              <Route path="/guides" element={<GuidesPage />} />
              <Route path="/guides/:id" element={<GuideDetailPage />} />
              <Route path="/map" element={<NavigationPage />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* Owner Guarded Route */}
                <Route element={<RoleRoute allowedRoles={['HotelOwner', 'RestaurantOwner', 'TransportOwner', 'Admin', 'SuperAdmin']} />}>
                  <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
                  <Route path="/owner/services" element={<OwnerServicesPage />} />
                </Route>

                {/* Admin Guarded Route */}
                <Route element={<RoleRoute allowedRoles={['Admin', 'SuperAdmin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/users" element={<AdminUsersPage />} />
                  <Route path="/admin/places" element={<AdminPlacesPage />} />
                  <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
                </Route>
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </Providers>
  );
}

export default App;
