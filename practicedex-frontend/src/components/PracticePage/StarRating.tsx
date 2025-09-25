import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  initialRating?: number;
  onRate: (rating: number) => void;
}

export default function StarRating({
  initialRating = 0,
  onRate,
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleRate = (value: number) => {
    setRating(value);
    if (onRate) onRate(value);
  };

  return (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        // Determine if this star should be highlighted
        const isActive = star <= (hoveredStar || rating);
        // Apply a gradient-like opacity for hover effect
        const opacityClass =
          hoveredStar && star <= hoveredStar ? "opacity-70" : "opacity-100";

        return (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="focus:outline-none"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                isActive ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              } ${opacityClass}`}
            />
          </button>
        );
      })}
    </div>
  );
}
