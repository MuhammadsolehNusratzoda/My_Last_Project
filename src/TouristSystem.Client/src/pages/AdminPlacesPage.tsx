import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useTranslation } from '../hooks/useTranslation';
import type { IPlace } from '../types';
import { Check, X, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useNotificationStore } from '../app/notificationStore';

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<IPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t, getLocalized } = useTranslation();
  const addNotification = useNotificationStore((state) => state.addNotification);

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

      // Trigger notification log
      addNotification(
        'Attraction Status Moderated',
        `${getLocalized(place, 'name')} has been set to ${nextStatus} by Admin.`,
        'Admin',
        'moderation'
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert(t('bookings.updateStatusError', 'Error updating place status.'));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {t('admin.placesModerationPanel', 'Places Moderation')}
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-light mt-0.5">
            {t('admin.placesModerationSubtitle', 'Approve suggested tourist sights or disable inactive locations.')}
          </p>
        </div>
        <button
          onClick={fetchPlaces}
          disabled={loading}
          className="bg-white dark:bg-[#0d1627] hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800/60 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('admin.refreshData', 'Refresh Data')}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 p-4 rounded-xl flex items-center space-x-2 text-sm text-left">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 inline-block" />
        </div>
      ) : places.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl text-slate-500 bg-white dark:bg-[#0d1627]">
          {t('admin.noPlacesInDb', 'No tourist places registered yet.')}
        </div>
      ) : (
        /* Places Card Table */
        <div className="bg-white dark:bg-[#0d1627] border border-slate-100 dark:border-slate-800/40 rounded-2xl shadow-sm overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              <thead>
                <tr className="text-left text-[10px] font-extrabold text-slate-400 uppercase bg-slate-50/40 dark:bg-slate-900/10">
                  <th className="px-6 py-4 rounded-l-xl">{t('admin.placeNameHeader', 'Place Name')}</th>
                  <th className="px-6 py-4">{t('admin.cityHeader', 'City')}</th>
                  <th className="px-6 py-4">{t('admin.statusHeader', 'Status')}</th>
                  <th className="px-6 py-4 text-right rounded-r-xl">{t('admin.actionsHeader', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-650 dark:text-slate-300">
                {places.map((place) => (
                  <tr key={place.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/15 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-850 dark:text-white">
                      {getLocalized(place, 'name')}
                    </td>
                    <td className="px-6 py-4 font-sans text-slate-500 dark:text-slate-400">
                      {t(place.city)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold font-sans tracking-wide ${
                          place.status === 'Approved'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-yellow-500/10 text-yellow-655 dark:text-yellow-400 animate-pulse'
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
                          className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-655 dark:text-green-400 p-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                          title={t('admin.approvePlace', 'Approve Place')}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(place, 'Pending')}
                          disabled={actionId === place.id || place.status === 'Pending'}
                          className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-655 dark:text-yellow-400 p-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
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
        </div>
      )}
    </div>
  );
}
