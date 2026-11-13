/** Data no formato dd/mm/aaaa, ou texto vazio se a API mandar um valor inválido. */
export function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR');
}
