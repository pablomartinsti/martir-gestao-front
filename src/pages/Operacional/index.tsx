import { useEffect, useMemo, useState, type FormEvent } from 'react';

import {
  listAdminCompanies,
  listAdminFiscalEvents,
  listAdminNotes,
  updateAdminCompanyFiscalConfig,
  updateAdminCompanyIssuance,
  type AdminNotesFilters,
} from '../../services/adminApi';
import { CertificateAttentionModal, type CertificateAttentionItem } from '../../components/CertificateAttentionModal';
import type { ApiClient } from '../../services/httpClient';
import type {
  AdminEmpresaOperacionalResumo,
  AdminEventoFiscalResumo,
  AdminNotaResumo,
  AmbienteFiscal,
  StatusEventoFiscal,
  StatusNota,
} from '../../types/models';
import {
  certificateStatusBadge,
  formatCurrency,
  formatDate,
  formatDocument,
  formatNumber,
  getCertificateExpirationInfo,
  readableEnum,
  statusLabel,
} from '../../utils/formatters';
import { normalizeSearchText, onlyNumbers } from '../../utils/forms';
import {
  Button,
  Empty,
  Eyebrow,
  Field,
  Panel,
  PanelTitle,
  SectionHead,
  Stack,
  StatusBadge,
} from '../../components/ui';
import {
  ActionCell,
  AdminGrid,
  CompanyActions,
  CompanyConfigForm,
  CompanyDropdown,
  CompanyMeta,
  CompanyOptionButton,
  CompanyWarning,
  CompanyPickerPanel,
  CompanySelector,
  CompanySelectorActions,
  EventItem,
  EventList,
  Filters,
  KpiCard,
  KpiGrid,
  MessageText,
  SelectedLabel,
  SummaryGrid,
  TableScroll,
  TextStack,
} from './styles';

interface OperationalPageProps {
  api: ApiClient;
}

interface FilterFormState {
  ambienteFiscal: AmbienteFiscal | '';
  busca: string;
  criadoAte: string;
  criadoDe: string;
  status: StatusNota | '';
}

const initialFilters: FilterFormState = {
  ambienteFiscal: '',
  busca: '',
  criadoAte: '',
  criadoDe: '',
  status: '',
};

export function OperationalPage({ api }: OperationalPageProps) {
  const [companies, setCompanies] = useState<AdminEmpresaOperacionalResumo[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [companyPickerOpen, setCompanyPickerOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [filters, setFilters] = useState<FilterFormState>(initialFilters);
  const [notes, setNotes] = useState<AdminNotaResumo[]>([]);
  const [events, setEvents] = useState<AdminEventoFiscalResumo[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
  const [actionCompanyId, setActionCompanyId] = useState('');
  const [fiscalConfigCompanyId, setFiscalConfigCompanyId] = useState('');
  const [certificateModalDismissed, setCertificateModalDismissed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadAdminData();
  }, [api]);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );

  const filteredCompanies = useMemo(
    () => filterCompanies(companies, companySearch),
    [companies, companySearch],
  );

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId),
    [notes, selectedNoteId],
  );

  const selectedCompanyLabel = selectedCompany
    ? `${selectedCompany.razaoSocial} | ${formatDocument(selectedCompany.cnpj)}`
    : '';
  const selectedCertificateInfo = selectedCompany ? certificateInfoForCompany(selectedCompany) : null;
  const certificateAttentionItems = useMemo<CertificateAttentionItem[]>(
    () =>
      companies
        .map((company) => ({
          company,
          info: certificateInfoForCompany(company),
        }))
        .filter(({ info }) => info.status !== 'ok')
        .map(({ company, info }) => ({
          detail: info.detail,
          document: `${formatDocument(company.cnpj)} | ${company.cidade}/${company.uf}`,
          id: company.id,
          name: company.razaoSocial,
          status: info.status,
        })),
    [companies],
  );

  const totals = useMemo(
    () =>
      companies.reduce(
        (summary, company) => ({
          blocked: summary.blocked + (company.configuracaoFiscal.emissaoHabilitada ? 0 : 1),
          certificateAlerts:
            summary.certificateAlerts + (certificateInfoForCompany(company).status === 'ok' ? 0 : 1),
          errors: summary.errors + company.notas.erros,
          notes: summary.notes + company.notas.total,
        }),
        { blocked: 0, certificateAlerts: 0, errors: 0, notes: 0 },
      ),
    [companies],
  );

  async function loadAdminData(nextCompanyId = selectedCompanyId, nextFilters = filters) {
    setLoading(true);
    setError('');

    try {
      const loadedCompanies = await listAdminCompanies(api);
      const companyId = nextCompanyId || loadedCompanies[0]?.id || '';

      setCompanies(loadedCompanies);
      setSelectedCompanyId(companyId);

      if (!companyId) {
        setNotes([]);
        setEvents([]);
        return;
      }

      await loadCompanyData(companyId, nextFilters);
    } catch (loadError) {
      setError(messageFromError(loadError));
    } finally {
      setLoading(false);
    }
  }

  async function loadCompanyData(companyId: string, nextFilters = filters) {
    const apiFilters = toApiFilters(nextFilters, companyId);
    const [adminNotes, fiscalEvents] = await Promise.all([
      listAdminNotes(api, apiFilters),
      listAdminFiscalEvents(api, {
        busca: nextFilters.busca,
        criadoAte: dateFilter(nextFilters.criadoAte, true),
        criadoDe: dateFilter(nextFilters.criadoDe),
        empresaId: companyId,
        limite: 60,
      }),
    ]);

    setNotes(adminNotes);
    setEvents(fiscalEvents);
    setSelectedNoteId('');
  }

  function selectCompany(companyId: string) {
    setSelectedCompanyId(companyId);
    setCompanyPickerOpen(false);
    setCompanySearch('');
    setError('');
    void loadCompanyData(companyId);
  }

  async function toggleCompanyIssuance(company: AdminEmpresaOperacionalResumo) {
    setActionCompanyId(company.id);
    setError('');

    try {
      const updatedCompany = await updateAdminCompanyIssuance(
        api,
        company.id,
        !company.configuracaoFiscal.emissaoHabilitada,
      );

      setCompanies((current) =>
        current.map((item) => (item.id === updatedCompany.id ? updatedCompany : item)),
      );
    } catch (actionError) {
      setError(messageFromError(actionError));
    } finally {
      setActionCompanyId('');
    }
  }

  async function submitCompanyFiscalConfig(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCompany) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const ambienteFiscalPadrao = String(
      formData.get('ambienteFiscalPadrao') ||
        selectedCompany.configuracaoFiscal.ambienteFiscalPadrao,
    ) as AmbienteFiscal;
    const serieDpsPadrao = String(
      formData.get('serieDpsPadrao') ||
        selectedCompany.configuracaoFiscal.serieDpsPadrao ||
        '1',
    ).trim();

    setFiscalConfigCompanyId(selectedCompany.id);
    setError('');

    try {
      const updatedCompany = await updateAdminCompanyFiscalConfig(api, selectedCompany.id, {
        ambienteFiscalPadrao,
        emissaoHabilitada: selectedCompany.configuracaoFiscal.emissaoHabilitada,
        serieDpsPadrao,
      });

      setCompanies((current) =>
        current.map((item) => (item.id === updatedCompany.id ? updatedCompany : item)),
      );
      await loadCompanyData(updatedCompany.id);
    } catch (actionError) {
      setError(messageFromError(actionError));
    } finally {
      setFiscalConfigCompanyId('');
    }
  }

  async function loadEventsForNote(note: AdminNotaResumo) {
    setEventLoading(true);
    setError('');
    setSelectedNoteId(note.id);

    try {
      setEvents(
        await listAdminFiscalEvents(api, {
          empresaId: note.empresa.id,
          limite: 60,
          notaServicoId: note.id,
        }),
      );
    } catch (loadError) {
      setError(messageFromError(loadError));
    } finally {
      setEventLoading(false);
    }
  }

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextFilters: FilterFormState = {
      ambienteFiscal: String(formData.get('ambienteFiscal') || '') as AmbienteFiscal | '',
      busca: String(formData.get('busca') || '').trim(),
      criadoAte: String(formData.get('criadoAte') || ''),
      criadoDe: String(formData.get('criadoDe') || ''),
      status: String(formData.get('status') || '') as StatusNota | '',
    };

    setFilters(nextFilters);

    if (selectedCompanyId) {
      void loadAdminData(selectedCompanyId, nextFilters);
    }
  }

  return (
    <>
      <SectionHead>
        <div>
          <Eyebrow>Admin do sistema</Eyebrow>
          <h1>Empresas</h1>
          <p>Escolha uma empresa, acompanhe as notas e libere ou bloqueie a emissao.</p>
        </div>
        <Button type="button" $tone="ghost" disabled={loading} onClick={() => void loadAdminData()}>
          {loading ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </SectionHead>

      <Stack>
        <CertificateAttentionModal
          items={certificateAttentionItems}
          message="Voce tem um ou mais clientes com certificado digital vencido, proximo do vencimento ou pendente de validade."
          open={Boolean(certificateAttentionItems.length) && !certificateModalDismissed}
          primaryLabel="Corrigir agora"
          onClose={() => setCertificateModalDismissed(true)}
          onPrimary={() => {
            setCertificateModalDismissed(true);
            if (certificateAttentionItems[0]) {
              selectCompany(certificateAttentionItems[0].id);
            }
          }}
        />
        {error ? <MessageText>{error}</MessageText> : null}

        <CompanyPickerPanel>
          <CompanySelector>
            <label htmlFor="admin-company-search">Empresa</label>
            <input
              id="admin-company-search"
              value={companyPickerOpen || companySearch ? companySearch : selectedCompanyLabel}
              onChange={(event) => {
                setCompanySearch(event.target.value);
                setCompanyPickerOpen(true);
              }}
              onFocus={() => {
                setCompanySearch('');
                setCompanyPickerOpen(true);
              }}
              placeholder="Selecione uma empresa"
            />
            {companyPickerOpen ? (
              <CompanyDropdown>
                {filteredCompanies.length ? (
                  filteredCompanies.map((company) => {
                    const certificateInfo = certificateInfoForCompany(company);

                    return (
                      <CompanyOptionButton
                        key={company.id}
                        type="button"
                        $active={company.id === selectedCompanyId}
                        onClick={() => selectCompany(company.id)}
                      >
                        <strong>{company.razaoSocial}</strong>
                        <CompanyMeta>
                          {formatDocument(company.cnpj)} | {company.cidade}/{company.uf}
                        </CompanyMeta>
                        {certificateInfo.status !== 'ok' ? (
                          <CompanyWarning $status={certificateInfo.status}>{certificateInfo.label}</CompanyWarning>
                        ) : null}
                      </CompanyOptionButton>
                    );
                  })
                ) : (
                  <CompanyMeta>Nenhuma empresa encontrada.</CompanyMeta>
                )}
              </CompanyDropdown>
            ) : null}
          </CompanySelector>
          <CompanySelectorActions>
            <SelectedLabel>{`${formatNumber(filteredCompanies.length)} de ${formatNumber(companies.length)} empresa(s)`}</SelectedLabel>
            <Button type="button" $tone="ghost" $compact onClick={() => setCompanyPickerOpen((current) => !current)}>
              Selecionar
            </Button>
          </CompanySelectorActions>
        </CompanyPickerPanel>

        <KpiGrid>
          <KpiCard>
            <span>Empresas</span>
            <strong>{formatNumber(companies.length)}</strong>
            <small>Clientes do sistema</small>
          </KpiCard>
          <KpiCard>
            <span>Notas registradas</span>
            <strong>{formatNumber(totals.notes)}</strong>
            <small>Todas as empresas</small>
          </KpiCard>
          <KpiCard>
            <span>Notas com erro</span>
            <strong>{formatNumber(totals.errors)}</strong>
            <small>Precisam de conferencia</small>
          </KpiCard>
          <KpiCard>
            <span>Certificados com alerta</span>
            <strong>{formatNumber(totals.certificateAlerts)}</strong>
            <small>Vencidos, vencendo ou pendentes</small>
          </KpiCard>
          <KpiCard>
            <span>Emissao bloqueada</span>
            <strong>{formatNumber(totals.blocked)}</strong>
            <small>Empresas sem emissao</small>
          </KpiCard>
        </KpiGrid>

        <AdminGrid>
          <Panel>
            <PanelTitle>
              <h2>{selectedCompany?.razaoSocial || 'Empresa'}</h2>
              {selectedCompany ? (
                <StatusBadge
                  $status={selectedCompany.configuracaoFiscal.emissaoHabilitada ? 'EMITIDA' : 'ERRO'}
                >
                  {selectedCompany.configuracaoFiscal.emissaoHabilitada ? 'Liberada' : 'Bloqueada'}
                </StatusBadge>
              ) : null}
            </PanelTitle>

            {selectedCompany ? (
              <Stack>
                <SummaryGrid>
                  <KpiCard>
                    <span>CNPJ</span>
                    <strong>{formatDocument(selectedCompany.cnpj)}</strong>
                    <small>{selectedCompany.cidade}/{selectedCompany.uf}</small>
                  </KpiCard>
                  <KpiCard>
                    <span>Certificado</span>
                    <strong>{selectedCertificateInfo?.label || '-'}</strong>
                    <small>{selectedCertificateInfo?.detail || '-'}</small>
                    {selectedCertificateInfo ? (
                      <StatusBadge $status={certificateStatusBadge(selectedCertificateInfo.status)}>
                        {selectedCertificateInfo.status === 'ok' ? 'Regular' : 'Atencao'}
                      </StatusBadge>
                    ) : null}
                  </KpiCard>
                  <KpiCard>
                    <span>Ambiente</span>
                    <strong>{readableEnum(selectedCompany.configuracaoFiscal.ambienteFiscalPadrao)}</strong>
                    <small>Serie DPS {selectedCompany.configuracaoFiscal.serieDpsPadrao}</small>
                  </KpiCard>
                </SummaryGrid>

                <CompanyConfigForm key={selectedCompany.id} onSubmit={submitCompanyFiscalConfig}>
                  <Field>
                    Ambiente do cliente
                    <select
                      name="ambienteFiscalPadrao"
                      defaultValue={selectedCompany.configuracaoFiscal.ambienteFiscalPadrao}
                    >
                      <option value="HOMOLOGACAO">Homologacao</option>
                      <option value="PRODUCAO">Producao</option>
                    </select>
                  </Field>
                  <Field>
                    Serie DPS
                    <input
                      name="serieDpsPadrao"
                      defaultValue={selectedCompany.configuracaoFiscal.serieDpsPadrao}
                      maxLength={20}
                    />
                  </Field>
                  <Button
                    type="submit"
                    disabled={fiscalConfigCompanyId === selectedCompany.id}
                  >
                    {fiscalConfigCompanyId === selectedCompany.id
                      ? 'Salvando...'
                      : 'Salvar ambiente'}
                  </Button>
                </CompanyConfigForm>

                <CompanyActions>
                  <Button
                    type="button"
                    $tone={selectedCompany.configuracaoFiscal.emissaoHabilitada ? 'danger' : 'primary'}
                    disabled={actionCompanyId === selectedCompany.id}
                    onClick={() => void toggleCompanyIssuance(selectedCompany)}
                  >
                    {actionCompanyId === selectedCompany.id
                      ? 'Salvando...'
                      : selectedCompany.configuracaoFiscal.emissaoHabilitada
                        ? 'Bloquear emissao'
                        : 'Liberar emissao'}
                  </Button>
                </CompanyActions>
              </Stack>
            ) : (
              <Empty $compact>Selecione uma empresa para acompanhar.</Empty>
            )}
          </Panel>
        </AdminGrid>

        <Panel>
          <PanelTitle>
            <h2>Notas da empresa</h2>
            <SelectedLabel>{loading ? 'Carregando...' : `${formatNumber(notes.length)} registro(s)`}</SelectedLabel>
          </PanelTitle>
          <Filters onSubmit={submitFilters}>
            <Field>
              Buscar
              <input name="busca" defaultValue={filters.busca} placeholder="Cliente, numero ou erro" />
            </Field>
            <Field>
              Status
              <select name="status" defaultValue={filters.status}>
                <option value="">Todos</option>
                <option value="ERRO">Erro</option>
                <option value="ERRO_RESOLVIDO">Erro resolvido</option>
                <option value="PROCESSANDO">Processando</option>
                <option value="RASCUNHO">Pendente</option>
                <option value="EMITIDA">Emitida</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="SUBSTITUIDA">Substituida</option>
              </select>
            </Field>
            <Field>
              Ambiente
              <select name="ambienteFiscal" defaultValue={filters.ambienteFiscal}>
                <option value="">Todos</option>
                <option value="PRODUCAO">Producao</option>
                <option value="HOMOLOGACAO">Homologacao</option>
              </select>
            </Field>
            <Field>
              De
              <input type="date" name="criadoDe" defaultValue={filters.criadoDe} />
            </Field>
            <Field>
              Ate
              <input type="date" name="criadoAte" defaultValue={filters.criadoAte} />
            </Field>
            <Button type="submit" disabled={loading || !selectedCompanyId}>
              {loading ? 'Filtrando...' : 'Filtrar'}
            </Button>
          </Filters>

          {loading ? (
            <Empty>Carregando notas...</Empty>
          ) : notes.length ? (
            <TableScroll>
              <table>
                <thead>
                  <tr>
                    <th>NFS-e</th>
                    <th>Atualizado</th>
                    <th>Cliente</th>
                    <th>Servico</th>
                    <th>Status</th>
                    <th>Valor</th>
                    <th>Ultimo retorno</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((note) => (
                    <tr key={note.id}>
                      <td>{note.numeroNfse || note.numeroDps || '-'}</td>
                      <td>{formatDate(note.updatedAt || note.createdAt)}</td>
                      <td>
                        <TextStack>
                          <strong>{note.cliente.nomeRazaoSocial}</strong>
                          <small>{formatDocument(note.cliente.cpfCnpj)}</small>
                        </TextStack>
                      </td>
                      <td>{note.servico.descricao}</td>
                      <td>
                        <TextStack>
                          <StatusBadge $status={note.status}>{statusLabel(note.status)}</StatusBadge>
                          <small>{readableEnum(note.ambienteFiscal)}</small>
                        </TextStack>
                      </td>
                      <td>{formatCurrency(note.valorServico)}</td>
                      <td>
                        <MessageText>
                          {note.mensagemErroFiscal ||
                            note.mensagemErro ||
                            note.ultimoEvento?.mensagem ||
                            'Sem retorno de erro.'}
                        </MessageText>
                      </td>
                      <td>
                        <ActionCell>
                          <Button
                            type="button"
                            $tone="action"
                            disabled={eventLoading}
                            onClick={() => void loadEventsForNote(note)}
                          >
                            Eventos
                          </Button>
                        </ActionCell>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
          ) : (
            <Empty>Nenhuma nota encontrada para a empresa selecionada.</Empty>
          )}
        </Panel>

        <Panel>
          <PanelTitle>
            <h2>Eventos fiscais</h2>
            <SelectedLabel>{selectedNote ? `Nota ${selectedNote.numeroNfse || selectedNote.numeroDps || '-'}` : 'Recentes'}</SelectedLabel>
          </PanelTitle>
          {eventLoading ? (
            <Empty $compact>Carregando eventos...</Empty>
          ) : events.length ? (
            <EventList>
              {events.map((fiscalEvent) => (
                <EventItem key={fiscalEvent.id}>
                  <header>
                    <strong>{eventTypeLabel(fiscalEvent.tipo)}</strong>
                    <StatusBadge $status={eventStatusToBadge(fiscalEvent.status)}>
                      {eventStatusLabel(fiscalEvent.status)}
                    </StatusBadge>
                  </header>
                  <small>{formatDate(fiscalEvent.createdAt)}</small>
                  <p>
                    {fiscalEvent.nota?.cliente
                      ? fiscalEvent.nota.cliente.nomeRazaoSocial
                      : fiscalEvent.empresa.razaoSocial}
                  </p>
                  <p>{fiscalEvent.mensagem || 'Evento registrado sem mensagem.'}</p>
                  {fiscalEvent.statusHttp ? <small>HTTP {fiscalEvent.statusHttp}</small> : null}
                </EventItem>
              ))}
            </EventList>
          ) : (
            <Empty $compact>Nenhum evento encontrado.</Empty>
          )}
        </Panel>
      </Stack>
    </>
  );
}

function toApiFilters(filters: FilterFormState, empresaId: string): AdminNotesFilters {
  return {
    ambienteFiscal: filters.ambienteFiscal,
    busca: filters.busca,
    criadoAte: dateFilter(filters.criadoAte, true),
    criadoDe: dateFilter(filters.criadoDe),
    empresaId,
    limite: 100,
    status: filters.status,
  };
}

function filterCompanies(
  companies: AdminEmpresaOperacionalResumo[],
  search: string,
): AdminEmpresaOperacionalResumo[] {
  const term = normalizeSearchText(search);
  const digits = onlyNumbers(search);

  if (!term && !digits) {
    return companies;
  }

  return companies.filter((company) => {
    const text = normalizeSearchText(
      `${company.razaoSocial} ${company.cidade} ${company.uf}`,
    );
    const cnpj = onlyNumbers(company.cnpj);

    return text.includes(term) || (digits ? cnpj.includes(digits) : false);
  });
}

function certificateInfoForCompany(company: AdminEmpresaOperacionalResumo) {
  return getCertificateExpirationInfo(
    company.configuracaoFiscal.certificadoA1Configurado,
    company.configuracaoFiscal.certificadoA1ValidoAte,
  );
}

function dateFilter(value: string, endOfDay = false): string | undefined {
  if (!value) {
    return undefined;
  }

  return `${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}-03:00`;
}

function eventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    CANCELAMENTO_NFSE: 'Cancelamento',
    CONSULTA_NFSE: 'Consulta da NFS-e',
    DOWNLOAD_DANFSE: 'Download PDF',
    ENVIO_DPS: 'Envio da DPS',
    RECONCILIACAO_ENVIO: 'Reconciliacao',
  };

  return labels[type] || readableEnum(type);
}

function eventStatusLabel(status: StatusEventoFiscal): string {
  return status === 'SUCESSO' ? 'Sucesso' : 'Erro';
}

function eventStatusToBadge(status: StatusEventoFiscal): StatusNota {
  return status === 'SUCESSO' ? 'EMITIDA' : 'ERRO';
}

function messageFromError(error: unknown): string {
  return error instanceof Error ? error.message : 'Erro inesperado ao carregar painel operacional.';
}
