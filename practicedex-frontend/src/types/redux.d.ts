import { User, Session } from "./global";
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
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
  schedule: {
    scheduledSessions: Session[];
    loading: boolean;
    error: string | null;
    scheduled: boolean;
  };
  sessionReady: boolean;
  activeSession: Session;
  recommendedSession: Session;
  toHome: boolean;
  toCongrats: boolean;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  Auth: AuthState;
  User: UserState;
  Session: SessionState;
}
