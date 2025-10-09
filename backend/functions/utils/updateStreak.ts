export function updateStreak(
  currentStreak: number,
  lastSessionDate: string,
  today: Date
): number {
  const lastDate = new Date(lastSessionDate);

  // Calculate difference in local days
  const lastLocalDay =
    lastDate.getFullYear() * 10000 +
    (lastDate.getMonth() + 1) * 100 +
    lastDate.getDate();
  const todayLocalDay =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();

  const diffDays = todayLocalDay - lastLocalDay;

  if (diffDays === 1) return currentStreak + 1;
  if (diffDays === 0) return currentStreak;
  return 1;
}
