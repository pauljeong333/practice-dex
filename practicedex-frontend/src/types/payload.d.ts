import { Goal } from "../components/NewSessionModal/NewSessionModal";

export interface setSessionPayload {
  uid: string | undefined;
  instrument: string;
  goals: string[] | Goal[];
  duration: number;
  status: string;
}
