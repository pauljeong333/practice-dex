import React from "react";

interface TimerProps {
  radius: number;
  timeLeft: number;
  totalDurationSeconds: number;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  setGoals: React.Dispatch<
    React.SetStateAction<{ text: string; done: boolean }[]>
  >;
  sessionGoals?: string[];
}

const Timer: React.FC<TimerProps> = ({
  radius,
  timeLeft,
  totalDurationSeconds,
  isRunning,
  setIsRunning,
  setTimeLeft,
  setGoals,
  sessionGoals,
}) => {
  const circumference = 2 * Math.PI * radius;
  const progress = totalDurationSeconds - timeLeft; // seconds elapsed

  // Calculate container size based on radius (with padding for stroke)
  const containerSize = radius * 2 + 40; // Add padding for the stroke width
  const center = containerSize / 2;

  // Calculate font size based on radius and whether we have hours
  const calculateFontSize = () => {
    const hasHours = timeLeft >= 3600;
    // Base font size on radius, with adjustment for hours format
    return `${(1.3 * radius) / (hasHours ? 3.5 : 2.8)}px`;
  };

  const handleReset = () => {
    setTimeLeft(totalDurationSeconds);
    setIsRunning(false);
    setGoals(sessionGoals?.map((g) => ({ text: g, done: false })) ?? []);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    } else {
      return `${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full bg-gray-50 text-gray-800 p-4">
      {/* Dynamic container based on radius */}
      <div
        className="relative"
        style={{ width: containerSize, height: containerSize }}
      >
        <svg
          width={containerSize}
          height={containerSize}
          viewBox={`0 0 ${containerSize} ${containerSize}`}
        >
          {/* Background circle */}
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            r={radius}
            cx={center}
            cy={center}
            strokeWidth="15"
          />

          {/* Progress circle */}
          <circle
            stroke="#3b82f6"
            fill="transparent"
            r={radius}
            cx={center}
            cy={center}
            strokeWidth="15"
            strokeDasharray={circumference}
            strokeDashoffset={
              circumference - (progress * circumference) / totalDurationSeconds
            }
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            style={{ transition: "stroke-dashoffset 0.2s linear" }}
          />

          {/* Time text - dynamically sized based on radius */}
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dy="0.35em"
            className="font-bold select-none"
            style={{
              fontSize: calculateFontSize(),
              fill: "#1f2937",
            }}
          >
            {formatTime(timeLeft)}
          </text>
        </svg>
      </div>

      <p className="mt-4 text-gray-500 text-xl text-center">
        {timeLeft > totalDurationSeconds / 2
          ? "Stay focused"
          : timeLeft > totalDurationSeconds / 3
          ? "Halfway there!"
          : timeLeft > 0
          ? "Final push!"
          : "Well done!"}
      </p>

      <div className="mt-6 flex gap-6">
        <button
          onClick={() => setIsRunning((r) => !r)}
          className="w-28 px-5 py-3 bg-blue-500 text-white rounded-lg shadow flex items-center justify-center transform transition-transform duration-300 hover:scale-105"
        >
          {isRunning ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M5 3v18l15-9L5 3z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleReset}
          className="w-28 px-5 py-3 bg-gray-200 text-gray-800 rounded-lg shadow flex items-center justify-center transform transition-transform duration-300 hover:scale-105"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;
