import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, Session } from "../types/redux";
import { getSessionRequest } from "../redux/session/actions";

export default function PracticePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.User);
  const { activeSession } = useSelector((state: RootState) => state.Session);

  const [session, setSession] = useState<Session | null>(null);
  const sessionId = user?.activeSession;

  useEffect(() => {
    if (!activeSession) {
      dispatch(getSessionRequest(sessionId));
    } else {
      setSession(activeSession);
    }
  }, [activeSession, dispatch, sessionId]);

  console.log(user);
  console.log(activeSession);
  console.log(session);

  return (
    <div>
      <h1>Practice Session</h1>
      <h2>Session ID: {sessionId}</h2>
      {/* <p>Instrument: {props.instrument}</p>
      <p>Duration: {props.duration}</p>
      <h2>Goals</h2>
      <ul>
        {props.goals.map((goal, index) => (
          <li key={index}>{goal}</li>
        ))}
      </ul> */}
    </div>
  );
}
