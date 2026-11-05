import type { Unit } from '../types/weather';

export function toFahrenheit(temperatureC: number): number {
  return (temperatureC * 9) / 5 + 32;
}

export function convertTemperature(temperatureC: number, unit: Unit): number {
  return unit === 'fahrenheit' ? toFahrenheit(temperatureC) : temperatureC;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function formatTemperature(temperatureC: number, unit: Unit): string {
  return `${Math.round(convertTemperature(temperatureC, unit))} ${unitLabel(unit)}`;
}
