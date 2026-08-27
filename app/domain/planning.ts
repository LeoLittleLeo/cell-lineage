import { createDailyPlan, createPlanTask, now } from "./rules";
import type { DailyPlan, PlannedTask, SubTask, TaskWeight } from "./types";

export function ensurePlan(plans: DailyPlan[], date: string) {
  return plans.find((plan) => plan.date === date) ?? createDailyPlan(date);
}

export function addTaskToPlan(plan: DailyPlan, source: PlannedTask["source"] = "planned") {
  if (plan.status !== "planning") return plan;
  return { ...plan, tasks: [...plan.tasks, createPlanTask("", plan.tasks.length, 2, source)] };
}

export function updatePlanTask(plan: DailyPlan, taskId: string, patch: { title?: string; weight?: TaskWeight; estimatedMinutes?: number; energy?: 1 | 2 | 3 | 4 | 5; subtasks?: SubTask[] }) {
  if (plan.status !== "planning") return plan;
  return { ...plan, tasks: plan.tasks.map((task) => task.id === taskId ? { ...task, ...patch, ...(patch.estimatedMinutes !== undefined ? { remainingMinutes: patch.estimatedMinutes } : {}) } : task) };
}

export function deletePlanTask(plan: DailyPlan, taskId: string) {
  if (plan.status !== "planning") return plan;
  return { ...plan, tasks: plan.tasks.filter((task) => task.id !== taskId).map((task, order) => ({ ...task, order })) };
}

export function movePlanTask(plan: DailyPlan, taskId: string, targetIndex: number) {
  if (plan.status !== "planning") return plan;
  const currentIndex = plan.tasks.findIndex((task) => task.id === taskId);
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= plan.tasks.length || currentIndex === targetIndex) return plan;
  const tasks = [...plan.tasks];
  const [moving] = tasks.splice(currentIndex, 1);
  tasks.splice(targetIndex, 0, moving);
  return { ...plan, tasks: tasks.map((task, order) => ({ ...task, order })) };
}

export function sealPlan(plan: DailyPlan, emergency = false) {
  if (plan.status !== "planning") return plan;
  const tasks = plan.tasks.filter((task) => task.title.trim()).map((task, order) => ({ ...task, title: task.title.trim(), order, status: "sealed" as const, source: emergency ? "emergency" as const : task.source }));
  if (!tasks.length) return plan;
  return { ...plan, tasks, status: "sealed" as const, sealedAt: now() };
}

export function appendDebtTask(plan: DailyPlan, title: string, weight: TaskWeight) {
  const task = createPlanTask(title.trim(), plan.tasks.length, weight, "debt");
  return { ...plan, tasks: [...plan.tasks, { ...task, status: plan.status === "sealed" ? "sealed" as const : "planning" as const }] };
}
