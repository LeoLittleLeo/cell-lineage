import { ATP_COST_DEFER, ATP_REWARD_COMPLETE, ATP_REWARD_SWAP } from "./config";
import { atpBalance, canDivide, createGeneration, isDayComplete, now, queuedTasks, uid } from "./rules";
import type { CellSkinId } from "./skins";
import type { DaySession, ExchangeType, MutationType, TaskCellModel, TaskWeight } from "./types";

export function settleGeneration(day: DaySession): DaySession {
  const generations = day.generations.map((generation, index) => {
    if (index !== day.generations.length - 1 || generation.maturedAt || !canDivide(generation)) return generation;
    return { ...generation, maturedAt: now() };
  });
  const next = { ...day, generations };
  if (isDayComplete(next)) return { ...next, status: "completed" };
  const latest = generations.at(-1);
  return { ...next, status: latest && canDivide(latest) ? "matured" : "active" };
}

export function releaseNextTasks(day: DaySession, skinId: CellSkinId = day.skinId): DaySession {
  const parent = day.generations.at(-1);
  if (parent && !canDivide(parent)) return day;
  const releasing = queuedTasks(day).slice(0, 2);
  if (!releasing.length) return isDayComplete(day) ? { ...day, status: "completed" } : day;
  const generation = createGeneration(day.generations.length + 1, releasing, parent?.cells, skinId);
  const releasingIds = new Set(releasing.map((task) => task.id));
  return {
    ...day,
    queue: day.queue.map((task) => releasingIds.has(task.id) ? { ...task, status: "released" } : task),
    generations: [...day.generations, generation],
    status: "active",
  };
}

/** Legacy-only escape hatch for cells created before Tomorrow DNA existed. */
export function setCellTitle(day: DaySession, cellId: string, title: string): DaySession {
  return {
    ...day,
    generations: day.generations.map((generation) => ({
      ...generation,
      cells: generation.cells.map((cell) => cell.id === cellId && cell.status === "active" && !cell.sourceTaskId
        ? { ...cell, currentTitle: title, originalTitle: cell.exchangeHistory.length === 0 ? title : cell.originalTitle }
        : cell),
    })),
  };
}

export function completeCell(day: DaySession, cellId: string): DaySession {
  let reward = 0;
  let debtCost = 0;
  let completedSourceTaskId: string | undefined;
  const generations = day.generations.map((generation) => ({
    ...generation,
    cells: generation.cells.map((cell) => {
      if (cell.id !== cellId || cell.status !== "active" || !cell.currentTitle.trim()) return cell;
      completedSourceTaskId = cell.sourceTaskId;
      if (!cell.atpRewardGranted) reward = cell.resolutionType === "minimum_action" ? 0 : cell.resolutionType === "equivalent_swap" || cell.resolutionType === "task_exchange" ? ATP_REWARD_SWAP : ATP_REWARD_COMPLETE;
      if (cell.debtGene && !cell.debtGene.clearedAt) debtCost = cell.debtGene.energyCost;
      const completedAt = now();
      return { ...cell, currentTitle: cell.currentTitle.trim(), status: "completed" as const, completedAt, resolutionType: cell.resolutionType ?? "completed", atpRewardGranted: true, debtGene: cell.debtGene ? { ...cell.debtGene, clearedAt: completedAt } : undefined };
    }),
  }));
  const queue = completedSourceTaskId ? day.queue.map((task) => task.id === completedSourceTaskId ? { ...task, status: "completed" as const } : task) : day.queue;
  return settleGeneration({ ...day, generations, queue, atpEarned: day.atpEarned + reward, atpSpent: day.atpSpent + debtCost });
}

export function toggleCellTimer(day: DaySession, cellId: string): DaySession {
  const timestamp = Date.now();
  return { ...day, generations: day.generations.map((generation) => ({ ...generation, cells: generation.cells.map((cell) => {
    if (cell.id !== cellId || cell.status !== "active" || !cell.estimatedMinutes) return cell;
    if (cell.timerEndsAt) {
      const remainingMinutes = Math.max(0, Math.ceil((new Date(cell.timerEndsAt).getTime() - timestamp) / 60_000));
      return { ...cell, remainingMinutes, timerEndsAt: null };
    }
    const remaining = cell.remainingMinutes ?? cell.estimatedMinutes;
    return { ...cell, remainingMinutes: remaining, timerEndsAt: new Date(timestamp + remaining * 60_000).toISOString() };
  }) })) };
}

export function toggleCellSubtask(day: DaySession, cellId: string, subtaskId: string): DaySession {
  return { ...day, generations: day.generations.map((generation) => ({ ...generation, cells: generation.cells.map((cell) => cell.id === cellId && cell.status === "active"
    ? { ...cell, subtasks: (cell.subtasks ?? []).map((subtask) => subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask) }
    : cell) })) };
}

export function mutateCell(day: DaySession, cellId: string, type: MutationType, replacement?: string, replacementWeight?: TaskWeight, reason = "", emergency = false): DaySession {
  let sourceTaskId: string | undefined;
  let changed = false;
  const generations = day.generations.map((generation) => ({
    ...generation,
    cells: generation.cells.map((cell) => {
      if (cell.id !== cellId || cell.status !== "active") return cell;
      if (type === "task_exchange" && (!replacement?.trim() || !replacementWeight || replacementWeight < cell.weight)) return cell;
      sourceTaskId = cell.sourceTaskId;
      changed = true;
      const record = {
        id: uid("mutation"), type, beforeTitle: cell.currentTitle,
        afterTitle: type === "task_exchange" ? replacement!.trim() : null,
        atpCost: 0, createdAt: now(), reason: reason.trim(), emergency,
      };
      if (type === "task_exchange") {
        return { ...cell, currentTitle: replacement!.trim(), weight: replacementWeight!, mutationCount: (cell.mutationCount ?? 0) + 1, emergencyScar: cell.emergencyScar || emergency, resolutionType: "task_exchange" as const, exchangeHistory: [...cell.exchangeHistory, record] };
      }
      return { ...cell, status: "mutated" as const, completedAt: now(), mutationCount: (cell.mutationCount ?? 0) + 1, emergencyScar: cell.emergencyScar || emergency, resolutionType: type, exchangeHistory: [...cell.exchangeHistory, record] };
    }),
  }));
  if (!changed) return day;
  const queue = sourceTaskId ? day.queue.map((task) => task.id === sourceTaskId
    ? type === "task_exchange"
      ? { ...task, title: replacement!.trim(), weight: replacementWeight!, status: "released" as const }
      : { ...task, status: "mutated" as const }
    : task) : day.queue;
  return settleGeneration({ ...day, generations, queue, mutationCount: day.mutationCount + 1 });
}

/** Preserved for already-running legacy sessions; new execution uses Mutation. */
export function exchangeCell(day: DaySession, cellId: string, type: ExchangeType, replacement?: string): DaySession {
  if (type === "atp_defer" && atpBalance(day) < ATP_COST_DEFER) return day;
  let dormant: TaskCellModel | null = null;
  let sourceTaskId: string | undefined;
  const generations = day.generations.map((generation) => ({
    ...generation,
    cells: generation.cells.map((cell) => {
      if (cell.id !== cellId || cell.status !== "active" || !cell.currentTitle.trim()) return cell;
      const nextTitle = type === "atp_defer" ? cell.currentTitle : replacement?.trim();
      if (!nextTitle) return cell;
      sourceTaskId = cell.sourceTaskId;
      const record = { id: uid("exchange"), type, beforeTitle: cell.currentTitle, afterTitle: type === "atp_defer" ? null : nextTitle, atpCost: type === "atp_defer" ? ATP_COST_DEFER : 0, createdAt: now() };
      const next: TaskCellModel = { ...cell, currentTitle: nextTitle, resolutionType: type, exchangeHistory: [...cell.exchangeHistory, record], status: type === "atp_defer" ? "dormant" : "active", completedAt: type === "atp_defer" ? now() : null };
      if (type === "atp_defer") dormant = next;
      return next;
    }),
  }));
  const spent = dormant ? ATP_COST_DEFER : 0;
  const queue = dormant && sourceTaskId ? day.queue.map((task) => task.id === sourceTaskId ? { ...task, status: "mutated" as const } : task) : day.queue;
  return settleGeneration({ ...day, generations, queue, atpSpent: day.atpSpent + spent, dormantTasks: dormant ? [...day.dormantTasks, dormant] : day.dormantTasks });
}
