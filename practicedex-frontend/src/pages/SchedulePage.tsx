import { useEffect, useState } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  DateCellWrapperProps,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Session } from "../types/global";
import { RootState } from "../types/redux";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type CalendarEvent = {
  session: Session;
  start: Date;
  end: Date;
  title: string;
};

type CustomDateCellProps = DateCellWrapperProps & {
  calendarEvents: CalendarEvent[];
};

const CustomDateCell: React.FC<
  CustomDateCellProps & { selectedDay: Date | null }
> = ({ value, children, calendarEvents, selectedDay }) => {
  const dayEvents = calendarEvents.filter((event) =>
    isSameDay(event.start, value)
  );
  const isToday = isSameDay(value, new Date());
  const isSelected = selectedDay && isSameDay(value, selectedDay);
  const isWeekend = value.getDay() === 0 || value.getDay() === 6;

  return (
    <div
      className={`
        relative w-full h-full
        border ${isWeekend ? "border-gray-300" : "border-gray-200"}
      `}
    >
      {/* Highlight today */}
      {isToday && (
        <div className="absolute inset-0 bg-yellow-200 rounded-sm z-0" />
      )}

      {/* Highlight selected day */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-blue-500 rounded-sm z-10 pointer-events-none" />
      )}

      {/* Original day content */}
      <div className="relative z-20 w-full h-full">{children}</div>

      {/* Dots for sessions */}
      {dayEvents.length > 0 && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1 z-30">
          {dayEvents.map((_, idx) => (
            <span
              key={idx}
              className="w-2 h-2 rounded-full bg-green-500"
            ></span>
          ))}
        </div>
      )}
    </div>
  );
};

export default function SchedulePage() {
  const { scheduledSessions, loading } = useSelector(
    (state: RootState) => state.Session.schedule
  );
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    if (!loading && scheduledSessions) {
      setSessions(scheduledSessions);
    }
  }, [loading, scheduledSessions]);

  // Map sessions to calendar events
  const calendarEvents: CalendarEvent[] = sessions
    .filter((s) => s.scheduledFor)
    .map((s) => ({
      session: s,
      start: new Date(s.scheduledFor!),
      end: new Date(
        new Date(s.scheduledFor!).getTime() + s.durationMinutes * 60000
      ),
      title: s.title,
    }));

  const sessionsForSelectedDay = selectedDay
    ? calendarEvents
        .filter((event) => isSameDay(event.start, selectedDay))
        .map((event) => event.session)
    : [];

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center h-[160px]">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-[48px] px-27 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Your Schedule</h1>

      <div className="flex gap-6">
        {/* Calendar */}
        <div className="flex-1" style={{ minWidth: 0 }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            selectable
            views={["month"]}
            popup
            onSelectSlot={(slotInfo) => setSelectedDay(slotInfo.start)}
            onSelectEvent={(event) => setSelectedDay(event.start)}
            date={selectedDay ?? new Date()}
            onNavigate={() => {}}
            components={{
              dateCellWrapper: (props) => (
                <CustomDateCell
                  {...props}
                  calendarEvents={calendarEvents}
                  selectedDay={selectedDay}
                />
              ),
            }}
          />
        </div>

        {/* Side panel */}
        <div className="w-80 bg-white rounded-lg shadow p-4 flex-shrink-0">
          {selectedDay ? (
            <>
              <h2 className="text-xl font-semibold mb-2">
                {selectedDay.toLocaleDateString("en-US")}
              </h2>
              {sessionsForSelectedDay.length === 0 ? (
                <p>No sessions for this day.</p>
              ) : (
                <ul className="space-y-2">
                  {sessionsForSelectedDay.map((session) => (
                    <li
                      key={session.session_id}
                      className="p-2 border rounded shadow-sm"
                    >
                      <strong>{session.title}</strong>
                      <div className="text-sm text-gray-600">
                        {new Date(session.scheduledFor!).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}{" "}
                        -{" "}
                        {new Date(
                          new Date(session.scheduledFor!).getTime() +
                            session.totalDuration * 1000
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {session.notes && <p>{session.notes}</p>}
                      <div className="text-sm text-gray-500">
                        Instrument: {session.instrument}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="text-gray-400">Select a day to see sessions</p>
          )}
        </div>
      </div>
    </div>
  );
}
