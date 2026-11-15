import { formatRelativeDate } from '@/lib/format';

describe('formatRelativeDate', () => {
  const now = new Date(2026, 0, 20, 15, 0);

  it.each([
    [new Date(2026, 0, 20, 8, 0), 'Hoje'],
    [new Date(2026, 0, 19, 23, 0), 'Ontem'],
    [new Date(2026, 0, 16, 10, 0), 'Há 4 dias'],
    [new Date(2026, 0, 10, 10, 0), '10/01/2026'],
  ])('formata %s como %s', (date, expected) => {
    expect(formatRelativeDate(date.toISOString(), now)).toBe(expected);
  });

  it('devolve texto vazio para data inválida', () => {
    expect(formatRelativeDate('não é data', now)).toBe('');
  });
});
