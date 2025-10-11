import React from "react";
import clsx from "clsx";

type AIButtonSize = "small" | "medium" | "large";

interface AIButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  hoverEffect?: boolean;
  size?: AIButtonSize;
}

export const AIButton: React.FC<AIButtonProps> = ({
  children,
  hoverEffect = true,
  size = "medium",
  disabled = false,
  className,
  ...props
}) => {
  const sizeClasses = {
    small: "px-4 py-1.5 text-sm h-9",
    medium: "px-6 py-2 text-base h-10",
    large: "px-8 py-3 text-lg h-13",
  };

  const glowSize = {
    small: "blur-md",
    medium: "blur-lg",
    large: "blur-xl",
  };

  const rippleSize = {
    small: "w-[120%] h-[120%]",
    medium: "w-[130%] h-[130%]",
    large: "w-[150%] h-[150%]",
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx(
        "relative flex items-center justify-center text-white font-semibold gap-2 rounded-lg overflow-hidden transition-transform duration-500 animate-breathe",
        sizeClasses[size],
        hoverEffect && !disabled && "group",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {/* Animated gradient background */}
      <div
        className={clsx(
          "absolute inset-0 rounded-lg transition-opacity duration-700",
          disabled
            ? "bg-purple-400 opacity-80"
            : "bg-gradient-to-r from-purple-500 via-fuchsia-500 via-rose-400 via-cyan-400 via-blue-400 to-indigo-500 opacity-90 animate-aurora group-hover:opacity-100"
        )}
      ></div>

      {/* Glowing aura ring */}
      {!disabled && (
        <div
          className={clsx(
            "absolute inset-0 rounded-lg transition-all duration-700 opacity-60 animate-glow",
            glowSize[size],
            hoverEffect && "group-hover:opacity-90 group-hover:blur-xl",
            "bg-gradient-to-r from-purple-400 via-fuchsia-400 via-cyan-400 via-blue-300 to-indigo-400"
          )}
        ></div>
      )}

      {/* Ripple halo (appears on hover) */}
      {!disabled && hoverEffect && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className={clsx(
              "ripple absolute border-2 border-white opacity-30 rounded-full",
              rippleSize[size],
              "group-hover:animate-ripple"
            )}
          ></span>
        </div>
      )}

      {/* Sparkles */}
      {!disabled && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <span className="sparkle top-1/3 left-1/4" />
          <span className="sparkle bottom-1/2 right-1/3 delay-1000" />
          <span className="sparkle top-2/3 right-1/4 delay-2000" />
        </div>
      )}

      {/* Text / Children */}
      <span
        className={clsx(
          "relative z-10 flex items-center gap-2 transition-transform duration-500",
          hoverEffect && !disabled && "group-hover:scale-105"
        )}
      >
        {children}
      </span>
    </button>
  );
};
