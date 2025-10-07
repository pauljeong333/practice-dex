import { CalendarClock, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { RootState } from "../../types/redux";

export default function ScheduledSessionCard() {
  const { scheduledSessions, loading } = useSelector(
    (state: RootState) => state.Session.schedule
  );

  const formatDate = (scheduledFor: string) =>
    format(new Date(scheduledFor ?? ""), "EEEE, MMM d 'at' h:mm a");

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-4 flex flex-col justify-between h-[160px]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Next Session</h2>
        </div>
      </div>

      {!loading ? (
        scheduledSessions.length > 0 ? (
          <div>
            <p className="text-base font-medium">
              {scheduledSessions[0]?.title ?? ""}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(scheduledSessions[0]?.scheduledFor ?? "")}
            </p>
          </div>
        ) : (
          <p className="text-gray-500 font-medium">No upcoming session</p>
        )
      ) : (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      )}
    </div>
  );
}
