export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  streak: number;
  preferences: Preferences;
  dateCreated: string | null;
  isNewUser: boolean;
  activeSession: string | null;
  lastUpdated: string;
}

export interface Session {
  session_id: string;
  uid: string;
  title: string;
  instrument: string;
  goals: Goal[];
  totalDuration: number;
  currentDuration: number;
  durationMinutes: number;
  status: string;
  stars: number;
  notes: string | null;
  scheduledFor: string | null;
  dateCreated: string;
  dateCompleted: string | null;
  completedOn: string | null;
}

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  timeSpent?: number | undefined; // in seconds
  performanceScore?: number | null;
}

export interface Preferences {
  preferredSessionLength?: number;
  favoriteGoals?: string[];
  preferredTimes?: string[];
}
