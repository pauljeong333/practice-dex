import { Session } from "../../types/global";

export function calculateStreak(sessions: Session[]): number {
  if (!sessions || sessions.length === 0) return 0;

  const completedDates = sessions
    .map((s) => s.completedOn)
    .filter((date): date is string => date !== null);

  if (completedDates.length === 0) return 0;

  const uniqueDates = Array.from(new Set(completedDates)).sort((a, b) =>
    a > b ? -1 : 1
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < uniqueDates.length; i++) {
    const sessionDate = new Date(uniqueDates[i]);
    sessionDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === streak) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }

  return streak;
}
