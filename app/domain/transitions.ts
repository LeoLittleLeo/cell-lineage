import { ATP_COST_DEFER, ATP_REWARD_COMPLETE, ATP_REWARD_SWAP } from "./config";
import { atpBalance, canDivide, createGeneration, now, uid } from "./rules";
import type { CellSkinId } from "./skins";
import type { DaySession, ExchangeType, TaskCellModel } from "./types";

export function settleGeneration(day: DaySession): DaySession {
  const generations = day.generations.map((generation, index) => {
    if (index !== day.generations.length - 1 || generation.maturedAt || !canDivide(generation)) return generation;
    return { ...generation, maturedAt: now() };
  });
  const latest = generations.at(-1);
  return { ...day, generations, status: latest && canDivide(latest) ? "matured" : "active" };
}

export function divideDay(day: DaySession, skinId: CellSkinId = day.skinId): DaySession {
  const parent = day.generations.at(-1);
  if (parent && !canDivide(parent)) return day;
  return { ...day, generations: [...day.generations, createGeneration(day.generations.length + 1, parent?.cells, skinId)], status: "active" };
}

export function setCellTitle(day: DaySession, cellId: string, title: string): DaySession {
  return {
    ...day,
    generations: day.generations.map((generation) => ({
      ...generation,
      cells: generation.cells.map((cell) => cell.id === cellId && cell.status === "active"
        ? { ...cell, currentTitle: title, originalTitle: cell.exchangeHistory.length === 0 ? title : cell.originalTitle }
        : cell) as typeof generation.cells,
    })),
  };
}

export function completeCell(day: DaySession, cellId: string): DaySession {
  let reward = 0;
  const generations = day.generations.map((generation) => ({
    ...generation,
    cells: generation.cells.map((cell) => {
      if (cell.id !== cellId || cell.status !== "active" || !cell.currentTitle.trim()) return cell;
      if (!cell.atpRewardGranted) reward = cell.resolutionType === "minimum_action" ? 0 : cell.resolutionType === "equivalent_swap" ? ATP_REWARD_SWAP : ATP_REWARD_COMPLETE;
      return { ...cell, currentTitle: cell.currentTitle.trim(), status: "completed" as const, completedAt: now(), resolutionType: cell.resolutionType ?? "completed", atpRewardGranted: true };
    }) as typeof generation.cells,
  }));
  return settleGeneration({ ...day, generations, atpEarned: day.atpEarned + reward });
}

export function exchangeCell(day: DaySession, cellId: string, type: ExchangeType, replacement?: string): DaySession {
  if (type === "atp_defer" && atpBalance(day) < ATP_COST_DEFER) return day;
  let dormant: TaskCellModel | null = null;
  const generations = day.generations.map((generation) => ({
    ...generation,
    cells: generation.cells.map((cell) => {
      if (cell.id !== cellId || cell.status !== "active" || !cell.currentTitle.trim()) return cell;
      const nextTitle = type === "atp_defer" ? cell.currentTitle : replacement?.trim();
      if (!nextTitle) return cell;
      const record = { id: uid("exchange"), type, beforeTitle: cell.currentTitle, afterTitle: type === "atp_defer" ? null : nextTitle, atpCost: type === "atp_defer" ? ATP_COST_DEFER : 0, createdAt: now() };
      const next: TaskCellModel = { ...cell, currentTitle: nextTitle, resolutionType: type, exchangeHistory: [...cell.exchangeHistory, record], status: type === "atp_defer" ? "dormant" : "active", completedAt: type === "atp_defer" ? now() : null };
      if (type === "atp_defer") dormant = next;
      return next;
    }) as typeof generation.cells,
  }));
  const spent = dormant ? ATP_COST_DEFER : 0;
  const nextDay: DaySession = { ...day, generations, atpSpent: day.atpSpent + spent, dormantTasks: dormant ? [...day.dormantTasks, dormant] : day.dormantTasks };
  return settleGeneration(nextDay);
}
