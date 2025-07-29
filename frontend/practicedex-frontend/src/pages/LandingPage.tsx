import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "../firebase";

export default function LandingPage() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/home");
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await fetch(
        "https://zox5b2uho2.execute-api.us-east-1.amazonaws.com/prod/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Sync response:", data);

      navigate("/home");
    } catch (err) {
      console.error("Sign-in error", err);
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
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
}
