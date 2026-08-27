import { ATP_INITIAL } from "./config";
import { DEFAULT_SKIN_ID, DEFAULT_SKIN_SELECTION, isCellSkinId, isSkinSelection, resolveSkinSelection, type CellSkinId, type SkinSelection } from "./skins";
import type { CellState, DaySession, GenerationModel, TaskCellModel } from "./types";

export const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
export const now = () => new Date().toISOString();

export function getLocalDateKey(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function createDay(date = getLocalDateKey(), atpStart = ATP_INITIAL, skinId: CellSkinId = DEFAULT_SKIN_ID): DaySession {
  return {
    id: uid("day"), date, generations: [], dormantTasks: [],
    atpStart, atpEarned: 0, atpSpent: 0, status: "unstarted", skinId,
  };
}

export function createTask(generationId: string, skinId: CellSkinId = DEFAULT_SKIN_ID, parentCellId?: string): TaskCellModel {
  return {
    id: uid("cell"), generationId, parentCellId, originalTitle: "", currentTitle: "",
    status: "active", createdAt: now(), completedAt: null, resolutionType: null,
    exchangeHistory: [], atpRewardGranted: false, skinId,
  };
}

export function createGeneration(index: number, parents: TaskCellModel[] = [], skinId: CellSkinId = DEFAULT_SKIN_ID): GenerationModel {
  const id = uid("generation");
  return {
    id, index, createdAt: now(), maturedAt: null, skinId,
    cells: [createTask(id, skinId, parents[0]?.id), createTask(id, skinId, parents[1]?.id)],
  };
}

export const isCellResolved = (cell: TaskCellModel) => cell.status === "completed" || cell.status === "dormant";
export const canDivide = (generation?: GenerationModel) => Boolean(generation && generation.cells.every(isCellResolved));
export const atpBalance = (day: DaySession) => day.atpStart + day.atpEarned - day.atpSpent;

function migrateCellSkin(cell: TaskCellModel, fallback: CellSkinId): TaskCellModel {
  return { ...cell, skinId: isCellSkinId(cell.skinId) ? cell.skinId : fallback };
}

function migrateDaySkins(day: DaySession): DaySession {
  const daySkinId = isCellSkinId(day.skinId) ? day.skinId : DEFAULT_SKIN_ID;
  return {
    ...day,
    skinId: daySkinId,
    generations: day.generations.map((generation) => {
      const generationSkinId = isCellSkinId(generation.skinId) ? generation.skinId : (isCellSkinId(generation.cells[0]?.skinId) ? generation.cells[0].skinId : daySkinId);
      return { ...generation, skinId: generationSkinId, cells: generation.cells.map((cell) => migrateCellSkin(cell, generationSkinId)) as typeof generation.cells };
    }),
    dormantTasks: day.dormantTasks.map((cell) => migrateCellSkin(cell, daySkinId)),
  };
}

export function normalizeForToday(state: CellState | null): CellState {
  const date = getLocalDateKey();
  if (!state || state.version !== 1 || !Array.isArray(state.days)) {
    return { version: 1, currentDate: date, days: [createDay(date)], preferences: { selectedSkinId: DEFAULT_SKIN_SELECTION } };
  }
  const selectedSkinId: SkinSelection = isSkinSelection(state.preferences?.selectedSkinId) ? state.preferences.selectedSkinId : DEFAULT_SKIN_SELECTION;
  const migratedDays = state.days.map(migrateDaySkins);
  if (!migratedDays.some((day) => day.date === date)) {
    const previous = migratedDays.at(-1);
    const carriedAtp = previous ? Math.max(0, atpBalance(previous)) : ATP_INITIAL;
    return { ...state, currentDate: date, days: [...migratedDays, createDay(date, carriedAtp, resolveSkinSelection(selectedSkinId))], preferences: { selectedSkinId } };
  }
  return { ...state, currentDate: date, days: migratedDays, preferences: { selectedSkinId } };
}
