import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../firebase";
import { RootState } from "../types/redux";

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

      // Sign out user if they were authenticated but something else failed
      if (auth.currentUser) {
        await signOut(auth);
      }

      if (err instanceof Error) {
        alert(`Sign-in failed: ${err.message}`);
      } else {
        alert("An unknown error occurred during sign-in");
      }
    }
  };

  // if (checkingAuth) {
  //   return <div className="text-center mt-10">Checking login status...</div>;
  // }

  if (isLoggedIn && !authLoading && !userLoading) {
    navigate("/home");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 text-gray-800">
      <h1 className="text-5xl font-bold mb-4">PracticeDex</h1>
      <p className="text-lg mb-8 text-center max-w-md">
        Track your music practice. Catch Pokémon. Level them up as you grow.
      </p>
      <button
        onClick={handleSignIn}
        disabled={isLoggingIn}
        className={`px-6 py-3 rounded-lg shadow-md transition ${
          isLoggingIn
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isLoggingIn ? "Signing in..." : "Sign in with Google"}
      </button>
    </div>
  );
}
