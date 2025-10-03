import React, { useState, useEffect, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/redux";
import {
  fetchRecommendedSessionRequest,
  resetRecommendedSession,
} from "../../redux/session/actions";
import { Session } from "../../types/global";
import { INSTRUMENTS } from "../../library/instruments";
import CustomTimeInput from "../NewSessionModal/TimeInput";
import GoalsForm from "../NewSessionModal/GoalsInput";

interface RecommendedSessionModalProps {
  open: boolean;
  onClose: (bool: boolean) => void;
  onAccept: (session: Session) => void;
  onCustomize: (session: Session) => void;
}

export default function RecommendedSessionModal({
  open,
  onClose,
  onAccept,
  onCustomize,
}: RecommendedSessionModalProps) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.User);
  const { loading, recommendedSession, error } = useSelector(
    (state: RootState) => state.Session
  );

  const [selectedInstrument, setSelectedInstrument] = useState(
    INSTRUMENTS[0] || ""
  );
  const [confirmed, setConfirmed] = useState(false);
  const [title, setTitle] = useState("");
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("00");
  const [goals, setGoals] = useState<string[]>([]);
  // Local state to hold initialGoals for GoalsForm
  const [initialGoals, setInitialGoals] = useState<string[]>([]);

  console.log(goals);
  console.log(recommendedSession);

  useEffect(() => {
    if (open && confirmed && selectedInstrument) {
      dispatch(
        fetchRecommendedSessionRequest({
          uid: user?.uid,
          instrument: selectedInstrument,
        })
      );
    }
  }, [open, confirmed, selectedInstrument, user?.uid, dispatch]);

  // Populate state variables when recommendedSession is loaded
  useEffect(() => {
    if (recommendedSession) {
      setTitle(recommendedSession.title);
      const totalMinutes = Math.ceil(recommendedSession.totalDuration / 60);
      setHours(Math.floor(totalMinutes / 60).toString());
      setMinutes((totalMinutes % 60).toString().padStart(2, "0"));
      const goalTexts = recommendedSession.goals.map((goal) => goal.text);
      setGoals(goalTexts);
      setInitialGoals(goalTexts);
    }
  }, [recommendedSession]);

  const resetModal = () => {
    setConfirmed(false);
    setSelectedInstrument(INSTRUMENTS[0] || "");
    setTitle("");
    setHours("1");
    setMinutes("00");
    setGoals([]);
    dispatch(resetRecommendedSession());
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetModal();
      onClose(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50
            data-[state=open]:animate-in data-[state=open]:fade-in
            data-[state=closed]:animate-out data-[state=closed]:fade-out
            transition-opacity duration-300"
        />

        {/* Modal */}
        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 w-full max-w-xl -translate-x-1/2 -translate-y-1/2
            rounded-2xl bg-white p-6 shadow-lg
            data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-90
            data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-90
            transition-all duration-300
          "
        >
          {/* Header */}
          <Dialog.Title className="text-lg font-semibold text-center mb-4">
            AI-Recommended Session
          </Dialog.Title>

          {!confirmed ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Select Instrument:
                </label>
                <select
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  value={selectedInstrument}
                  onChange={(e) => setSelectedInstrument(e.target.value)}
                >
                  {INSTRUMENTS.map((inst) => (
                    <option key={inst} value={inst}>
                      {inst}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={resetModal}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={() => setConfirmed(true)}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {loading && (
                <p className="text-center text-gray-500">
                  Loading AI recommendation...
                </p>
              )}
              {error && (
                <p className="text-center text-red-500">Error: {error}</p>
              )}
              {recommendedSession && !loading && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <CustomTimeInput
                    hours={hours}
                    setHours={setHours}
                    minutes={minutes}
                    setMinutes={setMinutes}
                  />

                  <GoalsForm
                    key={initialGoals.join(",")}
                    setGoals={setGoals}
                    initialGoals={initialGoals}
                  />

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={resetModal}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => {
                        const updatedSession = {
                          ...recommendedSession,
                          title,
                          totalDuration:
                            (Number(hours) * 60 + Number(minutes)) * 60,
                          goals: goals.map((goalText) => {
                            const existingGoal = recommendedSession.goals.find(
                              (g) => g.text === goalText
                            );
                            return {
                              id: existingGoal?.id || Math.random().toString(),
                              text: goalText,
                              completed: false,
                            };
                          }),
                        };
                        // onAccept(updatedSession);
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => {
                        const updatedSession = {
                          ...recommendedSession,
                          title,
                          totalDuration:
                            (Number(hours) * 60 + Number(minutes)) * 60,
                          goals: goals.map((goalText) => {
                            const existingGoal = recommendedSession.goals.find(
                              (g) => g.text === goalText
                            );
                            return {
                              id: existingGoal?.id || Math.random().toString(),
                              text: goalText,
                              completed: false,
                            };
                          }),
                        };
                        // onCustomize(updatedSession);
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition"
                    >
                      Customize
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
