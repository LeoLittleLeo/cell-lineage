"use client";

import { useMemo, useState } from "react";
import type { MutationType, TaskCellModel, TaskWeight } from "../domain/types";
import { useLanguage } from "../i18n/LanguageContext";

interface Props {
  cell: TaskCellModel;
  tokens: number;
  onClose: () => void;
  onMutate: (type: MutationType, replacement?: string, weight?: TaskWeight) => void;
}

const WEIGHTS: TaskWeight[] = [1, 2, 3];

export function MutationPanel({ cell, tokens, onClose, onMutate }: Props) {
  const { isZh } = useLanguage();
  const [type, setType] = useState<MutationType | null>(null);
  const [replacement, setReplacement] = useState("");
  const [weight, setWeight] = useState<TaskWeight>(cell.weight);
  const minimumWeight = type === "tomorrow_debt" ? Math.min(3, cell.weight + 1) as TaskWeight : cell.weight;
  const requiresReplacement = type === "tomorrow_debt" || type === "task_exchange";
  const valid = Boolean(type && tokens > 0 && (!requiresReplacement || (replacement.trim() && weight >= minimumWeight)));
  const weightOptions = useMemo(() => WEIGHTS.filter((value) => value >= minimumWeight), [minimumWeight]);

  const choose = (next: MutationType) => {
    setType(next);
    setWeight(next === "tomorrow_debt" ? Math.min(3, cell.weight + 1) as TaskWeight : cell.weight);
  };

  return (
    <div className="mutation-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="mutation-panel" role="dialog" aria-modal="true" aria-labelledby="mutation-title">
        <button className="exchange-close" type="button" onClick={onClose} aria-label={isZh ? "关闭突变面板" : "Close mutation panel"}>×</button>
        <span className="panel-kicker">{isZh ? "可控突变" : "CONTROLLED MUTATION"}</span>
        <h2 id="mutation-title">{isZh ? "改变承诺的生长路径" : "Change the commitment's growth path"}</h2>
        <p className="mutation-origin">{isZh ? "当前细胞" : "CURRENT CELL"} <strong>{cell.currentTitle}</strong></p>
        <p className="mutation-budget">{isZh ? "本周剩余" : "THIS WEEK"} <span>{tokens}</span> / 3 {isZh ? "次突变" : "MUTATIONS LEFT"}</p>
        <div className="mutation-options">
          <button className={type === "tomorrow_debt" ? "is-selected" : ""} type="button" onClick={() => choose("tomorrow_debt")} disabled={tokens < 1}><span>01</span><strong>{isZh ? "明日债务" : "TOMORROW DEBT"}</strong><small>{isZh ? "今天释放，明天偿还；新承诺必须更重。" : "Release it today and repay tomorrow with a heavier commitment."}</small></button>
          <button className={type === "task_exchange" ? "is-selected" : ""} type="button" onClick={() => choose("task_exchange")} disabled={tokens < 1}><span>02</span><strong>{isZh ? "事项交换" : "TASK EXCHANGE"}</strong><small>{isZh ? "换成同等或更高权重的承诺，细胞继续生长。" : "Exchange it for an equal or heavier commitment and keep growing."}</small></button>
          <button className={type === "mutation_token" ? "is-selected" : ""} type="button" onClick={() => choose("mutation_token")} disabled={tokens < 1}><span>03</span><strong>{isZh ? "突变机会" : "MUTATION TOKEN"}</strong><small>{isZh ? "承认计划失配，用一次稀缺机会结束这个细胞。" : "Acknowledge a planning mismatch and spend a rare token to end this cell."}</small></button>
        </div>
        {requiresReplacement && <div className="mutation-form">
          <label><span>{type === "tomorrow_debt" ? (isZh ? "明天偿还的承诺" : "COMMITMENT TO REPAY TOMORROW") : (isZh ? "替代承诺" : "REPLACEMENT COMMITMENT")}</span><input value={replacement} onChange={(event) => setReplacement(event.target.value)} maxLength={80} placeholder={isZh ? "写下清晰、可执行的承诺" : "Write a clear, actionable commitment"} /></label>
          <label><span>{isZh ? `权重 · 最低 ${minimumWeight}` : `WEIGHT · MINIMUM ${minimumWeight}`}</span><select value={weight} onChange={(event) => setWeight(Number(event.target.value) as TaskWeight)}>{weightOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        </div>}
        {tokens < 1 && <p className="mutation-warning">{isZh ? "本周的 3 次突变机会已全部使用。" : "All three mutation tokens have been used this week."}</p>}
        <button className="mutation-submit" type="button" disabled={!valid} onClick={() => { if (!type) return; onMutate(type, replacement, weight); onClose(); }}>{isZh ? "确认突变" : "CONFIRM MUTATION"}</button>
      </section>
    </div>
  );
}
