import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">Welcome to your PracticeDex!</h1>

      <button
        onClick={handleSignOut}
        className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Sign Out
      </button>
    </div>
  );
}
