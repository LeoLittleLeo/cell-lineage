"use client";

import { useState } from "react";
import type { DailyPlan, SubTask, TaskWeight } from "../domain/types";

interface Props {
  date: string;
  plan?: DailyPlan;
  emergency?: boolean;
  onAdd: () => void;
  onEdit: (taskId: string, patch: { title?: string; weight?: TaskWeight; estimatedMinutes?: number; energy?: 1 | 2 | 3 | 4 | 5; subtasks?: SubTask[] }) => void;
  onDelete: (taskId: string) => void;
  onMove: (taskId: string, targetIndex: number) => void;
  onSeal: () => void;
  onClose: () => void;
}

const WEIGHT_LABELS: Record<TaskWeight, string> = { 1: "LIGHT", 2: "STANDARD", 3: "DEEP" };

export function TomorrowPlanPanel({ date, plan, emergency = false, onAdd, onEdit, onDelete, onMove, onSeal, onClose }: Props) {
  const [confirmSeal, setConfirmSeal] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const tasks = plan?.tasks ?? [];
  const sealed = plan?.status === "sealed";
  const dateLabel = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date(`${date}T12:00:00`));
  const validTasks = tasks.filter((task) => task.title.trim());

  return (
    <div className="plan-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="plan-panel" role="dialog" aria-modal="true" aria-labelledby="plan-title">
        <button className="plan-close" type="button" onClick={onClose} aria-label="关闭计划面板">×</button>
        <span className="panel-kicker">{emergency ? "EMERGENCY FORMATION" : "TOMORROW DNA"}</span>
        <h2 id="plan-title">{emergency ? "为今天紧急形成一组 DNA" : "为明天设计细胞的生长"}</h2>
        <div className="plan-meta"><span>{dateLabel}</span><span>{sealed ? "SEALED" : `${validTasks.length} TASKS`}</span></div>
        <p className="plan-intro">{emergency ? "昨天没有留下 DNA。这是一次例外形成，封存后今天只负责执行。" : "排好顺序后封存。明天的你不再编辑，只负责让这些承诺逐步显现。"}</p>

        <div className="plan-task-list">
          {tasks.map((task, index) => (
            <div
              className={`plan-task ${draggedId === task.id ? "is-dragging" : ""}`}
              key={task.id}
              draggable={!sealed}
              onDragStart={() => setDraggedId(task.id)}
              onDragEnd={() => setDraggedId(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => { if (draggedId) onMove(draggedId, index); setDraggedId(null); }}
            >
              <span className="plan-task__order">{String(index + 1).padStart(2, "0")}</span>
              {sealed ? <strong className="plan-task__sealed-title">{task.title}</strong> : <input value={task.title} onChange={(event) => onEdit(task.id, { title: event.target.value })} maxLength={80} placeholder="写下一个真实承诺" aria-label={`第 ${index + 1} 个任务`} />}
              {sealed ? <span className="plan-task__weight">{WEIGHT_LABELS[task.weight]}</span> : (
                <select value={task.weight} onChange={(event) => onEdit(task.id, { weight: Number(event.target.value) as TaskWeight })} aria-label={`第 ${index + 1} 个任务的权重`}>
                  <option value={1}>Light</option><option value={2}>Standard</option><option value={3}>Deep</option>
                </select>
              )}
              {!sealed && <div className="plan-task__actions"><button type="button" disabled={index === 0} onClick={() => onMove(task.id, index - 1)} aria-label="上移">↑</button><button type="button" disabled={index === tasks.length - 1} onClick={() => onMove(task.id, index + 1)} aria-label="下移">↓</button><button type="button" onClick={() => onDelete(task.id)} aria-label="删除">×</button></div>}
              {sealed ? <span className="plan-task__bio-summary">{task.estimatedMinutes ?? 30} MIN · ENERGY {task.energy ?? 3}{task.subtasks?.length ? ` · ${task.subtasks.length} RIBOSOMES` : ""}</span> : <div className="plan-task__bio">
                <label><span>TIME</span><input type="number" min={5} max={480} step={5} value={task.estimatedMinutes ?? 30} onChange={(event) => onEdit(task.id, { estimatedMinutes: Math.max(5, Number(event.target.value) || 5) })} /><small>MIN</small></label>
                <label><span>ENERGY</span><select value={task.energy ?? 3} onChange={(event) => onEdit(task.id, { energy: Number(event.target.value) as 1 | 2 | 3 | 4 | 5 })}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option><option value={5}>5</option></select></label>
                <label className="plan-task__subtasks"><span>RIBOSOMES · 用逗号分隔子任务</span><input value={(task.subtasks ?? []).map((item) => item.title).join("，")} onChange={(event) => onEdit(task.id, { subtasks: event.target.value.split(/[，,]/).map((title) => title.trim()).filter(Boolean).map((title, subIndex) => ({ id: `${task.id}_sub_${subIndex}`, title, completed: false })) })} placeholder="研究，制作，检查" /></label>
              </div>}
            </div>
          ))}
          {!tasks.length && <p className="plan-empty">明天的 DNA 还是空白的。</p>}
        </div>

        {!sealed && <button className="plan-add" type="button" onClick={onAdd}>+ 添加一个承诺</button>}
        {!sealed && !confirmSeal && <button className="plan-seal" type="button" disabled={!validTasks.length} onClick={() => setConfirmSeal(true)}>{emergency ? "形成今日细胞" : "封存明日计划"}</button>}
        {!sealed && confirmSeal && <div className="seal-confirm"><p>封存后，这些承诺将成为 {emergency ? "今天" : "明天"} 的 DNA。</p><div><button type="button" onClick={() => setConfirmSeal(false)}>再检查一次</button><button type="button" onClick={onSeal}>确认封存</button></div></div>}
        {sealed && <p className="plan-sealed-note">● DNA 已封存。它将在目标日期自动成为 Today Cell。</p>}
      </section>
    </div>
  );
}
