export function textField(formData: FormData, field: string): string {
  return String(formData.get(field) || '').trim();
}

export function compactBody<T extends Record<string, unknown>>(body: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Partial<T>;
}

export function onlyNumbers(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function parseCurrencyField(formData: FormData, field: string): number {
  return parseCurrencyValue(textField(formData, field));
}

export function parseCurrencyValue(value: string): number {
  const cleanValue = value.replace(/[^\d,.-]/g, '').trim();
  const normalized = cleanValue.includes(',')
    ? cleanValue.replace(/\./g, '').replace(',', '.')
    : normalizeCurrencyWithDot(cleanValue);
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Informe um valor de servico valido.');
  }

  return parsed;
}

export function currencyInputValue(value?: number): string {
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function todayInputValue(): string {
  const date = new Date();
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return offsetDate.toISOString().slice(0, 10);
}

export function dateInputValue(value?: string): string {
  return value ? value.slice(0, 10) : '';
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      const result = String(reader.result || '');
      resolve(result.split(',')[1] || result);
    });

    reader.addEventListener('error', () => {
      reject(new Error('Nao foi possivel ler o arquivo do certificado.'));
    });

    reader.readAsDataURL(file);
  });
}

export function triggerFileDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function sanitizeFileName(value: string): string {
  return (
    value
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'nota'
  );
}

function normalizeCurrencyWithDot(value: string): string {
  const parts = value.split('.');

  if (parts.length === 2 && parts[1].length === 3) {
    return parts.join('');
  }

  return value;
}
