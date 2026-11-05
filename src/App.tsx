import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { mockWeatherData } from './mocks/weather';
import type { AsyncState, Unit, WeatherData } from './types/weather';

function normalizeCityName(city: string): string {
  return city
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const [weatherState, setWeatherState] = useState<AsyncState<WeatherData>>({ status: 'idle' });
  const [lastQuery, setLastQuery] = useState('');

  async function searchMockWeather(city: string): Promise<void> {
    const query = city.trim();
    setLastQuery(query);
    setWeatherState({ status: 'loading' });

    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 300);
      });

      if (normalizeCityName(query) !== normalizeCityName(mockWeatherData.city.name)) {
        setWeatherState({ status: 'empty' });
        return;
      }

      if (mockWeatherData.forecast.length !== 5) {
        setWeatherState({
          status: 'error',
          error: { kind: 'invalid-response', reason: 'invalid-forecast' },
        });
        return;
      }

      setWeatherState({ status: 'success', data: mockWeatherData });
    } catch {
      setWeatherState({ status: 'error', error: { kind: 'network' } });
    }
  }

  function handleRetry() {
    if (lastQuery) {
      void searchMockWeather(lastQuery);
    }
  }

  function renderContent() {
    switch (weatherState.status) {
      case 'idle':
        return (
          <EmptyState
            title="Nenhuma cidade selecionada"
            hint="Os dados meteorológicos aparecerão aqui após a seleção."
          />
        );
      case 'loading':
        return <LoadingState message="Buscando condições atuais..." />;
      case 'empty':
        return (
          <div role="status" aria-live="polite" aria-atomic="true">
            <EmptyState
              title="Cidade não encontrada"
              hint="Confira a grafia do nome e tente novamente."
            />
          </div>
        );
      case 'error':
        return (
          <ErrorState
            message="Não foi possível carregar os dados meteorológicos."
            onRetry={handleRetry}
          />
        );
      case 'success':
        return (
          <div className="space-y-8">
            <p role="status" className="sr-only">
              Previsão carregada para {weatherState.data.city.name}.
            </p>
            <CurrentWeather
              city={weatherState.data.city}
              current={weatherState.data.current}
              unit={unit}
            />
            <ForecastList forecast={weatherState.data.forecast} unit={unit} />
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-night-900 via-night-800 to-night-900 text-white">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-night-700 px-4 py-3 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
      >
        Pular para o conteúdo
      </a>
      <header className="border-b border-white/10 bg-night-900/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <a href="/" aria-label="Clima, início" className="flex shrink-0 items-center gap-3">
            <span aria-hidden="true" className="text-2xl">
              🌦️
            </span>
            <span className="text-xl font-semibold text-white">Clima</span>
          </a>
          <div className="flex w-full flex-col gap-3 sm:max-w-2xl sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <SearchBar
                onSearch={(city) => void searchMockWeather(city)}
                disabled={weatherState.status === 'loading'}
              />
            </div>
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        aria-busy={weatherState.status === 'loading'}
        className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:py-10"
      >
        <h1 className="sr-only">Previsão do tempo</h1>
        {renderContent()}
      </main>
    </div>
  );
}
