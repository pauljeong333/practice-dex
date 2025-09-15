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
  goals: string[];
  duration: number;
  status: string;
  dateCreated: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  app: {
    loading: boolean;
    error: string | null;
    appCanStart: boolean;
  };
  signin: {
    loading: boolean;
    error: string | null;
  };
}

export interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface SessionState {
  userSessions: Session[];
  sessionReady: boolean;
  activeSession: Session;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  Auth: AuthState;
  User: UserState;
  Session: SessionState;
}
