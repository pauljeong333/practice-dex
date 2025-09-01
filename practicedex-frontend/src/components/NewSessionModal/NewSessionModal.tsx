import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { X } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";
import CustomTimeInput from "./TimeInput";
import GoalsForm from "./GoalsInput";

type Goal = {
  text: string;
};

export default function PracticeSessionModal() {
  const [open, setOpen] = useState(false);
  const [instrument, setInstrument] = useState("Piano");
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("0");
  const [goals, setGoals] = useState<Goal[]>([]);

  const resetForm = () => {
    setInstrument("Piano");
    setHours("1");
    setMinutes("0");
    setGoals([]);
  };

  const formattedTime =
    hours !== "" && minutes !== ""
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
      : "";

  const handleStartSession = () => {
    console.log({ instrument, formattedTime, goals });
    // Save to DB or call a Lambda function
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(newState) => {
        setOpen(newState);
        if (!newState) resetForm(); // Reset when modal closes
      }}
    >
      <Dialog.Trigger asChild>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Start New Session
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
            {/* <div>
              <label className="block text-sm font-medium mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min={1}
                className="w-full border rounded-lg px-3 py-2"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div> */}
            <CustomTimeInput
              hours={hours}
              setHours={setHours}
              minutes={minutes}
              setMinutes={setMinutes}
            />

            {/* Goals */}
            {/* <div>
              <label className="block text-sm font-medium mb-1">Goals</label>
              <textarea
                rows={3}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="What do you want to work on today?"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
              />
            </div> */}
            <GoalsForm setGoals={setGoals} />
          </div>

          <Dialog.Close asChild>
            <button
              onClick={handleStartSession}
              className="mt-6 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Start
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
