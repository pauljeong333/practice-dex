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
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState(""); // NEW
  const [showConfetti, setShowConfetti] = useState(true);
  const { token } = useSelector((state: RootState) => state.Auth);
  const { loading } = useSelector((state: RootState) => state.Session);
  const { user } = useSelector((state: RootState) => state.User);
  const state = location.state as CongratsPageProps;

  // Redirect to home if no state is present
  useEffect(() => {
    if (!state) {
      navigate("/home");
    }
  }, [state, navigate]);

  // Auto-stop confetti after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  // Return null while redirecting
  if (!state) {
    return null;
  }

  const { sessionId, name, totalTime, goalsCompleted } = state;
  const totalMinutes = Math.ceil(totalTime / 60);

  const handleRate = (value: number) => {
    setRating(value);
  };

  const onHome = () => {
    if (rating || notes.trim()) {
      const payload = {
        sessionId,
        uid: user?.uid,
        session: {
          stars: rating,
          notes: notes.trim() || null,
        },
        idToken: token,
      };
      dispatch(finishCongratsRequest(payload));
    } else {
      dispatch(finishCongratsSuccess());
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white p-6 overflow-hidden">
      {/* Confetti */}
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}

      {/* Congrats Header */}
      <h1 className="text-3xl font-bold text-green-700 mb-4 z-10">
        🎉 Congrats {name}!
      </h1>

      {/* Stats */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 space-y-4 z-10">
        <div className="flex justify-between">
          <span className="text-gray-600">Total practice time:</span>
          <span className="font-semibold">{`${totalMinutes}m`}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-gray-600">Completed goals:</span>
          <ul className="list-none pl-0">
            {goalsCompleted.map((goal, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-semibold">{goal.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Rating Section */}
      <div className="mt-8 w-full max-w-md text-center z-10">
        <p className="text-gray-700 mb-3">Rate your session:</p>
        <StarRating onRate={handleRate} />
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
