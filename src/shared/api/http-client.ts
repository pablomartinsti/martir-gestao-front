export interface ApiClientContext {
  apiUrl: string;
  token: string;
}

export interface ApiError extends Error {
  status?: number;
  payload?: unknown;
}

export type ApiRequestInit = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export type ApiClient = <T>(
  path: string,
  options?: ApiRequestInit,
) => Promise<T>;

export function createApiClient(getContext: () => ApiClientContext): ApiClient {
  return async function api<T>(
    path: string,
    options: ApiRequestInit = {},
  ): Promise<T> {
    const context = getContext();
    const baseUrl = context.apiUrl.replace(/\/$/, '');
    const headers = new Headers(options.headers);
    let body = options.body as BodyInit | null | undefined;

    if (context.token) {
      headers.set('Authorization', `Bearer ${context.token}`);
    }

    if (body && !(body instanceof FormData) && typeof body !== 'string') {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
        body,
      });
    } catch {
      throw new Error('Nao foi possivel conectar com a API.');
    }

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof payload === 'object' &&
        payload !== null &&
        'message' in payload &&
        typeof payload.message === 'string'
          ? payload.message
          : `Erro ${response.status} na API.`;
      const error = new Error(message) as ApiError;
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload as T;
  };
}
