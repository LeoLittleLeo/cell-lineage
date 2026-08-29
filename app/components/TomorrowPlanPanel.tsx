"use client";

import { useState } from "react";
import type { DailyPlan, SubTask, TaskWeight } from "../domain/types";
import { useLanguage } from "../i18n/LanguageContext";

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

export function TomorrowPlanPanel({ date, plan, emergency = false, onAdd, onEdit, onDelete, onMove, onSeal, onClose }: Props) {
  const { isZh } = useLanguage();
  const [confirmSeal, setConfirmSeal] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const tasks = plan?.tasks ?? [];
  const sealed = plan?.status === "sealed";
  const dateLabel = new Intl.DateTimeFormat(isZh ? "zh-CN" : "en-US", { month: "long", day: "numeric", weekday: "long" }).format(new Date(`${date}T12:00:00`));
  const validTasks = tasks.filter((task) => task.title.trim());
  const weightLabels: Record<TaskWeight, string> = isZh ? { 1: "轻量", 2: "标准", 3: "深度" } : { 1: "LIGHT", 2: "STANDARD", 3: "DEEP" };

  return (
    <div className="plan-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="plan-panel" role="dialog" aria-modal="true" aria-labelledby="plan-title">
        <button className="plan-close" type="button" onClick={onClose} aria-label={isZh ? "关闭计划面板" : "Close planning panel"}>×</button>
        <span className="panel-kicker">{emergency ? (isZh ? "紧急形成" : "EMERGENCY FORMATION") : (isZh ? "明日基因" : "TOMORROW DNA")}</span>
        <h2 id="plan-title">{emergency ? (isZh ? "为今天紧急形成一组基因" : "Form an emergency DNA sequence for today") : (isZh ? "为明天设计细胞的生长" : "Design tomorrow's cell growth")}</h2>
        <div className="plan-meta"><span>{dateLabel}</span><span>{sealed ? (isZh ? "已封存" : "SEALED") : (isZh ? `${validTasks.length} 个事项` : `${validTasks.length} TASKS`)}</span></div>
        <p className="plan-intro">{emergency ? (isZh ? "昨天没有留下基因。这是一次例外形成，封存后今天只负责执行。" : "No DNA was left yesterday. This is an exception; once sealed, today is for execution only.") : (isZh ? "排好顺序后封存。明天的你不再编辑，只负责让这些承诺逐步显现。" : "Order and seal the plan. Tomorrow you will stop editing and let each commitment emerge in sequence.")}</p>

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
              {sealed ? <strong className="plan-task__sealed-title">{task.title}</strong> : <input value={task.title} onChange={(event) => onEdit(task.id, { title: event.target.value })} maxLength={80} placeholder={isZh ? "写下一个真实承诺" : "Write a real commitment"} aria-label={isZh ? `第 ${index + 1} 个任务` : `Task ${index + 1}`} />}
              {sealed ? <span className="plan-task__weight">{weightLabels[task.weight]}</span> : (
                <select value={task.weight} onChange={(event) => onEdit(task.id, { weight: Number(event.target.value) as TaskWeight })} aria-label={isZh ? `第 ${index + 1} 个任务的权重` : `Weight of task ${index + 1}`}>
                  <option value={1}>{isZh ? "轻量" : "Light"}</option><option value={2}>{isZh ? "标准" : "Standard"}</option><option value={3}>{isZh ? "深度" : "Deep"}</option>
                </select>
              )}
              {!sealed && <div className="plan-task__actions"><button type="button" disabled={index === 0} onClick={() => onMove(task.id, index - 1)} aria-label={isZh ? "上移" : "Move up"}>↑</button><button type="button" disabled={index === tasks.length - 1} onClick={() => onMove(task.id, index + 1)} aria-label={isZh ? "下移" : "Move down"}>↓</button><button type="button" onClick={() => onDelete(task.id)} aria-label={isZh ? "删除" : "Delete"}>×</button></div>}
              {sealed ? <span className="plan-task__bio-summary">{isZh ? `${task.estimatedMinutes ?? 30} 分钟 · 精力 ${task.energy ?? 3}${task.subtasks?.length ? ` · ${task.subtasks.length} 个子事项` : ""}` : `${task.estimatedMinutes ?? 30} MIN · ENERGY ${task.energy ?? 3}${task.subtasks?.length ? ` · ${task.subtasks.length} SUBTASKS` : ""}`}</span> : <div className="plan-task__bio">
                <label><span>{isZh ? "时间" : "TIME"}</span><input type="number" min={5} max={480} step={5} value={task.estimatedMinutes ?? 30} onChange={(event) => onEdit(task.id, { estimatedMinutes: Math.max(5, Number(event.target.value) || 5) })} /><small>{isZh ? "分钟" : "MIN"}</small></label>
                <label><span>{isZh ? "精力" : "ENERGY"}</span><select value={task.energy ?? 3} onChange={(event) => onEdit(task.id, { energy: Number(event.target.value) as 1 | 2 | 3 | 4 | 5 })}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option><option value={5}>5</option></select></label>
                <label className="plan-task__subtasks"><span>{isZh ? "子事项 · 用逗号分隔" : "SUBTASKS · SEPARATE WITH COMMAS"}</span><input value={(task.subtasks ?? []).map((item) => item.title).join(isZh ? "，" : ", ")} onChange={(event) => onEdit(task.id, { subtasks: event.target.value.split(/[，,]/).map((title) => title.trim()).filter(Boolean).map((title, subIndex) => ({ id: `${task.id}_sub_${subIndex}`, title, completed: false })) })} placeholder={isZh ? "研究，制作，检查" : "Research, create, review"} /></label>
              </div>}
            </div>
          ))}
          {!tasks.length && <p className="plan-empty">{isZh ? "明天的基因还是空白的。" : "Tomorrow's DNA is still blank."}</p>}
        </div>

        {!sealed && <button className="plan-add" type="button" onClick={onAdd}>+ {isZh ? "添加一个承诺" : "ADD A COMMITMENT"}</button>}
        {!sealed && !confirmSeal && <button className="plan-seal" type="button" disabled={!validTasks.length} onClick={() => setConfirmSeal(true)}>{emergency ? (isZh ? "形成今日细胞" : "FORM TODAY'S CELLS") : (isZh ? "封存明日计划" : "SEAL TOMORROW'S PLAN")}</button>}
        {!sealed && confirmSeal && <div className="seal-confirm"><p>{isZh ? `封存后，这些承诺将成为${emergency ? "今天" : "明天"}的基因。` : `Once sealed, these commitments become ${emergency ? "today's" : "tomorrow's"} DNA.`}</p><div><button type="button" onClick={() => setConfirmSeal(false)}>{isZh ? "再检查一次" : "REVIEW AGAIN"}</button><button type="button" onClick={onSeal}>{isZh ? "确认封存" : "CONFIRM SEAL"}</button></div></div>}
        {sealed && <p className="plan-sealed-note">{isZh ? "● 基因已封存。它将在目标日期自动成为今日细胞。" : "● DNA SEALED. It will automatically become today's cells on the target date."}</p>}
      </section>
    </div>
  );
}
