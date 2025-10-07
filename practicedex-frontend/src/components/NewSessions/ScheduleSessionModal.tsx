import { useEffect, useState } from "react";
import { X, Loader2, CalendarClock } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import CustomTimeInput from "./TimeInput";
import GoalsForm from "./GoalsInput";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../types/redux";
import {
  resetSchedule,
  scheduleSessionRequest,
} from "../../redux/session/actions";
import { SessionStatuses } from "../../enums/sessionStatuses";
import { generateGoalId } from "../../library/utility/generateGoalId";
import { INSTRUMENTS } from "../../library/instruments";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

export default function ScheduleSessionModal() {
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.Auth);
  const { user } = useSelector((state: RootState) => state.User);
  const { scheduled } = useSelector((state: RootState) => state.Session);
  const sessionLoading = useSelector(
    (state: RootState) => state.Session.loading
  );

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [instrument, setInstrument] = useState(INSTRUMENTS[0]);
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("00");
  const [goals, setGoals] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("12:00 PM");

  const suggestedTitle = `${user?.displayName || "My"}'s ${instrument} Session`;

  const resetForm = () => {
    setTitle("");
    setInstrument(INSTRUMENTS[0]);
    setHours("1");
    setMinutes("0");
    setGoals([]);
    setSelectedDate(new Date());
    setSelectedTime("12:00 PM");
  };

  const handleScheduleSession = () => {
    if (!selectedDate || !selectedTime) return;

    const finalTitle = title.trim() === "" ? suggestedTitle : title;

    // Convert selectedTime to 24-hour format for Date object
    const [time, modifier] = selectedTime.split(" ");
    let [hour, minute] = time.split(":").map(Number);
    if (modifier === "PM" && hour < 12) hour += 12;
    if (modifier === "AM" && hour === 12) hour = 0;

    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(hour, minute, 0, 0);

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
      scheduledFor: scheduledDate.toISOString(),
      status: SessionStatuses.SCHEDULED,
      idToken: token,
    };

    dispatch(scheduleSessionRequest(payload));
  };

  useEffect(() => {
    if (title.trim() === "") {
      setTitle("");
    }
  }, [instrument, title, user?.displayName]);

  useEffect(() => {
    if (scheduled) {
      setOpen(false);
      resetForm();
    }
  }, [scheduled]);

  // Generate 12-hour time options in 15-minute intervals
  const generateTimeOptions = () => {
    const times: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const date = new Date();
        date.setHours(h, m, 0, 0);
        const formatted = format(date, "hh:mm a"); // 12-hour format
        // Only include times in the future if date is today
        if (selectedDate) {
          const now = new Date();
          const isToday = selectedDate.toDateString() === now.toDateString();
          if (isToday && date <= now) continue;
        }
        times.push(formatted);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(newState) => {
        setOpen(newState);
        if (!newState) resetForm();
      }}
    >
      <Dialog.Trigger asChild>
        <button
          onClick={() => dispatch(resetSchedule())}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Schedule a Session
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-90 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-90">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">
              Schedule a Session
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-500 hover:text-gray-700">
                <X />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            {/* Title input */}
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={suggestedTitle}
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
                {INSTRUMENTS.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </div>

            {/* Date + Time side by side */}
            <div className="flex gap-4">
              {/* Date Picker */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <CalendarClock className="w-4 h-4" />
                  Date
                </label>
                <DayPicker
                  mode="single"
                  selected={selectedDate ?? undefined}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={{ before: new Date() }}
                  className="rounded-lg border p-2 shadow-sm"
                />
              </div>

              {/* Time Picker */}
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 cursor-pointer"
                >
                  {timeOptions.length > 0 ? (
                    timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))
                  ) : (
                    <option disabled>No available times</option>
                  )}
                </select>
              </div>
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
            onClick={handleScheduleSession}
            disabled={sessionLoading || timeOptions.length === 0}
            className="mt-6 w-full px-4 py-2 rounded-lg transition bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sessionLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Scheduling...
              </>
            ) : (
              "Schedule Session"
            )}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
