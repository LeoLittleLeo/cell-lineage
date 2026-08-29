"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { deriveCellVisualModel } from "../domain/cellVisual";
import { deriveTaskProgress } from "../domain/progress";
import type { TaskCellModel } from "../domain/types";
import { useLanguage } from "../i18n/LanguageContext";
import { Cell } from "./Cell";
import { GeneStrand } from "./GeneStrand";

interface Props {
  cell: TaskCellModel;
  label: string;
  onTitle: (title: string) => void;
  onComplete: () => void;
  onMutation: () => void;
  onTimer: () => void;
  onSubtask: (subtaskId: string) => void;
  onDivide: () => void;
  divisionAvailable: boolean;
  health: number;
}

export function TaskCell({ cell, label, onTitle, onComplete, onMutation, onTimer, onSubtask, onDivide, divisionAvailable, health }: Props) {
  const { isZh } = useLanguage();
  const [detailOpen, setDetailOpen] = useState(false);
  const [remaining, setRemaining] = useState(cell.remainingMinutes);
  const [clock, setClock] = useState(() => Date.now());
  const visual = deriveCellVisualModel(cell);
  const resolved = cell.status === "completed" || cell.status === "mutated" || cell.status === "dormant";
  useEffect(() => {
    if (!cell.timerEndsAt) return;
    const sync = () => setRemaining(Math.max(0, Math.ceil((new Date(cell.timerEndsAt!).getTime() - Date.now()) / 60_000)));
    const interval = window.setInterval(sync, 15_000);
    return () => window.clearInterval(interval);
  }, [cell.timerEndsAt]);
  useEffect(() => {
    const interval = window.setInterval(() => setClock(Date.now()), 15_000);
    return () => window.clearInterval(interval);
  }, []);
  const progress = deriveTaskProgress(cell, clock);
  const hasWindow = Boolean(cell.scheduledStart && cell.scheduledEnd);

  const organelleStyle = {
    "--functional-scale": visual.size,
    "--nucleus-functional-size": `${visual.nucleusSize}%`,
    "--membrane-stability": visual.membraneStability,
    "--mitochondria-activity": visual.mitochondriaActivity,
    "--mutation-level": visual.mutationLevel,
    "--cell-health": health,
    "--window-angle": `${progress.windowProgress * 360}deg`,
  } as CSSProperties;

  return <article className={`task-cell-wrap ${resolved ? "is-resolved" : ""} ${visual.mutationLevel ? "is-mutated" : ""} ${cell.emergencyScar ? "has-mutation-scar" : ""} ${cell.debtGene && !cell.debtGene.clearedAt ? "has-debt-gene" : ""}`} style={{ "--cell-health": health } as CSSProperties}>
    <span className="cell-index">{label}</span>
    <Cell className={`task-cell functional-cell task-cell--${cell.status}`} skinId={cell.skinId}>
      <div className="functional-organelles" style={organelleStyle}>
        {hasWindow && <span className={`time-window-orbit is-${progress.state}`} aria-hidden="true" />}
        <button className="organelle nucleus-control" type="button" onClick={() => setDetailOpen((open) => !open)} aria-expanded={detailOpen} aria-label={isZh ? "查看当前事项详情" : "View current commitment details"}>
          <GeneStrand seed={cell.currentTitle || cell.id} weight={cell.weight} minutes={cell.estimatedMinutes ?? 30} energy={cell.energy ?? 3} className="nucleus-gene" />
          {!cell.sourceTaskId ? <textarea value={cell.currentTitle} onChange={(event) => onTitle(event.target.value)} maxLength={80} rows={2} placeholder={isZh ? "当前事项" : "Current commitment"} /> : <strong>{cell.currentTitle}</strong>}
          <small>{isZh ? "细胞核 · 当前事项" : "NUCLEUS · COMMITMENT"}</small>
        </button>

        {visual.mitochondriaCount > 0 && <button className={`organelle mitochondria ${cell.timerEndsAt ? "is-running" : ""}`} type="button" onClick={onTimer} aria-label={cell.timerEndsAt ? (isZh ? "暂停计时" : "Pause timer") : (isZh ? "开始计时" : "Start timer")}>
          {Array.from({ length: visual.mitochondriaCount }, (_, index) => <i key={index} />)}
          <span>{remaining ?? cell.estimatedMinutes} {isZh ? "分钟" : "MIN"}<small>{cell.timerEndsAt ? (isZh ? "剩余" : "LEFT") : (isZh ? "时间" : "TIME")}</small></span>
        </button>}

        {!resolved && <button className="organelle lysosome" type="button" onClick={onMutation} aria-label={isZh ? "通过溶酶体进行突变" : "Mutate through the lysosome"}><i /><span>{isZh ? "溶酶体" : "LYSOSOME"}<small>{isZh ? "突变" : "MUTATE"}</small></span></button>}

        {(cell.subtasks?.length ?? 0) > 0 && <div className="ribosomes" aria-label={isZh ? "子任务核糖体" : "Subtask ribosomes"}>
          {cell.subtasks!.map((subtask, index) => <button className={subtask.completed ? "is-complete" : ""} key={subtask.id} type="button" onClick={() => onSubtask(subtask.id)} title={subtask.title} aria-label={isZh ? `${subtask.completed ? "恢复" : "完成"}子任务：${subtask.title}` : `${subtask.completed ? "Restore" : "Complete"} subtask: ${subtask.title}`}>{index + 1}</button>)}
        </div>}

        {!resolved && <button className="membrane-seal" type="button" onClick={onComplete}><span />{isZh ? "封存细胞膜" : "SEAL MEMBRANE"}</button>}
        {resolved && <button className={`organelle centrosome ${divisionAvailable ? "is-ready" : "is-locked"}`} type="button" onClick={onDivide} disabled={!divisionAvailable} aria-label={divisionAvailable ? (isZh ? "中心体已激活，进入下一组事项" : "Centrosome active; enter the next commitments") : (isZh ? "中心体尚未激活" : "Centrosome inactive")}><i /><i /><span>{divisionAvailable ? (isZh ? "开始分裂" : "DIVIDE") : (isZh ? "已稳定" : "STABLE")}</span></button>}

        {detailOpen && <div className="nucleus-detail" role="status"><strong>{cell.currentTitle}</strong>{cell.description && <p>{cell.description}</p>}<span>{isZh ? `权重 ${cell.weight} · 精力 ${cell.energy ?? 3}` : `WEIGHT ${cell.weight} · ENERGY ${cell.energy ?? 3}`}</span></div>}
        {cell.debtGene && !cell.debtGene.clearedAt && <div className="debt-gene" title={isZh ? `继承自：${cell.debtGene.inheritedTitle}` : `Inherited from: ${cell.debtGene.inheritedTitle}`}><b>δ</b><span>{isZh ? `债务基因 · 清除消耗 ${cell.debtGene.energyCost} 能量` : `DEBT GENE · COST ${cell.debtGene.energyCost} ENERGY`}</span></div>}
        {cell.emergencyScar && <span className="mutation-scar" title={isZh ? "紧急突变留下的永久伤疤" : "Permanent scar from an emergency mutation"} aria-label={isZh ? "永久突变伤疤" : "Permanent mutation scar"} />}
      </div>
    </Cell>
    {hasWindow && <div className={`cell-progress-hud is-${progress.state}`} aria-label={isZh ? `时间窗进度 ${Math.round(progress.windowProgress * 100)}%，任务进度 ${Math.round(progress.executionProgress * 100)}%` : `Time window ${Math.round(progress.windowProgress * 100)}%, task progress ${Math.round(progress.executionProgress * 100)}%`}>
      <span><small>{cell.scheduledStart}—{cell.scheduledEnd}</small><strong>{progress.state === "upcoming" ? (isZh ? "等待开始" : "UPCOMING") : progress.state === "overdue" ? (isZh ? "已经超时" : "OVERDUE") : progress.state === "ending" ? (isZh ? "即将结束" : "ENDING") : progress.state === "complete" ? (isZh ? "时间窗内已解决" : "RESOLVED") : (isZh ? "时间窗进行中" : "IN PROGRESS")}</strong></span>
      <div><label>{isZh ? "时间" : "WINDOW"}<b>{Math.round(progress.windowProgress * 100)}%</b></label><i><em style={{ width: `${progress.windowProgress * 100}%` }} /></i></div>
      <div><label>{isZh ? "任务" : "TASK"}<b>{Math.round(progress.executionProgress * 100)}%</b></label><i><em style={{ width: `${progress.executionProgress * 100}%` }} /></i></div>
    </div>}
    <p className="cell-health-label"><i style={{ width: `${health * 100}%` }} /><span>{isZh ? `细胞健康度 ${Math.round(health * 100)}%` : `CELL HEALTH ${Math.round(health * 100)}%`}</span></p>
    <p className="organelle-legend">{isZh ? "细胞核：事项 · 线粒体：时间 · 溶酶体：改变" : "NUCLEUS: COMMITMENT · MITOCHONDRIA: TIME · LYSOSOME: CHANGE"}</p>
  </article>;
}
