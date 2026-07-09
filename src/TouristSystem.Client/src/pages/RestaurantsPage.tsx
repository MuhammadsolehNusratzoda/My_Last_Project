import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import type { IRestaurant } from '../types';
import { Search, MapPin, Star, Eye, Utensils, DollarSign, Filter, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const popularCities = ['Dushanbe', 'Khujand', 'Panjakent', 'Hisor', 'Kulob', 'Bokhtar', 'Khorog'];

const restaurantsSuggestionsMap: Record<string, string[]> = {
  default: ['Toqi Restaurant', 'Rokhat Chaikhona', 'Yakub-Bek', 'Khorog Kitchen', 'Hisor Chaikhona'],
  dushanbe: ['Toqi Restaurant', 'Rokhat Chaikhona', 'Yakub-Bek'],
  khujand: ['Zaytun Restaurant', 'Bahor Restaurant', 'Khujand Star'],
  panjakent: ['Panjakent National', 'Oasis Café'],
  hisor: ['Hisor Chaikhona', 'Fortress View Cafe'],
  kulob: ['Kulob Grill', 'Hamadoni Dining'],
  bokhtar: ['Vakhsh Restaurant', 'Bokhtar Cafe'],
  khorog: ['Pamir Lodge Cafe', 'Khorog Kitchen']
};

const foodSuggestionsMap: Record<string, string[]> = {
  default: ['Qurutob', 'Osh Palov', 'Sambusa', 'Shashlik', 'Shurbo', 'Mantu'],
  dushanbe: ['Qurutob', 'Shurbo', 'Mantu', 'Sambusa'],
  khujand: ['Khujandi Osh', 'Sambusa', 'Shashlik'],
  panjakent: ['Panjakenti Osh', 'Shashlik', 'Sambusa'],
  hisor: ['Hisori Kabab', 'Sambusa', 'Osh Palov'],
  kulob: ['Kulob Osh', 'Qurutob', 'Sambusa'],
  bokhtar: ['Bokhtar Plov', 'Shashlik', 'Mantu'],
  khorog: ['Pamiri Bread', 'Osh-i-Burida', 'Shurbo']
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');
  const { t, getLocalized } = useTranslation();

  useEffect(() => {
    fetchRestaurants();
  }, [searchTerm, cityFilter, cuisineFilter]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const params = {
        searchTerm: searchTerm || undefined,
        city: cityFilter || undefined,
        cuisine: cuisineFilter || undefined,
        pageNumber: 1,
        pageSize: 50,
      };
      const response = await api.get('/restaurants', { params });
      setRestaurants(response.data.items || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const imagePlaceholder = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80';

  const getSuggestions = () => {
    const key = cityFilter.toLowerCase();
    return restaurantsSuggestionsMap[key] || restaurantsSuggestionsMap.default;
  };

  const getFoodSuggestions = () => {
    const key = cityFilter.toLowerCase();
    return foodSuggestionsMap[key] || foodSuggestionsMap.default;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex-grow py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center space-y-4 mb-16">
          <span className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-sky-400 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('restaurants.gastronomyTitle', 'Tajik Cuisine')}</span>
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {t('restaurants.title')}
          </h2>
          <p className="max-w-xl mx-auto text-sm text-slate-400 font-light">
            {t('restaurants.subtitle')}
          </p>
        </div>

        {/* Filters Panel */}
        <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative text-left">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-3">{t('restaurants.restaurantSearch', 'Restaurant Name')}</label>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder={t('restaurants.restaurantSearch')}
                />
              </div>
            </div>

            <div className="relative text-left">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-3">{t('restaurants.city', 'City')}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                <select
                  value={cityFilter}
                  onChange={(e) => {
                    setCityFilter(e.target.value);
                    setSearchTerm('');
                    setCuisineFilter('');
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
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-3">{t('restaurants.cuisine', 'Cuisine')}</label>
              <div className="relative">
                <Utensils className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={cuisineFilter}
                  onChange={(e) => setCuisineFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder={t('restaurants.cuisinePlaceholder', 'e.g. Osh, Qurutob')}
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCityFilter('');
                  setCuisineFilter('');
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-100 font-semibold py-3 rounded-2xl shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <Filter className="h-4 w-4 text-blue-500" />
                <span>{t('common.resetFilters')}</span>
              </button>
            </div>
          </div>

          {/* Suggestion tags */}
          <div className="space-y-3 pt-2 border-t border-slate-800/40 text-left">
            {/* Restaurant Suggestions */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
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

            {/* National Food Suggestions */}
            <div className="flex flex-wrap items-center gap-2 text-xs pt-2 border-t border-dashed border-slate-800/30">
              <span className="text-slate-400 font-bold uppercase tracking-wider mr-2">{t('restaurants.localSpecialties', 'Local Specialties')}</span>
              {getFoodSuggestions().map((food) => (
                <button
                  key={food}
                  onClick={() => setCuisineFilter(t(food))}
                  className="bg-slate-900 border border-slate-800 text-slate-350 hover:text-white hover:border-blue-500/50 px-3.5 py-1.5 rounded-full font-medium transition-all duration-200 cursor-pointer"
                >
                  {t(food)}
                </button>
              ))}
            </div>
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
                <div key={n} className="bg-slate-900 border border-slate-800 rounded-[24px] h-[400px] animate-pulse" />
              ))}
            </motion.div>
          ) : restaurants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 bg-slate-900/35 border border-dashed border-slate-800 rounded-3xl"
            >
              <p className="text-slate-400 font-light">{t('restaurants.noRestaurants')}</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {restaurants.map((rest) => (
                <div
                  key={rest.id}
                  className="group bg-slate-900 border border-slate-800/80 rounded-[24px] overflow-hidden shadow-lg hover:-translate-y-2 transition-all duration-300 hover:border-slate-700/60 flex flex-col justify-between"
                >
                  <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                    <img
                      src={rest.imageUrl || imagePlaceholder}
                      alt={getLocalized(rest, 'name')}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = imagePlaceholder;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute top-4 right-4 bg-slate-950/70 border border-slate-800 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 backdrop-blur-md">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span>{rest.ratingAverage.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4 text-left">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="flex items-center text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-blue-500 mr-1 shrink-0" />
                          <span>{t(rest.city)}</span>
                        </span>
                        <span className="bg-blue-500/10 border border-blue-500/30 text-sky-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {rest.cuisineType}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                        {getLocalized(rest, 'name')}
                      </h3>
                      <p className="text-xs text-slate-500 font-light leading-relaxed line-clamp-1">
                        {rest.address}
                      </p>
                      <p className="text-sm text-slate-400 font-light leading-relaxed line-clamp-3 mt-2">
                        {getLocalized(rest, 'description')}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center font-medium">
                        <DollarSign className="h-4 w-4 text-green-500 mr-0.5 shrink-0" />
                        <span>{t('restaurants.priceRange', 'Price')}: {rest.priceRange}</span>
                      </span>
                      <Link
                        to={`/restaurants/${rest.id}`}
                        className="flex items-center space-x-1 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        <span>{t('common.viewDetails')}</span>
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
