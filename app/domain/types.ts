export type CellStatus = "idle" | "active" | "completed" | "exchanged" | "dormant";
export type ResolutionType = "completed" | "minimum_action" | "equivalent_swap" | "atp_defer" | null;
export type ExchangeType = Exclude<ResolutionType, "completed" | null>;

export interface ExchangeRecord {
  id: string;
  type: ExchangeType;
  beforeTitle: string;
  afterTitle: string | null;
  atpCost: number;
  createdAt: string;
}

export interface TaskCellModel {
  id: string;
  generationId: string;
  parentCellId?: string;
  originalTitle: string;
  currentTitle: string;
  status: CellStatus;
  createdAt: string;
  completedAt: string | null;
  resolutionType: ResolutionType;
  exchangeHistory: ExchangeRecord[];
  atpRewardGranted: boolean;
}

export interface GenerationModel {
  id: string;
  index: number;
  cells: [TaskCellModel, TaskCellModel];
  createdAt: string;
  maturedAt: string | null;
}

export interface DaySession {
  id: string;
  date: string;
  generations: GenerationModel[];
  dormantTasks: TaskCellModel[];
  atpStart: number;
  atpEarned: number;
  atpSpent: number;
  status: "unstarted" | "active" | "matured";
}

export interface CellState {
  version: 1;
  currentDate: string;
  days: DaySession[];
}
