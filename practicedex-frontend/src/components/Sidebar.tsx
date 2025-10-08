import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Clock,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"; // Added Calendar icon

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const linkClasses =
    "relative flex items-center gap-3 px-3 py-2 h-10 rounded-lg transition group";

  return (
    <div
      className={`h-screen bg-gray-900 text-gray-100 flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-56"
      }`}
    >
      {/* Header with logo + collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <span
            className="text-xl font-bold cursor-pointer"
            onClick={() => navigate("/home")}
          >
            PracticeDex
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-800 transition"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {/* Home */}
        <NavLink
          to="/home"
          className={({ isActive }: { isActive: boolean }) =>
            `${linkClasses} ${
              isActive ? "bg-gray-800 text-white" : "hover:bg-gray-800"
            }`
          }
        >
          <Home className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Home</span>}
          {collapsed && (
            <span className="absolute left-full ml-6 px-2 py-1 rounded bg-gray-800 text-sm opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
              Home
            </span>
          )}
        </NavLink>

        {/* Scheduled */}
        <NavLink
          to="/schedule"
          className={({ isActive }: { isActive: boolean }) =>
            `${linkClasses} ${
              isActive ? "bg-gray-800 text-white" : "hover:bg-gray-800"
            }`
          }
        >
          <Calendar className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Schedule</span>}
          {collapsed && (
            <span className="absolute left-full ml-6 px-2 py-1 rounded bg-gray-800 text-sm opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
              Schedule
            </span>
          )}
        </NavLink>

        {/* History */}
        <NavLink
          to="/history"
          className={({ isActive }: { isActive: boolean }) =>
            `${linkClasses} ${
              isActive ? "bg-gray-800 text-white" : "hover:bg-gray-800"
            }`
          }
        >
          <Clock className="w-5 h-5 shrink-0" />
          {!collapsed && <span>History</span>}
          {collapsed && (
            <span className="absolute left-full ml-6 px-2 py-1 rounded bg-gray-800 text-sm opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
              History
            </span>
          )}
        </NavLink>

        {/* User */}
        <NavLink
          to="/user"
          className={({ isActive }: { isActive: boolean }) =>
            `${linkClasses} ${
              isActive ? "bg-gray-800 text-white" : "hover:bg-gray-800"
            }`
          }
        >
          <User className="w-5 h-5 shrink-0" />
          {!collapsed && <span>User</span>}
          {collapsed && (
            <span className="absolute left-full ml-6 px-2 py-1 rounded bg-gray-800 text-sm opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
              User
            </span>
          )}
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        {!collapsed && "v1.0.0"}
      </div>
    </div>
  );
}
