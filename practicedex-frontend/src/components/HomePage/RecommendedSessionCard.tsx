import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../types/redux";
import { fetchRecommendedSession } from "../redux/session/actions";

interface RecommendedSessionCardProps {
  userId: string;
  onAccept: (session: any) => void;
  onCustomize: (session: any) => void;
}

export default function RecommendedSessionCard({
  userId,
  onAccept,
  onCustomize,
}: RecommendedSessionCardProps) {
  const dispatch = useDispatch();
  const { loading, recommendedSession, error } = useSelector(
    (state: RootState) => state.session
  );

  if (loading) return <div>Loading AI recommendation...</div>;
  if (error) return <div>Error loading recommendation: {error.message}</div>;
  if (!recommendedSession) return null;

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        AI-Recommended Session
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Duration: {recommendedSession.durationMinutes} min
      </p>
      <div className="grid grid-cols-1 gap-3 mb-4">
        {recommendedSession.goalOrder.map((goalId: string, index: number) => {
          const goalName =
            recommendedSession.goals.find((g: any) => g.id === goalId)?.name ||
            "Unknown Goal";
          const priority = recommendedSession.priorities[goalId] || index + 1;

          return (
            <div
              key={goalId}
              className="p-3 border rounded hover:shadow-md transition flex justify-between items-center"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {goalName}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Priority: {priority}
              </span>
            </div>
          );
        })}
      </div>
      {recommendedSession.rationale && (
        <p className="text-sm text-gray-500 mb-4">
          Why: {recommendedSession.rationale}
        </p>
      )}
      <div className="flex gap-3">
        <button
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition"
          onClick={() => onAccept(recommendedSession)}
        >
          Accept
        </button>
        <button
          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded transition"
          onClick={() => onCustomize(recommendedSession)}
        >
          Customize
        </button>
      </div>
    </div>
  );
}
