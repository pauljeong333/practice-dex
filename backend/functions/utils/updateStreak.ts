export function updateStreak(
  currentStreak: number,
  lastSessionDate: string,
  today: Date
): number {
  const lastDate = new Date(lastSessionDate);
  const diffDays = Math.floor(
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 1) return currentStreak + 1;
  if (diffDays === 0) return currentStreak;
  return 1;
}
