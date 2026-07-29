import type { LoginResponse } from '../../domain/models';
import type { ApiClient } from '../../shared/api/http-client';

export interface OnboardingInput {
  empresa: Record<string, unknown>;
  proprietario: {
    nome: FormDataEntryValue | null;
    email: FormDataEntryValue | null;
    senha: FormDataEntryValue | null;
  };
}

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

export function loginWithGoogle(api: ApiClient, credential: string) {
  return api<LoginResponse>('/sessoes/google', {
    method: 'POST',
    body: { credential },
  });
}

export function onboard(api: ApiClient, input: OnboardingInput) {
  return api('/onboarding', {
    method: 'POST',
    body: input,
  });
}
