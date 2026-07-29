import type { LoginResponse } from '../../domain/models';
import type { ApiClient } from '../../shared/api/http-client';

export function login(
  api: ApiClient,
  email: FormDataEntryValue | null,
  senha: FormDataEntryValue | null,
) {
  return api<LoginResponse>('/sessoes', {
    method: 'POST',
    body: { email, senha },
  });
}
