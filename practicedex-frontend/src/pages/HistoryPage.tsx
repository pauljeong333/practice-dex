import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../types/redux";
import { Session } from "../types/global";
import Loader from "../components/utility/Loader";
import { Calendar, Clock, Music } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom";

export default function HistoryPage() {
  const { userSessions } = useSelector((state: RootState) => state.Session);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userSessions) return;
    setSessions(userSessions);
  }, [userSessions]);

  if (!userSessions) return <Loader />;

  const totalSessions = sessions.length;
  const totalMinutes =
    sessions.reduce((sum, s) => sum + s.totalDuration - s.currentDuration, 0) /
    60;
  const avgDuration = totalSessions
    ? Math.ceil(totalMinutes / totalSessions)
    : 0;

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = weekdays.map((day, index) => {
    const dayTotal = sessions
      .filter((s) => new Date(s.dateCreated).getDay() === index)
      .reduce((sum, s) => sum + (s.totalDuration - s.currentDuration) / 60, 0);
    return { day, minutes: dayTotal };
  });

  return (
    <div className="min-h-screen p-12 w-full flex flex-col items-center">
      {/* Header / Stats */}
      <div className="w-full max-w-4xl mb-8">
        <h1 className="text-4xl font-bold mb-4">Your Practice History</h1>
        <div className="flex gap-6 flex-wrap">
          <div className="p-6 bg-white rounded-xl shadow flex flex-col items-center flex-1 min-w-[120px]">
            <span className="text-gray-500 text-lg">Sessions Completed</span>
            <span className="text-3xl font-bold text-blue-600 mt-2">
              {totalSessions}
            </span>
          </div>
          <div className="p-6 bg-white rounded-xl shadow flex flex-col items-center flex-1 min-w-[120px]">
            <span className="text-gray-500 text-lg">Total Time Practiced</span>
            <span className="text-3xl font-bold text-green-600 mt-2">
              {Math.ceil(totalMinutes)} min
            </span>
          </div>
          <div className="p-6 bg-white rounded-xl shadow flex flex-col items-center flex-1 min-w-[120px]">
            <span className="text-gray-500 text-lg">Average Session</span>
            <span className="text-3xl font-bold text-purple-600 mt-2">
              {avgDuration} min
            </span>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center text-gray-500">
          <img
            src="/empty-sessions-illustration.svg"
            alt="No sessions yet"
            className="w-64 h-64 mb-6"
          />
          <h2 className="text-2xl font-semibold mb-2">
            No practice sessions yet
          </h2>
          <p className="max-w-sm">
            Start a session today and watch your progress grow! 🎵✨
          </p>
        </div>
      ) : (
        <>
          {/* Weekly Practice Chart */}
          <div className="w-full max-w-4xl mb-8 p-6 bg-white rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Weekly Practice Time</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={weeklyData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  formatter={(value: number) => `${value} min`}
                />
                <Bar
                  dataKey="minutes"
                  fill="url(#colorGrad)"
                  radius={[4, 4, 0, 0]}
                >
                  {weeklyData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      style={{ transition: "all 0.3s ease" }}
                      onMouseEnter={(event) => {
                        (event.currentTarget as SVGRectElement).style.fill =
                          "#6366F1";
                      }}
                      onMouseLeave={(event) => {
                        (event.currentTarget as SVGRectElement).style.fill =
                          "url(#colorGrad)";
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* View Mode Toggle */}
          <div className="w-full max-w-4xl mb-6 flex justify-end">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-l-lg border border-gray-300 ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-2 rounded-r-lg border border-gray-300 ${
                viewMode === "cards"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              Cards
            </button>
          </div>

          {/* Sessions */}
          <div className="w-full max-w-4xl flex flex-col gap-4">
            {viewMode === "list" ? (
              <div className="flex flex-col divide-y divide-gray-200">
                {sessions.map((s) => (
                  <div
                    key={s.session_id}
                    onClick={() =>
                      navigate(`/history/${s.session_id}`, {
                        state: { session: s },
                      })
                    }
                    className="px-5 flex items-start justify-between py-3 
                    transition-colors duration-200 ease-in-out cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold text-gray-900 truncate">
                        {s.title || "Untitled Session"}
                      </span>
                      {s.notes && (
                        <span className="text-gray-600 text-sm mt-0.5 line-clamp-1">
                          {s.notes}
                        </span>
                      )}
                      <div className="flex gap-4 mt-1 text-xs text-gray-500 items-center">
                        <div className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          <span>{s.instrument}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(s.dateCreated).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {Math.ceil(
                              (s.totalDuration - s.currentDuration) / 60
                            )}{" "}
                            min
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 shrink-0 text-yellow-500 text-sm">
                      {"⭐".repeat(s.stars)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {sessions.map((s) => (
                  <div
                    key={s.session_id}
                    onClick={() =>
                      navigate(`/history/${s.session_id}`, {
                        state: { session: s },
                      })
                    }
                    className="p-6 bg-white border border-gray-200 rounded-xl 
                    shadow-sm hover:shadow-md transition flex flex-col cursor-pointer"
                  >
                    <span className="font-semibold text-lg text-gray-900">
                      {s.title || "Untitled Session"}
                    </span>
                    {s.notes && (
                      <span className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {s.notes}
                      </span>
                    )}
                    <div className="flex flex-col gap-1 text-sm text-gray-500 mt-3">
                      <div className="flex items-center gap-1">
                        <Music className="w-4 h-4" />
                        <span>{s.instrument}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(s.dateCreated).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          Duration:{" "}
                          {Math.ceil(
                            (s.totalDuration - s.currentDuration) / 60
                          )}{" "}
                          min
                        </span>
                      </div>
                    </div>
                    <div className="text-yellow-500 mt-3 text-base">
                      {"⭐".repeat(s.stars)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
