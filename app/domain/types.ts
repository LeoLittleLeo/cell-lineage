import type { CellSkinId, SkinSelection } from "./skins";

export type CellStatus = "idle" | "active" | "completed" | "exchanged" | "mutated" | "dormant";
export type ResolutionType = "completed" | "minimum_action" | "equivalent_swap" | "atp_defer" | "tomorrow_debt" | "task_exchange" | "mutation_token" | null;
export type ExchangeType = "minimum_action" | "equivalent_swap" | "atp_defer";
export type MutationType = "tomorrow_debt" | "task_exchange" | "mutation_token";
export type TaskWeight = 1 | 2 | 3;
export type PlanTaskStatus = "planning" | "sealed" | "released" | "completed" | "mutated";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ExchangeRecord {
  id: string;
  type: Exclude<ResolutionType, "completed" | null>;
  beforeTitle: string;
  afterTitle: string | null;
  atpCost: number;
  createdAt: string;
  reason?: string;
  emergency?: boolean;
}

export interface DebtGene {
  inheritedFromCellId: string;
  inheritedTitle: string;
  energyCost: number;
  createdAt: string;
  clearedAt: string | null;
}

export interface PlannedTask {
  id: string;
  title: string;
  order: number;
  weight: TaskWeight;
  description?: string;
  estimatedMinutes?: number;
  remainingMinutes?: number;
  scheduledStart?: string;
  scheduledEnd?: string;
  energy?: 1 | 2 | 3 | 4 | 5;
  subtasks?: SubTask[];
  mutationCount?: number;
  debtGene?: DebtGene;
  status: PlanTaskStatus;
  source: "planned" | "emergency" | "debt" | "legacy";
  createdAt: string;
}

export interface DailyPlan {
  id: string;
  date: string;
  tasks: PlannedTask[];
  sealedAt: string | null;
  createdAt: string;
  status: "planning" | "sealed" | "active" | "completed";
}

export interface TaskCellModel {
  id: string;
  generationId: string;
  sourceTaskId?: string;
  parentCellId?: string;
  originalTitle: string;
  currentTitle: string;
  weight: TaskWeight;
  description?: string;
  estimatedMinutes?: number;
  remainingMinutes?: number;
  scheduledStart?: string;
  scheduledEnd?: string;
  energy?: 1 | 2 | 3 | 4 | 5;
  subtasks?: SubTask[];
  mutationCount?: number;
  emergencyScar?: boolean;
  debtGene?: DebtGene;
  timerEndsAt?: string | null;
  status: CellStatus;
  createdAt: string;
  completedAt: string | null;
  resolutionType: ResolutionType;
  exchangeHistory: ExchangeRecord[];
  atpRewardGranted: boolean;
  skinId: CellSkinId;
}

export interface GenerationModel {
  id: string;
  index: number;
  cells: TaskCellModel[];
  createdAt: string;
  maturedAt: string | null;
  skinId: CellSkinId;
}

export interface DaySession {
  id: string;
  date: string;
  queue: PlannedTask[];
  sealedAt: string | null;
  dnaSource: "yesterday" | "emergency" | "debt" | "legacy" | "missing";
  generations: GenerationModel[];
  dormantTasks: TaskCellModel[];
  atpStart: number;
  atpEarned: number;
  atpSpent: number;
  mutationCount: number;
  status: "missing_dna" | "unstarted" | "active" | "matured" | "completed";
  skinId: CellSkinId;
}

export interface UserPreferences {
  selectedSkinId: SkinSelection;
}

export interface CellState {
  version: 2;
  currentDate: string;
  days: DaySession[];
  plans: DailyPlan[];
  mutationUsageByWeek: Record<string, number>;
  preferences: UserPreferences;
}
