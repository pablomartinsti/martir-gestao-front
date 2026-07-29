export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function compactBody<T extends Record<string, unknown>>(
  body: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Partial<T>;
}
