import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import CustomTimeInput from "./TimeInput";
import GoalsForm from "./GoalsInput";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/redux";
import { useNavigate } from "react-router-dom";
import { setSessionRequest } from "../../redux/session/actions";
import { SessionStatuses } from "../../enums/sessionStatuses";
import { generateGoalId } from "../../library/utility/generateGoalId";

export default function PracticeSessionModal() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.Auth);
  const { user } = useSelector((state: RootState) => state.User);
  const sessionLoading = useSelector(
    (state: RootState) => state.Session.loading
  );
  const sessionReady = useSelector(
    (state: RootState) => state.Session.sessionReady
  );

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [instrument, setInstrument] = useState("Piano");
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("00");
  const [goals, setGoals] = useState<string[]>([]);

  // build a suggested title dynamically
  const suggestedTitle = `${user?.displayName || "My"}'s ${instrument} Session`;

  const resetForm = () => {
    setTitle("");
    setInstrument("Piano");
    setHours("1");
    setMinutes("0");
    setGoals([]);
  };

  const handleStartSession = async () => {
    const finalTitle = title.trim() === "" ? suggestedTitle : title;

    const payload = {
      uid: user?.uid,
      instrument,
      title: finalTitle,
      goals: goals.map((goal) => ({
        id: generateGoalId(goal),
        text: goal,
        completed: false,
      })),
      totalDuration: 3600 * Number(hours) + 60 * Number(minutes),
      currentDuration: 3600 * Number(hours) + 60 * Number(minutes),
      status: SessionStatuses.ACTIVE,
      idToken: token,
    };

    dispatch(setSessionRequest(payload));
  };

  // If user hasn't typed anything, auto-update title to suggestion
  useEffect(() => {
    if (title.trim() === "") {
      setTitle(""); // keep it empty so placeholder shows
    }
  }, [instrument, title, user?.displayName]);

  useEffect(() => {
    if (!sessionLoading && sessionReady) {
      navigate("/practice");
    }
  }, [sessionLoading, sessionReady, navigate]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(newState) => {
        setOpen(newState);
        if (!newState) resetForm();
      }}
    >
      <Dialog.Trigger asChild>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Start a New Session
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-90 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-90">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">
              New Session
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-700">
                <X />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <Dialog.Description />

            {/* Title input */}
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={suggestedTitle} // always reflects instrument + name
              />
            </div>

            {/* Instrument Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Instrument
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
              >
                <option>Piano</option>
                <option>Guitar</option>
                <option>Drums</option>
                <option>Bass Guitar</option>
                <option>Voice</option>
                <option>Violin</option>
                <option>Cello</option>
                <option>Flute</option>
                <option>Saxophone</option>
                <option>Trumpet</option>
                <option>Clarinet</option>
                <option>Ukulele</option>
              </select>
            </div>

            {/* Duration */}
            <CustomTimeInput
              hours={hours}
              setHours={setHours}
              minutes={minutes}
              setMinutes={setMinutes}
            />

            {/* Goals */}
            <GoalsForm setGoals={setGoals} />
          </div>

          <button
            onClick={handleStartSession}
            disabled={sessionLoading}
            className="mt-6 w-full px-4 py-2 rounded-lg transition bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 flex items-center justify-center gap-2"
          >
            {sessionLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Starting...
              </>
            ) : (
              "Start"
            )}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
