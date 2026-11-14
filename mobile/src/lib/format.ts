const DAY_MS = 24 * 60 * 60 * 1000;

/** Data no formato dd/mm/aaaa, ou texto vazio se a API mandar um valor inválido. */
export function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR');
}

/** "Hoje", "Ontem", "Há 3 dias" na última semana; antes disso, dd/mm/aaaa. */
export function formatRelativeDate(value: string, now = new Date()): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);

  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days > 1 && days < 7) return `Há ${days} dias`;
  return formatDate(value);
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
