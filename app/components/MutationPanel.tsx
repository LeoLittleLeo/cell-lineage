"use client";

import { useMemo, useState } from "react";
import type { MutationType, TaskCellModel, TaskWeight } from "../domain/types";
import { useLanguage } from "../i18n/LanguageContext";

interface Props {
  cell: TaskCellModel;
  tokens: number;
  onClose: () => void;
  onMutate: (type: MutationType, replacement?: string, weight?: TaskWeight, reason?: string, emergency?: boolean) => void;
}

const WEIGHTS: TaskWeight[] = [1, 2, 3];

export function MutationPanel({ cell, tokens, onClose, onMutate }: Props) {
  const { isZh } = useLanguage();
  const [type, setType] = useState<MutationType | null>(null);
  const [replacement, setReplacement] = useState("");
  const [reason, setReason] = useState("");
  const [ritual, setRitual] = useState(false);
  const [weight, setWeight] = useState<TaskWeight>(cell.weight);
  const minimumWeight = type === "tomorrow_debt" ? Math.min(3, cell.weight + 1) as TaskWeight : cell.weight;
  const requiresReplacement = type === "tomorrow_debt" || type === "task_exchange";
  const emergency = tokens < 1;
  const valid = Boolean(type && reason.trim() && (!requiresReplacement || (replacement.trim() && weight >= minimumWeight)));
  const weightOptions = useMemo(() => WEIGHTS.filter((value) => value >= minimumWeight), [minimumWeight]);

  const choose = (next: MutationType) => {
    setType(next);
    setWeight(next === "tomorrow_debt" ? Math.min(3, cell.weight + 1) as TaskWeight : cell.weight);
  };

  return (
    <div className={`mutation-backdrop ${ritual ? "is-ritual" : ""}`} role="presentation" onMouseDown={(event) => { if (!ritual && event.target === event.currentTarget) onClose(); }}>
      <section className={`mutation-panel ${ritual ? "is-recombining" : ""}`} role="dialog" aria-modal="true" aria-labelledby="mutation-title">
        <button className="exchange-close" type="button" onClick={onClose} aria-label={isZh ? "关闭突变面板" : "Close mutation panel"}>×</button>
        <span className="panel-kicker">{isZh ? "可控突变" : "CONTROLLED MUTATION"}</span>
        <h2 id="mutation-title">{isZh ? "改变承诺的生长路径" : "Change the commitment's growth path"}</h2>
        <p className="mutation-origin">{isZh ? "当前细胞" : "CURRENT CELL"} <strong>{cell.currentTitle}</strong></p>
        <p className="mutation-budget">{isZh ? "本周剩余" : "THIS WEEK"} <span>{tokens}</span> / 3 {isZh ? "次突变" : "MUTATIONS LEFT"}</p>
        <div className="mutation-options">
          <button className={type === "tomorrow_debt" ? "is-selected" : ""} type="button" onClick={() => choose("tomorrow_debt")}><span>01</span><strong>{isZh ? "明日债务" : "TOMORROW DEBT"}</strong><small>{isZh ? "今天释放，明天偿还；子代会继承债务基因。" : "Release it today; its offspring inherits a debt gene."}</small></button>
          <button className={type === "task_exchange" ? "is-selected" : ""} type="button" onClick={() => choose("task_exchange")}><span>02</span><strong>{isZh ? "事项交换" : "TASK EXCHANGE"}</strong><small>{isZh ? "换成同等或更高权重的承诺，细胞继续生长。" : "Exchange it for an equal or heavier commitment and keep growing."}</small></button>
          <button className={type === "mutation_token" ? "is-selected" : ""} type="button" onClick={() => choose("mutation_token")}><span>03</span><strong>{isZh ? "承认失配" : "ACKNOWLEDGE MISMATCH"}</strong><small>{isZh ? "诚实结束不再适合的承诺，并保留原因。" : "Honestly end a mismatched commitment and preserve why."}</small></button>
        </div>
        {requiresReplacement && <div className="mutation-form">
          <label><span>{type === "tomorrow_debt" ? (isZh ? "明天偿还的承诺" : "COMMITMENT TO REPAY TOMORROW") : (isZh ? "替代承诺" : "REPLACEMENT COMMITMENT")}</span><input value={replacement} onChange={(event) => setReplacement(event.target.value)} maxLength={80} placeholder={isZh ? "写下清晰、可执行的承诺" : "Write a clear, actionable commitment"} /></label>
          <label><span>{isZh ? `权重 · 最低 ${minimumWeight}` : `WEIGHT · MINIMUM ${minimumWeight}`}</span><select value={weight} onChange={(event) => setWeight(Number(event.target.value) as TaskWeight)}>{weightOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        </div>}
        <label className="mutation-reason"><span>{isZh ? "突变记录 · 为什么改变？" : "MUTATION RECORD · WHY CHANGE?"}</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={140} rows={3} placeholder={isZh ? "例如：估时错误、优先级变化、身体状态不适合……" : "For example: bad estimate, changed priority, low capacity…"} /></label>
        {emergency && <p className="mutation-warning mutation-warning--emergency"><strong>{isZh ? "紧急突变" : "EMERGENCY MUTATION"}</strong>{isZh ? "本周额度已耗尽。这次改变仍被允许，但会在细胞和谱系上留下永久伤疤。" : "The weekly allowance is depleted. This change is allowed, but leaves a permanent scar on the cell and lineage."}</p>}
        <button className={`mutation-submit ${emergency ? "is-emergency" : ""}`} type="button" disabled={!valid || ritual} onClick={() => { if (!type) return; setRitual(true); window.setTimeout(() => { onMutate(type, replacement, weight, reason, emergency); onClose(); }, 1450); }}>{ritual ? (isZh ? "细胞解体 · 基因重组中" : "DISASSEMBLING · RECOMBINING") : emergency ? (isZh ? "执行紧急突变并留下伤疤" : "EMERGENCY MUTATION · LEAVE SCAR") : (isZh ? "开始突变仪式" : "BEGIN MUTATION RITUAL")}</button>
      </section>
    </div>
  );
}
