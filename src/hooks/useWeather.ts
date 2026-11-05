import { useEffect, useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { AsyncState, City, WeatherData } from '../types/weather';

interface WeatherState {
  status: AsyncState<WeatherData>['status'];
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
}

interface UseWeatherResult extends WeatherState {
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

type WeatherOperation = { kind: 'search'; name: string } | { kind: 'select-city'; city: City };

export default function useWeather(): UseWeatherResult {
  const [state, setState] = useState<WeatherState>({
    status: 'idle',
    data: null,
    cities: [],
    error: null,
    query: '',
  });
  const requestId = useRef(0);
  const lastOperation = useRef<WeatherOperation | null>(null);

  useEffect(() => {
    return () => {
      requestId.current += 1;
    };
  }, []);

  async function execute(operation: WeatherOperation): Promise<void> {
    const currentRequestId = ++requestId.current;
    lastOperation.current = operation;
    setState((previous) => ({
      ...previous,
      status: 'loading',
      data: null,
      error: null,
      query: operation.kind === 'search' ? operation.name : previous.query,
      cities: operation.kind === 'search' ? [] : previous.cities,
    }));

    try {
      let city: City;
      if (operation.kind === 'search') {
        const cities = await searchCities(operation.name);
        if (currentRequestId !== requestId.current) {
          return;
        }

        if (cities.length === 0) {
          setState((previous) => ({ ...previous, status: 'empty', cities: [] }));
          return;
        }

        setState((previous) => ({ ...previous, cities }));
        city = cities[0];
      } else {
        city = operation.city;
      }

      const data = await getWeather(city);
      if (currentRequestId === requestId.current) {
        setState((previous) => ({ ...previous, status: 'success', data }));
      }
    } catch (error) {
      if (currentRequestId === requestId.current) {
        setState((previous) => ({
          ...previous,
          status: 'error',
          error:
            error instanceof WeatherServiceError
              ? error.message
              : 'Não foi possível carregar os dados meteorológicos.',
        }));
      }
    }
  }

  function search(name: string): Promise<void> {
    return execute({ kind: 'search', name: name.trim() });
  }

  function selectCity(city: City): Promise<void> {
    return execute({ kind: 'select-city', city });
  }

  async function retry(): Promise<void> {
    if (lastOperation.current) {
      await execute(lastOperation.current);
    }
  }

  return { ...state, search, selectCity, retry };
}
