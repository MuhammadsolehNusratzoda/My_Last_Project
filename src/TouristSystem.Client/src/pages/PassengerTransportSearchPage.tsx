import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { IPassengerProviderSearchResult } from '../types';
import {
  Car, ShieldCheck, Star, MapPin, Phone, Check, Search, Filter, Fuel, Users,
  Sparkles, Award, CheckCircle2, Shield
} from 'lucide-react';

const TAJIK_CITIES = ['Dushanbe', 'Khujand', 'Panjakent', 'Hisor', 'Khorog', 'Kulob', 'Bokhtar'];
const SERVICE_OPTIONS = ['Taxi', 'Ride-Hailing', 'Intercity Passenger Transport', 'Airport Transfer', 'Hotel Transfer', 'Tourist Transportation', 'VIP Transportation'];
const LANGUAGE_OPTIONS = ['Tajik', 'Russian', 'English', 'Uzbek'];

export default function PassengerTransportSearchPage() {
  const [providers, setProviders] = useState<IPassengerProviderSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [currentCity, setCurrentCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [language, setLanguage] = useState('');
  const [hasAc, setHasAc] = useState(false);
  const [isAvailableNow, setIsAvailableNow] = useState(false);
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentCity) params.append('currentCity', currentCity);
      if (destinationCity) params.append('destinationCity', destinationCity);
      if (serviceType) params.append('serviceType', serviceType);
      if (language) params.append('language', language);
      if (hasAc) params.append('hasAirConditioning', 'true');
      if (isAvailableNow) params.append('isAvailableNow', 'true');
      if (isVerifiedOnly) params.append('isVerifiedOnly', 'true');

      const res = await api.get(`/transports/search-passenger-providers?${params.toString()}`);
      setProviders(res.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [currentCity, destinationCity, serviceType, language, hasAc, isAvailableNow, isVerifiedOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-slate-100 flex-grow w-full text-left">
      {/* Search Header Banner */}
      <div className="text-center space-y-3 mb-10">
        <span className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 text-sky-400 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">
          <Car className="h-3.5 w-3.5" />
          <span>Verified Passenger Transport</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Passenger Drivers & Rides in Tajikistan</h1>
        <p className="text-slate-400 text-sm font-light max-w-2xl mx-auto">
          Book verified taxi drivers, ride-hailing services, intercity transfers, and tourist transportation across Tajikistan.
        </p>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 mb-10 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current City</label>
            <select
              value={currentCity}
              onChange={e => setCurrentCity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">All Cities</option>
              {TAJIK_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Destination City</label>
            <select
              value={destinationCity}
              onChange={e => setDestinationCity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">Any Destination</option>
              {TAJIK_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Service Type</label>
            <select
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">All Service Types</option>
              {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Language Spoken</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">All Languages</option>
              {LANGUAGE_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Checkbox Toggles */}
        <div className="flex gap-4 flex-wrap pt-2 border-t border-slate-800/60">
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAc}
              onChange={e => setHasAc(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
            <span>Air Conditioned Only</span>
          </label>

          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isAvailableNow}
              onChange={e => setIsAvailableNow(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
            <span>Available Now</span>
          </label>

          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isVerifiedOnly}
              onChange={e => setIsVerifiedOnly(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
            <span className="text-sky-400 font-semibold flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Verified Providers Only</span>
          </label>
        </div>
      </div>

      {/* Provider Results Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Searching passenger transportation providers...</div>
      ) : providers.length === 0 ? (
        <div className="py-20 text-center text-slate-500 text-sm">No passenger transport providers found matching your search filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map(p => (
            <div key={p.id} className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 rounded-3xl p-6 backdrop-blur-xl shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                {/* Driver & Company Header */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 shrink-0">
                    {p.profilePhotoUrl ? (
                      <img src={`http://localhost:5010${p.profilePhotoUrl}`} alt={p.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500"><Car className="h-6 w-6" /></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
                      <span>{p.fullName}</span>
                      {p.isFullyVerified && <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0" title="Verified Provider" />}
                    </h3>
                    <div className="text-xs text-slate-400 font-medium">{p.companyName} • {p.currentCity}</div>
                    <div className="flex items-center space-x-1 mt-1 text-xs">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-white">{p.ratingAverage.toFixed(1)}</span>
                      <span className="text-slate-500">({p.completedTripsCount} trips)</span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Box */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{p.vehicleBrand} {p.vehicleModel} ({p.vehicleYear})</span>
                    <span className="font-mono text-[10px] text-sky-400 bg-sky-950/50 border border-sky-800/40 px-2 py-0.5 rounded-md">{p.vehicleRegNumber}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-slate-500" /> {p.passengerSeats} Seats</span>
                    {p.hasAirConditioning && <span className="bg-blue-500/10 text-blue-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">A/C</span>}
                  </div>
                </div>

                {/* Service Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.serviceTypes.slice(0, 3).map(st => (
                    <span key={st} className="bg-slate-800/80 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-full">{st}</span>
                  ))}
                </div>
              </div>

              {/* Contact / Book Button */}
              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <a
                  href={`tel:${p.phone}`}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center space-x-2"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call {p.phone}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
