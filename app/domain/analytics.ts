import type { DaySession } from "./types";

export function deriveMonthlyReview(days: DaySession[], dateKey: string) {
  const month = dateKey.slice(0, 7);
  const monthDays = days.filter((day) => day.date.startsWith(month)).sort((a, b) => a.date.localeCompare(b.date));
  const cells = monthDays.flatMap((day) => day.generations.flatMap((generation) => generation.cells));
  const completed = cells.filter((cell) => cell.status === "completed").length;
  const mutated = cells.filter((cell) => cell.status === "mutated" || cell.status === "dormant").length;
  const resolved = completed + mutated;
  const scars = cells.filter((cell) => cell.emergencyScar).length;
  const energySurplus = monthDays.reduce((sum, day) => sum + day.atpEarned - day.atpSpent, 0);
  return {
    month,
    days: monthDays,
    completed,
    mutated,
    scars,
    energySurplus,
    fulfillmentRate: resolved ? completed / resolved : 0,
  };
}
