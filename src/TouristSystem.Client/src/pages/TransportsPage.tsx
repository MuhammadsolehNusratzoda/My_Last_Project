import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { ITransport } from '../types';
import { useAuthStore } from '../app/store';
import { useTranslation } from '../hooks/useTranslation';
import { MapPin, Bus, ArrowRight, Loader2, CheckCircle, Navigation, Info, Phone, Sparkles } from 'lucide-react';
import TajikistanRouteMap from '../components/TajikistanRouteMap';
import { motion, AnimatePresence } from 'framer-motion';

const popularCities = ['Dushanbe', 'Khujand', 'Panjakent', 'Hisor', 'Kulob', 'Bokhtar', 'Khorog'];

export default function TransportsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t, formatDate, formatCurrency, formatNumber } = useTranslation();

  const [transports, setTransports] = useState<ITransport[]>([]);
  const [loading, setLoading] = useState(true);

  // Search parameters
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  // Booking states
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [seatsCount, setSeatsCount] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchTransports();
  }, [origin, destination]);

  const fetchTransports = async () => {
    setLoading(true);
    try {
      const params = {
        originCity: origin || undefined,
        destinationCity: destination || undefined,
        pageNumber: 1,
        pageSize: 50,
      };
      const response = await api.get('/transports', { params });
      setTransports(response.data.items || []);
    } catch (err) {
      console.error('Error loading transports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSeat = async (transport: ITransport) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBookingId(transport.id);
    setBookingLoading(true);
    setError(null);
    try {
      await api.post('/bookings', {
        userId: user.id,
        bookingType: 'Transport',
        referenceId: transport.id,
        startDate: transport.departureTime,
        endDate: transport.arrivalTime,
        guestsCount: seatsCount,
        quantity: seatsCount,
        notes: `Seats reservation for vehicle ${transport.vehicleNumber}`,
      });

      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || t('transports.bookingError', 'Booking failed'));
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex-grow py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center space-y-4 mb-16">
          <span className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-sky-400 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{t('transports.routesCategory', 'Transport & Intercity Routes')}</span>
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {t('transports.title')}
          </h2>
          <p className="max-w-xl mx-auto text-sm text-slate-400 font-light">
            {t('transports.subtitle')}
          </p>
        </div>

        {/* Filter Panel */}
        <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative text-left">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-3">{t('transports.origin', 'Origin')}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-green-550 shrink-0" />
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="">{t('transports.origin')}</option>
                  {popularCities.map((c) => (
                    <option key={c} value={c}>{t(c)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative text-left">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 ml-3">{t('transports.destination', 'Destination')}</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-red-500 shrink-0" />
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  <option value="">{t('transports.destination')}</option>
                  {popularCities.map((c) => (
                    <option key={c} value={c}>{t(c)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setOrigin('');
                  setDestination('');
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-100 font-semibold py-3.5 rounded-2xl shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-colors"
              >
                <span>{t('transports.resetCities', 'Reset')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Route Map */}
        <div className="bg-slate-900/40 border border-slate-900/60 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-4 mb-12">
          <div className="flex items-center gap-2">
            <Navigation className="h-4.5 w-4.5 text-blue-500" />
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider">
              {t('transports.routeMap', 'Interactive Route Map')}
            </h3>
            {origin && destination && (
              <span className="ml-auto text-xs bg-blue-500/10 border border-blue-500/30 text-sky-400 px-3.5 py-1 rounded-full font-semibold">
                {t(origin)} → {t(destination)}
              </span>
            )}
          </div>
          <div className="h-[400px] rounded-2xl overflow-hidden border border-slate-800 relative z-10">
            <TajikistanRouteMap origin={origin} destination={destination} t={t} />
          </div>
        </div>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold"
            >
              <CheckCircle className="h-5 w-5" />
              {t('transports.bookingConfirmed')}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-center text-sm font-semibold"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tickets Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {[1, 2].map((n) => (
                <div key={n} className="bg-slate-900 border border-slate-800 rounded-[24px] h-[320px] animate-pulse" />
              ))}
            </motion.div>
          ) : transports.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 bg-slate-900/35 border border-dashed border-slate-800 rounded-3xl"
            >
              <p className="text-slate-400 font-light">{t('transports.noTransports')}</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {transports.map((trans) => (
                <div
                  key={trans.id}
                  className="group bg-slate-900 border border-slate-800/80 rounded-[24px] p-6 shadow-lg hover:-translate-y-1.5 transition-all duration-300 hover:border-slate-700/60 flex flex-col justify-between space-y-6 text-left"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-sky-400 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Bus className="h-4 w-4 shrink-0" />
                        <span>{t(`transports.types.${trans.type}`, trans.type)}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('transports.vehicleNo')}: {trans.vehicleNumber}</span>
                    </div>

                    <h3 className="text-xl font-extrabold text-white flex items-center space-x-3">
                      <span>{t(trans.originCity) || trans.originCity}</span>
                      <ArrowRight className="h-5 w-5 text-blue-500 shrink-0" />
                      <span>{t(trans.destinationCity) || trans.destinationCity}</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 border border-slate-900/60 p-4 rounded-2xl">
                      <div className="space-y-1">
                        <span className="block font-bold text-slate-550 uppercase tracking-wider">{t('transports.departure')}</span>
                        <span className="font-semibold text-slate-200">
                          {formatDate(trans.departureTime, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="block font-bold text-slate-550 uppercase tracking-wider">{t('transports.arrival')}</span>
                        <span className="font-semibold text-slate-200">
                          {formatDate(trans.arrivalTime, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2 border-t border-slate-800/40 pt-4">
                      <span className="flex items-center">
                        <Info className="h-4 w-4 text-blue-500 mr-1.5 shrink-0" />
                        <span>{t('transports.availableSeats')}: <span className="font-bold text-white">{formatNumber(trans.availableSeats)}</span> / {formatNumber(trans.totalSeats)}</span>
                      </span>
                      <span className="flex items-center">
                        <Phone className="h-4 w-4 text-blue-500 mr-1.5 shrink-0" />
                        <span>{t('footer.contact')}: <span className="font-bold text-white">{trans.contactPhone}</span></span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-extrabold text-blue-500 dark:text-sky-400">{formatCurrency(trans.pricePerSeat)}</span>
                      <span className="text-xs text-slate-500"> / {t('transports.seat', 'seat')}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={1}
                        max={trans.availableSeats}
                        value={bookingId === trans.id ? seatsCount : 1}
                        onChange={(e) => {
                          setBookingId(trans.id);
                          setSeatsCount(Number(e.target.value));
                        }}
                        className="w-12 border border-slate-800 bg-slate-950 text-slate-100 rounded-xl py-2 text-center text-sm focus:outline-none"
                      />
                      {user ? (
                        <button
                          onClick={() => handleBookSeat(trans)}
                          disabled={bookingLoading && bookingId === trans.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                        >
                          {bookingLoading && bookingId === trans.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            t('transports.bookTicket')
                          )}
                        </button>
                      ) : (
                        <Link to="/login" className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-all">
                          {t('transports.signInToBook')}
                        </Link>
                      )}
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
