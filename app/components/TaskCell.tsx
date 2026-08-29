"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { deriveCellVisualModel } from "../domain/cellVisual";
import type { TaskCellModel } from "../domain/types";
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
        <button className="organelle nucleus-control" type="button" onClick={() => setDetailOpen((open) => !open)} aria-expanded={detailOpen} aria-label="查看当前事项详情">
          {!cell.sourceTaskId ? <textarea value={cell.currentTitle} onChange={(event) => onTitle(event.target.value)} maxLength={80} rows={2} placeholder="当前事项" /> : <strong>{cell.currentTitle}</strong>}
          <small>细胞核 · 当前事项</small>
        </button>

        {visual.mitochondriaCount > 0 && <button className={`organelle mitochondria ${cell.timerEndsAt ? "is-running" : ""}`} type="button" onClick={onTimer} aria-label={cell.timerEndsAt ? "暂停计时" : "开始计时"}>
          {Array.from({ length: visual.mitochondriaCount }, (_, index) => <i key={index} />)}
          <span>{remaining ?? cell.estimatedMinutes} 分钟<small>{cell.timerEndsAt ? "剩余" : "时间"}</small></span>
        </button>}

        {!resolved && <button className="organelle lysosome" type="button" onClick={onMutation} aria-label="通过溶酶体进行突变"><i /><span>溶酶体<small>突变</small></span></button>}

        {(cell.subtasks?.length ?? 0) > 0 && <div className="ribosomes" aria-label="子任务核糖体">
          {cell.subtasks!.map((subtask, index) => <button className={subtask.completed ? "is-complete" : ""} key={subtask.id} type="button" onClick={() => onSubtask(subtask.id)} title={subtask.title} aria-label={`${subtask.completed ? "恢复" : "完成"}子任务：${subtask.title}`}>{index + 1}</button>)}
        </div>}

        {!resolved && <button className="membrane-seal" type="button" onClick={onComplete}><span />封存细胞膜</button>}
        {resolved && <button className={`organelle centrosome ${divisionAvailable ? "is-ready" : "is-locked"}`} type="button" onClick={onDivide} disabled={!divisionAvailable} aria-label={divisionAvailable ? "中心体已激活，进入下一组事项" : "中心体尚未激活"}><i /><i /><span>{divisionAvailable ? "开始分裂" : "已稳定"}</span></button>}

        {detailOpen && <div className="nucleus-detail" role="status"><strong>{cell.currentTitle}</strong>{cell.description && <p>{cell.description}</p>}<span>权重 {cell.weight} · 精力 {cell.energy ?? 3}</span></div>}
      </div>
    </Cell>
    <p className="organelle-legend">细胞核：事项 · 线粒体：时间 · 溶酶体：改变</p>
  </article>;
}
