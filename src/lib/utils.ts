import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function getMatchColor(percentage: number): string {
  if (percentage >= 90) return "text-green-400";
  if (percentage >= 75) return "text-yellow-400";
  if (percentage >= 60) return "text-orange-400";
  return "text-red-400";
}

export function getRatingColor(rating: number): string {
  if (rating >= 8) return "text-green-400";
  if (rating >= 7) return "text-yellow-400";
  if (rating >= 5) return "text-orange-400";
  return "text-red-400";
}
