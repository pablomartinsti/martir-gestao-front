import type { LoginResponse } from '../../domain/models';
import type { ApiClient } from '../../shared/api/http-client';

export interface OnboardingInput {
  empresa: {
    razaoSocial: FormDataEntryValue | null;
    cnpj: FormDataEntryValue | null;
    regimeTributario: FormDataEntryValue | null;
    cidade: FormDataEntryValue | null;
    uf: FormDataEntryValue | null;
  };
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

export function onboard(api: ApiClient, input: OnboardingInput) {
  return api('/onboarding', {
    method: 'POST',
    body: input,
  });
}
