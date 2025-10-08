import { CalendarClock, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { format, differenceInHours } from "date-fns";
import { RootState } from "../../types/redux";
import StartSessionModal from "./StartSessionModal";

export default function ScheduledSessionCard() {
  const { scheduledSessions, loading } = useSelector(
    (state: RootState) => state.Session.schedule
  );

  const formatDate = (scheduledFor: string) =>
    format(new Date(scheduledFor ?? ""), "EEEE, MMM d 'at' h:mm a");

  const getTimeStatus = (scheduledFor: string) => {
    const scheduledDate = new Date(scheduledFor);
    const hoursSince = differenceInHours(new Date(), scheduledDate);

    if (hoursSince <= 0) return "upcoming"; // future session
    if (hoursSince < 24) return "recent"; // red once more than hour since start
    return "late"; // late 24 hours or more
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center h-[160px]">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (scheduledSessions.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-lg p-4 flex flex-col justify-between h-[160px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Next Session</h2>
          </div>
        </div>
        <p className="text-gray-500 font-medium">No upcoming session</p>
      </div>
    );
  }

  const session = scheduledSessions.at(-1);
  const timeStatus = getTimeStatus(session?.scheduledFor ?? "");

  const styles =
    timeStatus === "recent"
      ? {
          card: "bg-red-50 border border-red-200",
          icon: "text-red-500",
          text: "text-red-600",
          label: { text: "Late!", bg: "bg-red-100 text-red-600" },
          button: "bg-red-600 hover:bg-red-700 text-white shadow-red-200/70",
          buttonBg: "bg-red-50",
        }
      : timeStatus === "late"
      ? {
          card: "bg-gray-50 border border-gray-200",
          icon: "text-gray-500",
          text: "text-gray-600",
          label: { text: "Overdue...", bg: "bg-gray-100 text-gray-600" },
          button: "bg-gray-500 hover:bg-gray-600 text-white shadow-gray-300/70",
          buttonBg: "bg-gray-50",
        }
      : {
          card: "bg-white border border-transparent",
          icon: "text-blue-500",
          text: "text-gray-500 dark:text-gray-400",
          label: null,
          button: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200/70",
          buttonBg: "bg-white",
        };

  return (
    <div
      className={`w-full rounded-2xl shadow-lg p-4 flex flex-col justify-between h-[160px] transition-all ${styles.card}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CalendarClock className={`w-5 h-5 ${styles.icon}`} />
          <h2 className="text-lg font-semibold">Next Session</h2>
        </div>
        {styles.label && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.label.bg}`}
          >
            {styles.label.text}
          </span>
        )}
      </div>

      <div>
        <p className="text-base font-medium">{session?.title ?? ""}</p>
        <p className={`text-sm ${styles.text}`}>
          {formatDate(session?.scheduledFor ?? "")}
        </p>
        <StartSessionModal
          session={session!}
          buttonStyle={styles.button}
          isAlert={timeStatus === "recent" || timeStatus === "late"}
        />
      </div>
    </div>
  );
}
