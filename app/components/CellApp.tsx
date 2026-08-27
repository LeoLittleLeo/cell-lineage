"use client";

import { useEffect, useMemo, useState } from "react";
import { DIVISION_DURATION_MS } from "../domain/config";
import type { TaskCellModel } from "../domain/types";
import { useCellStore } from "../hooks/useCellStore";
import { ATPIndicator } from "./ATPIndicator";
import { DayCell } from "./DayCell";
import { DivisionStage } from "./DivisionStage";
import { ExchangePanel } from "./ExchangePanel";
import { Lineage } from "./Lineage";
import { TaskCell } from "./TaskCell";

export function CellApp() {
  const store = useCellStore();
  const [isDividing, setIsDividing] = useState(false);
  const [exchangeCell, setExchangeCell] = useState<TaskCellModel | null>(null);
  const generationNumber = store.day.generations.length + 1;
  const divide = store.divide;

  const startDivision = () => {
    if (isDividing || (store.latest && !store.canDivide)) return;
    setIsDividing(true);
  };

  useEffect(() => {
    if (!isDividing) return;
    const timer = window.setTimeout(() => { divide(); setIsDividing(false); }, DIVISION_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [isDividing, divide]);

  useEffect(() => {
    if (!exchangeCell) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setExchangeCell(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exchangeCell]);

  const resolvedCount = store.latest?.cells.filter((cell) => cell.status === "completed" || cell.status === "dormant").length ?? 0;
  const archive = useMemo(() => store.state.days.filter((day) => day.date !== store.state.currentDate), [store.state]);
  const dormantCount = store.state.days.reduce((count, day) => count + day.dormantTasks.length, 0);

  return (
    <main className="cell-app">
      <header className="quiet-header">
        <div><span className="wordmark">CELL</span><span className="wordmark-sub">让承诺生长</span></div>
        <ATPIndicator value={store.atp} />
      </header>

      {isDividing ? <DivisionStage generation={generationNumber} /> : !store.latest ? <DayCell onDivide={startDivision} /> : (
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

      <Lineage generations={store.day.generations} />
      <footer className="archive-note"><span>{archive.length} 个过往日期已封存</span><span>{dormantCount} 个休眠细胞被保留</span></footer>

      {exchangeCell && <ExchangePanel cell={exchangeCell} atp={store.atp} onClose={() => setExchangeCell(null)} onExchange={(type, replacement) => store.exchange(exchangeCell.id, type, replacement)} />}
    </main>
  );
}
