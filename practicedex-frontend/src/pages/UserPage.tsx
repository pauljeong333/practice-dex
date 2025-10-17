import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../types/redux";
import { signout } from "../redux/auth/actions";
import LoadingBar from "../components/utility/LoadingBar";

export default function UserPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.User);

  const [showSettings, setShowSettings] = useState(false);

  const handleSignOut = () => {
    dispatch(signout());
  };

  return (
    <>
      <LoadingBar isLoading={!user} />
      <div className="min-h-screen w-full flex flex-col items-center justify-start p-12">
        {/* Greeting */}
        <h1 className="text-4xl font-bold mb-8">
          Hello{user?.displayName ? `, ${user.displayName}` : ""}!
        </h1>

        {/* User Info / Settings */}
        <div className="w-full max-w-md flex flex-col gap-6">
          <div className="p-6 bg-white rounded-xl shadow flex flex-col">
            <span className="text-gray-500 text-sm">Email</span>
            <span className="font-semibold text-lg">{user.email}</span>
          </div>

          {/* Settings Section */}
          {showSettings && (
            <div className="p-6 bg-white rounded-xl shadow flex flex-col gap-4">
              <h2 className="font-semibold text-lg">Settings</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Change Display Name
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Change Password
              </button>
            </div>
          )}

          {/* Toggle Settings */}
          {/* <button
          onClick={() => setShowSettings((prev) => !prev)}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
        >
          {showSettings ? "Hide Settings" : "Show Settings"}
        </button> */}

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
