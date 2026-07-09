import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { IRestaurant, IReview } from '../types';
import { useAuthStore } from '../app/store';
import { useTranslation } from '../hooks/useTranslation';
import { MapPin, Star, Heart, Clock, Loader2, MessageSquare, Plus, DollarSign, Utensils, Sparkles } from 'lucide-react';

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t, getLocalized, formatDate, formatNumber } = useTranslation();

  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const restRes = await api.get(`/restaurants/${id}`);
      setRestaurant(restRes.data);

      const reviewsRes = await api.get('/reviews', {
        params: { reviewType: 'Restaurant', referenceId: id },
      });
      setReviews(reviewsRes.data.items || []);
    } catch (error) {
      console.error('Error loading details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/favorites', {
        userId: user.id,
        favoriteType: 'Restaurant',
        referenceId: restaurant?.id,
      });
      setFavorited(true);
    } catch (error) {
      console.error('Error bookmarking:', error);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      setSubmitError(t('validation.required', 'Comment is required'));
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post('/reviews', {
        userId: user.id,
        reviewType: 'Restaurant',
        referenceId: restaurant?.id,
        rating,
        comment,
      });

      setComment('');
      setRating(5);
      fetchDetails();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || t('toasts.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-32 flex-grow bg-slate-950 text-slate-100 flex flex-col justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
        <p className="text-sm text-slate-400 font-light">{t('common.pleaseWait')}</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-32 flex-grow bg-slate-950 text-slate-100 flex flex-col justify-center items-center">
        <p className="text-slate-400 font-light">{t('restaurants.noRestaurants')}</p>
      </div>
    );
  }

  const imagePlaceholder = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex-grow py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner with absolute gradient overlays */}
        <div className="relative rounded-[32px] overflow-hidden h-[450px] w-full mb-12 shadow-2xl">
          <img
            src={restaurant.imageUrl || imagePlaceholder}
            alt={getLocalized(restaurant, 'name')}
            className="h-full w-full object-cover scale-100 hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-white z-10">
            <div className="space-y-3 text-left">
              <div className="inline-flex items-center space-x-1.5 text-xs bg-white/10 border border-white/20 backdrop-blur-md px-3 py-1.5 rounded-full uppercase tracking-wider font-semibold">
                <MapPin className="h-3.5 w-3.5 text-sky-400" />
                <span>{t(restaurant.city)}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">{getLocalized(restaurant, 'name')}</h1>
            </div>
            
            <button
              onClick={handleFavorite}
              disabled={favorited}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                favorited
                  ? 'bg-red-500/20 border border-red-500/40 text-red-400 cursor-default'
                  : 'bg-white hover:bg-gray-100 text-slate-950'
              }`}
            >
              <Heart className={`h-5 w-5 ${favorited ? 'fill-red-400 text-red-400' : 'text-red-500'}`} />
              <span>{favorited ? t('common.bookmarked') : t('common.addToFavorites')}</span>
            </button>
          </div>
        </div>

        {/* Core details layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* About / Description card */}
            <div className="bg-slate-900/40 border border-slate-900/60 p-8 rounded-3xl backdrop-blur-xl shadow-xl space-y-6 text-left">
              <h2 className="text-2xl font-extrabold text-white flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <span>{t('restaurants.aboutRestaurant')}</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 text-sm text-slate-350 bg-slate-950 border border-slate-900/60 p-4 rounded-2xl">
                  <Utensils className="h-5 w-5 text-blue-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('restaurants.cuisine')}</span>
                    <span className="font-semibold text-white">{restaurant.cuisineType}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-sm text-slate-350 bg-slate-950 border border-slate-900/60 p-4 rounded-2xl">
                  <DollarSign className="h-5 w-5 text-green-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('restaurants.priceRange')}</span>
                    <span className="font-semibold text-white">{restaurant.priceRange}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-sm text-slate-350 bg-slate-950 border border-slate-900/60 p-4 rounded-2xl">
                  <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('restaurants.workingHours')}</span>
                    <span className="font-semibold text-white">{restaurant.workingHours}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800/40">
                <p className="text-slate-300 leading-relaxed font-light whitespace-pre-line text-sm sm:text-base">
                  {getLocalized(restaurant, 'description')}
                </p>
                <div className="flex items-center text-xs text-slate-500 space-x-1.5 pt-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span>{t('restaurants.locatedAt', 'Located at')}: {restaurant.address}</span>
                </div>
              </div>
            </div>

            {/* Reviews container */}
            <div className="bg-slate-900/40 border border-slate-900/60 p-8 rounded-3xl backdrop-blur-xl shadow-xl space-y-8">
              <h2 className="text-2xl font-extrabold text-white flex items-center space-x-2.5 border-b border-slate-800/40 pb-4">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <span>{t('places.reviews')} ({formatNumber(reviews.length)})</span>
              </h2>

              <div className="space-y-6 text-left">
                {reviews.length === 0 ? (
                  <p className="text-sm text-slate-500 font-light">{t('places.noReviews')}</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-slate-900/40 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-white text-sm sm:text-base">{rev.userName}</h4>
                          <div className="flex items-center space-x-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < rev.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-slate-800'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">
                          {formatDate(rev.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-350 font-light leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Form container sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/40 border border-slate-900/60 p-8 rounded-3xl backdrop-blur-xl shadow-xl sticky top-24 space-y-6">
              <h3 className="text-xl font-extrabold text-white flex items-center space-x-2 pb-4 border-b border-slate-800/40">
                <Plus className="h-5 w-5 text-blue-500" />
                <span>{t('common.leaveReview')}</span>
              </h3>

              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-6 text-left">
                  {submitError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-2xl text-xs">
                      {submitError}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('common.rating')}</label>
                    <div className="flex space-x-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`h-7 w-7 transition-colors ${
                              star <= rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-slate-800 hover:text-yellow-500'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('common.comment')}</label>
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="block w-full border border-slate-800 bg-slate-950 text-slate-100 rounded-2xl p-3 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600 font-light"
                      placeholder={t('common.comment')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl text-sm font-semibold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center cursor-pointer"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.submitReview')}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
                  <p className="text-xs text-slate-400 font-light px-4">{t('common.mustBeSignedIn')}</p>
                  <Link
                    to="/login"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all"
                  >
                    {t('common.signIn')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
