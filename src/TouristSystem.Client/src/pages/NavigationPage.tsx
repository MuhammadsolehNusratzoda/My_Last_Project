import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import {
  MapPin, Navigation, Car, Footprints, Bike, Search, ExternalLink,
  Copy, Share2, Loader2, ChevronDown, Route, Clock, Ruler, X, CheckCircle
} from 'lucide-react';

// ─── Fix Leaflet default icons broken by Vite bundler ────────────────────────
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface Destination {
  id: string;
  name: string;
  category: 'place' | 'hotel' | 'restaurant';
  city: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  description?: string;
}

type TravelMode = 'driving' | 'cycling' | 'foot';

interface RouteResult {
  distanceM: number;
  durationSec: number;
  coords: [number, number][];
}

// ─── OSRM Routing endpoints ───────────────────────────────────────────────────
const MODE_CFG: Record<TravelMode, { baseUrl: string; profile: string; color: string }> = {
  driving: {
    baseUrl: 'https://router.project-osrm.org/route/v1',
    profile: 'driving',
    color:   '#3b82f6',
  },
  cycling: {
    baseUrl: 'https://routing.openstreetmap.de/routed-bike/route/v1',
    profile: 'bike',
    color:   '#10b981',
  },
  foot: {
    baseUrl: 'https://routing.openstreetmap.de/routed-foot/route/v1',
    profile: 'foot',
    color:   '#f59e0b',
  },
};

async function fetchOsrmRoute(
  from: [number, number],
  to: [number, number],
  mode: TravelMode
): Promise<RouteResult | null> {
  const { baseUrl, profile } = MODE_CFG[mode];
  const url = `${baseUrl}/${profile}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
  try {
    const res  = await fetch(url, { signal: AbortSignal.timeout(12000) });
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]) return null;
    const route  = data.routes[0];
    const coords: [number, number][] = route.geometry.coordinates.map(
      ([lon, lat]: [number, number]) => [lat, lon]
    );
    return { distanceM: route.distance, durationSec: route.duration, coords };
  } catch {
    return null;
  }
}

function fmtDist(m: number, t: (k: string) => string): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} ${t('map.km')}`;
  return `${Math.round(m)} ${t('map.m')}`;
}

function fmtDur(sec: number, t: (k: string) => string): string {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h === 0) return `${m} ${t('map.min')}`;
  if (m === 0) return `${h} ${t('map.h')}`;
  return `${h}${t('map.h')} ${m}${t('map.min')}`;
}

function fmtArrival(sec: number): string {
  const now    = new Date();
  const arrive = new Date(now.getTime() + sec * 1000);
  return arrive.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function categoryIcon(cat: string): string {
  switch (cat) {
    case 'hotel':      return '🏨';
    case 'restaurant': return '🍽️';
    default:           return '🏛️';
  }
}

function categoryColor(cat: string): string {
  switch (cat) {
    case 'hotel':      return '#a855f7';
    case 'restaurant': return '#f97316';
    default:           return '#22c55e';
  }
}

// ─── Main NavigationPage ──────────────────────────────────────────────────────
export default function NavigationPage() {
  const { t } = useTranslation();

  // Map refs
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<L.Map | null>(null);
  const layersRef     = useRef<L.Layer[]>([]);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  // State
  const [destinations,   setDestinations]   = useState<Destination[]>([]);
  const [filtered,       setFiltered]       = useState<Destination[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [userPos,        setUserPos]        = useState<[number, number] | null>(null);
  const [detecting,      setDetecting]      = useState(false);
  const [locationError,  setLocationError]  = useState('');
  const [selected,       setSelected]       = useState<Destination | null>(null);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [catFilter,      setCatFilter]      = useState<'all' | 'place' | 'hotel' | 'restaurant'>('all');
  const [mode,           setMode]           = useState<TravelMode>('driving');
  const [route,          setRoute]          = useState<RouteResult | null>(null);
  const [calculating,    setCalculating]    = useState(false);
  const [routeError,     setRouteError]     = useState('');
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [toast,          setToast]          = useState('');

  // ── Load destinations from backend ──────────────────────────────────────────
  useEffect(() => {
    api.get<Destination[]>('/map/destinations')
      .then(res => {
        setDestinations(res.data);
        setFiltered(res.data);
      })
      .catch(() => setDestinations([]))
      .finally(() => setLoading(false));
  }, []);

  // ── Filter destinations ──────────────────────────────────────────────────────
  useEffect(() => {
    let result = destinations;
    if (catFilter !== 'all') result = result.filter(d => d.category === catFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [destinations, catFilter, searchQuery]);

  // ── Init Leaflet map ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [38.86, 71.0],
      zoom:   6,
      zoomControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Place destination markers on map when destinations load ─────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || destinations.length === 0) return;
    // Remove old destination markers
    layersRef.current.forEach(l => map.removeLayer(l));
    layersRef.current = [];

    destinations.forEach(dest => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;border-radius:50%;background:${categoryColor(dest.category)};
          display:flex;align-items:center;justify-content:center;font-size:14px;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);border:2px solid white;
          cursor:pointer;transition:transform 0.15s;"
          title="${dest.name}">
          ${categoryIcon(dest.category)}
        </div>`,
        iconSize:   [28, 28],
        iconAnchor: [14, 14],
      });
      const marker = L.marker([dest.latitude, dest.longitude], { icon })
        .bindPopup(`
          <div style="min-width:160px;font-family:Inter,sans-serif;">
            <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${dest.name}</div>
            <div style="font-size:11px;color:#64748b;">${categoryIcon(dest.category)} ${dest.category} · ${dest.city}</div>
            ${dest.description ? `<div style="font-size:11px;margin-top:6px;color:#374151;">${dest.description.slice(0, 80)}…</div>` : ''}
          </div>
        `, { maxWidth: 220 })
        .addTo(map);
      layersRef.current.push(marker);
    });
  }, [destinations]);

  // ── GPS detect user location ────────────────────────────────────────────────
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError(t('map.locationError'));
      return;
    }
    setDetecting(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserPos([lat, lng]);
        setDetecting(false);
        const map = mapRef.current;
        if (!map) return;
        // Remove old user marker
        if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
        // Pulsing blue GPS dot
        const userIcon = L.divIcon({
          className: '',
          html: `<div style="position:relative;width:20px;height:20px;">
            <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);
              animation:gpsPulse 1.6s ease-out infinite;"></div>
            <div style="position:absolute;inset:4px;border-radius:50%;background:#3b82f6;
              border:2px solid white;box-shadow:0 2px 6px rgba(59,130,246,0.6);"></div>
          </div>
          <style>@keyframes gpsPulse{0%{transform:scale(1);opacity:0.7}100%{transform:scale(2.8);opacity:0}}</style>`,
          iconSize:   [20, 20],
          iconAnchor: [10, 10],
        });
        userMarkerRef.current = L.circleMarker([lat, lng], { radius: 0, opacity: 0 })
          .addTo(map) as any;
        const m = L.marker([lat, lng], { icon: userIcon })
          .bindPopup(`<b>${t('map.currentLocation')}</b>`)
          .addTo(map);
        layersRef.current.push(m);
        map.setView([lat, lng], 13, { animate: true });
      },
      err => {
        setDetecting(false);
        if (err.code === 1) setLocationError(t('map.locationDenied'));
        else                 setLocationError(t('map.locationError'));
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, [t]);

  // ── Calculate route ─────────────────────────────────────────────────────────
  const calcRoute = useCallback(async () => {
    if (!userPos || !selected) return;
    setCalculating(true);
    setRouteError('');
    setRoute(null);

    // Clear previous route lines (keep markers)
    const map = mapRef.current;

    const result = await fetchOsrmRoute(userPos, [selected.latitude, selected.longitude], mode);
    setCalculating(false);

    if (!result) {
      setRouteError(t('map.routeError'));
      return;
    }
    setRoute(result);

    if (!map) return;

    // Remove old polylines by tag
    (map as any)._routeLines?.forEach((l: L.Layer) => map.removeLayer(l));
    (map as any)._routeLines = [];

    // Draw animated polyline
    const cfg  = MODE_CFG[mode];
    const line = L.polyline(result.coords, {
      color:  cfg.color,
      weight: 6,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);
    (map as any)._routeLines = [line];
    map.fitBounds(line.getBounds(), { padding: [60, 60], animate: true });
  }, [userPos, selected, mode, t]);

  // ── Auto-recalc when mode changes if route exists ──────────────────────────
  useEffect(() => {
    if (route && userPos && selected) calcRoute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ── Copy coordinates ─────────────────────────────────────────────────────────
  const copyCoords = useCallback(() => {
    if (!selected) return;
    const text = `${selected.latitude}, ${selected.longitude}`;
    navigator.clipboard.writeText(text).then(() => {
      setToast(t('map.coordsCopied'));
      setTimeout(() => setToast(''), 2500);
    });
  }, [selected, t]);

  // ── Open external maps ───────────────────────────────────────────────────────
  const openGoogleMaps = () => {
    if (!selected) return;
    const url = `https://www.google.com/maps/dir/?api=1${userPos ? `&origin=${userPos[0]},${userPos[1]}` : ''}&destination=${selected.latitude},${selected.longitude}&travelmode=${mode === 'foot' ? 'walking' : mode}`;
    window.open(url, '_blank');
  };

  const openWaze = () => {
    if (!selected) return;
    window.open(`https://waze.com/ul?ll=${selected.latitude},${selected.longitude}&navigate=yes`, '_blank');
  };

  const shareLocation = () => {
    if (!selected) return;
    const text = `${selected.name} — ${selected.latitude}, ${selected.longitude}`;
    if (navigator.share) {
      navigator.share({ title: selected.name, text, url: `https://www.google.com/maps?q=${selected.latitude},${selected.longitude}` });
    } else {
      copyCoords();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden pb-16 md:pb-0">

      {/* ── Left Panel ─────────────────────────────────────────────────────── */}
      <aside className="order-2 md:order-1 w-full md:w-96 h-1/2 md:h-full flex flex-col bg-slate-900/95 backdrop-blur border-t md:border-t-0 md:border-r border-slate-800 overflow-y-auto z-10 shrink-0">


        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-blue-600/10 to-sky-500/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">{t('map.title')}</h1>
              <p className="text-xs text-slate-400">{t('map.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-4 flex-1">

          {/* ── 1. Detect Location ── */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
              {t('map.currentLocation')}
            </label>
            <button
              onClick={detectLocation}
              disabled={detecting}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                ${userPos
                  ? 'bg-green-500/15 border border-green-500/40 text-green-400 hover:bg-green-500/25'
                  : 'bg-blue-500/15 border border-blue-500/40 text-blue-300 hover:bg-blue-500/25'
                }
                ${detecting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {detecting
                ? <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                : userPos
                ? <CheckCircle className="w-4 h-4 shrink-0 text-green-400" />
                : <MapPin className="w-4 h-4 shrink-0" />
              }
              {detecting
                ? t('map.detecting')
                : userPos
                ? `${userPos[0].toFixed(4)}, ${userPos[1].toFixed(4)}`
                : t('map.detectLocation')
              }
            </button>
            {locationError && (
              <p className="text-xs text-red-400 mt-1.5 flex items-start gap-1">
                <X className="w-3 h-3 shrink-0 mt-0.5" />{locationError}
              </p>
            )}
          </div>

          {/* ── 2. Destination Search ── */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
              {t('map.destination')}
            </label>

            {/* Category filter pills */}
            <div className="flex gap-1.5 mb-2 flex-wrap">
              {(['all', 'place', 'hotel', 'restaurant'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all
                    ${catFilter === cat
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                >
                  {cat === 'all' ? t('map.allCategories') :
                   cat === 'place' ? t('map.places') :
                   cat === 'hotel' ? t('map.hotels') : t('map.restaurants')}
                </button>
              ))}
            </div>

            {/* Search input + dropdown */}
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
                placeholder={loading ? t('map.loadingDestinations') : t('map.destinationPlaceholder')}
                disabled={loading}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
              {selected && (
                <button
                  onClick={() => { setSelected(null); setSearchQuery(''); setRoute(null); }}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {!selected && (
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              )}

              {/* Dropdown */}
              {dropdownOpen && !selected && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto">
                  {filtered.slice(0, 30).map(dest => (
                    <button
                      key={dest.id}
                      onClick={() => {
                        setSelected(dest);
                        setSearchQuery(dest.name);
                        setDropdownOpen(false);
                        setRoute(null);
                        setRouteError('');
                        // Fly to destination
                        mapRef.current?.flyTo([dest.latitude, dest.longitude], 14, { animate: true, duration: 1.2 });
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-700 transition-colors text-left"
                    >
                      <span className="text-lg leading-none shrink-0">{categoryIcon(dest.category)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-white truncate">{dest.name}</div>
                        <div className="text-xs text-slate-400 truncate">{dest.city}</div>
                      </div>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: `${categoryColor(dest.category)}22`, color: categoryColor(dest.category) }}
                      >
                        {dest.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {dropdownOpen && !selected && filtered.length === 0 && !loading && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 px-4 py-3 text-sm text-slate-400">
                  {t('map.noDestinations')}
                </div>
              )}
            </div>

            {/* Selected destination card */}
            {selected && (
              <div
                className="mt-2 p-3 rounded-xl border flex items-start gap-3"
                style={{ background: `${categoryColor(selected.category)}0f`, borderColor: `${categoryColor(selected.category)}30` }}
              >
                <span className="text-xl shrink-0">{categoryIcon(selected.category)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">{selected.name}</div>
                  <div className="text-xs text-slate-400">{selected.city}</div>
                </div>
              </div>
            )}
          </div>

          {/* ── 3. Travel Mode ── */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
              {t('map.travelMode')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: 'driving' as TravelMode, icon: Car,       label: t('map.driving'), color: '#3b82f6' },
                { key: 'foot'    as TravelMode, icon: Footprints, label: t('map.walking'),  color: '#f59e0b' },
                { key: 'cycling' as TravelMode, icon: Bike,      label: t('map.cycling'), color: '#10b981' },
              ] as const).map(({ key, icon: Icon, label, color }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold transition-all duration-200
                    ${mode === key
                      ? 'text-white shadow-lg scale-[1.03]'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                    }`}
                  style={mode === key ? {
                    background: `${color}22`,
                    borderColor: `${color}55`,
                    color,
                  } : undefined}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── 4. Find Route Button ── */}
          <button
            onClick={calcRoute}
            disabled={!userPos || !selected || calculating}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200
              ${(!userPos || !selected)
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : calculating
                ? 'bg-blue-600/70 text-blue-100 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98]'
              }`}
          >
            {calculating
              ? <><Loader2 className="w-4 h-4 animate-spin" />{t('map.calculating')}</>
              : <><Route className="w-4 h-4" />{t('map.findRoute')}</>
            }
          </button>

          {routeError && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <X className="w-3 h-3" />{routeError}
            </p>
          )}

          {/* ── 5. Route Stats ── */}
          {route && selected && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                {/* Distance */}
                <div className="bg-slate-800 rounded-xl p-3 flex flex-col items-center gap-1 border border-slate-700">
                  <Ruler className="w-4 h-4 text-blue-400" />
                  <div className="text-base font-bold text-white">{fmtDist(route.distanceM, t)}</div>
                  <div className="text-xs text-slate-400">{t('map.distance')}</div>
                </div>
                {/* Duration */}
                <div className="bg-slate-800 rounded-xl p-3 flex flex-col items-center gap-1 border border-slate-700">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <div className="text-base font-bold text-white">{fmtDur(route.durationSec, t)}</div>
                  <div className="text-xs text-slate-400">{t('map.duration')}</div>
                </div>
                {/* Arrival */}
                <div className="bg-slate-800 rounded-xl p-3 flex flex-col items-center gap-1 border border-slate-700">
                  <Navigation className="w-4 h-4 text-indigo-400" />
                  <div className="text-base font-bold text-white">{fmtArrival(route.durationSec)}</div>
                  <div className="text-xs text-slate-400">{t('map.arrival')}</div>
                </div>
              </div>

              {/* External links */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={openGoogleMaps}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  {t('map.openGoogleMaps')}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={openWaze}
                    className="flex items-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    {t('map.openWaze')}
                  </button>
                  <button
                    onClick={copyCoords}
                    className="flex items-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    {t('map.copyCoords')}
                  </button>
                </div>
                <button
                  onClick={shareLocation}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  {t('map.shareLocation')}
                </button>
              </div>
            </div>
          )}

          {!userPos && !selected && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center">
                <Navigation className="w-7 h-7 text-slate-500" />
              </div>
              <p className="text-sm text-slate-500 max-w-[200px]">{t('map.selectDestination')}</p>
            </div>
          )}
        </div>
      </aside>

      {/* ── Right: Map ─────────────────────────────────────────────────────── */}
      <div className="order-1 md:order-2 flex-grow h-1/2 md:h-full relative min-h-[300px] md:min-h-0">
        <div ref={containerRef} className="absolute inset-0" />


        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-slate-950/80">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-sm text-slate-400">{t('map.loadingDestinations')}</p>
            </div>
          </div>
        )}

        {/* Tap-outside handler for dropdown */}
        {dropdownOpen && (
          <div
            className="absolute inset-0 z-[999]"
            onClick={() => setDropdownOpen(false)}
          />
        )}
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-slate-800 border border-slate-700 text-white text-sm px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce-once">
          <CheckCircle className="w-4 h-4 text-green-400" />
          {toast}
        </div>
      )}
    </div>
  );
}
