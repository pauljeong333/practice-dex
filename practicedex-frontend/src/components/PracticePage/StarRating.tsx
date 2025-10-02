import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value?: number; // Controlled value
  onRate: (rating: number) => void;
}

export default function StarRating({ value = 0, onRate }: StarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleRate = (star: number) => {
    if (onRate) onRate(star);
  };

  return (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hoveredStar || value);
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
