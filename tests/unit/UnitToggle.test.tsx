import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import UnitToggle from '../../src/components/UnitToggle';
import { mockWeatherData } from '../../src/mocks/weather';
import type { Unit } from '../../src/types/weather';

const current = { ...mockWeatherData.current, temperatureC: 0 };

function WeatherWithUnit() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather city={mockWeatherData.city} current={current} unit={unit} />
    </>
  );
}

afterEach(cleanup);

describe('UnitToggle com CurrentWeather', () => {
  it('converte 0 °C para 32 °F por clique e permite voltar para Celsius', async () => {
    const user = userEvent.setup();
    render(<WeatherWithUnit />);
    const weather = screen.getByRole('region', { name: 'Clima atual' });
    const celsius = screen.getByRole('button', { name: 'Celsius' });
    const fahrenheit = screen.getByRole('button', { name: 'Fahrenheit' });

    expect(weather).toHaveTextContent('0 °C');
    expect(celsius).toHaveAttribute('aria-pressed', 'true');
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'false');

    await user.click(fahrenheit);

    expect(weather).toHaveTextContent('32 °F');
    expect(weather).not.toHaveTextContent('0 °C');
    expect(celsius).toHaveAttribute('aria-pressed', 'false');
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
    expect(current.temperatureC).toBe(0);

    await user.click(celsius);

    expect(weather).toHaveTextContent('0 °C');
    expect(celsius).toHaveAttribute('aria-pressed', 'true');
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'false');
  });

  it('alterna unidade pelo teclado e move o foco para o botão selecionado', async () => {
    const user = userEvent.setup();
    render(<WeatherWithUnit />);
    const weather = screen.getByRole('region', { name: 'Clima atual' });
    const celsius = screen.getByRole('button', { name: 'Celsius' });
    const fahrenheit = screen.getByRole('button', { name: 'Fahrenheit' });

    await user.tab();
    expect(celsius).toHaveFocus();
    await user.keyboard('{ArrowRight}');

    expect(fahrenheit).toHaveFocus();
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'true');
    expect(weather).toHaveTextContent('32 °F');

    await user.keyboard('{ArrowLeft}');

    expect(celsius).toHaveFocus();
    expect(celsius).toHaveAttribute('aria-pressed', 'true');
    expect(weather).toHaveTextContent('0 °C');
  });
});
