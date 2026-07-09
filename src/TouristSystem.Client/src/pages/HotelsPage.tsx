import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import type { IHotel } from '../types';
import { Search, MapPin, Eye, Filter, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const popularCities = ['Dushanbe', 'Khujand', 'Panjakent', 'Hisor', 'Kulob', 'Bokhtar', 'Khorog'];

const hotelsSuggestionsMap: Record<string, string[]> = {
  default: ['Serena Hotel', 'Hyatt Regency', 'Hilton Dushanbe', 'Atlas Hotel', 'Dushanbe Palace'],
  dushanbe: ['Serena Hotel', 'Hyatt Regency', 'Hilton Dushanbe', 'Atlas Hotel'],
  khujand: ['Parliament Hotel', 'Sugdiyon Hotel', 'Grand Hotel Khujand'],
  panjakent: ['Panjakent Plaza', 'Hotel Penyakent'],
  hisor: ['Hisor Resort', 'Fortress Hotel'],
  kulob: ['Kulob Hotel', 'Hamadoni Hotel'],
  bokhtar: ['Bokhtar Hotel', 'Vakhsh Hotel'],
  khorog: ['Pamir Hotel', 'Khorog Inn']
};

export default function HotelsPage() {
  const [hotels, setHotels] = useState<IHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [starsFilter, setStarsFilter] = useState<number | null>(null);
  const { t, getLocalized, formatCurrency } = useTranslation();

  useEffect(() => {
    fetchHotels();
  }, [searchTerm, cityFilter, starsFilter]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const params = {
        searchTerm: searchTerm || undefined,
        city: cityFilter || undefined,
        stars: starsFilter || undefined,
        pageNumber: 1,
        pageSize: 50,
      };
      const response = await api.get('/hotels', { params });
      setHotels(response.data.items || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const imagePlaceholder = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';

  const getSuggestions = () => {
    const key = cityFilter.toLowerCase();
    return hotelsSuggestionsMap[key] || hotelsSuggestionsMap.default;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex-grow py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center space-y-4 mb-16">
          <span className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-sky-400 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('hotels.staysCategory', 'Premium Stays')}</span>
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {t('hotels.title')}
          </h2>
          <p className="max-w-xl mx-auto text-sm text-slate-400 font-light">
            {t('hotels.subtitle')}
          </p>
        </div>

        {/* Filters Panel */}
        <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative text-left">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-3">{t('hotels.hotelSearch', 'Hotel Name')}</label>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder={t('hotels.hotelSearch')}
                />
              </div>
            </div>

            <div className="relative text-left">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-3">{t('hotels.city', 'City')}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                <select
                  value={cityFilter}
                  onChange={(e) => {
                    setCityFilter(e.target.value);
                    setSearchTerm('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="">{t('common.allCities')}</option>
                  {popularCities.map((c) => (
                    <option key={c} value={c}>{t(c)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative text-left">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-3">{t('hotels.starsFilter', 'Stars Rating')}</label>
              <div className="relative">
                <select
                  value={starsFilter || ''}
                  onChange={(e) => setStarsFilter(e.target.value ? Number(e.target.value) : null)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="">{t('hotels.starsFilter')}</option>
                  {[5, 4, 3, 2, 1].map((s) => (
                    <option key={s} value={s}>
                      {t(`star${s}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCityFilter('');
                  setStarsFilter(null);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-100 font-semibold py-3 rounded-2xl shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <Filter className="h-4 w-4 text-blue-500" />
                <span>{t('common.resetFilters')}</span>
              </button>
            </div>
          </div>

          {/* Suggestion tags */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-slate-800/40">
            <span className="text-slate-400 font-bold uppercase tracking-wider mr-2">{t('common.suggestions')}</span>
            {getSuggestions().map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchTerm(t(tag))}
                className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-blue-500/50 px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 cursor-pointer"
              >
                {t(tag)}
              </button>
            ))}
          </div>
        </div>

        {/* Results grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-slate-900 border border-slate-800 rounded-[24px] h-[420px] animate-pulse" />
              ))}
            </motion.div>
          ) : hotels.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 bg-slate-900/35 border border-dashed border-slate-800 rounded-3xl"
            >
              <p className="text-slate-400 font-light">{t('hotels.noHotels')}</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="group bg-slate-900 border border-slate-800/80 rounded-[24px] overflow-hidden shadow-lg hover:-translate-y-2 transition-all duration-300 hover:border-slate-700/60 flex flex-col justify-between"
                >
                  <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                    <img
                      src={hotel.imageUrl || imagePlaceholder}
                      alt={getLocalized(hotel, 'name')}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = imagePlaceholder;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute top-4 left-4 bg-blue-600 border border-blue-500/30 text-white px-3.5 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                      {hotel.stars} ★
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4 text-left">
                    <div>
                      <div className="flex items-center text-xs text-slate-400 space-x-1 mb-2">
                        <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span>{t(hotel.city)}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                        {getLocalized(hotel, 'name')}
                      </h3>
                      <p className="text-xs text-slate-500 font-light leading-relaxed line-clamp-1">
                        {hotel.address}
                      </p>
                      <p className="text-sm text-slate-400 font-light leading-relaxed line-clamp-3 mt-2">
                        {getLocalized(hotel, 'description')}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-extrabold text-blue-500 dark:text-sky-400">{formatCurrency(hotel.pricePerNight)}</span>
                        <span className="text-xs text-slate-500"> / {t('common.perNight')}</span>
                      </div>
                      <Link
                        to={`/hotels/${hotel.id}`}
                        className="flex items-center space-x-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        <span>{t('hotels.bookingForm', 'View Rooms')}</span>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
