"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadState, saveState } from "../domain/persistence";
import { atpBalance, canDivide, normalizeForToday } from "../domain/rules";
import { completeCell, divideDay, exchangeCell, setCellTitle } from "../domain/transitions";
import type { CellState, DaySession, ExchangeType } from "../domain/types";

function updateToday(state: CellState, mutate: (day: DaySession) => DaySession): CellState {
  return { ...state, days: state.days.map((day) => day.date === state.currentDate ? mutate(day) : day) };
}

export function useCellStore() {
  const [state, setState] = useState<CellState>(() => normalizeForToday(null));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) return;
      setState(normalizeForToday(loadState()));
      setHydrated(true);
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);
  useEffect(() => { if (hydrated) saveState(state); }, [hydrated, state]);

  const day = useMemo(() => state.days.find((item) => item.date === state.currentDate)!, [state]);
  const latest = day.generations.at(-1);
  const mutateDay = useCallback((mutate: (day: DaySession) => DaySession) => setState((current) => updateToday(current, mutate)), []);
  const divide = useCallback(() => mutateDay(divideDay), [mutateDay]);
  const updateTitle = useCallback((cellId: string, title: string) => mutateDay((activeDay) => setCellTitle(activeDay, cellId, title)), [mutateDay]);
  const complete = useCallback((cellId: string) => mutateDay((activeDay) => completeCell(activeDay, cellId)), [mutateDay]);
  const exchange = useCallback((cellId: string, type: ExchangeType, replacement?: string) => mutateDay((activeDay) => exchangeCell(activeDay, cellId, type, replacement)), [mutateDay]);

  return { state, day, latest, hydrated, atp: atpBalance(day), divide, updateTitle, complete, exchange, canDivide: canDivide(latest) };
}
