import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useWeather from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/mocks/weather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/services/weatherService')>();
  return { ...original, searchCities: vi.fn(), getWeather: vi.fn() };
});

const firstCity = mockWeatherData.city;
const secondCity: City = { name: 'Recife', latitude: -8.05, longitude: -34.88 };
const secondWeather: WeatherData = { ...mockWeatherData, city: secondCity };

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe('useWeather', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(searchCities).mockResolvedValue([firstCity, secondCity]);
    vi.mocked(getWeather).mockResolvedValue(mockWeatherData);
  });

  afterEach(cleanup);

  it('inicia em idle e retry sem operação não chama serviços', async () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current).toMatchObject({
      status: 'idle',
      data: null,
      cities: [],
      error: null,
      query: '',
    });
    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).not.toHaveBeenCalled();
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('busca cidades e carrega o clima da primeira preservando todos os resultados', async () => {
    const { result } = renderHook(() => useWeather());
    const forecast = deferred<WeatherData>();
    vi.mocked(getWeather).mockReturnValueOnce(forecast.promise);
    let pending!: Promise<void>;

    await act(async () => {
      pending = result.current.search(' São Paulo ');
    });

    expect(result.current).toMatchObject({
      status: 'loading',
      data: null,
      error: null,
      query: 'São Paulo',
      cities: [firstCity, secondCity],
    });
    expect(searchCities).toHaveBeenCalledWith('São Paulo');
    expect(getWeather).toHaveBeenCalledExactlyOnceWith(firstCity);

    await act(async () => {
      forecast.resolve(mockWeatherData);
      await pending;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toBe(mockWeatherData);
  });

  it('retorna empty sem consultar clima quando não há cidades', async () => {
    vi.mocked(searchCities).mockResolvedValue([]);
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Atlantis');
    });

    expect(result.current).toMatchObject({
      status: 'empty',
      data: null,
      cities: [],
      error: null,
      query: 'Atlantis',
    });
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('expõe erro de busca e retry repete a busca completa', async () => {
    vi.mocked(searchCities).mockRejectedValueOnce(new WeatherServiceError({ kind: 'network' }));
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('São Paulo');
    });

    expect(result.current).toMatchObject({ status: 'error', error: 'Falha de rede.', data: null });
    expect(getWeather).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(searchCities).toHaveBeenLastCalledWith('São Paulo');
    expect(result.current).toMatchObject({ status: 'success', error: null });
  });

  it('retry de busca cujo forecast falhou também repete a busca', async () => {
    vi.mocked(getWeather).mockRejectedValueOnce(
      new WeatherServiceError({ kind: 'timeout', timeoutMs: 10000 }),
    );
    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('São Paulo');
    });

    expect(result.current).toMatchObject({
      status: 'error',
      error: 'A requisição demorou demais.',
      cities: [firstCity, secondCity],
    });

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
  });

  it('selectCity mantém query e cidades; retry repete somente a seleção', async () => {
    const { result } = renderHook(() => useWeather());
    await act(async () => {
      await result.current.search('São Paulo');
    });
    vi.mocked(getWeather).mockRejectedValueOnce(new WeatherServiceError({ kind: 'network' }));

    await act(async () => {
      await result.current.selectCity(secondCity);
    });

    expect(result.current).toMatchObject({
      status: 'error',
      data: null,
      query: 'São Paulo',
      cities: [firstCity, secondCity],
    });
    vi.mocked(getWeather).mockResolvedValueOnce(secondWeather);

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenLastCalledWith(secondCity);
    expect(result.current.data).toBe(secondWeather);
    expect(result.current.error).toBeNull();
  });

  it('limpa dados anteriores assim que uma nova consulta começa', async () => {
    const { result } = renderHook(() => useWeather());
    await act(async () => {
      await result.current.search('São Paulo');
    });
    const cities = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValueOnce(cities.promise);
    let pending!: Promise<void>;

    act(() => {
      pending = result.current.search('Recife');
    });

    expect(result.current).toMatchObject({
      status: 'loading',
      data: null,
      cities: [],
      error: null,
      query: 'Recife',
    });
    await act(async () => {
      cities.resolve([]);
      await pending;
    });
  });

  it('ignora uma busca antiga sem iniciar o forecast dela', async () => {
    const cities = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValueOnce(cities.promise).mockResolvedValueOnce([secondCity]);
    vi.mocked(getWeather).mockResolvedValue(secondWeather);
    const { result } = renderHook(() => useWeather());
    let previous!: Promise<void>;

    act(() => {
      previous = result.current.search('São Paulo');
    });
    await act(async () => {
      await result.current.search('Recife');
    });
    await act(async () => {
      cities.resolve([firstCity]);
      await previous;
    });

    expect(getWeather).toHaveBeenCalledExactlyOnceWith(secondCity);
    expect(result.current).toMatchObject({
      status: 'success',
      query: 'Recife',
      data: secondWeather,
    });
  });

  it('ignora o sucesso de um forecast anterior após uma nova seleção', async () => {
    const forecast = deferred<WeatherData>();
    vi.mocked(getWeather)
      .mockReturnValueOnce(forecast.promise)
      .mockResolvedValueOnce(secondWeather);
    const { result } = renderHook(() => useWeather());
    let previous!: Promise<void>;

    act(() => {
      previous = result.current.selectCity(firstCity);
    });
    await act(async () => {
      await result.current.selectCity(secondCity);
    });
    await act(async () => {
      forecast.resolve(mockWeatherData);
      await previous;
    });

    expect(result.current).toMatchObject({ status: 'success', data: secondWeather });
  });

  it('ignora o erro de uma operação anterior', async () => {
    const forecast = deferred<WeatherData>();
    vi.mocked(getWeather)
      .mockReturnValueOnce(forecast.promise)
      .mockResolvedValueOnce(secondWeather);
    const { result } = renderHook(() => useWeather());
    let previous!: Promise<void>;

    act(() => {
      previous = result.current.selectCity(firstCity);
    });
    await act(async () => {
      await result.current.selectCity(secondCity);
    });
    await act(async () => {
      forecast.reject(new WeatherServiceError({ kind: 'network' }));
      await previous;
    });

    expect(result.current).toMatchObject({ status: 'success', data: secondWeather, error: null });
  });

  it('não inicia forecast se a busca termina após desmontagem', async () => {
    const cities = deferred<City[]>();
    vi.mocked(searchCities).mockReturnValueOnce(cities.promise);
    const { result, unmount } = renderHook(() => useWeather());
    let pending!: Promise<void>;

    act(() => {
      pending = result.current.search('São Paulo');
    });
    unmount();
    await act(async () => {
      cities.resolve([firstCity]);
      await pending;
    });

    expect(getWeather).not.toHaveBeenCalled();
  });
});
