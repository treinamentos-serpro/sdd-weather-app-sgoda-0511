import { formatTemperature } from '../lib/temperature';
import { getWeatherInfo } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatMetric(value: number | undefined, unit: string): string {
  return value === undefined ? 'Indisponível' : `${value} ${unit}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const weatherInfo = getWeatherInfo(current.weatherCode);
  const locationDetails = [city.adminRegion, city.country].filter(Boolean).join(' · ');

  return (
    <section
      aria-labelledby="current-weather-title"
      className="rounded-lg border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-md sm:p-7"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 id="current-weather-title" className="text-sm font-semibold text-white/70">
            Clima atual
          </h2>
          <p className="mt-1 break-words text-lg font-semibold text-white">
            {city.name}
            {locationDetails && (
              <span className="break-words text-white/60"> · {locationDetails}</span>
            )}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span aria-hidden="true" className="text-4xl">
              {weatherInfo.icon}
            </span>
            <p className="min-w-0 break-words text-base text-white/80">{weatherInfo.description}</p>
          </div>
        </div>

        <p className="tabular-nums text-6xl font-semibold leading-none text-white sm:text-7xl">
          {formatTemperature(current.temperatureC, unit)}
        </p>
      </div>

      <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="min-w-0 rounded-md border border-white/10 bg-night-800/70 p-3">
          <dt className="text-xs font-medium text-white/60">Umidade</dt>
          <dd className="mt-1 break-words text-base font-semibold text-white">
            {formatMetric(current.relativeHumidityPercent, '%')}
          </dd>
        </div>
        <div className="min-w-0 rounded-md border border-white/10 bg-night-800/70 p-3">
          <dt className="text-xs font-medium text-white/60">Vento</dt>
          <dd className="mt-1 break-words text-base font-semibold text-white">
            {formatMetric(current.windSpeedKmh, 'km/h')}
          </dd>
        </div>
        <div className="min-w-0 rounded-md border border-white/10 bg-night-800/70 p-3">
          <dt className="text-xs font-medium text-white/60">Precipitação</dt>
          <dd className="mt-1 break-words text-base font-semibold text-white">
            {formatMetric(current.precipitationMm, 'mm')}
          </dd>
        </div>
        <div className="min-w-0 rounded-md border border-white/10 bg-night-800/70 p-3">
          <dt className="text-xs font-medium text-white/60">Pressão</dt>
          <dd className="mt-1 break-words text-base font-semibold text-white">
            {formatMetric(current.pressureHpa, 'hPa')}
          </dd>
        </div>
      </dl>
    </section>
  );
}
