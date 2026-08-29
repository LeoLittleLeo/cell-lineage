"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { deriveCellVisualModel } from "../domain/cellVisual";
import type { TaskCellModel } from "../domain/types";
import { useLanguage } from "../i18n/LanguageContext";
import { Cell } from "./Cell";

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
}

export function TaskCell({ cell, label, onTitle, onComplete, onMutation, onTimer, onSubtask, onDivide, divisionAvailable }: Props) {
  const { isZh } = useLanguage();
  const [detailOpen, setDetailOpen] = useState(false);
  const [remaining, setRemaining] = useState(cell.remainingMinutes);
  const visual = deriveCellVisualModel(cell);
  const resolved = cell.status === "completed" || cell.status === "mutated" || cell.status === "dormant";
  useEffect(() => {
    if (!cell.timerEndsAt) return;
    const sync = () => setRemaining(Math.max(0, Math.ceil((new Date(cell.timerEndsAt!).getTime() - Date.now()) / 60_000)));
    const interval = window.setInterval(sync, 15_000);
    return () => window.clearInterval(interval);
  }, [cell.timerEndsAt]);

  const organelleStyle = {
    "--functional-scale": visual.size,
    "--nucleus-functional-size": `${visual.nucleusSize}%`,
    "--membrane-stability": visual.membraneStability,
    "--mitochondria-activity": visual.mitochondriaActivity,
    "--mutation-level": visual.mutationLevel,
  } as CSSProperties;

  return <article className={`task-cell-wrap ${resolved ? "is-resolved" : ""} ${visual.mutationLevel ? "is-mutated" : ""}`}>
    <span className="cell-index">{label}</span>
    <Cell className={`task-cell functional-cell task-cell--${cell.status}`} skinId={cell.skinId}>
      <div className="functional-organelles" style={organelleStyle}>
        <button className="organelle nucleus-control" type="button" onClick={() => setDetailOpen((open) => !open)} aria-expanded={detailOpen} aria-label={isZh ? "查看当前事项详情" : "View current commitment details"}>
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
      </div>
    </Cell>
    <p className="organelle-legend">{isZh ? "细胞核：事项 · 线粒体：时间 · 溶酶体：改变" : "NUCLEUS: COMMITMENT · MITOCHONDRIA: TIME · LYSOSOME: CHANGE"}</p>
  </article>;
}
