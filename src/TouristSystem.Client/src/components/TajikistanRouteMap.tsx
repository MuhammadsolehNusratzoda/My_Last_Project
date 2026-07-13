import { useEffect, useRef, useState } from 'react';
import { Car, Bike, Footprints, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons broken by bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// City coordinates [lat, lon]
export const cityCoords: Record<string, [number, number]> = {
  Dushanbe:  [38.5598, 68.7870],
  Khujand:   [40.2792, 69.6237],
  Panjakent: [39.4950, 67.6083],
  Hisor:     [38.5263, 68.5525],
  Kulob:     [37.9109, 69.7817],
  Bokhtar:   [37.8368, 68.7790],
  Khorog:    [37.4897, 71.5498],
};

// Each mode uses its own dedicated OSRM backend
const MODE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  driving: Car,
  cycling: Bike,
  foot: Footprints,
};

const MODE_ENDPOINTS: Record<string, { baseUrl: string; profile: string; color: string; weight: number; labelKey: string }> = {
  driving: {
    baseUrl:  'https://router.project-osrm.org/route/v1',
    profile:  'driving',
    color:    '#3b82f6',
    weight:   5,
    labelKey: 'modeCar',
  },
  cycling: {
    baseUrl:  'https://routing.openstreetmap.de/routed-bike/route/v1',
    profile:  'bike',
    color:    '#10b981',
    weight:   4,
    labelKey: 'modeBike',
  },
  foot: {
    baseUrl:  'https://routing.openstreetmap.de/routed-foot/route/v1',
    profile:  'foot',
    color:    '#f59e0b',
    weight:   4,
    labelKey: 'modeWalk',
  },
};

type TravelMode = keyof typeof MODE_ENDPOINTS;

interface RouteResult {
  durationSec: number;
  distanceM:   number;
  coords:      [number, number][];
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

async function fetchRoute(
  from: [number, number],
  to:   [number, number],
  mode: TravelMode
): Promise<RouteResult | null> {
  const { baseUrl, profile } = MODE_ENDPOINTS[mode];
  // OSRM expects lon,lat
  const url = `${baseUrl}/${profile}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
  try {
    const res  = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]) return null;
    const route  = data.routes[0];
    const coords: [number, number][] = route.geometry.coordinates.map(
      ([lon, lat]: [number, number]) => [lat, lon]
    );
    return { durationSec: route.duration, distanceM: route.distance, coords };
  } catch {
    return null;
  }
}

interface Props {
  origin:      string;
  destination: string;
  t:           (key: string) => string;
}

export default function TajikistanRouteMap({ origin, destination, t }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const layersRef    = useRef<L.Layer[]>([]);

  const [activeMode, setActiveMode] = useState<TravelMode>('driving');
  const [routes,     setRoutes]     = useState<Partial<Record<TravelMode, RouteResult>>>({});
  const [fetching,   setFetching]   = useState(false);

  // ── Init map once ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = L.map(containerRef.current, { center: [38.86, 71.0], zoom: 6 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current);
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  const clearLayers = () => {
    layersRef.current.forEach((l) => mapRef.current?.removeLayer(l));
    layersRef.current = [];
  };

  // ── Fetch routes when cities change ────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    clearLayers();
    setRoutes({});

    const oCoords = cityCoords[origin];
    const dCoords = cityCoords[destination];

    if (!oCoords || !dCoords) {
      map.setView([38.86, 71.0], 6);
      Object.entries(cityCoords).forEach(([city, coords]) => {
        const dot = L.circleMarker(coords, {
          radius: 7, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8, weight: 2,
        }).bindTooltip(t(city), { direction: 'top', offset: [0, -6] }).addTo(map);
        layersRef.current.push(dot);
      });
      return;
    }

    setFetching(true);
    (async () => {
      const results: Partial<Record<TravelMode, RouteResult>> = {};
      // Fetch all 3 modes in parallel — each hits its own routing server
      await Promise.all(
        (Object.keys(MODE_ENDPOINTS) as TravelMode[]).map(async (mode) => {
          const r = await fetchRoute(oCoords, dCoords, mode);
          if (r) results[mode] = r;
        })
      );
      setRoutes(results);
      setFetching(false);
    })();
  }, [origin, destination]);

  // ── Draw active route ───────────────────────────────────────────────────────
  useEffect(() => {
    const map    = mapRef.current;
    const oCoords = cityCoords[origin];
    const dCoords = cityCoords[destination];
    if (!map || !oCoords || !dCoords) return;

    clearLayers();

    const result = routes[activeMode];
    const cfg    = MODE_ENDPOINTS[activeMode];

    if (result) {
      const line = L.polyline(result.coords, {
        color: cfg.color, weight: cfg.weight, opacity: 0.9,
        lineCap: 'round', lineJoin: 'round',
      }).addTo(map);
      layersRef.current.push(line);
      map.fitBounds(line.getBounds(), { padding: [55, 55] });
    }

    // City label markers
    const makeIcon = (label: string, bg: string) =>
      L.divIcon({
        className: '',
        html: `<div style="background:${bg};color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.35)">${label}</div>`,
        iconAnchor: [0, 0],
      });

    const om = L.marker(oCoords, { icon: makeIcon(t(origin),      '#22c55e') }).addTo(map);
    const dm = L.marker(dCoords, { icon: makeIcon(t(destination), '#ef4444') }).addTo(map);
    layersRef.current.push(om, dm);
  }, [activeMode, routes, origin, destination]);

  const hasRoute = !!cityCoords[origin] && !!cityCoords[destination];

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md">
      {/* Travel mode tabs */}
      {hasRoute && (
        <div className="flex items-stretch border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          {(Object.keys(MODE_ENDPOINTS) as TravelMode[]).map((mode) => {
            const cfg    = MODE_ENDPOINTS[mode];
            const result = routes[mode];
            const active = mode === activeMode;
            return (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className={`flex-1 flex flex-col items-center py-3 px-2 transition-all border-b-2 ${
                  active
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                    : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span className="mb-0.5 flex justify-center">{(() => { const Icon = MODE_ICONS[mode]; return Icon ? <Icon className="h-6 w-6" /> : null; })()}</span>
                <span className={`text-xs font-bold ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                  {t(cfg.labelKey)}
                </span>
                {fetching && !result ? (
                  <span className="text-xs text-gray-400 mt-0.5 animate-pulse">…</span>
                ) : result ? (
                  <>
                    <span className="text-xs font-extrabold mt-0.5" style={{ color: cfg.color }}>
                      {formatDuration(result.durationSec)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {(result.distanceM / 1000).toFixed(0)} km
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-gray-300 mt-0.5">—</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Map */}
      <div style={{ height: 420, position: 'relative' }}>
        {fetching && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/75 dark:bg-gray-900/75 pointer-events-none">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" />
              {t('searchingRoutes')}
            </span>
          </div>
        )}
        <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}
