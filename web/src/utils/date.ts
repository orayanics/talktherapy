// formatToLocalDateTime returns in this format: "MM/DD/YYYY, HH:MM:SS AM/PM"
export function formatToLocalDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// formatToLocalDate returns in this format: "MM/DD/YYYY"
export function formatToLocalDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// formatToLocalTime returns in this format: "HH:MM:SS AM/PM"
export function formatToLocalTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
}

// toISODateTime converts a date and time string into an ISO 8601 formatted string, which is commonly used for API communication. The input date should be in "YYYY-MM-DD" format and time should be in "HH:MM" format.
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
