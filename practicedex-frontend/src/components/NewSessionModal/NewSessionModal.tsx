import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";
import * as Dialog from "@radix-ui/react-dialog";
import CustomTimeInput from "./TimeInput";
import GoalsForm from "./GoalsInput";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/redux";
import { useNavigate } from "react-router-dom";
import { setSessionRequest } from "../../redux/session/actions";
import { SessionStatuses } from "../../enums/sessionStatuses";

export default function PracticeSessionModal() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.Auth);
  const { user } = useSelector((state: RootState) => state.User);
  const sessionLoading = useSelector(
    (state: RootState) => state.Session
  ).loading;
  const sessionReady = useSelector(
    (state: RootState) => state.Session
  ).sessionReady;
  const [open, setOpen] = useState(false);
  const [instrument, setInstrument] = useState("Piano");
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("00");
  const [goals, setGoals] = useState<string[]>([]);

  const resetForm = () => {
    setInstrument("Piano");
    setHours("1");
    setMinutes("0");
    setGoals([]);
  };

  const handleStartSession = async () => {
    const payload = {
      uid: user?.uid,
      instrument: instrument,
      goals: goals.map((goal) => ({
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
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50 backdrop-blur-sm
    data-[state=open]:animate-in data-[state=open]:fade-in
    data-[state=closed]:animate-out data-[state=closed]:fade-out
    transition-opacity duration-300"
        />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-lg
    data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-90
    data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-90
    transition-all duration-300"
        >
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
            <DialogDescription></DialogDescription>
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
                <option>Violin</option>
                <option>Voice</option>
                <option>Drums</option>
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
            className="
              mt-6 w-full px-4 py-2 rounded-lg transition 
              bg-green-600 text-white hover:bg-green-700 
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600
              flex items-center justify-center gap-2
            "
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
