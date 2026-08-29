"use client";

import { useEffect, useMemo, useState } from "react";
import { DIVISION_DURATION_MS } from "../domain/config";
import { resolveSkinSelection, type CellSkinId } from "../domain/skins";
import type { TaskCellModel } from "../domain/types";
import { useCellStore } from "../hooks/useCellStore";
import { useLanguage } from "../i18n/LanguageContext";
import { ATPIndicator } from "./ATPIndicator";
import { Cell } from "./Cell";
import { DayCell } from "./DayCell";
import { DayComplete } from "./DayComplete";
import { DesktopPet } from "./DesktopPet";
import { DivisionStage } from "./DivisionStage";
import { Lineage } from "./Lineage";
import { MissingDNA } from "./MissingDNA";
import { MutationPanel } from "./MutationPanel";
import { SkinPicker } from "./SkinPicker";
import { TaskCell } from "./TaskCell";
import { TomorrowPlanPanel } from "./TomorrowPlanPanel";

type PlanMode = "tomorrow" | "emergency" | null;

export function CellApp() {
  const store = useCellStore();
  const { isZh, language, setLanguage } = useLanguage();
  const [isDividing, setIsDividing] = useState(false);
  const [divisionSkinId, setDivisionSkinId] = useState<CellSkinId | null>(null);
  const [mutationCell, setMutationCell] = useState<TaskCellModel | null>(null);
  const [planMode, setPlanMode] = useState<PlanMode>(null);
  const [skinPickerOpen, setSkinPickerOpen] = useState(false);
  const generationNumber = store.day.generations.length + 1;
  const divide = store.divide;
  const activePlanDate = planMode === "emergency" ? store.state.currentDate : store.tomorrowDate;
  const activePlan = planMode === "emergency" ? store.todayPlan : store.tomorrowPlan;

  const startDivision = () => {
    if (isDividing || store.remainingQueued < 1 || (store.latest && !store.canDivide)) return;
    setDivisionSkinId(resolveSkinSelection(store.selectedSkinId));
    setIsDividing(true);
  };

  useEffect(() => {
    if (!isDividing) return;
    const timer = window.setTimeout(() => { divide(divisionSkinId ?? undefined); setIsDividing(false); setDivisionSkinId(null); }, DIVISION_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [isDividing, divide, divisionSkinId]);

  useEffect(() => {
    if (!mutationCell && !skinPickerOpen && !planMode) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setMutationCell(null); setSkinPickerOpen(false); setPlanMode(null); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mutationCell, skinPickerOpen, planMode]);

  const resolvedCount = store.latest?.cells.filter((cell) => cell.status === "completed" || cell.status === "mutated" || cell.status === "dormant").length ?? 0;
  const latestCount = store.latest?.cells.length ?? 0;
  const archive = useMemo(() => store.state.days.filter((day) => day.date !== store.state.currentDate), [store.state]);
  const dormantCount = store.state.days.reduce((count, day) => count + day.dormantTasks.length, 0);
  const activeSkinId = store.latest?.skinId ?? store.day.skinId;
  const activeCell = store.latest?.cells.find((cell) => cell.status === "active");
  const skinNames: Record<CellSkinId, string> = isZh ? { cell: "原生", jelly: "凝胶", petri: "培养皿", yolk: "卵黄", ink: "水墨", moss: "苔藓" } : { cell: "Cell", jelly: "Jelly", petri: "Petri", yolk: "Yolk", ink: "Ink", moss: "Moss" };
  const selectedSkinName = store.selectedSkinId === "random" ? (isZh ? "随机" : "Random") : skinNames[store.selectedSkinId];
  const petStatus = store.day.status === "completed" ? (isZh ? "今日完成" : "Day complete") : store.day.status === "missing_dna" ? (isZh ? "等待形成" : "Awaiting formation") : store.day.status === "unstarted" ? (isZh ? "尚未开始" : "Not started") : store.canDivide ? (isZh ? "可以分裂" : "Ready to divide") : (isZh ? "生长中" : "Growing");

  const stage = isDividing && divisionSkinId ? <DivisionStage generation={generationNumber} skinId={divisionSkinId} />
    : store.day.status === "completed" ? <DayComplete total={store.totalTasks} mutations={store.day.mutationCount} skinId={activeSkinId} onPrepare={() => setPlanMode("tomorrow")} />
    : store.day.status === "missing_dna" ? <MissingDNA skinId={store.day.skinId} onEmergency={() => setPlanMode("emergency")} />
    : !store.latest ? <DayCell onDivide={startDivision} skinId={store.day.skinId} taskCount={store.remainingQueued} />
    : <section className="generation-stage" aria-labelledby="generation-heading">
        <div className="generation-heading">
          <p className="eyebrow">{isZh ? `第 ${String(store.latest.index).padStart(2, "0")} 代` : `Generation ${String(store.latest.index).padStart(2, "0")}`}</p>
          <h1 id="generation-heading">{store.canDivide ? (store.remainingQueued ? (isZh ? "这一代已经成熟" : "This generation is mature") : (isZh ? "最后一组承诺已经成熟" : "The final commitments are mature")) : (isZh ? "承诺正在生长" : "Commitments are growing")}</h1>
          <p className="maturity-count"><strong>{resolvedCount} / {latestCount}</strong> {isZh ? `个细胞已解决 · 今日 ${store.resolvedTasks} / ${store.totalTasks}` : `cells resolved · today ${store.resolvedTasks} / ${store.totalTasks}`}</p>
        </div>
        <div className={`task-cell-grid ${latestCount === 1 ? "task-cell-grid--single" : ""}`}>
          {store.latest.cells.map((cell, index) => <TaskCell key={cell.id} cell={cell} label={isZh ? `细胞 ${index === 0 ? "甲" : "乙"}` : `Cell ${index === 0 ? "A" : "B"}`} onTitle={(title) => store.updateTitle(cell.id, title)} onComplete={() => store.complete(cell.id)} onMutation={() => setMutationCell(cell)} onTimer={() => store.toggleTimer(cell.id)} onSubtask={(subtaskId) => store.toggleSubtask(cell.id, subtaskId)} onDivide={startDivision} divisionAvailable={store.canDivide && store.remainingQueued > 0} />)}
        </div>
        <div className="generation-gate">{!store.canDivide && <p className="division-locked">{isZh ? "分裂尚未激活 · 先解决当前细胞" : "DIVISION LOCKED · Resolve the current cells first"}</p>}</div>
      </section>;

  return <main className="cell-app">
    <header className="quiet-header">
      <div><span className="wordmark">{isZh ? "细胞" : "CELL"}</span><span className="wordmark-sub">{isZh ? "让承诺生长" : "Let commitments grow"}</span></div>
      <div className="header-controls">
        <button className="language-switch" type="button" onClick={() => setLanguage(language === "zh" ? "en" : "zh")} aria-label={isZh ? "Switch to English" : "切换到中文"}>{isZh ? "EN" : "中文"}</button>
        <DesktopPet snapshot={{ title: activeCell?.currentTitle ?? (store.day.status === "completed" ? (isZh ? "今天的承诺已经成熟" : "Today's commitments are mature") : (isZh ? "等待今日细胞" : "Waiting for today's cell")), minutes: activeCell?.remainingMinutes, status: petStatus, skinId: activeCell?.skinId ?? activeSkinId }} onComplete={activeCell ? () => store.complete(activeCell.id) : undefined} onTimer={activeCell?.estimatedMinutes ? () => store.toggleTimer(activeCell.id) : undefined} />
        <button className="dna-trigger" type="button" onClick={() => setPlanMode("tomorrow")}><small>{isZh ? "明日基因" : "TOMORROW DNA"}</small><strong>{store.tomorrowPlan?.status === "sealed" ? (isZh ? "已封存" : "SEALED") : `${store.tomorrowPlan?.tasks.filter((task) => task.title.trim()).length ?? 0} ${isZh ? "个事项" : "TASKS"}`}</strong></button>
        <span className="mutation-token-indicator" title={isZh ? "本周剩余突变次数" : "Mutations left this week"}><strong>{store.mutationTokens}</strong><small>{isZh ? "突变" : "MUT"}</small></span>
        <button className="skin-trigger" type="button" onClick={() => setSkinPickerOpen(true)} aria-haspopup="dialog" aria-expanded={skinPickerOpen}><Cell skinId={activeSkinId} className="skin-trigger-cell" /><span><small>{isZh ? "细胞皮肤" : "CELL SKIN"}</small><strong>{selectedSkinName}</strong></span></button>
        <ATPIndicator value={store.atp} />
      </div>
    </header>
    {stage}
    <Lineage generations={store.day.generations} daySkinId={store.day.skinId} />
    <footer className="archive-note"><span>{isZh ? `${archive.length} 个过往日期已封存` : `${archive.length} past days archived`}</span><span>{isZh ? `${dormantCount} 个休眠细胞被保留` : `${dormantCount} dormant cells preserved`}</span></footer>
    {mutationCell && <MutationPanel cell={mutationCell} tokens={store.mutationTokens} onClose={() => setMutationCell(null)} onMutate={(type, replacement, weight) => store.mutate(mutationCell.id, type, replacement, weight)} />}
    {planMode && <TomorrowPlanPanel date={activePlanDate} plan={activePlan} emergency={planMode === "emergency"} onAdd={() => store.addPlanTask(activePlanDate, planMode === "emergency" ? "emergency" : "planned")} onEdit={(id, patch) => store.editPlanTask(activePlanDate, id, patch)} onDelete={(id) => store.removePlanTask(activePlanDate, id)} onMove={(id, index) => store.reorderPlanTask(activePlanDate, id, index)} onSeal={() => { store.sealDailyPlan(activePlanDate, planMode === "emergency"); setPlanMode(null); }} onClose={() => setPlanMode(null)} />}
    {skinPickerOpen && <SkinPicker selected={store.selectedSkinId} onSelect={store.setSkin} onClose={() => setSkinPickerOpen(false)} />}
  </main>;
}
