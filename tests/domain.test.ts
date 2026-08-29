import assert from "node:assert/strict";
import test from "node:test";
import { deriveCellVisualModel } from "../app/domain/cellVisual";
import { deriveMonthlyReview } from "../app/domain/analytics";
import { appendDebtTask, sealPlan } from "../app/domain/planning";
import { deriveTaskProgress } from "../app/domain/progress";
import { canDivide, createDailyPlan, createDay, createPlanTask, getLocalDateKey, mutationTokensRemaining, normalizeForToday } from "../app/domain/rules";
import { CELL_SKINS, resolveSkinSelection } from "../app/domain/skins";
import { completeCell, mutateCell, releaseNextTasks, toggleCellSubtask, toggleCellTimer } from "../app/domain/transitions";
import type { CellState, PlannedTask } from "../app/domain/types";

function task(title: string, order: number, weight: 1 | 2 | 3 = 2): PlannedTask {
  return { ...createPlanTask(title, order, weight), status: "sealed", estimatedMinutes: 30 + order * 15, remainingMinutes: 30 + order * 15, energy: 3, subtasks: [] };
}

function queuedDay(count = 4) {
  return createDay("2026-08-27", 2, "cell", Array.from({ length: count }, (_, index) => task(`Task ${index + 1}`, index)));
}

test("sealed DNA releases at most two tasks in order", () => {
  const day = releaseNextTasks(queuedDay(3), "jelly");
  assert.deepEqual(day.generations[0].cells.map((cell) => cell.currentTitle), ["Task 1", "Task 2"]);
  assert.ok(day.generations[0].cells.every((cell) => cell.sourceTaskId));
  assert.equal(day.queue.filter((item) => item.status === "sealed").length, 1);
  assert.equal(day.generations[0].skinId, "jelly");
});

test("an unresolved generation locks further division", () => {
  const day = releaseNextTasks(queuedDay());
  assert.equal(releaseNextTasks(day).generations.length, 1);
  assert.equal(canDivide(day.generations[0]), false);
});

test("odd final DNA creates a single-cell generation", () => {
  let day = releaseNextTasks(queuedDay(3));
  for (const cell of day.generations[0].cells) day = completeCell(day, cell.id);
  day = releaseNextTasks(day, "ink");
  assert.equal(day.generations[1].cells.length, 1);
  assert.equal(day.generations[1].cells[0].currentTitle, "Task 3");
});

test("completion rewards ATP exactly once and completes the day", () => {
  let day = releaseNextTasks(queuedDay(2));
  const [a, b] = day.generations[0].cells;
  day = completeCell(day, a.id);
  day = completeCell(day, a.id);
  assert.equal(day.atpEarned, 1);
  day = completeCell(day, b.id);
  assert.equal(day.atpEarned, 2);
  assert.equal(day.status, "completed");
  assert.ok(day.queue.every((item) => item.status === "completed"));
});

test("task exchange enforces equal weight while other mutations resolve", () => {
  let day = releaseNextTasks(queuedDay(2));
  const cell = day.generations[0].cells[0];
  const rejected = mutateCell(day, cell.id, "task_exchange", "Too light", 1);
  assert.equal(rejected.generations[0].cells[0].currentTitle, "Task 1");
  day = mutateCell(day, cell.id, "task_exchange", "Equivalent work", 2);
  assert.equal(day.generations[0].cells[0].status, "active");
  assert.equal(day.generations[0].cells[0].mutationCount, 1);
  day = mutateCell(day, cell.id, "mutation_token");
  assert.equal(day.generations[0].cells[0].status, "mutated");
  assert.equal(day.queue[0].status, "mutated");
});

test("emergency mutation preserves its reason and permanent scar", () => {
  let day = releaseNextTasks(queuedDay(1));
  const cell = day.generations[0].cells[0];
  day = mutateCell(day, cell.id, "mutation_token", undefined, undefined, "Priority changed", true);
  const changed = day.generations[0].cells[0];
  assert.equal(changed.emergencyScar, true);
  assert.equal(changed.exchangeHistory[0].reason, "Priority changed");
  assert.equal(changed.exchangeHistory[0].emergency, true);
});

test("tomorrow debt becomes an inherited gene that costs energy to clear", () => {
  const plan = appendDebtTask(createDailyPlan("2026-08-28"), "Repay promise", 3, "parent-1", "Old promise");
  let day = releaseNextTasks(createDay("2026-08-28", 2, "cell", plan.tasks.map((item) => ({ ...item, status: "sealed" }))));
  const cell = day.generations[0].cells[0];
  assert.equal(cell.debtGene?.inheritedFromCellId, "parent-1");
  day = completeCell(day, cell.id);
  assert.equal(day.atpSpent, 1);
  assert.ok(day.generations[0].cells[0].debtGene?.clearedAt);
});

test("timer and ribosomes carry real task state", () => {
  const withSubtasks = { ...task("Build portfolio", 0, 3), subtasks: [{ id: "s1", title: "Research", completed: false }, { id: "s2", title: "Export", completed: false }] };
  let day = releaseNextTasks(createDay("2026-08-27", 2, "cell", [withSubtasks]));
  const cell = day.generations[0].cells[0];
  day = toggleCellTimer(day, cell.id);
  assert.ok(day.generations[0].cells[0].timerEndsAt);
  day = toggleCellSubtask(day, cell.id, "s1");
  assert.equal(day.generations[0].cells[0].subtasks?.[0].completed, true);
  const visual = deriveCellVisualModel(day.generations[0].cells[0]);
  assert.equal(visual.ribosomeCount, 2);
  assert.ok(visual.mitochondriaCount > 0);
  assert.ok(visual.membraneStability > .18);
});

test("a scheduled task exposes independent time-window and execution progress", () => {
  const day = releaseNextTasks(createDay("2026-08-27", 2, "cell", [{ ...task("Timed", 0), scheduledStart: "09:00", scheduledEnd: "10:00", subtasks: [{ id: "s1", title: "Half", completed: true }, { id: "s2", title: "Rest", completed: false }] }]));
  const progress = deriveTaskProgress(day.generations[0].cells[0], new Date(2026, 7, 27, 9, 30).getTime());
  assert.equal(progress.state, "active");
  assert.equal(progress.windowProgress, .5);
  assert.equal(progress.executionProgress, .5);
});

test("monthly review measures fulfilled promises against honest mutations", () => {
  let day = releaseNextTasks(queuedDay(2));
  day = completeCell(day, day.generations[0].cells[0].id);
  day = mutateCell(day, day.generations[0].cells[1].id, "mutation_token", undefined, undefined, "No longer relevant");
  const review = deriveMonthlyReview([day], "2026-08-27");
  assert.equal(review.fulfillmentRate, .5);
  assert.equal(review.mutated, 1);
});

test("a sealed plan for today becomes executable DNA", () => {
  const date = getLocalDateKey();
  const plan = sealPlan({ ...createDailyPlan(date), tasks: [createPlanTask("Prepared yesterday", 0)] });
  const state = normalizeForToday({ version: 2, currentDate: "2000-01-01", days: [], plans: [plan], mutationUsageByWeek: {}, preferences: { selectedSkinId: "moss" } });
  assert.equal(state.days.at(-1)?.status, "unstarted");
  assert.equal(state.days.at(-1)?.queue[0].title, "Prepared yesterday");
  assert.equal(state.days.at(-1)?.dnaSource, "yesterday");
});

test("unsealed ordinary plans do not leak into today", () => {
  const date = getLocalDateKey();
  const plan = { ...createDailyPlan(date), tasks: [createPlanTask("Not sealed", 0)] };
  const state = normalizeForToday({ version: 2, currentDate: "2000-01-01", days: [], plans: [plan], mutationUsageByWeek: {}, preferences: { selectedSkinId: "cell" } });
  assert.equal(state.days.at(-1)?.status, "missing_dna");
  assert.equal(state.days.at(-1)?.queue.length, 0);
});

test("weekly Mutation tokens are capped at three", () => {
  const state = normalizeForToday(null);
  assert.equal(mutationTokensRemaining(state), 3);
  const week = Object.keys({ [state.currentDate]: true })[0];
  const monday = (() => { const date = new Date(`${week}T12:00:00`); date.setDate(date.getDate() - (date.getDay() + 6) % 7); return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10); })();
  assert.equal(mutationTokensRemaining({ ...state, mutationUsageByWeek: { [monday]: 3 } }), 0);
});

test("all six skins remain available and Random resolves safely", () => {
  assert.deepEqual(CELL_SKINS.map((skin) => skin.id), ["cell", "jelly", "petri", "yolk", "ink", "moss"]);
  assert.equal(resolveSkinSelection("random", () => 0), "cell");
  assert.equal(resolveSkinSelection("random", () => .999), "moss");
});

test("version-one data migrates without losing cells", () => {
  const date = getLocalDateKey();
  let legacyDay = releaseNextTasks(createDay(date, 2, "cell", [task("Legacy task", 0)]));
  legacyDay = { ...legacyDay, queue: [] };
  const legacy = { version: 1, currentDate: date, days: [{ ...legacyDay, skinId: undefined, generations: legacyDay.generations.map((generation) => ({ ...generation, skinId: undefined, cells: generation.cells.map((cell) => ({ ...cell, sourceTaskId: undefined, skinId: undefined })) })) }] } as unknown as CellState;
  const migrated = normalizeForToday(legacy);
  assert.equal(migrated.version, 2);
  assert.equal(migrated.days[0].generations[0].cells[0].currentTitle, "Legacy task");
  assert.equal(migrated.days[0].generations[0].cells[0].skinId, "cell");
  assert.equal(migrated.days[0].queue.length, 1);
});
