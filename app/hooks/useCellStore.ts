"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { addTaskToPlan, appendDebtTask, deletePlanTask, ensurePlan, movePlanTask, sealPlan, updatePlanTask } from "../domain/planning";
import { loadState, saveState } from "../domain/persistence";
import { atpBalance, canDivide, getTomorrowDateKey, getWeekKey, mutationTokensRemaining, normalizeForToday, queuedTasks, resolvedTaskCount } from "../domain/rules";
import { resolveSkinSelection, type CellSkinId, type SkinSelection } from "../domain/skins";
import { completeCell, exchangeCell, mutateCell, releaseNextTasks, setCellTitle, toggleCellSubtask, toggleCellTimer } from "../domain/transitions";
import type { CellState, DailyPlan, DaySession, ExchangeType, MutationType, PlannedTask, SubTask, TaskWeight } from "../domain/types";

type DesktopCloudBridge = { cloudLoad?: () => Promise<{ ok: boolean; state?: CellState | null }>; cloudSave?: (state: CellState) => Promise<{ ok: boolean }> };
const desktopCloud = () => typeof window === "undefined" ? undefined : (window as unknown as { desktop?: DesktopCloudBridge }).desktop;
async function loadCloudState() {
  const bridge = desktopCloud();
  if (bridge?.cloudLoad) return bridge.cloudLoad();
  const response = await fetch("/api/sync", { cache: "no-store" });
  if (!response.ok) throw new Error("sync unavailable");
  return response.json() as Promise<{ ok: boolean; state: CellState | null }>;
}
async function saveCloudState(state: CellState) {
  const bridge = desktopCloud();
  if (bridge?.cloudSave) return bridge.cloudSave(state);
  const response = await fetch("/api/sync", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(state) });
  if (!response.ok) throw new Error("sync unavailable");
  return response.json() as Promise<{ ok: boolean }>;
}

function updateToday(state: CellState, mutate: (day: DaySession) => DaySession): CellState {
  return { ...state, days: state.days.map((day) => day.date === state.currentDate ? mutate(day) : day) };
}

function updatePlan(state: CellState, date: string, mutate: (plan: DailyPlan) => DailyPlan): CellState {
  const existing = state.plans.find((plan) => plan.date === date);
  const next = mutate(ensurePlan(state.plans, date));
  return { ...state, plans: existing ? state.plans.map((plan) => plan.date === date ? next : plan) : [...state.plans, next] };
}

export function useCellStore(cloudEnabled = false) {
  const [state, setState] = useState<CellState>(() => normalizeForToday(null));
  const [hydrated, setHydrated] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"local" | "syncing" | "synced" | "offline">(cloudEnabled ? "syncing" : "local");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) return;
      const local = normalizeForToday(loadState());
      setState(local);
      setHydrated(true);
      if (cloudEnabled) {
        loadCloudState().then(async (payload) => {
          if (payload.state) setState(normalizeForToday(payload.state));
          else await saveCloudState(local);
          setCloudReady(true);
          setSyncStatus("synced");
        }).catch(() => { setCloudReady(true); setSyncStatus("offline"); });
      }
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [cloudEnabled]);
  useEffect(() => { if (hydrated) saveState(state); }, [hydrated, state]);
  useEffect(() => {
    if (!hydrated || !cloudEnabled || !cloudReady) return;
    const timer = window.setTimeout(() => {
      setSyncStatus("syncing");
      saveCloudState(state)
        .then(() => setSyncStatus("synced"))
        .catch(() => setSyncStatus("offline"));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [cloudEnabled, cloudReady, hydrated, state]);

  const day = useMemo(() => state.days.find((item) => item.date === state.currentDate)!, [state]);
  const latest = day.generations.at(-1);
  const tomorrowDate = getTomorrowDateKey(state.currentDate);
  const tomorrowPlan = state.plans.find((plan) => plan.date === tomorrowDate);
  const todayPlan = state.plans.find((plan) => plan.date === state.currentDate);
  const mutateDay = useCallback((mutate: (day: DaySession) => DaySession) => setState((current) => updateToday(current, mutate)), []);

  const divide = useCallback((skinId?: CellSkinId) => setState((current) => updateToday(current, (activeDay) => releaseNextTasks(activeDay, skinId ?? resolveSkinSelection(current.preferences.selectedSkinId)))), []);
  const setSkin = useCallback((selection: SkinSelection) => setState((current) => {
    const previewSkinId = resolveSkinSelection(selection);
    return {
      ...current,
      preferences: { ...current.preferences, selectedSkinId: selection },
      days: current.days.map((item) => item.date === current.currentDate && item.generations.length === 0 ? { ...item, skinId: previewSkinId } : item),
    };
  }), []);
  const setCurrentCellSkin = useCallback((cellId: string, skinId: CellSkinId) => setState((current) => updateToday(current, (activeDay) => ({
    ...activeDay,
    skinId,
    generations: activeDay.generations.map((generation) => ({
      ...generation,
      skinId: generation.cells.some((cell) => cell.id === cellId) ? skinId : generation.skinId,
      cells: generation.cells.map((cell) => cell.id === cellId ? { ...cell, skinId } : cell),
    })),
  }))), []);

  const addPlanTask = useCallback((date: string, source: PlannedTask["source"] = "planned") => setState((current) => updatePlan(current, date, (plan) => addTaskToPlan(plan, source))), []);
  const editPlanTask = useCallback((date: string, taskId: string, patch: { title?: string; weight?: TaskWeight; estimatedMinutes?: number; scheduledStart?: string; scheduledEnd?: string; energy?: 1 | 2 | 3 | 4 | 5; subtasks?: SubTask[] }) => setState((current) => updatePlan(current, date, (plan) => updatePlanTask(plan, taskId, patch))), []);
  const removePlanTask = useCallback((date: string, taskId: string) => setState((current) => updatePlan(current, date, (plan) => deletePlanTask(plan, taskId))), []);
  const reorderPlanTask = useCallback((date: string, taskId: string, targetIndex: number) => setState((current) => updatePlan(current, date, (plan) => movePlanTask(plan, taskId, targetIndex))), []);
  const sealDailyPlan = useCallback((date: string, emergency = false) => setState((current) => {
    const currentPlan = ensurePlan(current.plans, date);
    const sealed = sealPlan(currentPlan, emergency);
    if (sealed === currentPlan || sealed.status !== "sealed") return current;
    let next = updatePlan(current, date, () => sealed);
    if (date === current.currentDate) {
      next = updateToday(next, (activeDay) => ({
        ...activeDay,
        queue: sealed.tasks.map((task, order) => ({ ...task, order, status: "sealed" as const })),
        sealedAt: sealed.sealedAt,
        dnaSource: emergency ? "emergency" : "yesterday",
        generations: [], status: "unstarted",
      }));
    }
    return next;
  }), []);

  const updateTitle = useCallback((cellId: string, title: string) => mutateDay((activeDay) => setCellTitle(activeDay, cellId, title)), [mutateDay]);
  const complete = useCallback((cellId: string) => mutateDay((activeDay) => completeCell(activeDay, cellId)), [mutateDay]);
  const toggleTimer = useCallback((cellId: string) => mutateDay((activeDay) => toggleCellTimer(activeDay, cellId)), [mutateDay]);
  const toggleSubtask = useCallback((cellId: string, subtaskId: string) => mutateDay((activeDay) => toggleCellSubtask(activeDay, cellId, subtaskId)), [mutateDay]);
  const exchange = useCallback((cellId: string, type: ExchangeType, replacement?: string) => mutateDay((activeDay) => exchangeCell(activeDay, cellId, type, replacement)), [mutateDay]);

  const mutate = useCallback((cellId: string, type: MutationType, replacement?: string, weight?: TaskWeight, reason = "", emergency = false) => setState((current) => {
    if (!reason.trim() || (mutationTokensRemaining(current) < 1 && !emergency)) return current;
    const activeDay = current.days.find((item) => item.date === current.currentDate);
    const cell = activeDay?.generations.flatMap((generation) => generation.cells).find((item) => item.id === cellId);
    if (!activeDay || !cell || cell.status !== "active") return current;
    if (type === "task_exchange" && (!replacement?.trim() || !weight || weight < cell.weight)) return current;
    const minimumDebtWeight = Math.min(3, cell.weight + 1) as TaskWeight;
    if (type === "tomorrow_debt" && (!replacement?.trim() || !weight || weight < minimumDebtWeight)) return current;
    const nextDay = mutateCell(activeDay, cellId, type, replacement, weight, reason, emergency);
    if (nextDay === activeDay) return current;

    const week = getWeekKey(current.currentDate);
    let next: CellState = {
      ...current,
      days: current.days.map((item) => item.date === current.currentDate ? nextDay : item),
      mutationUsageByWeek: { ...current.mutationUsageByWeek, [week]: (current.mutationUsageByWeek[week] ?? 0) + 1 },
    };
    if (type === "tomorrow_debt") {
      const date = getTomorrowDateKey(current.currentDate);
      next = updatePlan(next, date, (plan) => appendDebtTask(plan, replacement!, weight!, cell.id, cell.currentTitle));
    }
    return next;
  }), []);

  return {
    state, day, latest, hydrated, syncStatus, atp: atpBalance(day), selectedSkinId: state.preferences.selectedSkinId,
    tomorrowDate, tomorrowPlan, todayPlan, mutationTokens: mutationTokensRemaining(state),
    remainingQueued: queuedTasks(day).length, resolvedTasks: resolvedTaskCount(day), totalTasks: day.queue.length,
    divide, setSkin, setCurrentCellSkin, addPlanTask, editPlanTask, removePlanTask, reorderPlanTask, sealDailyPlan,
    updateTitle, complete, toggleTimer, toggleSubtask, exchange, mutate, canDivide: canDivide(latest),
  };
}
