const PRODUCTION_API_URL = 'https://nota-fiscal.martircontabil.com.br';

export const DEFAULT_API_URL = import.meta.env.VITE_API_URL || PRODUCTION_API_URL;
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const STORAGE_KEYS = {
  apiUrl: 'martir.apiUrl',
  token: 'martir.token',
} as const;

export const MONTHS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
] as const;
