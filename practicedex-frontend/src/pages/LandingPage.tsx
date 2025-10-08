import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Loader2,
  Guitar,
  Piano,
  Drum,
  Mic,
  Music,
  Sparkles,
  KeyboardMusic,
} from "lucide-react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../firebase";
import { RootState } from "../types/redux";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const navigate = useNavigate();
  const isLoggedIn = useSelector(
    (state: RootState) => state.Auth.isAuthenticated
  );
  const authLoading = useSelector(
    (state: RootState) => state.Auth.signin.loading
  );
  const userLoading = useSelector((state: RootState) => state.User.loading);
  const isLoggingIn = authLoading || userLoading;

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Sign-in error", err);
      if (auth.currentUser) await signOut(auth);
      if (err instanceof Error) alert(`Sign-in failed: ${err.message}`);
      else alert("An unknown error occurred during sign-in");
    }
  };

  useEffect(() => {
    if (isLoggedIn && !isLoggingIn) navigate("/home");
  }, [isLoggedIn, isLoggingIn, navigate]);

  return (
    <div className="relative min-h-screen flex flex-col sm:flex-row items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 via-blue-50 to-blue-200 text-gray-800 pl-10 pr-6 sm:pl-40 sm:pr-16">
      {/* Floating icons layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingIcon
          Icon={Guitar}
          size={50}
          x="10%"
          y="20%"
          delay={0}
          color="text-indigo-400"
        />
        <FloatingIcon
          Icon={Piano}
          size={55}
          x="80%"
          y="30%"
          delay={1}
          color="text-blue-400"
        />
        <FloatingIcon
          Icon={Music}
          size={40}
          x="50%"
          y="10%"
          delay={2}
          color="text-purple-400"
        />
        <FloatingIcon
          Icon={Drum}
          size={45}
          x="30%"
          y="75%"
          delay={3}
          color="text-blue-500"
        />
        <FloatingIcon
          Icon={Mic}
          size={42}
          x="70%"
          y="80%"
          delay={1.5}
          color="text-indigo-500"
        />
        <FloatingIcon
          Icon={KeyboardMusic}
          size={48}
          x="20%"
          y="50%"
          delay={2.5}
          color="text-blue-300"
        />
      </div>

      {/* Left Section — Brand and CTA */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-start justify-center sm:w-1/2 z-10 text-left mt-20 sm:mt-0"
      >
        {/* Main App Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-7xl sm:text-8xl font-extrabold bg-gradient-to-r from-indigo-600 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4"
        >
          PracticeDex
        </motion.h1>

        {/* Tagline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl sm:text-4xl font-semibold text-gray-800 mb-6"
        >
          Level Up Your Practice
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg sm:text-xl text-gray-700 mb-10 max-w-lg"
        >
          Track your music sessions, stay consistent, and celebrate progress as
          you grow into the musician you want to be.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          onClick={handleSignIn}
          disabled={isLoggingIn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 200 }}
          className={`px-8 py-4 rounded-xl shadow-lg font-semibold flex items-center gap-2 backdrop-blur-md ${
            isLoggingIn
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-300/50"
          }`}
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              Sign in with Google
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Right Section — Animated Illustration */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center sm:w-1/2 mt-16 sm:mt-0"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-indigo-400 to-blue-300 shadow-2xl flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Music className="text-white opacity-80 w-16 h-16" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.9, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 text-sm text-gray-600 text-center w-full"
      >
        Made with 🎶 by the PracticeDex team
      </motion.div>
    </div>
  );
}

function FloatingIcon({
  Icon,
  size,
  x,
  y,
  delay = 0,
  color = "text-blue-400",
}: {
  Icon: React.ElementType;
  size: number;
  x: string;
  y: string;
  delay?: number;
  color?: string;
}) {
  return (
    <motion.div
      style={{ left: x, top: y, position: "absolute" }}
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: [0.3, 0.6, 0.3],
        y: [0, -15, 0],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`pointer-events-none ${color}`}
    >
      <Icon size={size} />
    </motion.div>
  );
}
