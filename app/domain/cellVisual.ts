import type { TaskCellModel } from "./types";

export interface CellVisualModel {
  size: number;
  nucleusSize: number;
  mitochondriaCount: number;
  mitochondriaActivity: number;
  ribosomeCount: number;
  membraneStability: number;
  mutationLevel: number;
  showGolgi: boolean;
  showVacuole: boolean;
  divisionReady: boolean;
}

export function deriveCellVisualModel(task: TaskCellModel): CellVisualModel {
  const minutes = task.estimatedMinutes ?? 0;
  const subtasks = task.subtasks ?? [];
  const subtaskProgress = subtasks.length ? subtasks.filter((item) => item.completed).length / subtasks.length : 0;
  const complete = task.status === "completed" || task.status === "mutated" || task.status === "dormant";
  return {
    size: Math.min(1.12, .9 + task.weight * .045 + Math.min(minutes, 120) / 1200),
    nucleusSize: Math.min(44, 29 + task.weight * 3 + Math.min(task.currentTitle.length, 24) / 4),
    mitochondriaCount: minutes ? Math.max(1, Math.min(4, Math.ceil(minutes / 30))) : 0,
    mitochondriaActivity: task.timerEndsAt ? Math.max(.45, (task.energy ?? 3) / 5) : .2,
    ribosomeCount: subtasks.length,
    membraneStability: complete ? 1 : Math.max(.18, subtaskProgress * .72),
    mutationLevel: Math.min(3, task.mutationCount ?? task.exchangeHistory.length),
    showGolgi: false,
    showVacuole: false,
    divisionReady: complete,
  };
}
