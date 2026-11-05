import { describe, expect, it } from 'vitest';
import {
  convertTemperature,
  formatTemperature,
  toFahrenheit,
  unitLabel,
} from '../../src/lib/temperature';

describe('toFahrenheit', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converte %s °C para %s °F', (temperatureC, expected) => {
    expect(toFahrenheit(temperatureC)).toBe(expected);
  });
});

describe('convertTemperature', () => {
  it.each([0, 100, -40, 18.2])('preserva %s em Celsius', (temperatureC) => {
    expect(convertTemperature(temperatureC, 'celsius')).toBe(temperatureC);
  });

  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
    [18.2, 64.76],
  ])('converte %s °C para %s °F sem arredondar', (temperatureC, expected) => {
    expect(convertTemperature(temperatureC, 'fahrenheit')).toBeCloseTo(expected);
  });
});

describe('formatTemperature', () => {
  it.each([
    [0, '0 °C'],
    [18.2, '18 °C'],
    [18.6, '19 °C'],
    [-18.6, '-19 °C'],
  ])('formata %s °C com arredondamento e símbolo: %s', (temperatureC, expected) => {
    expect(formatTemperature(temperatureC, 'celsius')).toBe(expected);
  });

  it.each([
    [0, '32 °F'],
    [100, '212 °F'],
    [-40, '-40 °F'],
    [18.2, '65 °F'],
    [23, '73 °F'],
  ])('converte antes de arredondar e formatar %s °C: %s', (temperatureC, expected) => {
    expect(formatTemperature(temperatureC, 'fahrenheit')).toBe(expected);
  });
});

describe('unitLabel', () => {
  it('retorna o símbolo de Celsius', () => {
    expect(unitLabel('celsius')).toBe('°C');
  });

  it('retorna o símbolo de Fahrenheit', () => {
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});
