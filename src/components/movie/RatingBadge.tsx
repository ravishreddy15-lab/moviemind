import { Star } from "lucide-react";
import { cn, getRatingColor } from "@/lib/utils";

interface RatingBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "px-1.5 py-0.5 text-xs gap-1",
  md: "px-2 py-1 text-sm gap-1.5",
  lg: "px-3 py-1.5 text-base gap-2",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export default function RatingBadge({ rating, size = "md" }: RatingBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded bg-zinc-800 font-medium",
        getRatingColor(rating),
        sizeClasses[size]
      )}
    >
      <Star className={cn("fill-current", iconSizes[size])} />
      {rating.toFixed(1)}
    </span>
  );
}
