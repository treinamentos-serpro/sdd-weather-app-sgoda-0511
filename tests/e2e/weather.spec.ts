import { expect, type Page, test } from '@playwright/test';

async function mockWeatherApi(page: Page) {
  const requests = { geocoding: 0, forecast: 0 };

  await page.route('https://geocoding-api.open-meteo.com/v1/search?*', async (route) => {
    requests.geocoding += 1;
    const url = new URL(route.request().url());
    expect(url.searchParams.get('name')).toBe('Recife');

    await route.fulfill({
      json: {
        results: [
          {
            id: 3390760,
            name: 'Recife',
            admin1: 'Pernambuco',
            country: 'Brasil',
            country_code: 'BR',
            latitude: -8.0539,
            longitude: -34.8811,
          },
        ],
      },
    });
  });

  await page.route('https://api.open-meteo.com/v1/forecast?*', async (route) => {
    requests.forecast += 1;
    const url = new URL(route.request().url());
    expect(url.searchParams.get('latitude')).toBe('-8.0539');
    expect(url.searchParams.get('longitude')).toBe('-34.8811');
    expect(url.searchParams.get('forecast_days')).toBe('5');
    expect(url.searchParams.get('temperature_unit')).toBe('celsius');

    await route.fulfill({
      json: {
        timezone: 'America/Recife',
        current: {
          temperature_2m: 0,
          apparent_temperature: -2,
          relative_humidity_2m: 70,
          is_day: 1,
          precipitation: 0,
          surface_pressure: 1012,
          weather_code: 0,
          wind_speed_10m: 8,
          wind_direction_10m: 90,
        },
        daily: {
          time: ['2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09'],
          temperature_2m_min: [0, 1, 2, 3, 4],
          temperature_2m_max: [10, 11, 12, 13, 14],
          precipitation_probability_max: [0, 10, 20, 30, 40],
          precipitation_sum: [0, 0.2, 1, 2, 3],
          weather_code: [0, 1, 2, 3, 61],
          wind_speed_10m_max: [8, 9, 10, 11, 12],
        },
      },
    });
  });

  return requests;
}

test('busca uma cidade, exibe cinco dias e converte Celsius para Fahrenheit', async ({ page }) => {
  const requests = await mockWeatherApi(page);

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Recife');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  const currentWeather = page.getByRole('region', { name: 'Clima atual' });
  await expect(currentWeather).toBeVisible();
  await expect(currentWeather).toContainText('Recife');
  await expect(currentWeather).toContainText('Pernambuco');
  await expect(currentWeather.getByText('0 °C', { exact: true })).toBeVisible();

  const forecast = page.getByRole('region', { name: 'Previsão para cinco dias' });
  await expect(forecast).toBeVisible();
  await expect(forecast.getByRole('listitem')).toHaveCount(5);

  await page.getByRole('button', { name: 'Fahrenheit', exact: true }).click();

  await expect(currentWeather.getByText('32 °F', { exact: true })).toBeVisible();
  await expect(currentWeather.getByText('0 °C', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(requests.geocoding).toBe(1);
  expect(requests.forecast).toBe(1);
});

test('mostra Nenhuma cidade encontrada quando geocoding retorna sem results', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/v1/search?*', async (route) => {
    await route.fulfill({ json: {} });
  });
  await page.route('https://api.open-meteo.com/v1/forecast?*', async (route) => {
    forecastRequests += 1;
    await route.abort();
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Atlantis');
  await page.getByRole('button', { name: 'Buscar', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Nenhuma cidade encontrada');
  await expect(page.getByRole('region', { name: 'Clima atual' })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Previsão para cinco dias' })).toHaveCount(0);
  expect(forecastRequests).toBe(0);
});

test.describe('viewport mobile de 375x812', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('busca e renderiza o clima corretamente em mobile', async ({ page }) => {
    const requests = await mockWeatherApi(page);
    await page.goto('/');
    expect(page.viewportSize()).toEqual({ width: 375, height: 812 });
    await page.getByRole('searchbox', { name: 'Cidade' }).fill('Recife');
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();

    const currentWeather = page.getByRole('region', { name: 'Clima atual' });
    await expect(currentWeather).toBeVisible();
    await expect(currentWeather).toContainText('Recife');
    await expect(currentWeather).toContainText('Pernambuco');
    await expect(currentWeather.getByText('0 °C', { exact: true })).toBeVisible();

    const forecast = page.getByRole('region', { name: 'Previsão para cinco dias' });
    await forecast.scrollIntoViewIfNeeded();
    await expect(forecast).toBeInViewport();
    await expect(forecast.getByRole('listitem')).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      375,
    );

    await page.getByRole('button', { name: 'Fahrenheit', exact: true }).click();

    await expect(currentWeather.getByText('32 °F', { exact: true })).toBeVisible();
    expect(requests.geocoding).toBe(1);
    expect(requests.forecast).toBe(1);
  });
});
