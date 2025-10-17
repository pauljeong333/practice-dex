import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Clock,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const linkClasses =
    "relative flex items-center gap-3 px-3 py-2 h-10 rounded-lg transition group";

  return (
    <div
      className={`h-screen bg-gray-100 text-gray-800 flex flex-col transition-all duration-300 border-r border-gray-300 ${
        collapsed ? "w-20" : "w-56"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center p-4 border-b border-gray-300 transition-all duration-300 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <span
          className={`text-xl font-bold cursor-pointer select-none transition-opacity duration-300 whitespace-nowrap overflow-hidden ${
            collapsed ? "opacity-0 w-0" : "opacity-100"
          }`}
          onClick={() => navigate("/home")}
        >
          PracticeDex
        </span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-gray-200 transition flex items-center justify-center"
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
        {[
          { to: "/home", label: "Home", icon: Home },
          { to: "/schedule", label: "Schedule", icon: Calendar },
          { to: "/history", label: "History", icon: Clock },
          { to: "/user", label: "User", icon: User },
        ].map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }: { isActive: boolean }) =>
              `${linkClasses} ${
                isActive
                  ? "bg-gray-300 text-black font-medium"
                  : "hover:bg-gray-200"
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span
              className={`transition-opacity duration-300 whitespace-nowrap overflow-hidden ${
                collapsed ? "opacity-0 w-0" : "opacity-100"
              }`}
            >
              {label}
            </span>
            {collapsed && (
              <span className="absolute left-full ml-4 px-2 py-1 rounded bg-gray-200 text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow z-10">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      {/* Footer */}
      <div className="p-4 border-t border-gray-300 text-sm text-gray-500">
        <span
          className={`transition-opacity duration-300 ${
            collapsed ? "opacity-0" : "opacity-100"
          }`}
        >
          v1.0.0
        </span>
      </div>
    </div>
  );
}
