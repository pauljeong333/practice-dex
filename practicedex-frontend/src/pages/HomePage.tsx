import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../types/redux";
import NewSessionModal from "../components/NewSessions/NewSessionModal";
import ResumeSessionModal from "../components/ResumeSessionModal";
import { motion } from "framer-motion";
import PlanSessionCard from "../components/HomePage/PlanSessionCard";
import Loader from "../components/utility/Loader";
import {
  resumeSessionRequest,
  stopSessionRequest,
} from "../redux/session/actions";
import { SessionStatuses } from "../enums/sessionStatuses";
import RecommendedSessionModal from "../components/HomePage/RecommendedSessionModal";
import ScheduleSessionModal from "../components/NewSessions/ScheduleSessionModal";
import ScheduledSessionCard from "../components/HomePage/ScheduledSessionCard";
import AICoachModal from "../components/Agent/AiCoachModal";

export default function HomePage() {
  const dispatch = useDispatch();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showRecommendedModal, setShowRecommendedModal] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const { token } = useSelector((state: RootState) => state.Auth);
  const { user } = useSelector((state: RootState) => state.User);

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

  useEffect(() => {
    if (user) {
      if (user.isNewUser) setShowOnboardingModal(true);
    }
    setQuoteIndex(Math.floor(Math.random() * quotes.length));
  }, [user, quotes.length]);

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

  function isTodayOrYesterday(lastUpdated?: string | Date) {
    if (!lastUpdated) return false;

    const last = new Date(lastUpdated);
    const now = new Date();

    // Today
    if (
      last.getFullYear() === now.getFullYear() &&
      last.getMonth() === now.getMonth() &&
      last.getDate() === now.getDate()
    ) {
      return true;
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
      last.getFullYear() === yesterday.getFullYear() &&
      last.getMonth() === yesterday.getMonth() &&
      last.getDate() === yesterday.getDate()
    ) {
      return true;
    }

    return false;
  }

  if (!user) return <Loader />;

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-12">
      {/* Greeting + Animated Quote */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
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
      </motion.div>

      {/* Main Content: Two Columns */}
      <div className="flex flex-col lg:flex-row w-full max-w-4xl gap-12 mb-16">
        {/* Left Column: Progress */}
        <motion.div
          className="flex flex-col gap-6 flex-1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <div className="p-10 bg-white rounded-xl shadow-lg flex flex-col items-center">
            <span className="text-gray-500 text-lg">Current Streak</span>
            <span className="text-4xl font-bold text-blue-600 mt-3">
              {`${isTodayOrYesterday(user?.lastUpdated) ? user?.streak : 0}🔥`}
            </span>
          </div>
          <ScheduledSessionCard />
        </motion.div>

        {/* Right Column: Actions */}
        <motion.div
          className="flex flex-col gap-6 flex-1 items-center lg:items-start h-full"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
        >
          {/* Session Actions Card */}
          <div className="p-8 bg-white rounded-xl shadow-lg flex flex-col justify-between w-full flex-1">
            <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
              Start a Session
            </h2>

            <div className="flex flex-col gap-4 sm:flex-col lg:flex-col w-full h-full justify-center">
              <NewSessionModal />
              <ScheduleSessionModal />
              <AICoachModal />
            </div>
          </div>
        </motion.div>
        {/* <div className="p-6">
            <PlanSessionCard
              onPlanSession={() => setShowRecommendedModal(true)}
            />
          </div> */}

        <ResumeSessionModal
          open={showResumeModal}
          onConfirm={handleResumeSession}
          onDiscard={handleDiscardSession}
          onClose={setShowResumeModal}
        />

        <RecommendedSessionModal
          open={showRecommendedModal}
          onAccept={() => {}}
          onCustomize={() => {}}
          onClose={setShowRecommendedModal}
        />
      </div>
    </div>
  );
}
