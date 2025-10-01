import { Session } from "../../types/global";

export function calculateLongestStreak(sessions: Session[]): number {
  if (!sessions || sessions.length === 0) return 0;

  const completedDates = sessions
    .map((s) => s.completedOn)
    .filter((date): date is string => !!date);

  if (completedDates.length === 0) return 0;

  const uniqueDates = Array.from(new Set(completedDates)).sort();

  let longest = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1] + "T00:00:00");
    const curr = new Date(uniqueDates[i] + "T00:00:00");

    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      currentStreak++;
      longest = Math.max(longest, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longest;
}
