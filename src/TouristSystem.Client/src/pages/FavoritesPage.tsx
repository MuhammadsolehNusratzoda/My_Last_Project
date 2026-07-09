import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { IFavorite } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { Heart, Trash2, Loader2, ExternalLink } from 'lucide-react';

export default function FavoritesPage() {
  const { t, formatDate } = useTranslation();
  const [favorites, setFavorites] = useState<IFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  useEffect(() => { fetchFavorites(); }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await api.get('/favorites', {
        params: { pageNumber: 1, pageSize: 50 },
      });
      setFavorites(response.data.items || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    setDeleteLoadingId(id);
    try {
      await api.delete(`/favorites/${id}`);
      fetchFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert(t('favorites.removeFailed', 'Failed to remove favorite'));
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const getDetailPageLink = (type: string, refId: string) => {
    if (type === 'Place')      return `/places/${refId}`;
    if (type === 'Hotel')      return `/hotels/${refId}`;
    if (type === 'Restaurant') return `/restaurants/${refId}`;
    return `/guides/${refId}`;
  };

  const imagePlaceholder = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow bg-slate-950 text-slate-100 transition-colors">
      <div className="mb-12 text-left">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">{t('navbar.favorites')}</h2>
        <p className="mt-1 text-sm text-slate-400 font-light">{t('favorites.subtitle', 'Keep track of all your saved destinations, hotels, and dining spots.')}</p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 inline-block" />
          <p className="mt-2 text-sm text-slate-400 font-light">{t('common.pleaseWait')}</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-[28px] bg-slate-900/25">
          <Heart className="h-10 w-10 text-slate-700 mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-slate-400 font-light">{t('favorites.noFavorites', 'No favorites saved yet.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {favorites.map((fav) => (
            <div key={fav.id} className="bg-slate-900/40 border border-slate-900/60 rounded-[24px] overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all flex flex-col justify-between hover:border-slate-800 text-left">
              <div>
                <div className="relative h-48 w-full bg-slate-950">
                  <img
                    src={fav.itemImageUrl || imagePlaceholder}
                    alt={fav.itemName}
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = imagePlaceholder; }}
                  />
                  <div className="absolute top-3 left-3 bg-blue-600/90 border border-blue-500/30 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md">
                    {t(`bookings.types.${fav.favoriteType}`, fav.favoriteType)}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2 truncate">{fav.itemName}</h3>
                  <span className="text-xs text-slate-400 font-light">
                    {t('favorites.savedOn', 'Saved on')}: {formatDate(fav.createdAt)}
                  </span>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-800/40 flex items-center justify-between mt-auto">
                <Link
                  to={getDetailPageLink(fav.favoriteType, fav.referenceId)}
                  className="flex items-center space-x-1 text-sm font-semibold text-sky-400 hover:text-sky-350"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>{t('favorites.visitPage', 'View Listing')}</span>
                </Link>

                <button
                  onClick={() => handleRemove(fav.id)}
                  disabled={deleteLoadingId === fav.id}
                  className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 p-2.5 rounded-2xl transition-all cursor-pointer disabled:opacity-50"
                  title={t('favorites.removeBookmark', 'Remove Bookmark')}
                >
                  {deleteLoadingId === fav.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
