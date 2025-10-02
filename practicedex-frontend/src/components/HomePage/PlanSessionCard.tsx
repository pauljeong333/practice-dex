import React from "react";

interface PlanSessionCardProps {
  onPlanSession: () => void;
}

export default function PlanSessionCard({
  onPlanSession,
}: PlanSessionCardProps) {
  return (
    <div className="max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Ready to Practice?
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Let your AI Coach suggest a session tailored to your recent practice
        history.
      </p>
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
        onClick={onPlanSession}
      >
        Plan My Session
      </button>
    </div>
  );
}
