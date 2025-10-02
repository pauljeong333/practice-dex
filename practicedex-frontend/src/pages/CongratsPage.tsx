import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { RootState } from "../types/redux";
import Confetti from "react-confetti";
import { Goal } from "../types/global";
import { Check } from "lucide-react";
import {
  finishCongratsRequest,
  finishCongratsSuccess,
} from "../redux/session/actions";
import StarRating from "../components/PracticePage/StarRating";

interface CongratsPageProps {
  sessionId: string;
  name: string;
  totalTime: number;
  goalsCompleted: Goal[];
}

export default function CongratsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useSelector((state: RootState) => state.Auth);
  const { loading } = useSelector((state: RootState) => state.Session);
  const { user } = useSelector((state: RootState) => state.User);

  const state = location.state as CongratsPageProps;

  const [overallRating, setOverallRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [showConfetti, setShowConfetti] = useState(true);

  // Per-goal ratings (1-5)
  const [goalRatings, setGoalRatings] = useState<Record<string, number>>(() =>
    state?.goalsCompleted.reduce((acc, goal) => {
      acc[goal.id] = 0;
      return acc;
    }, {} as Record<string, number>)
  );

  // Redirect to home if no state
  useEffect(() => {
    if (!state) navigate("/home");
  }, [state, navigate]);

  // Auto-stop confetti
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!state) return null;

  const { sessionId, name, totalTime, goalsCompleted } = state;
  const totalMinutes = Math.ceil(totalTime / 60);

  const handleOverallRate = (value: number) => setOverallRating(value);
  const handleGoalRate = (goalId: string, value: number) => {
    setGoalRatings((prev) => ({ ...prev, [goalId]: value }));
  };

  const onHome = () => {
    // Create updated goals array with performanceScore
    const newGoals = goalsCompleted.map((goal) => ({
      ...goal,
      performanceScore: goalRatings[goal.id] || null,
    }));

    const payload = {
      sessionId,
      uid: user?.uid,
      session: {
        stars: overallRating || null,
        notes: notes.trim() || null,
        goals: newGoals,
      },
      idToken: token,
    };

    if (
      overallRating ||
      notes.trim() ||
      newGoals.some((g) => g.performanceScore)
    )
      dispatch(finishCongratsRequest(payload));
    else dispatch(finishCongratsSuccess());
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white p-6 overflow-hidden">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

      <h1 className="text-3xl font-bold text-green-700 mb-4 z-10">
        🎉 Congrats {name}!
      </h1>

      {/* Stats and Completed Goals */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 space-y-4 z-10">
        <div className="flex justify-between">
          <span className="text-gray-600">Total practice time:</span>
          <span className="font-semibold">{`${totalMinutes}m`}</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-gray-600">Completed goals:</span>
          <p className="text-xs text-gray-500 italic mb-2">
            ⭐ Tip: Rate your completed goals so the AI coach can learn from
            your feedback and suggest better sessions.
          </p>
          <ul className="list-none pl-0 space-y-2">
            {goalsCompleted.map((goal) => (
              <li key={goal.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">{goal.text}</span>
                </div>
                <div className="ml-7">
                  <StarRating
                    value={goalRatings[goal.id]}
                    onRate={(value) => handleGoalRate(goal.id, value)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Overall Session Rating */}
      <div className="mt-8 w-full max-w-md text-center z-10">
        <p className="text-gray-700 mb-3">Rate your session:</p>
        <StarRating onRate={handleOverallRate} value={overallRating} />
      </div>

      {/* Notes Section */}
      <div className="mt-8 w-full max-w-md z-10">
        <label className="block text-gray-700 mb-2 font-medium">
          Add session notes:
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write down your thoughts, progress, or ideas..."
          className="w-full min-h-[120px] border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      {/* Back to Home */}
      <button
        onClick={onHome}
        disabled={loading}
        className="
          mt-10 w-full max-w-md px-4 py-3 rounded-lg transition
          bg-green-600 text-white font-semibold hover:bg-green-700 z-10
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600
        "
      >
        Back to Home
      </button>
    </div>
  );
}
