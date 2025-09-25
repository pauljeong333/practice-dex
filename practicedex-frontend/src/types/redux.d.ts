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
  sessionReady: boolean;
  activeSession: Session;
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
