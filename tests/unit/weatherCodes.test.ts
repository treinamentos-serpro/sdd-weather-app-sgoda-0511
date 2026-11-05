import { describe, expect, it } from 'vitest';
import { getWeatherInfo } from '../../src/lib/weatherCodes';

describe('getWeatherInfo', () => {
  it.each([
    [0, 'Céu limpo', '☀️'],
    [3, 'Nublado', '☁️'],
    [61, 'Chuva leve', '🌧️'],
    [95, 'Trovoada', '⛈️'],
  ] as const)('mapeia o código conhecido %s', (code, description, icon) => {
    expect(getWeatherInfo(code)).toEqual({ description, icon });
  });

  it.each([999, -1])('retorna fallback para o código desconhecido %s', (code) => {
    expect(getWeatherInfo(code)).toEqual({ description: 'Condição desconhecida', icon: '—' });
  });

  it('retorna condição indisponível quando o código está ausente', () => {
    expect(getWeatherInfo()).toEqual({ description: 'Condição indisponível', icon: '—' });
  });
});
