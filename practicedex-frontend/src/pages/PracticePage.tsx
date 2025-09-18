import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Session, Goal } from "../types/global";
import { RootState } from "../types/redux";
import { getSessionRequest } from "../redux/session/actions";
import { auth } from "../firebase";
import ProgressBar from "../components/PracticePage/ProgressBar";
import Timer from "../components/PracticePage/Timer";

export default function PracticePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.User);
  const { activeSession } = useSelector((state: RootState) => state.Session);

  const [session, setSession] = useState<Session | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);

  const sessionId = user?.activeSession;

  // Load session from Redux
  useEffect(() => {
    let isMounted = true;

    if (!activeSession && sessionId) {
      const fetchSession = async () => {
        try {
          const token = await auth.currentUser?.getIdToken();
          if (isMounted) {
            dispatch(
              getSessionRequest({ sessionId: sessionId, idToken: token })
            );
          }
        } catch (error) {
          console.error("Failed to fetch session:", error);
        }
      };
      fetchSession();
    } else if (activeSession) {
      if (isMounted) {
        setSession(activeSession);

        setTimeLeft(activeSession.currentDuration);

        setGoals(activeSession.goals);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [activeSession, dispatch, sessionId]);

  // countdown logic
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  const toggleGoal = (index: number) => {
    setGoals((prev) =>
      prev.map((g, i) => (i === index ? { ...g, completed: !g.completed } : g))
    );
  };

  // timer ring setup
  const radius = 200;
  const totalDurationSeconds = session?.totalDuration ?? 1;

  const completedGoals = goals.filter((g) => g.completed).length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-md p-4">
        <h1 className="text-xl font-semibold text-center flex-1">
          {user?.displayName}'s {session?.instrument} Session
        </h1>
      </div>

      <Timer
        radius={radius}
        timeLeft={timeLeft}
        totalDurationSeconds={totalDurationSeconds}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        setTimeLeft={setTimeLeft}
        setGoals={setGoals}
        sessionGoals={session?.goals}
      />

      {/* Goals */}
      <div className="w-full max-w-md mt-8 px-4">
        <p className="text-sm text-gray-600 mb-2">
          {completedGoals} of {goals.length} completed
        </p>
        <ProgressBar completedGoals={completedGoals} goals={goals.length} />
        <ul className="mt-4 space-y-2">
          {goals.map((goal, i) => (
            <li key={i} className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={goal.completed}
                onChange={() => toggleGoal(i)}
                className="w-5 h-5"
              />
              <span
                className={goal.completed ? "line-through text-gray-400" : ""}
              >
                {goal.text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
