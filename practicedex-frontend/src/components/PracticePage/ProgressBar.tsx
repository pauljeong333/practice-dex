import { useState, useEffect } from "react";

interface ProgressBarProps {
  completedGoals: number;
  goals: number;
}

export default function ProgressBar({
  completedGoals,
  goals,
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const percent = (completedGoals / goals) * 100;
    setWidth(percent);
  }, [completedGoals, goals]);

  return (
    <div className="w-full bg-gray-200 h-3 rounded-lg overflow-hidden">
      <div
        className="h-3 bg-green-500 rounded-lg transition-all duration-500 ease-in-out"
        style={{ width: `${width}%` }}
      ></div>
    </div>
  );
}
