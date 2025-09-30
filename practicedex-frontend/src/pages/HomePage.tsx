import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../types/redux";
import PracticeSessionModal from "../components/NewSessionModal/NewSessionModal";
import ResumeSessionModal from "../components/ResumeSessionModal";
import Loader from "../components/utility/Loader";
import {
  resumeSessionRequest,
  stopSessionRequest,
} from "../redux/session/actions";
import { SessionStatuses } from "../enums/sessionStatuses";
import { calculateStreak } from "../library/utility/calculateStreak";

export default function HomePage() {
  const dispatch = useDispatch();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const { token } = useSelector((state: RootState) => state.Auth);
  const { user } = useSelector((state: RootState) => state.User);
  const { userSessions } = useSelector((state: RootState) => state.Session);

  const quotes = [
    "Practice makes perfect… or at least pretty good!",
    "Keep going — even turtles reach the finish line.",
    "Every small step is secretly a giant leap.",
    "Mistakes are just proof that you’re trying.",

    "Every note you play is a step closer to mastery.",
    "The only bad practice is the one you skip.",
    "Play it loud, play it proud, play it again.",
    "Practice is the key that unlocks musical magic.",
    "Consistency beats talent when talent skips practice.",
    "Practice like you're performing, and perform like you're practicing.",

    "Even Mozart had to start somewhere — probably on the wrong note.",
    "Keep practicing; one day you’ll sound like a rockstar… or at least a popstar.",
    "Turn your practice into a game, and the music will play itself.",
    "Turn on your metronome.",
  ];

  // Onboarding modal + initial quote
  useEffect(() => {
    if (user) {
      if (user.isNewUser) setShowOnboardingModal(true);
    }
    setQuoteIndex(Math.floor(Math.random() * quotes.length));
  }, [user, quotes.length]);

  // Animate quotes with fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);

      const timeout = setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
        setFade(true);
      }, 1500);

      return () => clearTimeout(timeout);
    }, 10000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  // Check for unfinished session
  useEffect(() => {
    if (user?.activeSession) {
      setShowResumeModal(true);
    }
  }, [user?.activeSession]);

  // calculate streak
  useEffect(() => {
    if (userSessions) {
      setStreak(calculateStreak(userSessions));
    }
  }, [userSessions]);

  const handleResumeSession = () => {
    const payload = {
      sessionId: user?.activeSession,
      idToken: token,
    };
    dispatch(resumeSessionRequest(payload));
  };

  const handleDiscardSession = () => {
    const payload = {
      sessionId: user?.activeSession,
      uid: user?.uid,
      session: {
        status: SessionStatuses.DELETED,
      },
      idToken: token,
    };
    dispatch(stopSessionRequest(payload));
  };

  if (!user) return <Loader />;

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-12">
      {/* Greeting + Animated Quote */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-6">
          Welcome back{user.displayName ? `, ${user.displayName}` : ""}!
        </h1>
        <p
          className={`text-xl text-gray-600 italic transition-opacity duration-[1500ms] ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          {quotes[quoteIndex]}
        </p>
      </div>

      {/* Main Content: Two Columns */}
      <div className="flex flex-col lg:flex-row w-full max-w-4xl gap-12 mb-16">
        {/* Left Column: Progress */}
        <div className="flex flex-col gap-6 flex-1">
          <div className="p-10 bg-white rounded-xl shadow-lg flex flex-col items-center">
            <span className="text-gray-500 text-lg">Current Streak</span>
            <span className="text-4xl font-bold text-blue-600 mt-3">
              {streak !== null ? `${streak} days 🔥` : "Loading..."}
            </span>
          </div>
          <div className="p-10 bg-white rounded-xl shadow-lg flex flex-col items-center">
            <span className="text-gray-500 text-lg">Total Sessions</span>
            <span className="text-4xl font-bold text-green-600 mt-3">
              {userSessions ? userSessions.length : "Loading..."}
            </span>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="flex flex-col gap-6 flex-1 items-center lg:items-start">
          <PracticeSessionModal />
        </div>
        <ResumeSessionModal
          open={showResumeModal}
          onConfirm={handleResumeSession}
          onDiscard={handleDiscardSession}
          onClose={setShowResumeModal}
        />
      </div>
    </div>
  );
}
