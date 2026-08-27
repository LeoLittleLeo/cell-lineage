import { ATP_INITIAL, MUTATION_TOKENS_WEEKLY } from "./config";
import { DEFAULT_SKIN_ID, DEFAULT_SKIN_SELECTION, isCellSkinId, isSkinSelection, resolveSkinSelection, type CellSkinId, type SkinSelection } from "./skins";
import type { CellState, DailyPlan, DaySession, GenerationModel, PlannedTask, TaskCellModel, TaskWeight } from "./types";

export const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
export const now = () => new Date().toISOString();

export function getLocalDateKey(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function addLocalDays(dateKey: string, amount: number) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return getLocalDateKey(date);
}

export const getTomorrowDateKey = (date = getLocalDateKey()) => addLocalDays(date, 1);

export function getWeekKey(dateKey = getLocalDateKey()) {
  const date = new Date(`${dateKey}T12:00:00`);
  const weekday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - weekday);
  return getLocalDateKey(date);
}

export function mutationTokensRemaining(state: CellState, date = state.currentDate) {
  return Math.max(0, MUTATION_TOKENS_WEEKLY - (state.mutationUsageByWeek[getWeekKey(date)] ?? 0));
}

export function createPlanTask(title = "", order = 0, weight: TaskWeight = 2, source: PlannedTask["source"] = "planned"): PlannedTask {
  return { id: uid("plan_task"), title, order, weight, estimatedMinutes: 30, remainingMinutes: 30, energy: weight + 1 as 2 | 3 | 4, subtasks: [], mutationCount: 0, status: "planning", source, createdAt: now() };
}

export function createDailyPlan(date: string): DailyPlan {
  return { id: uid("plan"), date, tasks: [], sealedAt: null, createdAt: now(), status: "planning" };
}

export function createDay(
  date = getLocalDateKey(),
  atpStart = ATP_INITIAL,
  skinId: CellSkinId = DEFAULT_SKIN_ID,
  queue: PlannedTask[] = [],
  dnaSource: DaySession["dnaSource"] = queue.length ? "yesterday" : "missing",
  sealedAt: string | null = null,
): DaySession {
  return {
    id: uid("day"), date, queue: queue.map((task, order) => ({ ...task, order, status: "sealed" })), sealedAt, dnaSource,
    generations: [], dormantTasks: [], atpStart, atpEarned: 0, atpSpent: 0, mutationCount: 0,
    status: queue.length ? "unstarted" : "missing_dna", skinId,
  };
}

export function createTaskFromPlan(generationId: string, task: PlannedTask, skinId: CellSkinId, parentCellId?: string): TaskCellModel {
  return {
    id: uid("cell"), generationId, sourceTaskId: task.id, parentCellId,
    originalTitle: task.title, currentTitle: task.title, weight: task.weight, status: "active",
    description: task.description, estimatedMinutes: task.estimatedMinutes, remainingMinutes: task.remainingMinutes ?? task.estimatedMinutes,
    energy: task.energy, subtasks: task.subtasks ?? [], mutationCount: task.mutationCount ?? 0, timerEndsAt: null,
    createdAt: now(), completedAt: null, resolutionType: null, exchangeHistory: [], atpRewardGranted: false, skinId,
  };
}

export function createGeneration(index: number, tasks: PlannedTask[], parents: TaskCellModel[] = [], skinId: CellSkinId = DEFAULT_SKIN_ID): GenerationModel {
  const id = uid("generation");
  return {
    id, index, createdAt: now(), maturedAt: null, skinId,
    cells: tasks.map((task, taskIndex) => createTaskFromPlan(id, task, skinId, parents[taskIndex]?.id)),
  };
}

export const isCellResolved = (cell: TaskCellModel) => cell.status === "completed" || cell.status === "mutated" || cell.status === "dormant";
export const canDivide = (generation?: GenerationModel) => Boolean(generation && generation.cells.length > 0 && generation.cells.every(isCellResolved));
export const atpBalance = (day: DaySession) => day.atpStart + day.atpEarned - day.atpSpent;
export const queuedTasks = (day: DaySession) => day.queue.filter((task) => task.status === "sealed").sort((a, b) => a.order - b.order);
export const resolvedTaskCount = (day: DaySession) => day.queue.filter((task) => task.status === "completed" || task.status === "mutated").length;
export const isDayComplete = (day: DaySession) => day.queue.length > 0 && resolvedTaskCount(day) === day.queue.length && (!day.generations.length || canDivide(day.generations.at(-1)));

function normalizeWeight(value: unknown): TaskWeight {
  return value === 1 || value === 3 ? value : 2;
}

function migratePlannedTask(task: PlannedTask, order: number, source: PlannedTask["source"] = "planned"): PlannedTask {
  const status = ["planning", "sealed", "released", "completed", "mutated"].includes(task.status) ? task.status : "planning";
  const estimatedMinutes = typeof task.estimatedMinutes === "number" ? task.estimatedMinutes : 30;
  return { ...task, id: task.id || uid("plan_task"), title: task.title ?? "", order, weight: normalizeWeight(task.weight), estimatedMinutes, remainingMinutes: task.remainingMinutes ?? estimatedMinutes, energy: task.energy ?? 3, subtasks: task.subtasks ?? [], mutationCount: task.mutationCount ?? 0, status, source: task.source ?? source, createdAt: task.createdAt ?? now() };
}

function migrateCell(cell: TaskCellModel, fallback: CellSkinId, sourceTaskId?: string): TaskCellModel {
  return {
    ...cell,
    sourceTaskId: cell.sourceTaskId ?? sourceTaskId,
    weight: normalizeWeight(cell.weight),
    estimatedMinutes: cell.estimatedMinutes ?? 30,
    remainingMinutes: cell.remainingMinutes ?? cell.estimatedMinutes ?? 30,
    energy: cell.energy ?? 3,
    subtasks: cell.subtasks ?? [],
    mutationCount: cell.mutationCount ?? cell.exchangeHistory?.length ?? 0,
    timerEndsAt: cell.timerEndsAt ?? null,
    skinId: isCellSkinId(cell.skinId) ? cell.skinId : fallback,
  };
}

function migrateDay(day: DaySession): DaySession {
  const daySkinId = isCellSkinId(day.skinId) ? day.skinId : DEFAULT_SKIN_ID;
  const hasQueue = Array.isArray(day.queue) && day.queue.length > 0;
  const legacyQueue: PlannedTask[] = hasQueue ? day.queue.map((task, order) => migratePlannedTask(task, order, task.source ?? "legacy")) : [];
  const queue = [...legacyQueue];
  let legacyOrder = queue.length;
  const generations = (day.generations ?? []).map((generation) => {
    const generationSkinId = isCellSkinId(generation.skinId) ? generation.skinId : (isCellSkinId(generation.cells?.[0]?.skinId) ? generation.cells[0].skinId : daySkinId);
    const cells = (generation.cells ?? []).map((rawCell) => {
      let sourceTaskId = rawCell.sourceTaskId;
      if (!sourceTaskId) {
        sourceTaskId = `legacy_${rawCell.id}`;
        if (!queue.some((task) => task.id === sourceTaskId) && rawCell.currentTitle?.trim()) {
          queue.push({
            id: sourceTaskId, title: rawCell.currentTitle.trim(), order: legacyOrder++, weight: normalizeWeight(rawCell.weight),
            status: isCellResolved(rawCell) ? (rawCell.status === "completed" ? "completed" : "mutated") : "released",
            source: "legacy", createdAt: rawCell.createdAt ?? now(),
          });
        }
      }
      return migrateCell(rawCell, generationSkinId, sourceTaskId);
    });
    return { ...generation, skinId: generationSkinId, cells, createdAt: generation.createdAt ?? now(), maturedAt: generation.maturedAt ?? null };
  });
  const migrated: DaySession = {
    ...day,
    queue: queue.sort((a, b) => a.order - b.order),
    sealedAt: day.sealedAt ?? null,
    dnaSource: day.dnaSource ?? (generations.length ? "legacy" : "missing"),
    generations,
    dormantTasks: (day.dormantTasks ?? []).map((cell) => migrateCell(cell, daySkinId)),
    mutationCount: day.mutationCount ?? 0,
    skinId: daySkinId,
    status: day.status === "completed" || isDayComplete({ ...day, queue, generations } as DaySession)
      ? "completed"
      : generations.length ? (canDivide(generations.at(-1)) ? "matured" : "active") : queue.length ? "unstarted" : "missing_dna",
  };
  return migrated;
}

function migratePlan(plan: DailyPlan): DailyPlan {
  const tasks = (plan.tasks ?? []).map((task, order) => migratePlannedTask(task, order));
  return { ...plan, id: plan.id || uid("plan"), tasks, sealedAt: plan.sealedAt ?? null, createdAt: plan.createdAt ?? now(), status: plan.status ?? (plan.sealedAt ? "sealed" : "planning") };
}

function executableTasks(plan?: DailyPlan) {
  if (!plan) return [];
  if (plan.status === "sealed" || plan.status === "active" || plan.status === "completed") return plan.tasks;
  return plan.tasks.filter((task) => task.source === "debt");
}

export function normalizeForToday(state: CellState | null): CellState {
  const date = getLocalDateKey();
  const raw = state as unknown as Partial<CellState> | null;
  const selectedSkinId: SkinSelection = isSkinSelection(raw?.preferences?.selectedSkinId) ? raw.preferences.selectedSkinId : DEFAULT_SKIN_SELECTION;
  const plans = Array.isArray(raw?.plans) ? raw.plans.map(migratePlan) : [];
  const days = Array.isArray(raw?.days) ? raw.days.map(migrateDay) : [];
  const mutationUsageByWeek = raw?.mutationUsageByWeek && typeof raw.mutationUsageByWeek === "object" ? raw.mutationUsageByWeek : {};

  if (!days.some((day) => day.date === date)) {
    const previous = days.at(-1);
    const carriedAtp = previous ? Math.max(0, atpBalance(previous)) : ATP_INITIAL;
    const todayPlan = plans.find((plan) => plan.date === date);
    const tasks = executableTasks(todayPlan);
    const dnaSource: DaySession["dnaSource"] = todayPlan?.status === "sealed" ? "yesterday" : tasks.length ? "debt" : "missing";
    days.push(createDay(date, carriedAtp, resolveSkinSelection(selectedSkinId), tasks, dnaSource, todayPlan?.sealedAt ?? null));
  }

  const normalizedDays = days.map((day) => {
    if (day.date !== date || day.queue.length || day.generations.length) return day;
    const todayPlan = plans.find((plan) => plan.date === date);
    const tasks = executableTasks(todayPlan);
    if (!tasks.length) return { ...day, status: "missing_dna" as const, dnaSource: "missing" as const };
    return createDay(date, day.atpStart, day.skinId, tasks, todayPlan?.status === "sealed" ? "yesterday" : "debt", todayPlan?.sealedAt ?? null);
  });

  return { version: 2, currentDate: date, days: normalizedDays, plans, mutationUsageByWeek, preferences: { selectedSkinId } };
}
