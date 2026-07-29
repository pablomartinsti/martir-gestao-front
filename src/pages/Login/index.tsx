import { useEffect, useRef, useState, type FormEvent } from 'react';
import styled from 'styled-components';

import { GOOGLE_CLIENT_ID } from '../../config';
import { fetchAddressByCep } from '../../services/cepApi';
import { fetchCompanyByCnpj } from '../../services/cnpjApi';
import type { AuthMode } from '../../types/app';
import { onlyNumbers } from '../../utils/forms';
import { PasswordToggle } from '../../components/PasswordToggle';
import { Button, Field, FieldHelp, Grid } from '../../components/ui';

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

interface LoginPageProps {
  authMode: AuthMode;
  onAuthModeChange: (mode: AuthMode) => void;
  onLogin: (formData: FormData) => Promise<void>;
  onGoogleLogin: (credential: string) => Promise<void>;
  onOnboard: (formData: FormData) => Promise<void>;
}

let googleScriptPromise: Promise<void> | null = null;

export function LoginPage({
  authMode,
  onAuthModeChange,
  onLogin,
  onGoogleLogin,
  onOnboard,
}: LoginPageProps) {
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [cnpjStatus, setCnpjStatus] = useState('');
  const [cepStatus, setCepStatus] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isOnboarding = authMode === 'onboarding';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      if (isOnboarding) {
        await onOnboard(formData);
      } else {
        await onLogin(formData);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function fillCompanyFromCnpj() {
    const form = formRef.current;
    const cnpj = getFieldValue(form, 'cnpj');
    const digits = onlyNumbers(cnpj);

    if (!digits) {
      setCnpjStatus('');
      return;
    }

    if (digits.length !== 14) {
      setCnpjStatus('CNPJ precisa ter 14 digitos.');
      return;
    }

    setCnpjStatus('Buscando CNPJ...');

    try {
      const company = await fetchCompanyByCnpj(digits);

      setFieldValue(form, 'cnpj', company.cnpj);
      setFieldValue(form, 'razaoSocial', company.nomeRazaoSocial);
      setFieldValue(form, 'empresaEmail', company.email);
      setFieldValue(form, 'telefone', company.telefone);
      setFieldValue(form, 'cep', company.cep);
      setFieldValue(form, 'endereco', company.endereco);
      setFieldValue(form, 'numero', company.numero);
      setFieldValue(form, 'bairro', company.bairro);
      setFieldValue(form, 'cidade', company.cidade);
      setFieldValue(form, 'uf', company.uf);
      setCnpjStatus('Dados preenchidos pelo CNPJ.');

      if (company.cep) {
        await fillCompanyAddressFromCep(company.cep);
      }
    } catch (error) {
      setCnpjStatus(messageFromError(error));
    }
  }

  async function fillCompanyAddressFromCep(inputCep?: string) {
    const form = formRef.current;
    const cep = inputCep || getFieldValue(form, 'cep');
    const digits = onlyNumbers(cep);

    if (!digits) {
      setCepStatus('');
      return;
    }

    if (digits.length !== 8) {
      setCepStatus('CEP precisa ter 8 digitos.');
      return;
    }

    setCepStatus('Buscando CEP...');

    try {
      const address = await fetchAddressByCep(digits);

      if (!address) {
        setCepStatus('CEP nao encontrado.');
        return;
      }

      setFieldValue(form, 'cep', address.cep);
      setFieldValue(form, 'endereco', address.endereco);
      setFieldValue(form, 'bairro', address.bairro);
      setFieldValue(form, 'cidade', address.cidade);
      setFieldValue(form, 'uf', address.uf);
      setFieldValue(form, 'codigoMunicipioIbge', address.codigoMunicipioIbge);
      setCepStatus('Endereco preenchido pelo CEP.');
    } catch (error) {
      setCepStatus(messageFromError(error));
    }
  }

  return (
    <AuthShell>
      <AuthBrand>
        <img src="/assets/martir-logo.png" alt="Martir Contabil" />
        <div>
          <span>Martir Gestao</span>
          <h1>Painel NFS-e.</h1>
          <p>Emita notas de servico e acompanhe sua rotina fiscal em um lugar simples.</p>
        </div>
      </AuthBrand>
      <AuthPanel $centered={!isOnboarding}>
        <AuthCard $wide={isOnboarding}>
          <AuthHead>
            <span>Acesso</span>
            <h2>{isOnboarding ? 'Cadastrar empresa' : 'Entrar no painel'}</h2>
          </AuthHead>
          <Tabs>
            <button
              type="button"
              className={!isOnboarding ? 'active' : ''}
              onClick={() => onAuthModeChange('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              className={isOnboarding ? 'active' : ''}
              onClick={() => onAuthModeChange('onboarding')}
            >
              Cadastrar
            </button>
          </Tabs>
          <AuthForm ref={formRef} onSubmit={handleSubmit}>
            {isOnboarding ? (
              <>
                <Grid $columns={2}>
                  <Field>
                    CNPJ
                    <input name="cnpj" inputMode="numeric" required onBlur={() => void fillCompanyFromCnpj()} />
                    <FieldHelp $status={statusTone(cnpjStatus)}>{cnpjStatus}</FieldHelp>
                  </Field>
                  <Field>
                    Razao social
                    <input name="razaoSocial" required />
                  </Field>
                </Grid>
                <Grid $columns={2}>
                  <Field>
                    Nome fantasia
                    <input name="nomeFantasia" />
                  </Field>
                  <Field>
                    Regime tributario
                    <select name="regimeTributario" required defaultValue="SIMPLES_NACIONAL">
                      <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                      <option value="MEI">MEI</option>
                      <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                      <option value="LUCRO_REAL">Lucro Real</option>
                    </select>
                  </Field>
                </Grid>
                <Grid $columns={2}>
                  <Field>
                    E-mail da empresa
                    <input name="empresaEmail" type="email" />
                  </Field>
                  <Field>
                    Telefone
                    <input name="telefone" />
                  </Field>
                </Grid>
                <Grid $columns={2}>
                  <Field>
                    CEP
                    <input name="cep" inputMode="numeric" onBlur={() => void fillCompanyAddressFromCep()} />
                    <FieldHelp $status={statusTone(cepStatus)}>{cepStatus}</FieldHelp>
                  </Field>
                  <Field>
                    Endereco
                    <input name="endereco" />
                  </Field>
                </Grid>
                <Grid $columns={3}>
                  <Field>
                    Numero
                    <input name="numero" />
                  </Field>
                  <Field>
                    Bairro
                    <input name="bairro" />
                  </Field>
                  <Field>
                    Cidade
                    <input name="cidade" required />
                  </Field>
                </Grid>
                <Grid $columns={3}>
                  <Field>
                    UF
                    <input name="uf" maxLength={2} required />
                  </Field>
                  <Field>
                    Codigo municipio IBGE
                    <input name="codigoMunicipioIbge" inputMode="numeric" />
                  </Field>
                  <Field>
                    Inscricao municipal
                    <input name="inscricaoMunicipal" />
                  </Field>
                </Grid>
                <Grid $columns={2}>
                  <Field>
                    Nome do responsavel
                    <input name="nome" autoComplete="name" required />
                  </Field>
                  <Field>
                    E-mail de acesso
                    <input name="email" type="email" autoComplete="email" required />
                  </Field>
                </Grid>
              </>
            ) : (
              <>
                {GOOGLE_CLIENT_ID ? <GoogleLoginButton onGoogleLogin={onGoogleLogin} /> : null}
                {GOOGLE_CLIENT_ID ? <Divider>ou</Divider> : null}
                <Field>
                  E-mail
                  <input name="email" type="email" autoComplete="email" required />
                </Field>
              </>
            )}
            <Field>
              Senha
              <PasswordRow>
                <input
                  name="senha"
                  type={passwordVisible ? 'text' : 'password'}
                  minLength={isOnboarding ? 8 : undefined}
                  autoComplete={isOnboarding ? 'new-password' : 'current-password'}
                  required
                />
                <PasswordToggle visible={passwordVisible} onToggle={() => setPasswordVisible((value) => !value)} />
              </PasswordRow>
            </Field>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? isOnboarding
                  ? 'Criando cadastro...'
                  : 'Entrando...'
                : isOnboarding
                  ? 'Criar cadastro'
                  : 'Entrar no painel'}
            </Button>
          </AuthForm>
        </AuthCard>
      </AuthPanel>
    </AuthShell>
  );
}

function GoogleLoginButton({ onGoogleLogin }: { onGoogleLogin: (credential: string) => Promise<void> }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const container = containerRef.current;

    if (!container || !GOOGLE_CLIENT_ID) {
      return;
    }

    loadGoogleScript()
      .then(() => {
        if (!window.google?.accounts?.id) {
          throw new Error('Google Identity indisponivel.');
        }

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response.credential) {
              void onGoogleLogin(response.credential);
            }
          },
        });
        window.google.accounts.id.renderButton(container, {
          shape: 'rectangular',
          size: 'large',
          text: 'signin_with',
          theme: 'outline',
          width: 360,
        });
        setStatus('');
      })
      .catch(() => setStatus('Nao foi possivel carregar o login Google.'));
  }, [onGoogleLogin]);

  return (
    <GoogleBox>
      <div ref={containerRef} />
      <small>{status}</small>
    </GoogleBox>
  );
}

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-identity]');

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Google Identity indisponivel.')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Google Identity indisponivel.')), {
      once: true,
    });
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

function getFieldValue(form: HTMLFormElement | null, field: string): string {
  const element = form?.elements.namedItem(field);

  return element instanceof HTMLInputElement || element instanceof HTMLSelectElement
    ? element.value.trim()
    : '';
}

function setFieldValue(form: HTMLFormElement | null, field: string, value: string) {
  if (!value) {
    return;
  }

  const element = form?.elements.namedItem(field);

  if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
    element.value = value;
  }
}

function statusTone(value: string): 'success' | 'error' | '' {
  if (!value) return '';
  if (value.includes('preenchid') || value.includes('Dados')) return 'success';
  return value.includes('Buscando') ? '' : 'error';
}

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : 'Erro inesperado.';
}

const AuthShell = styled.section`
  display: grid;
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  grid-template-columns: minmax(320px, 34%) minmax(0, 1fr);
  background: var(--surface-soft);
  overflow: hidden;

  @media (max-width: 940px) {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 100dvh;
    overflow: visible;
  }
`;

const AuthBrand = styled.aside`
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  justify-content: space-between;
  background: var(--navy-950);
  color: #ffffff;
  padding: 42px 38px;

  img {
    width: 240px;
    max-width: 100%;
  }

  span {
    color: var(--gold-500);
    font-size: 0.76rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h1 {
    max-width: 360px;
    margin: auto 0 8px;
    font-size: clamp(2.4rem, 5vw, 4.6rem);
    line-height: 0.95;
  }

  p {
    max-width: 390px;
    color: rgba(255, 255, 255, 0.72);
  }

  @media (max-width: 940px) {
    height: auto;
    min-height: auto;
    gap: 30px;
  }
`;

const AuthPanel = styled.div<{ $centered: boolean }>`
  display: grid;
  min-height: 0;
  align-items: ${({ $centered }) => ($centered ? 'center' : 'start')};
  justify-items: center;
  overflow-y: auto;
  padding: 28px;

  @media (max-width: 940px) {
    overflow: visible;
  }
`;

const AuthCard = styled.article<{ $wide: boolean }>`
  width: min(${({ $wide }) => ($wide ? '920px' : '440px')}, 100%);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
  padding: 24px;
`;

const AuthHead = styled.header`
  margin-bottom: 16px;

  span {
    color: var(--gold-600);
    font-size: 0.74rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h2 {
    margin: 4px 0 0;
  }
`;

const Tabs = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  border-radius: var(--radius);
  background: var(--surface-muted);
  padding: 4px;
  margin-bottom: 18px;

  button {
    min-height: 40px;
    border-radius: 6px;
    background: transparent;
    color: var(--ink-700);
    font-weight: 900;
  }

  button.active {
    background: #ffffff;
    color: var(--ink-900);
    box-shadow: 0 4px 16px rgba(13, 24, 58, 0.08);
  }
`;

const AuthForm = styled.form`
  display: grid;
  gap: 14px;
`;

const PasswordRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
`;

const GoogleBox = styled.div`
  display: grid;
  justify-content: center;
  gap: 6px;
  color: var(--ink-500);
  font-size: 0.78rem;
`;

const Divider = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  color: var(--ink-500);
  font-size: 0.76rem;

  &::before,
  &::after {
    content: '';
    height: 1px;
    background: var(--line);
  }
`;
