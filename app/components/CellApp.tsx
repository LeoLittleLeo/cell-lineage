"use client";

import { useEffect, useMemo, useState } from "react";
import { DIVISION_DURATION_MS } from "../domain/config";
import { getCellSkin, resolveSkinSelection, type CellSkinId } from "../domain/skins";
import type { TaskCellModel } from "../domain/types";
import { useCellStore } from "../hooks/useCellStore";
import { ATPIndicator } from "./ATPIndicator";
import { Cell } from "./Cell";
import { DayCell } from "./DayCell";
import { DivisionStage } from "./DivisionStage";
import { ExchangePanel } from "./ExchangePanel";
import { Lineage } from "./Lineage";
import { SkinPicker } from "./SkinPicker";
import { TaskCell } from "./TaskCell";

export function CellApp() {
  const store = useCellStore();
  const [isDividing, setIsDividing] = useState(false);
  const [divisionSkinId, setDivisionSkinId] = useState<CellSkinId | null>(null);
  const [exchangeCell, setExchangeCell] = useState<TaskCellModel | null>(null);
  const [skinPickerOpen, setSkinPickerOpen] = useState(false);
  const generationNumber = store.day.generations.length + 1;
  const divide = store.divide;

  const startDivision = () => {
    if (isDividing || (store.latest && !store.canDivide)) return;
    setDivisionSkinId(resolveSkinSelection(store.selectedSkinId));
    setIsDividing(true);
  };

  useEffect(() => {
    if (!isDividing) return;
    const timer = window.setTimeout(() => { divide(divisionSkinId ?? undefined); setIsDividing(false); setDivisionSkinId(null); }, DIVISION_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [isDividing, divide, divisionSkinId]);

  useEffect(() => {
    if (!exchangeCell && !skinPickerOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setExchangeCell(null); setSkinPickerOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exchangeCell, skinPickerOpen]);

  const resolvedCount = store.latest?.cells.filter((cell) => cell.status === "completed" || cell.status === "dormant").length ?? 0;
  const archive = useMemo(() => store.state.days.filter((day) => day.date !== store.state.currentDate), [store.state]);
  const dormantCount = store.state.days.reduce((count, day) => count + day.dormantTasks.length, 0);
  const activeSkinId = store.latest?.skinId ?? store.day.skinId;
  const selectedSkinName = store.selectedSkinId === "random" ? "Random" : getCellSkin(store.selectedSkinId).name;

  return (
    <main className="cell-app">
      <header className="quiet-header">
        <div><span className="wordmark">CELL</span><span className="wordmark-sub">让承诺生长</span></div>
        <div className="header-controls">
          <button className="skin-trigger" type="button" onClick={() => setSkinPickerOpen(true)} aria-haspopup="dialog" aria-expanded={skinPickerOpen}>
            <Cell skinId={activeSkinId} className="skin-trigger-cell" />
            <span><small>CELL SKIN</small><strong>{selectedSkinName}</strong></span>
          </button>
          <ATPIndicator value={store.atp} />
        </div>
      </header>

      {isDividing && divisionSkinId ? <DivisionStage generation={generationNumber} skinId={divisionSkinId} /> : !store.latest ? <DayCell onDivide={startDivision} skinId={store.day.skinId} /> : (
        <section className="generation-stage" aria-labelledby="generation-heading">
          <div className="generation-heading">
            <p className="eyebrow">GENERATION {String(store.latest.index).padStart(2, "0")}</p>
            <h1 id="generation-heading">{store.canDivide ? "这一代已经成熟" : "两个承诺，正在生长"}</h1>
            <p className="maturity-count"><strong>{resolvedCount} / 2</strong> 个细胞已成熟</p>
          </div>

          <div className="task-cell-grid">
            {store.latest.cells.map((cell, index) => (
              <TaskCell key={cell.id} cell={cell} label={`CELL ${index === 0 ? "A" : "B"}`} onTitle={(title) => store.updateTitle(cell.id, title)} onComplete={() => store.complete(cell.id)} onExchange={() => setExchangeCell(cell)} />
            ))}
          </div>

          <div className="generation-gate">
            {store.canDivide ? (
              <><p>你获得了下一次分裂的资格。</p><button type="button" onClick={startDivision}>继续分裂 <span aria-hidden="true">→</span></button></>
            ) : <p>只有当两个细胞都得到解决，这一代才会成熟。</p>}
          </div>
        </section>
      )}

      <Lineage generations={store.day.generations} daySkinId={store.day.skinId} />
      <footer className="archive-note"><span>{archive.length} 个过往日期已封存</span><span>{dormantCount} 个休眠细胞被保留</span></footer>

      {exchangeCell && <ExchangePanel cell={exchangeCell} atp={store.atp} onClose={() => setExchangeCell(null)} onExchange={(type, replacement) => store.exchange(exchangeCell.id, type, replacement)} />}
      {skinPickerOpen && <SkinPicker selected={store.selectedSkinId} onSelect={store.setSkin} onClose={() => setSkinPickerOpen(false)} />}
    </main>
  );
}
