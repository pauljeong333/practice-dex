import { useSelector } from "react-redux";
import { RootState } from "../types/redux";

export default function PracticePage() {
  const { user } = useSelector((state: RootState) => state.User);
  const sessionId = user?.activeSession;

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
