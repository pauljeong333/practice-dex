import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { getUserField } from "../api/user";

export default function HomePage() {
  const navigate = useNavigate();

  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  //const [showNewSessionModal, setShowNewSessionModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const idToken = await auth.currentUser?.getIdToken();
      const isNewUser = await getUserField("isNewUser", idToken || "");
      console.log("isNewUser:", isNewUser);

      if (isNewUser) {
        setShowOnboardingModal(true);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">Welcome to your PracticeDex!</h1>
      {showOnboardingModal && <h1 className="text-2xl">Welcome, new user!</h1>}

      <button
        onClick={handleSignOut}
        className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Sign Out
      </button>
      <button className="ml-4 px-4 py-2 bg-blue-600 text-black rounded hover:bg-blue-700 transition">
        Create a new Practice Session
      </button>
    </div>
  );
}
