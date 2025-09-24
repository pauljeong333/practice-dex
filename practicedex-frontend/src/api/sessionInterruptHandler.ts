import { API } from "../enums/api";
import { SessionStatuses } from "../enums/sessionStatuses";
import { Goal } from "../types/global";

type SessionInterruptHandlerOptions = {
  sessionId: string;
  uid: string;
  instrument: string;
  totalDuration: number;
  getCurrentTime: () => number;
  getGoals: () => Goal[];
  token: string | null;
  dateCreated: string;
};

export function registerSessionInterruptHandler({
  sessionId,
  uid,
  instrument,
  totalDuration,
  getCurrentTime,
  getGoals,
  token,
  dateCreated,
}: SessionInterruptHandlerOptions) {
  const handleUnload = async (status: string) => {
    try {
      const body = {
        sessionId,
        session: {
          status: status,
          currentDuration: getCurrentTime(),
          goals: getGoals(),
        },
      };

      const interruptedSession = {
        sessionId,
        uid,
        instrument,
        totalDuration,
        currentDuration: getCurrentTime(),
        goals: getGoals(),
        status,
        dateCreated,
      };

      localStorage.setItem(
        "interruptedSession",
        JSON.stringify(interruptedSession)
      );

      await fetch(API.UPDATE_SESSION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        keepalive: true,
      });
    } catch (err) {
      console.error("Failed to sync session on exit:", err);
    }
  };

  const beforeUnloadHandler = () => handleUnload(SessionStatuses.PAUSED);
  const visibilityChangeHandler = () => {
    if (document.visibilityState === "hidden") {
      handleUnload(SessionStatuses.PAUSED);
    }
  };

  window.addEventListener("beforeunload", beforeUnloadHandler);
  window.addEventListener("visibilitychange", visibilityChangeHandler);

  // Cleanup
  return () => {
    window.removeEventListener("beforeunload", beforeUnloadHandler);
    window.removeEventListener("visibilitychange", visibilityChangeHandler);
  };
}
