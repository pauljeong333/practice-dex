import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Session, Goal } from "../types/global";
import { RootState } from "../types/redux";
import {
  getSessionRequest,
  stopSessionRequest,
  finishSessionRequest,
} from "../redux/session/actions";
import { registerSessionInterruptHandler } from "../api/sessionInterruptHandler";
import ProgressBar from "../components/PracticePage/ProgressBar";
import Timer from "../components/PracticePage/Timer";
import StopSessionModal from "../components/PracticePage/StopSessionModal";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { SessionStatuses } from "../enums/sessionStatuses";
import FinishSessionModal from "../components/PracticePage/FinishSessionModal";
import { getLocalDate } from "../library/utility/getLocalDate";

export default function PracticePage() {
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.Auth);
  const { user } = useSelector((state: RootState) => state.User);
  const { activeSession, loading, toCongrats } = useSelector(
    (state: RootState) => state.Session
  );
  const [session, setSession] = useState<Session | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState(true);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsOpen, setGoalsOpen] = useState(true);
  const [goalsHeight, setGoalsHeight] = useState<number>(0);
  const [openStopModal, setOpenStopModal] = useState(false);
  const [openFinishModal, setOpenFinishModal] = useState(false);

  const [sessionId] = useState(user?.activeSession);
  const goalsContentRef = useRef<HTMLDivElement>(null);

  const timeLeftRef = useRef(timeLeft);
  const goalsRef = useRef(goals);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    goalsRef.current = goals;
  }, [goals]);

  // Calculate goals content height when goals change or component mounts
  useEffect(() => {
    if (goalsContentRef.current) {
      const height = goalsContentRef.current.scrollHeight;
      setGoalsHeight(height);
    }
  }, [goals]);

  // Recalculate height on window resize
  useEffect(() => {
    const handleResize = () => {
      if (goalsContentRef.current) {
        const height = goalsContentRef.current.scrollHeight;
        setGoalsHeight(height);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // set session from redux or fetch if not available
  useEffect(() => {
    let isMounted = true;
    if (activeSession) {
      if (isMounted) {
        setSession(activeSession);
        setTimeLeft(activeSession.currentDuration);
        setGoals(activeSession.goals);
      }
    } else if (sessionId) {
      dispatch(getSessionRequest({ sessionId, idToken: token }));
    }
    return () => {
      isMounted = false;
    };
  }, [activeSession, dispatch, sessionId, token]);

  // Register session interrupt handler
  useEffect(() => {
    if (!sessionId || !user?.uid || toCongrats) return;
    const cleanup = registerSessionInterruptHandler({
      sessionId,
      uid: user?.uid,
      instrument: session?.instrument || "",
      totalDuration: session?.totalDuration || 0,
      dateCreated: session?.dateCreated || "",
      getCurrentTime: () => timeLeftRef.current,
      getGoals: () => goalsRef.current,
      token: token,
    });
    return () => cleanup?.();
  }, [
    sessionId,
    user?.uid,
    token,
    session?.instrument,
    session?.totalDuration,
    session?.dateCreated,
    toCongrats,
  ]);

  // Timer
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
      prev.map((g, i) => {
        if (i !== index) return g;

        const completed = !g.completed;

        return {
          ...g,
          completed,
          timeSpent: completed
            ? (session?.totalDuration || 0) - timeLeft
            : undefined,
        };
      })
    );
  };

  const stopSession = () => {
    setIsRunning(false);
    const payload = {
      sessionId,
      uid: user?.uid,
      session: {
        status: SessionStatuses.DELETED,
        currentDuration: timeLeft,
        goals: goals,
        uid_status: `${user?.uid}#deleted`,
      },
      idToken: token,
    };
    dispatch(stopSessionRequest(payload));
  };

  const finishSession = () => {
    setIsRunning(false);
    const now = new Date();
    const payload = {
      uid: user?.uid,
      sessionId,
      session: {
        status: SessionStatuses.COMPLETED,
        uid_status: `${user?.uid}#completed`,
        currentDuration: timeLeft,
        durationMinutes: Math.ceil(
          (session?.totalDuration || 0 - timeLeft) / 60
        ),
        goals: goals,
        dateCompleted: now.toISOString(),
        completedOn: getLocalDate(now),
      },
      idToken: token,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    console.log(payload);
    dispatch(finishSessionRequest(payload));
  };

  const radius = 200;
  const totalDurationSeconds = session?.totalDuration ?? 1;
  const completedGoals = goals.filter((g) => g.completed).length;

  const navigate = useNavigate();

  useEffect(() => {
    if (toCongrats) {
      navigate("/congrats", {
        state: {
          sessionId: sessionId ?? "",
          name: user?.displayName ?? "",
          totalTime: (session?.totalDuration ?? 0) - timeLeft,
          goalsCompleted: goals.filter((goal) => goal.completed),
        },
      });
    }
  }, [
    toCongrats,
    sessionId,
    user?.displayName,
    session?.totalDuration,
    timeLeft,
    goals,
    navigate,
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <div className="p-4 text-center text-xl font-semibold">
        {session?.title}
      </div>

      {/* Main layout */}
      <div className="flex flex-1 flex-col lg:flex-row max-w-6xl mx-auto w-full">
        {/* Left: Goals */}
        <div className="lg:w-1/3 px-4 py-6 flex flex-col justify-center">
          {/* Toggle */}
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setGoalsOpen(!goalsOpen)}
          >
            <p className="text-sm text-gray-600">
              {completedGoals} of {goals.length} completed
            </p>
            <button className="flex items-center gap-1 text-blue-500 text-sm">
              {goalsOpen ? (
                <>
                  <ChevronUpIcon className="w-4 h-4" />
                  Hide Goals
                </>
              ) : (
                <>
                  <ChevronDownIcon className="w-4 h-4" />
                  Show Goals
                </>
              )}
            </button>
          </div>

          <ProgressBar completedGoals={completedGoals} goals={goals.length} />

          {/* Animated goals list container */}
          <div
            className="overflow-hidden transition-all duration-300 ease-out"
            style={{
              height: goalsOpen ? `${goalsHeight}px` : "0px",
              marginTop: goalsOpen ? "16px" : "0px",
            }}
          >
            {/* Goals content */}
            <div ref={goalsContentRef}>
              <ul className="space-y-2">
                {goals.map((goal, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => toggleGoal(i)}
                      className="w-5 h-5"
                    />
                    <span
                      className={
                        goal.completed ? "line-through text-gray-400" : ""
                      }
                    >
                      {goal.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Timer & Controls */}
        <div className="flex flex-col items-center justify-center flex-1 px-4 py-6">
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

          {/* Session Controls */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setOpenStopModal(true)}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold
              transform transition-transform duration-300 hover:scale-105"
            >
              Stop
            </button>
            <button
              onClick={() => setOpenFinishModal(true)}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-green-500 text-white font-semibold
              transform transition-transform duration-300 hover:scale-105"
            >
              Finish
            </button>
          </div>
        </div>
      </div>
      <StopSessionModal
        open={openStopModal}
        onClose={setOpenStopModal}
        onConfirm={stopSession}
      />
      <FinishSessionModal
        open={openFinishModal}
        onClose={setOpenFinishModal}
        onConfirm={finishSession}
      />
    </div>
  );
}
