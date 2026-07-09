import { useAuthStore } from '../app/store';
import { translations } from '../app/locale/translations';

export type Language = 'en' | 'ru' | 'tj';

export function useTranslation() {
  const lang = useAuthStore((state) => state.lang) as Language;
  const setLang = useAuthStore((state) => state.setLang);

  const t = (key: string, defaultValue?: string): string => {
    if (!key) return '';

    const keys = key.split('.');
    
    // 1. Resolve key in target language dictionary
    let result: any = translations[lang] || translations['en'];
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        result = undefined;
        break;
      }
    }

    if (result !== undefined && typeof result === 'string') {
      return result;
    }

    // 2. Fallback to English dictionary
    result = translations['en'];
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        result = undefined;
        break;
      }
    }

    if (result !== undefined && typeof result === 'string') {
      return result;
    }

    // 3. Fallback to root translations mapping directly (flat keys)
    const flatResult = (translations[lang] as any)?.[key] || (translations['en'] as any)?.[key];
    if (flatResult !== undefined && typeof flatResult === 'string') {
      return flatResult;
    }

    return defaultValue !== undefined ? defaultValue : key;
  };

  const formatDate = (date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string => {
    if (!date) return '';
    try {
      const d = new Date(date);
      // Map 'tj' locale string to standard 'tg' (Tajik BCP-47 identifier)
      const locale = lang === 'tj' ? 'tg-TJ' : lang === 'ru' ? 'ru-RU' : 'en-US';
      const defaultOptions: Intl.DateTimeFormatOptions = options || {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
    } catch (e) {
      return String(date);
    }
  };

  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '';
    try {
      const locale = lang === 'tj' ? 'tg-TJ' : lang === 'ru' ? 'ru-RU' : 'en-US';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (e) {
      return `$${amount}`;
    }
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return '';
    try {
      const locale = lang === 'tj' ? 'tg-TJ' : lang === 'ru' ? 'ru-RU' : 'en-US';
      return new Intl.NumberFormat(locale).format(num);
    } catch (e) {
      return String(num);
    }
  };

  const getLocalized = (obj: any, fieldBase: string): string => {
    if (!obj) return '';

    // Convert BCP key 'tj' to 'Tj', 'ru' to 'Ru', 'en' to 'En'
    const suffix = lang === 'en' ? 'En' : lang === 'ru' ? 'Ru' : 'Tj';
    const localizedKey = `${fieldBase}${suffix}`;

    if (obj[localizedKey] !== undefined && obj[localizedKey] !== null && String(obj[localizedKey]).trim() !== '') {
      return String(obj[localizedKey]);
    }

    // Fallback to standard base field
    return obj[fieldBase] !== undefined && obj[fieldBase] !== null ? String(obj[fieldBase]) : '';
  };

  return {
    t,
    lang,
    setLang,
    formatDate,
    formatCurrency,
    formatNumber,
    getLocalized
  };
}
