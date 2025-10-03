interface Preferences {
  preferredSessionLength?: number;
  favoriteGoals?: { id: string; text: string; totalTimeSpent: number }[];
  preferredTimes?: string[];
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  timeSpent: number | undefined; // in seconds
  performanceScore: number | null;
}

interface CompletedSession {
  durationMinutes: number;
  dateCreated: string; // stored in UTC
  goals: Goal[];
}

export function updatePreferences(
  oldPreferences: Preferences,
  completedSessions: CompletedSession[],
  userTimezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): Preferences {
  if (!completedSessions || completedSessions.length === 0)
    return oldPreferences;

  // --- 1. Preferred Session Length (average duration)
  const totalDuration = completedSessions.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  );
  const avgDuration = Math.round(totalDuration / completedSessions.length);

  // --- 2. Favorite Goals (top 3 by total time spent across sessions)
  const goalStats: Record<string, { text: string; totalTime: number }> = {};

  completedSessions.forEach((s) =>
    s.goals.forEach((g) => {
      if (g.completed && g.timeSpent) {
        if (!goalStats[g.id]) {
          goalStats[g.id] = { text: g.text, totalTime: 0 };
        }
        goalStats[g.id].totalTime += g.timeSpent; // in seconds
      }
    })
  );

  const favoriteGoals = Object.entries(goalStats)
    .sort((a, b) => b[1].totalTime - a[1].totalTime)
    .slice(0, 3)
    .map(([id, { text, totalTime }]) => ({
      id,
      text,
      totalTimeSpent: totalTime,
    }));

  // --- 3. Preferred Times (local timezone: morning / afternoon / evening)
  const timeBuckets = { morning: 0, afternoon: 0, evening: 0 };

  completedSessions.forEach((s) => {
    const utcDate = new Date(s.dateCreated);

    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: userTimezone,
    });

    const hour = parseInt(formatter.format(utcDate), 10);

    if (hour >= 5 && hour < 12) timeBuckets.morning++;
    else if (hour >= 12 && hour < 18) timeBuckets.afternoon++;
    else timeBuckets.evening++;
  });

  const preferredTimes = Object.entries(timeBuckets)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([bucket]) => bucket);

  return {
    preferredSessionLength: avgDuration,
    favoriteGoals,
    preferredTimes,
  };
}
