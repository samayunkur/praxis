import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function difficultyLabel(d: number) {
  const labels = ["", "Very Easy", "Easy", "Medium", "Hard", "Expert"];
  return labels[d] ?? "Medium";
}

export function difficultyColor(d: number) {
  if (d <= 2) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (d === 3) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
}

export function rankColor(rank: string) {
  const map: Record<string, string> = {
    Bronze: "text-amber-600",
    Silver: "text-gray-400",
    Gold: "text-yellow-400",
    Platinum: "text-cyan-400",
    Diamond: "text-blue-400",
  };
  return map[rank] ?? "text-gray-400";
}

export function pointsToRank(points: number): string {
  if (points >= 5000) return "Diamond";
  if (points >= 2000) return "Platinum";
  if (points >= 800) return "Gold";
  if (points >= 200) return "Silver";
  return "Bronze";
}
