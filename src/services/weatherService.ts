import type { City, WeatherData, WeatherError } from '../types/weather';

interface GeocodingResult {
  id?: number;
  name: string;
  admin1?: string;
  country?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastResponse {
  timezone?: string;
  current?: {
    temperature_2m?: number | null;
    apparent_temperature?: number | null;
    relative_humidity_2m?: number | null;
    is_day?: number | null;
    precipitation?: number | null;
    surface_pressure?: number | null;
    weather_code?: number | null;
    wind_speed_10m?: number | null;
    wind_direction_10m?: number | null;
  };
  daily?: {
    time?: string[];
    temperature_2m_min?: (number | null)[];
    temperature_2m_max?: (number | null)[];
    precipitation_probability_max?: (number | null)[];
    precipitation_sum?: (number | null)[];
    weather_code?: (number | null)[];
    wind_speed_10m_max?: (number | null)[];
  };
}

export class WeatherServiceError extends Error {
  constructor(public readonly error: WeatherError) {
    super(
      error.kind === 'timeout'
        ? 'A requisição demorou demais.'
        : error.kind === 'network'
          ? 'Falha de rede.'
          : 'Não foi possível consultar os dados meteorológicos.',
    );
    this.name = 'WeatherServiceError';
  }
}

export async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutMs = 10_000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'AbortError'
    ) {
      throw new WeatherServiceError({ kind: 'timeout', timeoutMs });
    }

    throw new WeatherServiceError({ kind: 'network' });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) {
    return [];
  }

  const response = await fetchWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`,
  );

  if (!response.ok) {
    throw new WeatherServiceError({
      kind: 'http',
      status: response.status,
      retryable: response.status === 429 || response.status >= 500,
    });
  }

  let data: GeocodingResponse;
  try {
    data = await response.json();
  } catch {
    throw new WeatherServiceError({ kind: 'invalid-response', reason: 'malformed-json' });
  }

  return (data.results ?? []).map((city) => ({
    id: city.id,
    name: city.name,
    adminRegion: city.admin1,
    country: city.country,
    countryCode: city.country_code,
    latitude: city.latitude,
    longitude: city.longitude,
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation,surface_pressure,weather_code,wind_speed_10m,wind_direction_10m',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max',
    forecast_days: '5',
    timezone: 'auto',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
  });

  const response = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`);

  if (!response.ok) {
    throw new WeatherServiceError({
      kind: 'http',
      status: response.status,
      retryable: response.status === 429 || response.status >= 500,
    });
  }

  let data: ForecastResponse | null;
  try {
    data = await response.json();
  } catch {
    throw new WeatherServiceError({ kind: 'invalid-response', reason: 'malformed-json' });
  }

  const current = data?.current;
  if (typeof current?.temperature_2m !== 'number' || !Number.isFinite(current.temperature_2m)) {
    throw new WeatherServiceError({
      kind: 'invalid-response',
      reason: 'missing-current-temperature',
    });
  }

  const daily = data?.daily;
  if (
    !daily ||
    !Array.isArray(daily.time) ||
    daily.time.length !== 5 ||
    daily.time.some(
      (date, index, dates) =>
        typeof date !== 'string' ||
        !Number.isFinite(Date.parse(date)) ||
        (index > 0 && Date.parse(date) - Date.parse(dates[index - 1]) !== 86_400_000),
    ) ||
    Object.values(daily).some((values) => !Array.isArray(values) || values.length !== 5) ||
    typeof data?.timezone !== 'string' ||
    !data.timezone
  ) {
    throw new WeatherServiceError({ kind: 'invalid-response', reason: 'invalid-forecast' });
  }

  return {
    city,
    timezone: data.timezone,
    current: {
      temperatureC: current.temperature_2m,
      apparentTemperatureC: current.apparent_temperature ?? undefined,
      relativeHumidityPercent: current.relative_humidity_2m ?? undefined,
      isDay: current.is_day == null ? undefined : current.is_day === 1,
      precipitationMm: current.precipitation === null ? 0 : (current.precipitation ?? undefined),
      pressureHpa: current.surface_pressure ?? undefined,
      weatherCode: current.weather_code ?? undefined,
      windSpeedKmh: current.wind_speed_10m ?? undefined,
      windDirectionDegrees: current.wind_direction_10m ?? undefined,
    },
    forecast: daily.time.map((date, index) => ({
      date,
      minTemperatureC: daily.temperature_2m_min?.[index] ?? undefined,
      maxTemperatureC: daily.temperature_2m_max?.[index] ?? undefined,
      precipitationProbabilityPercent: daily.precipitation_probability_max?.[index] ?? undefined,
      precipitationSumMm:
        daily.precipitation_sum?.[index] === null
          ? 0
          : (daily.precipitation_sum?.[index] ?? undefined),
      weatherCode: daily.weather_code?.[index] ?? undefined,
      maxWindSpeedKmh: daily.wind_speed_10m_max?.[index] ?? undefined,
    })),
  };
}
