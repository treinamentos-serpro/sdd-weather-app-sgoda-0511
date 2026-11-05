import type { Unit } from '../types/weather';

export function toFahrenheit(temperatureC: number): number {
  return (temperatureC * 9) / 5 + 32;
}

export function formatTemperature(temperatureC: number, unit: Unit): string {
  const temperature = unit === 'fahrenheit' ? toFahrenheit(temperatureC) : temperatureC;
  const symbol = unit === 'fahrenheit' ? 'F' : 'C';

  return `${Math.round(temperature)} °${symbol}`;
}
