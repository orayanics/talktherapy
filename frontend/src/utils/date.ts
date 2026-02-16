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
