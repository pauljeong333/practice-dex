import { useParams } from "react-router-dom";

export default function PracticePage() {
  const { sessionId } = useParams();

  return (
    <div>
      <h1>Practice Session</h1>
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
