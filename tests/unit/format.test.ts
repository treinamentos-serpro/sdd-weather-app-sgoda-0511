import { describe, expect, it } from 'vitest';
import { formatDayLabel, getShortDate } from '../../src/lib/format';

describe('formatDayLabel', () => {
  it('retorna Hoje para o índice 0', () => {
    expect(formatDayLabel('2026-11-05', 0)).toBe('Hoje');
  });

  it('retorna Amanhã para o índice 1', () => {
    expect(formatDayLabel('2026-11-06', 1)).toBe('Amanhã');
  });

  it.each([
    ['2026-11-07', 2, 'sáb.'],
    ['2026-11-08', 3, 'dom.'],
    ['2026-11-09', 4, 'seg.'],
    ['2024-02-29', 2, 'qui.'],
  ] as const)('retorna o dia da semana de %s no índice %s', (date, index, expected) => {
    expect(formatDayLabel(date, index)).toBe(expected);
  });
});

describe('getShortDate', () => {
  it.each([
    ['2026-11-05', '05/11'],
    ['2026-01-01', '01/01'],
    ['2026-12-31', '31/12'],
    ['2024-02-29', '29/02'],
  ])('formata %s como %s, com dia e mês de dois dígitos', (date, expected) => {
    expect(getShortDate(date)).toBe(expected);
  });
});
