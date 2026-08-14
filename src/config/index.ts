const PRODUCTION_API_URL = 'https://nota-fiscal.martircontabil.com.br';
const DEVELOPMENT_API_URL = 'http://localhost:3333';

export const DEFAULT_API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? DEVELOPMENT_API_URL : PRODUCTION_API_URL);

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
