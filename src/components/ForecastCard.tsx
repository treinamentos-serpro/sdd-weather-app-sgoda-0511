import { formatDayLabel } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherInfo } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

function formatForecastTemperature(value: number | undefined, unit: Unit): string {
  return value === undefined ? '—' : formatTemperature(value, unit);
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const weatherInfo = getWeatherInfo(day.weatherCode);

  return (
    <article className="h-full rounded-lg border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md">
      <h3 className="text-sm font-semibold text-white">{formatDayLabel(day.date, index)}</h3>
      <div className="mt-3 flex min-h-10 items-center">
        <span role="img" aria-label={weatherInfo.description} className="text-3xl">
          {weatherInfo.icon}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-x-3 gap-y-2 text-sm">
        <div>
          <dt className="text-xs text-white/60">Máx.</dt>
          <dd className="mt-1 break-words font-semibold text-white">
            {formatForecastTemperature(day.maxTemperatureC, unit)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-white/60">Mín.</dt>
          <dd className="mt-1 break-words font-semibold text-white">
            {formatForecastTemperature(day.minTemperatureC, unit)}
          </dd>
        </div>
        <div className="col-span-2 border-t border-white/10 pt-2">
          <dt className="text-xs text-white/60">Prob. de chuva</dt>
          <dd className="mt-1 font-medium text-white">
            {day.precipitationProbabilityPercent === undefined
              ? '—'
              : `${day.precipitationProbabilityPercent}%`}
          </dd>
        </div>
      </dl>
    </article>
  );
}
