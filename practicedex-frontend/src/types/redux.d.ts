export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  dateCreated: string | null;
  isNewUser: boolean;
  activeSession: string | null;
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
  userSessions: string[];
  sessionReady: boolean;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  Auth: AuthState;
  User: UserState;
  Session: SessionState;
}
