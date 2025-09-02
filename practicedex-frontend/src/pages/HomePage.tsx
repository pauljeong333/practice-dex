import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signout } from "../redux/auth/actions";
import { RootState } from "../types/redux";
import PracticeSessionModal from "../components/NewSessionModal/NewSessionModal";
import Loader from "../components/utility/Loader";

export default function HomePage() {
  const dispatch = useDispatch();

  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const { user } = useSelector((state: RootState) => state.User);

  useEffect(() => {
    if (user) {
      if (user.isNewUser) {
        setShowOnboardingModal(true);
      }
    }
  }, [user]);

  const handleSignOut = async () => {
    dispatch(signout());
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-3xl font-bold">Welcome to your PracticeDex!</h1>
      {showOnboardingModal && <h1 className="text-2xl">Welcome, new user!</h1>}
      <div>
        <PracticeSessionModal />
        <button
          onClick={handleSignOut}
          className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Sign Out
        </button>
      </div>

      {!user && <Loader />}
    </div>
  );
}
