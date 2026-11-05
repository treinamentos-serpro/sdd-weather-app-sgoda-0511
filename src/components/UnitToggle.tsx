import { type KeyboardEvent, useRef } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const celsiusButtonRef = useRef<HTMLButtonElement>(null);
  const fahrenheitButtonRef = useRef<HTMLButtonElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();

    const nextUnit: Unit =
      event.currentTarget === celsiusButtonRef.current ? 'fahrenheit' : 'celsius';
    const nextButtonRef = nextUnit === 'celsius' ? celsiusButtonRef : fahrenheitButtonRef;

    nextButtonRef.current?.focus();

    if (nextUnit !== unit) {
      onChange(nextUnit);
    }
  }

  const buttonClasses =
    'min-h-11 min-w-12 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900';

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
    >
      <button
        ref={celsiusButtonRef}
        type="button"
        aria-label="Celsius"
        aria-pressed={unit === 'celsius'}
        tabIndex={unit === 'celsius' ? 0 : -1}
        onClick={() => onChange('celsius')}
        onKeyDown={handleKeyDown}
        className={`${buttonClasses} ${unit === 'celsius' ? 'bg-accent-500 text-night-900' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
      >
        °C
      </button>
      <button
        ref={fahrenheitButtonRef}
        type="button"
        aria-label="Fahrenheit"
        aria-pressed={unit === 'fahrenheit'}
        tabIndex={unit === 'fahrenheit' ? 0 : -1}
        onClick={() => onChange('fahrenheit')}
        onKeyDown={handleKeyDown}
        className={`${buttonClasses} ${unit === 'fahrenheit' ? 'bg-accent-500 text-night-900' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
      >
        °F
      </button>
    </div>
  );
}
