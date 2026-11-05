import { useId } from 'react';
import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="space-y-4">
      <h2 id={headingId} className="text-lg font-semibold text-white">
        Previsão para cinco dias
      </h2>
      {forecast.length === 0 ? (
        <p className="text-sm text-white/70">Previsão indisponível.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {forecast.map((day, index) => (
            <li key={day.date}>
              <ForecastCard day={day} index={index} unit={unit} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
