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
  instrument: string;
  goals: Goal[];
  totalDuration: number;
  currentDuration: number;
  status: string;
  stars: number;
  dateCreated: string;
}

export interface Goal {
  text: string;
  completed: boolean;
}
