export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  dateCreated: string | null;
  isNewUser: boolean;
  activeSession: string | null;
}

export interface Session {
  session_id: string;
  uid: string;
  title: string;
  instrument: string;
  goals: Goal[];
  totalDuration: number;
  currentDuration: number;
  status: string;
  stars: number;
  notes: string | null;
  dateCreated: string;
  dateCompleted: string | null;
  completedOn: string | null;
}

export interface Goal {
  text: string;
  completed: boolean;
}
