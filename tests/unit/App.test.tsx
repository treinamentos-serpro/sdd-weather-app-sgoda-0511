import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/mocks/weather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/services/weatherService')>();
  return { ...original, searchCities: vi.fn(), getWeather: vi.fn() };
});

const weather: WeatherData = {
  ...mockWeatherData,
  current: { ...mockWeatherData.current, temperatureC: 0 },
};

describe('App com useWeather', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(searchCities).mockResolvedValue([weather.city]);
    vi.mocked(getWeather).mockResolvedValue(weather);
  });

  afterEach(cleanup);

  it('renderiza idle, loading e success e converte as temperaturas sem novas consultas', async () => {
    const user = userEvent.setup();
    let resolveWeather!: (data: WeatherData) => void;
    vi.mocked(getWeather).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveWeather = resolve;
      }),
    );
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Nenhuma cidade selecionada' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');
    expect(searchCities).not.toHaveBeenCalled();
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(screen.getByRole('status')).toHaveTextContent('Buscando condições atuais...');
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    expect(searchCities).toHaveBeenCalledExactlyOnceWith('São Paulo');
    expect(getWeather).toHaveBeenCalledExactlyOnceWith(weather.city);

    await act(async () => {
      resolveWeather(weather);
    });

    expect(screen.getByRole('region', { name: 'Clima atual' })).toHaveTextContent('0 °C');
    const forecast = screen.getByRole('region', { name: 'Previsão para cinco dias' });
    expect(within(forecast).getAllByRole('listitem')).toHaveLength(5);
    expect(within(forecast).getByText('23 °C')).toBeVisible();
    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'false');

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByRole('region', { name: 'Clima atual' })).toHaveTextContent('32 °F');
    expect(within(forecast).getByText('73 °F')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(screen.getByRole('button', { name: 'Celsius' }));

    expect(screen.getByRole('region', { name: 'Clima atual' })).toHaveTextContent('0 °C');
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it('renderiza empty e remove o clima anterior quando a busca não tem resultados', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    await user.type(input, 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('region', { name: 'Clima atual' })).toBeVisible();
    vi.mocked(searchCities).mockResolvedValueOnce([]);

    await user.clear(input);
    await user.type(input, 'Atlantis');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('heading', { name: 'Cidade não encontrada' })).toBeVisible();
    expect(screen.queryByRole('region', { name: 'Clima atual' })).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledTimes(1);
  });

  it('exibe a mensagem de erro do hook e o botão de retry repete a consulta', async () => {
    const user = userEvent.setup();
    vi.mocked(getWeather).mockRejectedValueOnce(
      new WeatherServiceError({ kind: 'timeout', timeoutMs: 10000 }),
    );
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    await user.type(screen.getByRole('searchbox', { name: 'Cidade' }), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('A requisição demorou demais.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('region', { name: 'Clima atual' })).toHaveTextContent('32 °F');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(searchCities).toHaveBeenLastCalledWith('São Paulo');
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(getWeather).toHaveBeenLastCalledWith(weather.city);
  });
});
