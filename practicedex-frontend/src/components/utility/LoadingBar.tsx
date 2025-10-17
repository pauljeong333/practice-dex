import { useEffect, useState } from "react";

const LoadingBar = ({ isLoading }: { isLoading: boolean }) => {
  const [progress, setProgress] = useState(40); // start halfway for instant feedback
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p < 50) return p + Math.random() * 20; // fast start
          if (p < 70) return p + Math.random() * 10; // steady climb
          if (p < 85) return p + Math.random() * 5; // slowing down
          if (p < 95) return p + Math.random() * 2; // hover near 90–95%
          return p;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      // complete smoothly then fade out
      setProgress(100);
      const fade = setTimeout(() => setVisible(false), 600);
      return () => clearTimeout(fade);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-white bg-opacity-30 transition-opacity duration-700 ${
        !isLoading && progress >= 100 ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-64 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-blue-500 h-3 transition-all duration-200 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default LoadingBar;
