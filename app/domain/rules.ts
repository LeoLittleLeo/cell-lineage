import { ATP_INITIAL } from "./config";
import type { CellState, DaySession, GenerationModel, TaskCellModel } from "./types";

export const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
export const now = () => new Date().toISOString();

export function getLocalDateKey(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function createDay(date = getLocalDateKey(), atpStart = ATP_INITIAL): DaySession {
  return {
    id: uid("day"), date, generations: [], dormantTasks: [],
    atpStart, atpEarned: 0, atpSpent: 0, status: "unstarted",
  };
}

export function createTask(generationId: string, parentCellId?: string): TaskCellModel {
  return {
    id: uid("cell"), generationId, parentCellId, originalTitle: "", currentTitle: "",
    status: "active", createdAt: now(), completedAt: null, resolutionType: null,
    exchangeHistory: [], atpRewardGranted: false,
  };
}

export function createGeneration(index: number, parents: TaskCellModel[] = []): GenerationModel {
  const id = uid("generation");
  return {
    id, index, createdAt: now(), maturedAt: null,
    cells: [createTask(id, parents[0]?.id), createTask(id, parents[1]?.id)],
  };
}

export const isCellResolved = (cell: TaskCellModel) => cell.status === "completed" || cell.status === "dormant";
export const canDivide = (generation?: GenerationModel) => Boolean(generation && generation.cells.every(isCellResolved));
export const atpBalance = (day: DaySession) => day.atpStart + day.atpEarned - day.atpSpent;

export function normalizeForToday(state: CellState | null): CellState {
  const date = getLocalDateKey();
  if (!state || state.version !== 1 || !Array.isArray(state.days)) {
    return { version: 1, currentDate: date, days: [createDay(date)] };
  }
  if (!state.days.some((day) => day.date === date)) {
    const previous = state.days.at(-1);
    const carriedAtp = previous ? Math.max(0, atpBalance(previous)) : ATP_INITIAL;
    return { ...state, currentDate: date, days: [...state.days, createDay(date, carriedAtp)] };
  }
  return { ...state, currentDate: date };
}
