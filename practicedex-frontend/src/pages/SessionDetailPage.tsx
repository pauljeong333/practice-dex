import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../types/redux";
import { ArrowLeft, Star } from "lucide-react";
import { Session } from "../types/global";

export default function SessionDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedSession = (location.state as { session?: Session })?.session;

  const sessionFromStore = useSelector((state: RootState) =>
    state.Session.userSessions.find((s) => s.session_id === sessionId)
  );

  const session: Session | undefined = passedSession || sessionFromStore;

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-gray-500">Session not found.</p>
      </div>
    );
  }

  const {
    title,
    instrument,
    goals,
    dateCompleted,
    totalDuration,
    currentDuration,
    stars,
    notes,
  } = session;

  return (
    <div className="min-h-screen flex justify-center p-6">
      <div className="w-full max-w-4xl space-y-6">
        {/* back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
        >
          <ArrowLeft size={18} /> Back
        </button>

        {/* title & date */}
        <div>
          <h1 className="text-2xl font-semibold">
            {title || "Untitled Session"}
          </h1>
          <p className="text-gray-500 text-sm">
            {dateCompleted
              ? `${new Date(dateCompleted).toLocaleDateString()} ${new Date(
                  dateCompleted
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "No date"}
          </p>
        </div>

        {/* Grid of main stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card label="Instrument" value={instrument || "-"} />
          <Card
            label="Duration"
            value={`${Math.ceil((totalDuration - currentDuration) / 60)} min`}
          />
          <Card label="Rating">
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < (stars || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Full-width Goals */}
        <Card label="Goals" fullWidth>
          {goals.length > 0 ? (
            <ul className="space-y-1">
              {goals.map((goal, index) => (
                <li key={index} className="text-lg flex items-center gap-2">
                  <span>{goal.completed ? "✅" : "❌"}</span>
                  <span>{goal.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lg">-</p>
          )}
        </Card>

        {/* Full-width Notes */}
        {notes && <Card label="Notes" multiline value={notes} fullWidth />}
      </div>
    </div>
  );
}

interface CardProps {
  label: string;
  value?: string;
  children?: React.ReactNode;
  multiline?: boolean;
  fullWidth?: boolean;
}

function Card({ label, value, children, multiline }: CardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-sm text-gray-500 mb-1">{label}</h2>
      {children ? (
        children
      ) : (
        <p className={multiline ? "whitespace-pre-wrap" : "text-lg"}>{value}</p>
      )}
    </div>
  );
}
