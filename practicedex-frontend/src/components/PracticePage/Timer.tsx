import React from "react";

interface TimerProps {
  radius: number;
  circumference: number;
  progress: number;
  timeLeft: number;
  totalDurationSeconds: number;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  setGoals: React.Dispatch<
    React.SetStateAction<{ text: string; done: boolean }[]>
  >;
  sessionGoals?: string[];
  formatTime: (seconds: number) => string;
}

const Timer: React.FC<TimerProps> = ({
  radius,
  circumference,
  progress,
  timeLeft,
  totalDurationSeconds,
  isRunning,
  setIsRunning,
  setTimeLeft,
  setGoals,
  sessionGoals,
  formatTime,
}) => {
  const handleReset = () => {
    setTimeLeft(totalDurationSeconds);
    setIsRunning(false);
    setGoals(sessionGoals?.map((g) => ({ text: g, done: false })) ?? []);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full bg-gray-50 text-gray-800">
      <svg
        className="w-[400px] h-[400px] md:w-[450px] md:h-[450px]"
        viewBox="0 0 192 192"
      >
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          r={radius}
          cx="96"
          cy="96"
          strokeWidth="10"
        />
        <circle
          stroke="#3b82f6"
          fill="transparent"
          r={radius}
          cx="96"
          cy="96"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform="rotate(-90 96 96)"
          style={{ transition: "stroke-dashoffset 0.2s linear" }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy="0.3em"
          className="font-bold"
          style={{ fontSize: "3rem", fill: "#1f2937" }}
        >
          {formatTime(timeLeft)}
        </text>
      </svg>

      <p className="mt-4 text-gray-500 text-xl">
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
          className="px-5 py-3 bg-blue-500 text-white rounded-lg shadow flex items-center justify-center transform transition-transform duration-300 hover:scale-105"
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
          className="px-5 py-3 bg-gray-200 text-gray-800 rounded-lg shadow text-lg"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;
