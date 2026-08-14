import { useRef, useState, type FormEvent } from 'react';

import { fetchAddressByCep } from '../../services/cepApi';
import { fetchCompanyByCnpj } from '../../services/cnpjApi';
import type { AuthMode } from '../../types/app';
import { onlyNumbers } from '../../utils/forms';
import { PasswordToggle } from '../../components/PasswordToggle';
import { Button, Field, FieldHelp, Grid } from '../../components/ui';
import {
  AuthBrand,
  AuthCard,
  AuthForm,
  AuthHead,
  AuthPanel,
  AuthShell,
  PasswordRow,
  Tabs,
} from './styles';

interface LoginPageProps {
  authMode: AuthMode;
  onAuthModeChange: (mode: AuthMode) => void;
  onLogin: (formData: FormData) => Promise<void>;
  onOnboard: (formData: FormData) => Promise<void>;
}

export function LoginPage({
  authMode,
  onAuthModeChange,
  onLogin,
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
              <Field>
                E-mail
                <input name="email" type="email" autoComplete="email" required />
              </Field>
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
