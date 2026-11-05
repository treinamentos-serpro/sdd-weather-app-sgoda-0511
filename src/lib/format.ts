export function formatDayLabel(date: string, index: number): string {
  if (index === 0) {
    return 'Hoje';
  }

  if (index === 1) {
    return 'Amanhã';
  }

  const [year, month, day] = date.split('-').map(Number);
  const localDate = new Date(Date.UTC(year, month - 1, day, 12));

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(localDate);
}

export function getShortDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const localDate = new Date(Date.UTC(year, month - 1, day, 12));

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  }).format(localDate);
}
