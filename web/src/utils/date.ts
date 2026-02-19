export function formatToLocalDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

export function formatToLocalDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

export function formatToLocalTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
}

export function toISODateTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function getDay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { weekday: "long" });
}

export function getTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
