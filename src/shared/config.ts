const LOCAL_API_URL = 'http://localhost:3333';
const PRODUCTION_API_URL = 'https://nota-fiscal.martircontabil.com.br';

function resolverDefaultApiUrl(): string {
  if (window.location.hostname === 'localhost') {
    return LOCAL_API_URL;
  }

  if (window.location.hostname === '127.0.0.1') {
    return LOCAL_API_URL;
  }

  return PRODUCTION_API_URL;
}

export const DEFAULT_API_URL = resolverDefaultApiUrl();

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
