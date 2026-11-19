import { useEffect, useState } from 'react';
import { Bus, Hotel, Loader2, Pencil, Plus, Trash2, User, Utensils, X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuthStore } from '../../app/store';
import { api } from '../../services/api';
import { partnerApi, listingEndpoint, apiErrorMessage } from '../../services/partnerApi';
import type { IPartnerListing, ListingType } from '../../types/partner';
import ErrorState from '../../components/common/ErrorState';
import StatusBadge from '../../components/partner/StatusBadge';
import ActionDialog from '../../components/partner/ActionDialog';
import { LISTING_FIELDS, emptyValues, toLocalInput } from './listingForms';

const ROLE_TO_TYPE: Record<string, ListingType> = {
  HotelOwner: 'Hotel',
  RestaurantOwner: 'Restaurant',
  TransportOwner: 'Transport',
  Guide: 'Guide',
};

const TYPE_ICON = { Hotel, Restaurant: Utensils, Transport: Bus, Guide: User };

interface FormState {
  mode: 'create' | 'edit';
  type: ListingType;
  id?: string;
  /** Full detail loaded from the API — fields not shown in the form are sent back unchanged. */
  original?: Record<string, unknown>;
  values: Record<string, unknown>;
}

export default function PartnerListingsPage() {
  const { t, formatCurrency } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const myType = user ? ROLE_TO_TYPE[user.role] : undefined;

  const [listings, setListings] = useState<IPartnerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [form, setForm] = useState<FormState | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [toDelete, setToDelete] = useState<IPartnerListing | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      setListings(await partnerApi.getListings());
    } catch (err) {
      console.error('Error loading partner listings:', err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // A guide has exactly one profile; other partners can add as many listings as they want
  const canCreate = !!myType && !(myType === 'Guide' && listings.some((l) => l.type === 'Guide'));

  const openCreate = () => {
    if (!myType) return;
    setFormError(null);
    setForm({ mode: 'create', type: myType, values: emptyValues(myType) });
  };

  const openEdit = async (listing: IPartnerListing) => {
    setFormError(null);
    setFormLoading(true);
    setForm({ mode: 'edit', type: listing.type, id: listing.id, values: {} });
    try {
      const { data } = await api.get(`${listingEndpoint[listing.type]}/${listing.id}`);
      const values: Record<string, unknown> = {};
      for (const f of LISTING_FIELDS[listing.type]) {
        const v = data[f.key];
        values[f.key] = f.type === 'datetime' && v ? toLocalInput(v) : v ?? (f.type === 'checkbox' ? false : '');
      }
      setForm({ mode: 'edit', type: listing.type, id: listing.id, original: data, values });
    } catch (err) {
      setFormError(apiErrorMessage(err, t('partner.loadListingFailed', 'Could not load this listing.')));
    } finally {
      setFormLoading(false);
    }
  };

  const setValue = (key: string, value: unknown) =>
    setForm((f) => (f ? { ...f, values: { ...f.values, [key]: value } } : f));

  const buildPayload = (state: FormState): Record<string, unknown> => {
    const fields = LISTING_FIELDS[state.type];
    const payload: Record<string, unknown> = { ...(state.original ?? {}) };
    for (const f of fields) {
      if (f.editOnly && state.mode === 'create') continue;
      let v = state.values[f.key];
      if (f.type === 'number') v = v === '' || v === null || v === undefined ? 0 : Number(v);
      if (f.type === 'datetime' && typeof v === 'string' && v) v = new Date(v).toISOString();
      if ((f.key === 'imageUrl' || f.key === 'websiteUrl') && v === '') v = null;
      payload[f.key] = v;
    }
    // Owner is required by the DTO; the server checks it against the JWT on update
    if (state.type === 'Guide') payload.userId = user?.id;
    else payload.ownerId = state.mode === 'edit' ? state.original?.ownerId : user?.id;
    // Status is kept as-is: only admins may change it (the server ignores it for partners)
    payload.status = state.original?.status ?? 'Pending';
    return payload;
  };

  const validate = (state: FormState): string | null => {
    for (const f of LISTING_FIELDS[state.type]) {
      if (!f.required || (f.editOnly && state.mode === 'create')) continue;
      const v = state.values[f.key];
      if (v === '' || v === null || v === undefined) return `${t(f.labelKey, f.label)}: ${t('partner.required', 'required')}`;
    }
    return null;
  };

  const save = async () => {
    if (!form) return;
    const problem = validate(form);
    if (problem) {
      setFormError(problem);
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const url = listingEndpoint[form.type];
      const payload = buildPayload(form);
      if (form.mode === 'create') await api.post(url, payload);
      else await api.put(`${url}/${form.id}`, payload);
      setForm(null);
      await fetchListings();
    } catch (err) {
      setFormError(apiErrorMessage(err, t('partner.saveFailed', 'Could not save. Please check the fields.')));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`${listingEndpoint[toDelete.type]}/${toDelete.id}`);
      setToDelete(null);
      await fetchListings();
    } catch (err) {
      setDeleteError(apiErrorMessage(err, t('partner.deleteFailed', 'Could not delete this listing.')));
    } finally {
      setDeleting(false);
    }
  };

  const inputClass = 'w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40';
  const unitLabel = (unit?: string | null) =>
    unit ? ` / ${t(`partner.unit.${unit}`, unit)}` : '';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{t('partner.menu.listings', 'My Listings')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('partner.listingsSubtitle', 'Add, edit and remove the hotels, restaurants, routes or guide profile you offer.')}</p>
        </div>
        {canCreate && (
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white self-start">
            <Plus className="h-4 w-4" />
            <span>{myType === 'Guide' ? t('partner.createGuideProfile', 'Create my guide profile') : t('partner.addListing', 'Add listing')}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => <div key={n} className="h-44 rounded-2xl bg-white dark:bg-[#0d1627] border border-gray-100 dark:border-slate-800/40 animate-pulse" />)}
        </div>
      ) : loadError ? (
        <ErrorState onRetry={fetchListings} />
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#0d1627] border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
          <p className="text-gray-500">{t('partner.noListings', 'You have no listings yet.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {listings.map((l) => {
            const Icon = TYPE_ICON[l.type];
            return (
              <div key={l.id} className="bg-white dark:bg-[#0d1627] border border-gray-100 dark:border-slate-800/40 rounded-2xl overflow-hidden flex flex-col">
                <div className="h-28 bg-gray-100 dark:bg-slate-900 relative">
                  {l.imageUrl ? (
                    <img src={l.imageUrl} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-slate-700"><Icon className="h-10 w-10" /></div>
                  )}
                  <div className="absolute top-3 right-3"><StatusBadge status={l.status} /></div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t(`partner.type.${l.type}`, l.type)}{l.city ? ` · ${l.city}` : ''}</p>
                  <h3 className="font-extrabold text-gray-900 dark:text-white mt-1">{l.name}</h3>
                  <div className="mt-2 text-sm text-gray-500 space-y-0.5">
                    {l.price != null && <p>{formatCurrency(l.price)}{unitLabel(l.priceUnit)}</p>}
                    {l.capacity != null && <p>{t('partner.availability', 'Free')}: {l.available ?? 0} / {l.capacity}</p>}
                  </div>
                  <div className="mt-auto pt-4 flex gap-2">
                    <button onClick={() => openEdit(l)} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800">
                      <Pencil className="h-4 w-4" />
                      <span>{t('partner.edit', 'Edit')}</span>
                    </button>
                    {l.type !== 'Guide' && (
                      <button onClick={() => { setDeleteError(null); setToDelete(l); }} className="px-3 py-2 rounded-xl text-sm font-semibold border border-red-500/30 text-red-500 hover:bg-red-500/10" aria-label={t('partner.delete', 'Delete')}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / edit modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0d1627] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-left">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                {form.mode === 'create' ? t('partner.addListing', 'Add listing') : t('partner.editListing', 'Edit listing')} · {t(`partner.type.${form.type}`, form.type)}
              </h2>
              <button onClick={() => setForm(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>

            {formLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {LISTING_FIELDS[form.type]
                    .filter((f) => !(f.editOnly && form.mode === 'create') && f.type !== 'checkbox')
                    .map((f) => (
                      <label key={f.key} className={`block ${f.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                        <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                          {t(f.labelKey, f.label)}{f.required ? ' *' : ''}
                        </span>
                        {f.type === 'textarea' ? (
                          <textarea rows={4} value={String(form.values[f.key] ?? '')} onChange={(e) => setValue(f.key, e.target.value)} className={inputClass} />
                        ) : f.type === 'select' ? (
                          <select value={String(form.values[f.key] ?? '')} onChange={(e) => setValue(f.key, e.target.value)} className={inputClass}>
                            {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            type={f.type === 'number' ? 'number' : f.type === 'datetime' ? 'datetime-local' : 'text'}
                            min={f.min}
                            step={f.step}
                            value={String(form.values[f.key] ?? '')}
                            onChange={(e) => setValue(f.key, e.target.value)}
                            className={inputClass}
                          />
                        )}
                      </label>
                    ))}
                </div>

                {LISTING_FIELDS[form.type].some((f) => f.type === 'checkbox' && !(f.editOnly && form.mode === 'create')) && (
                  <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {LISTING_FIELDS[form.type]
                      .filter((f) => f.type === 'checkbox' && !(f.editOnly && form.mode === 'create'))
                      .map((f) => (
                        <label key={f.key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                          <input type="checkbox" checked={Boolean(form.values[f.key])} onChange={(e) => setValue(f.key, e.target.checked)} className="h-4 w-4 rounded" />
                          <span>{t(f.labelKey, f.label)}</span>
                        </label>
                      ))}
                  </div>
                )}

                {formError && <p className="mt-4 text-sm text-red-500">{formError}</p>}

                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setForm(null)} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800">
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50">
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{t('common.save', 'Save')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <ActionDialog
        open={toDelete !== null}
        title={t('partner.deleteTitle', 'Delete listing?')}
        message={toDelete ? `${toDelete.name} — ${t('partner.deleteWarning', 'It will no longer be visible to travelers.')}` : ''}
        confirmLabel={t('partner.delete', 'Delete')}
        danger
        busy={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
