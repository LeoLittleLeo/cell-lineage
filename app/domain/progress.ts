import type { TaskCellModel } from "./types";

export type TimeWindowState = "unscheduled" | "upcoming" | "active" | "ending" | "overdue" | "complete";

function minuteOfDay(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function deriveTaskProgress(task: TaskCellModel, timestamp = Date.now()) {
  const resolved = task.status === "completed" || task.status === "mutated" || task.status === "dormant";
  const estimated = Math.max(1, task.estimatedMinutes ?? 30);
  const liveRemaining = task.timerEndsAt ? Math.max(0, (new Date(task.timerEndsAt).getTime() - timestamp) / 60_000) : task.remainingMinutes ?? estimated;
  const timerProgress = clamp((estimated - liveRemaining) / estimated);
  const subtasks = task.subtasks ?? [];
  const subtaskProgress = subtasks.length ? subtasks.filter((item) => item.completed).length / subtasks.length : 0;
  const executionProgress = resolved ? 1 : Math.max(timerProgress, subtaskProgress);

  if (!task.scheduledStart || !task.scheduledEnd) {
    return { windowProgress: 0, executionProgress, state: resolved ? "complete" as const : "unscheduled" as const, minutesUntilStart: null, minutesUntilEnd: null };
  }

  const date = new Date(timestamp);
  const current = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  const start = minuteOfDay(task.scheduledStart);
  const end = minuteOfDay(task.scheduledEnd);
  const duration = Math.max(1, end - start);
  const windowProgress = clamp((current - start) / duration);
  const minutesUntilStart = Math.round(start - current);
  const minutesUntilEnd = Math.round(end - current);
  const state: TimeWindowState = resolved ? "complete" : current < start ? "upcoming" : current >= end ? "overdue" : windowProgress >= .8 ? "ending" : "active";
  return { windowProgress, executionProgress, state, minutesUntilStart, minutesUntilEnd };
}
