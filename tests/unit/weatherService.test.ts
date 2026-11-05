import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, ForecastDay } from '../../src/types/weather';

const city: City = {
  id: 3448433,
  name: 'São Paulo',
  adminRegion: 'São Paulo',
  country: 'Brasil',
  countryCode: 'BR',
  latitude: -23.5505,
  longitude: -46.6333,
};

const forecast: ForecastDay[] = [
  {
    date: '2026-11-05',
    minTemperatureC: 16,
    maxTemperatureC: 23,
    precipitationProbabilityPercent: 10,
    precipitationSumMm: 0,
    weatherCode: 2,
    maxWindSpeedKmh: 12,
  },
  {
    date: '2026-11-06',
    minTemperatureC: 15,
    maxTemperatureC: 22,
    precipitationProbabilityPercent: 20,
    precipitationSumMm: 0.2,
    weatherCode: 3,
    maxWindSpeedKmh: 11,
  },
  {
    date: '2026-11-07',
    minTemperatureC: 14,
    maxTemperatureC: 20,
    precipitationProbabilityPercent: 70,
    precipitationSumMm: 4.1,
    weatherCode: 61,
    maxWindSpeedKmh: 10,
  },
  {
    date: '2026-11-08',
    minTemperatureC: 16,
    maxTemperatureC: 24,
    precipitationProbabilityPercent: 5,
    precipitationSumMm: 0,
    weatherCode: 1,
    maxWindSpeedKmh: 13,
  },
  {
    date: '2026-11-09',
    minTemperatureC: 17,
    maxTemperatureC: 25,
    precipitationProbabilityPercent: 0,
    precipitationSumMm: 0,
    weatherCode: 0,
    maxWindSpeedKmh: 9,
  },
];

const forecastResponse = {
  timezone: 'America/Sao_Paulo',
  current: {
    temperature_2m: 18.2,
    apparent_temperature: 19.1,
    relative_humidity_2m: 72,
    is_day: 1,
    precipitation: 0.5,
    surface_pressure: 1015,
    weather_code: 2,
    wind_speed_10m: 8.4,
    wind_direction_10m: 120,
  },
  daily: {
    time: forecast.map((day) => day.date),
    temperature_2m_min: forecast.map((day) => day.minTemperatureC),
    temperature_2m_max: forecast.map((day) => day.maxTemperatureC),
    precipitation_probability_max: forecast.map((day) => day.precipitationProbabilityPercent),
    precipitation_sum: forecast.map((day) => day.precipitationSumMm),
    weather_code: forecast.map((day) => day.weatherCode),
    wind_speed_10m_max: forecast.map((day) => day.maxWindSpeedKmh),
  },
};

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it.each(['', '   '])('retorna vazio sem fetch para input %j', async (name) => {
    expect(await searchCities(name)).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('codifica o nome na URL e mapeia todos os resultados para City', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        results: [
          {
            id: city.id,
            name: city.name,
            admin1: city.adminRegion,
            country: city.country,
            country_code: city.countryCode,
            latitude: city.latitude,
            longitude: city.longitude,
          },
          { name: 'Outra cidade', latitude: 10, longitude: 20 },
        ],
      }),
    );

    expect(await searchCities(' São Paulo & região ')).toEqual([
      city,
      {
        id: undefined,
        name: 'Outra cidade',
        adminRegion: undefined,
        country: undefined,
        countryCode: undefined,
        latitude: 10,
        longitude: 20,
      },
    ]);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://geocoding-api.open-meteo.com/v1/search?name=S%C3%A3o%20Paulo%20%26%20regi%C3%A3o&count=10&language=pt&format=json',
      { signal: expect.any(AbortSignal) },
    );
  });

  it.each([{}, { results: [] }])('retorna vazio para resposta %j', async (payload) => {
    fetchMock.mockResolvedValueOnce(Response.json(payload));

    expect(await searchCities('São Paulo')).toEqual([]);
  });

  it.each([400, 429, 503])('lança WeatherServiceError para HTTP %s', async (status) => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status }));

    const pending = searchCities('São Paulo');
    await expect(pending).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(pending).rejects.toMatchObject({
      error: { kind: 'http', status, retryable: status === 429 || status >= 500 },
    });
  });
});

describe('getWeather', () => {
  it.each([
    400, 429, 503,
  ])('rejeita HTTP %s sem tratar a falha como clima válido', async (status) => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status }));

    const pending = getWeather(city);
    await expect(pending).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(pending).rejects.toMatchObject({
      error: { kind: 'http', status, retryable: status === 429 || status >= 500 },
    });
  });

  it.each([
    undefined,
    null,
    '18.2',
  ])('rejeita temperatura atual inválida: %j', async (temperature) => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        ...forecastResponse,
        current: { ...forecastResponse.current, temperature_2m: temperature },
      }),
    );

    await expect(getWeather(city)).rejects.toMatchObject({
      error: { kind: 'invalid-response', reason: 'missing-current-temperature' },
    });
  });

  it('preserva temperatura zero e is_day zero sem confundi-los com ausência', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        ...forecastResponse,
        current: { ...forecastResponse.current, temperature_2m: 0, is_day: 0 },
      }),
    );

    expect((await getWeather(city)).current).toMatchObject({ temperatureC: 0, isDay: false });
  });

  it.each([0, 4, 6])('rejeita forecast com %s datas em vez de cinco', async (length) => {
    const dates = Array.from(
      { length },
      (_, index) => `2026-11-${String(5 + index).padStart(2, '0')}`,
    );
    fetchMock.mockResolvedValueOnce(
      Response.json({
        ...forecastResponse,
        daily: { ...forecastResponse.daily, time: dates },
      }),
    );

    await expect(getWeather(city)).rejects.toMatchObject({
      error: { kind: 'invalid-response', reason: 'invalid-forecast' },
    });
  });

  it.each([
    'temperature_2m_min',
    'temperature_2m_max',
    'precipitation_probability_max',
    'precipitation_sum',
    'weather_code',
    'wind_speed_10m_max',
  ])('rejeita o array diário %s com comprimento inconsistente', async (field) => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        ...forecastResponse,
        daily: { ...forecastResponse.daily, [field]: [1, 2] },
      }),
    );

    await expect(getWeather(city)).rejects.toMatchObject({
      error: { kind: 'invalid-response', reason: 'invalid-forecast' },
    });
  });

  it.each([
    ['duplicadas', ['2026-11-05', '2026-11-06', '2026-11-06', '2026-11-08', '2026-11-09']],
    ['fora de ordem', ['2026-11-05', '2026-11-07', '2026-11-06', '2026-11-08', '2026-11-09']],
    ['não consecutivas', ['2026-11-05', '2026-11-06', '2026-11-08', '2026-11-09', '2026-11-10']],
  ])('rejeita datas %s', async (_description, dates) => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        ...forecastResponse,
        daily: { ...forecastResponse.daily, time: dates },
      }),
    );

    await expect(getWeather(city)).rejects.toMatchObject({
      error: { kind: 'invalid-response', reason: 'invalid-forecast' },
    });
  });

  it('usa parâmetros de forecast e mapeia current e arrays daily para cinco dias', async () => {
    fetchMock.mockResolvedValueOnce(Response.json(forecastResponse));

    const data = await getWeather(city);

    expect(data).toEqual({
      city,
      timezone: 'America/Sao_Paulo',
      current: {
        temperatureC: 18.2,
        apparentTemperatureC: 19.1,
        relativeHumidityPercent: 72,
        isDay: true,
        precipitationMm: 0.5,
        pressureHpa: 1015,
        weatherCode: 2,
        windSpeedKmh: 8.4,
        windDirectionDegrees: 120,
      },
      forecast,
    });
    expect(data.city).toBe(city);
    expect(data.forecast).toHaveLength(5);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(Object.fromEntries(url.searchParams)).toEqual({
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
  });

  it('normaliza precipitação null para zero no clima atual e no acumulado diário', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        ...forecastResponse,
        current: { ...forecastResponse.current, precipitation: null },
        daily: { ...forecastResponse.daily, precipitation_sum: [null, 0, 4.1, null, 0] },
      }),
    );

    const data = await getWeather(city);

    expect(data.current.precipitationMm).toBe(0);
    expect(data.forecast.map((day) => day.precipitationSumMm)).toEqual([0, 0, 4.1, 0, 0]);
  });

  it('preserva precipitação ausente como undefined em vez de criar zeros', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        ...forecastResponse,
        current: { ...forecastResponse.current, precipitation: undefined },
        daily: { ...forecastResponse.daily, precipitation_sum: undefined },
      }),
    );

    const data = await getWeather(city);

    expect(data.current.precipitationMm).toBeUndefined();
    expect(data.forecast.every((day) => day.precipitationSumMm === undefined)).toBe(true);
  });

  it.each([
    'current',
    'daily',
  ] as const)('lança WeatherServiceError se %s está ausente', async (field) => {
    fetchMock.mockResolvedValueOnce(Response.json({ ...forecastResponse, [field]: undefined }));

    const pending = getWeather(city);
    await expect(pending).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(pending).rejects.toMatchObject({
      error: {
        kind: 'invalid-response',
        reason: field === 'current' ? 'missing-current-temperature' : 'invalid-forecast',
      },
    });
  });
});

describe.each([
  { name: 'geocoding', run: () => searchCities('São Paulo') },
  { name: 'forecast', run: () => getWeather(city) },
])('falhas de API: $name', ({ run }) => {
  it('normaliza falha de rede para WeatherServiceError', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const pending = run();
    await expect(pending).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(pending).rejects.toMatchObject({
      message: 'Falha de rede.',
      error: { kind: 'network' },
    });
  });

  it('rejeita JSON malformado com erro tipado', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{', { status: 200 }));

    const pending = run();
    await expect(pending).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(pending).rejects.toMatchObject({
      error: { kind: 'invalid-response', reason: 'malformed-json' },
    });
  });

  it('aborta aos 10 segundos e limpa o timer após timeout', async () => {
    vi.useFakeTimers();
    let signal!: AbortSignal;
    fetchMock.mockImplementationOnce((_input, options) => {
      signal = options?.signal as AbortSignal;
      return new Promise<Response>((_resolve, reject) => {
        signal.addEventListener(
          'abort',
          () => {
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
      });
    });

    const outcome = run().catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(9999);
    expect(signal.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);

    const error = await outcome;
    expect(error).toBeInstanceOf(WeatherServiceError);
    expect(error).toMatchObject({
      message: 'A requisição demorou demais.',
      error: { kind: 'timeout', timeoutMs: 10000 },
    });
    expect(signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('limpa o timer quando a requisição falha antes do timeout', async () => {
    vi.useFakeTimers();
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));

    await expect(run()).rejects.toBeInstanceOf(WeatherServiceError);

    expect(vi.getTimerCount()).toBe(0);
  });
});
