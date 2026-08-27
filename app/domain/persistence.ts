import { STORAGE_KEY } from "./config";
import type { CellState } from "./types";

export function loadState(): CellState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CellState) : null;
  } catch { return null; }
}

export function saveState(state: CellState) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* local privacy mode */ }
}
