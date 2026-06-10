/** Clé jour locale YYYY-MM-DD. */
export function dayKey(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function todayKey(): string {
  return dayKey(new Date());
}

/** Horodatage ISO pour aujourd'hui (heure fixée à 08:00 locale pour la stabilité). */
export function todayAttendanceIso(): string {
  const d = new Date();
  d.setHours(8, 0, 0, 0);
  return d.toISOString();
}
