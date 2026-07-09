import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import type { IPlace } from '../types';
import { Check, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminPlacesPage() {
  const { pathname } = useLocation();
  const [places, setPlaces] = useState<IPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t, getLocalized } = useTranslation();

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/places', { params: { pageSize: 100 } });
      setPlaces(res.data.items || []);
    } catch (err) {
      console.error('Error loading admin places:', err);
      setError(t('errors.fetchFailed', 'Could not query tourist attractions list.'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (place: IPlace, nextStatus: string) => {
    setActionId(place.id);
    try {
      await api.put(`/places/${place.id}`, {
        name: place.name,
        description: place.description,
        city: place.city,
        address: place.imageUrl || '',
        latitude: 0,
        longitude: 0,
        imageUrl: place.imageUrl || undefined,
        entryFee: 0,
        status: nextStatus,
      });

      fetchPlaces();
    } catch (err) {
      console.error('Error updating status:', err);
      alert(t('bookings.updateStatusError', 'Error updating place status.'));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow bg-slate-950 text-slate-100 transition-colors">
      <div className="flex items-center justify-between mb-8 text-left">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('admin.placesModerationPanel', 'Places Moderation')}</h2>
          <p className="mt-1 text-sm text-slate-400 font-light">{t('admin.placesModerationSubtitle')}</p>
        </div>
        <button
          onClick={fetchPlaces}
          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center space-x-2 shadow-lg cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>{t('admin.refreshData')}</span>
        </button>
      </div>

      {/* Admin Sub-navigation Links */}
      <div className="flex flex-wrap items-center gap-4 mb-8 bg-slate-900/40 border border-slate-900/60 p-4 rounded-2xl text-sm font-semibold">
        <Link to="/admin/dashboard" className={`${isActive('/admin/dashboard') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'} transition-colors`}>
          {t('admin.statsOverview')}
        </Link>
        <span className="text-slate-800">|</span>
        <Link to="/admin/places" className={`${isActive('/admin/places') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'} transition-colors`}>
          {t('admin.moderatePlaces')}
        </Link>
        <span className="text-slate-800">|</span>
        <Link to="/admin/users" className={`${isActive('/admin/users') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'} transition-colors`}>
          {t('admin.manageUsers')}
        </Link>
        <span className="text-slate-800">|</span>
        <Link to="/admin/audit-logs" className={`${isActive('/admin/audit-logs') ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'} transition-colors`}>
          {t('admin.auditLogs')}
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-center space-x-2 text-sm text-left">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 inline-block" />
        </div>
      ) : places.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl text-slate-500 bg-slate-900/10">
          {t('admin.noPlacesInDb', 'No tourist places registered yet.')}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-900/60 rounded-3xl overflow-hidden shadow-xl text-left">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase bg-slate-950/40">
                <th className="px-6 py-3 rounded-l-xl">{t('admin.placeNameHeader')}</th>
                <th className="px-6 py-3">{t('admin.cityHeader')}</th>
                <th className="px-6 py-3">{t('admin.statusHeader')}</th>
                <th className="px-6 py-3 text-right rounded-r-xl">{t('admin.actionsHeader')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {places.map((place) => (
                <tr key={place.id} className="hover:bg-slate-950/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white">{getLocalized(place, 'name')}</td>
                  <td className="px-6 py-4">{t(place.city)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        place.status === 'Approved'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-yellow-500/10 text-yellow-400 animate-pulse'
                      }`}
                    >
                      {t(`bookings.statusBadge.${place.status}`, place.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(place, 'Approved')}
                        disabled={actionId === place.id || place.status === 'Approved'}
                        className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 p-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        title={t('admin.approvePlace', 'Approve Place')}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(place, 'Pending')}
                        disabled={actionId === place.id || place.status === 'Pending'}
                        className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 p-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                        title={t('admin.setToPending', 'Set to Pending')}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
