import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signout } from "../redux/auth/actions";
import { RootState } from "../types/redux";
import PracticeSessionModal from "../components/NewSessionModal/NewSessionModal";
import Loader from "../components/utility/Loader";

export default function HomePage() {
  const dispatch = useDispatch();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true); // controls fade in/out
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

  const handleSignOut = async () => {
    dispatch(signout());
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
              5 days
            </span>
          </div>
          <div className="p-10 bg-white rounded-xl shadow-lg flex flex-col items-center">
            <span className="text-gray-500 text-lg">Total Sessions</span>
            <span className="text-4xl font-bold text-green-600 mt-3">23</span>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="flex flex-col gap-6 flex-1 items-center lg:items-start">
          <PracticeSessionModal />
          <button
            onClick={handleSignOut}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition w-full"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
