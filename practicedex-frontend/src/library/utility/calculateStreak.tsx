import { Session } from "../../types/global";

export function calculateStreak(sessions: Session[]): number {
  if (!sessions || sessions.length === 0) return 0;

  const completedDates = sessions
    .map((s) => s.completedOn)
    .filter((date): date is string => !!date);

  if (completedDates.length === 0) return 0;

  const uniqueDates = Array.from(new Set(completedDates)).sort((a, b) =>
    a > b ? -1 : 1
  );

  const today = formatLocalDate(new Date());
  const yesterday = formatLocalDate(new Date(Date.now() - 1000 * 60 * 60 * 24));

  let startDate: string;
  if (uniqueDates.includes(today)) {
    startDate = today;
  } else if (uniqueDates.includes(yesterday)) {
    startDate = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  const current = new Date(startDate + "T00:00:00");

  while (true) {
    const currentStr = formatLocalDate(current);
    if (uniqueDates.includes(currentStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
