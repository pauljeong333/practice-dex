import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  onAuthStateChanged,
  getAdditionalUserInfo,
  signOut,
} from "firebase/auth";
import { auth, provider } from "../firebase";

export default function LandingPage() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !isSigningIn) {
        // Only navigate if user exists AND we're not in the middle of a sign-in process
        navigate("/home");
      } else if (!user) {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [navigate, isSigningIn]);

  const handleSignIn = async () => {
    setIsSigningIn(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const additionalInfo = getAdditionalUserInfo(result);

      if (additionalInfo?.isNewUser) {
        // Try the API call
        const response = await fetch(
          "https://yh0ui0vmg5.execute-api.us-east-1.amazonaws.com/prod/",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
            }),
          }
        );

        // Check for failure
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `API Error: ${response.status} - ${
              errorData.message || "Unknown error"
            }`
          );
        }

        // Proceed if API call succeeded
        const data = await response.json();
        console.log("Sync response:", data);
      }

      // Only navigate on complete success
      navigate("/home");
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
    } finally {
      setIsSigningIn(false);
    }
  };

  if (checkingAuth) {
    return <div className="text-center mt-10">Checking login status...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 to-blue-200 text-gray-800">
      <h1 className="text-5xl font-bold mb-4">PracticeDex</h1>
      <p className="text-lg mb-8 text-center max-w-md">
        Track your music practice. Catch Pokémon. Level them up as you grow.
      </p>
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className={`px-6 py-3 rounded-lg shadow-md transition ${
          isSigningIn
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isSigningIn ? "Signing in..." : "Sign in with Google"}
      </button>
    </div>
  );
}
