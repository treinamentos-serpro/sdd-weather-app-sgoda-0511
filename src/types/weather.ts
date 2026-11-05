export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id?: number;
  name: string;
  adminRegion?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperatureC: number;
  apparentTemperatureC?: number;
  relativeHumidityPercent?: number;
  isDay?: boolean;
  precipitationMm?: number;
  pressureHpa?: number;
  weatherCode?: number;
  windSpeedKmh?: number;
  windDirectionDegrees?: number;
}

export interface ForecastDay {
  date: string;
  minTemperatureC?: number;
  maxTemperatureC?: number;
  precipitationProbabilityPercent?: number;
  precipitationSumMm?: number;
  weatherCode?: number;
  maxWindSpeedKmh?: number;
}

export interface WeatherData {
  city: City;
  timezone: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
}

export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'error'; error: WeatherError };

export type WeatherError =
  | { kind: 'network' }
  | { kind: 'timeout'; timeoutMs: number }
  | { kind: 'http'; status: number; retryable: boolean }
  | {
      kind: 'invalid-response';
      reason: 'malformed-json' | 'missing-current-temperature' | 'invalid-forecast';
    };

export interface WeatherViewState {
  query: string;
  search: AsyncState<City[]>;
  selectedCity: City | null;
  weather: AsyncState<WeatherData>;
  unit: Unit;
}
