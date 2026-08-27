"use client";

import { useMemo, useState } from "react";
import type { MutationType, TaskCellModel, TaskWeight } from "../domain/types";

interface Props {
  cell: TaskCellModel;
  tokens: number;
  onClose: () => void;
  onMutate: (type: MutationType, replacement?: string, weight?: TaskWeight) => void;
}

const WEIGHTS: TaskWeight[] = [1, 2, 3];

export function MutationPanel({ cell, tokens, onClose, onMutate }: Props) {
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
        <button className="exchange-close" type="button" onClick={onClose} aria-label="关闭突变面板">×</button>
        <span className="panel-kicker">可控突变</span>
        <h2 id="mutation-title">改变承诺的生长路径</h2>
        <p className="mutation-origin">当前细胞 <strong>{cell.currentTitle}</strong></p>
        <p className="mutation-budget">本周剩余 <span>{tokens}</span> / 3 次突变</p>
        <div className="mutation-options">
          <button className={type === "tomorrow_debt" ? "is-selected" : ""} type="button" onClick={() => choose("tomorrow_debt")} disabled={tokens < 1}><span>01</span><strong>明日债务</strong><small>今天释放，明天偿还；新承诺必须更重。</small></button>
          <button className={type === "task_exchange" ? "is-selected" : ""} type="button" onClick={() => choose("task_exchange")} disabled={tokens < 1}><span>02</span><strong>事项交换</strong><small>换成同等或更高权重的承诺，细胞继续生长。</small></button>
          <button className={type === "mutation_token" ? "is-selected" : ""} type="button" onClick={() => choose("mutation_token")} disabled={tokens < 1}><span>03</span><strong>突变机会</strong><small>承认计划失配，用一次稀缺机会结束这个细胞。</small></button>
        </div>
        {requiresReplacement && <div className="mutation-form">
          <label><span>{type === "tomorrow_debt" ? "明天偿还的承诺" : "替代承诺"}</span><input value={replacement} onChange={(event) => setReplacement(event.target.value)} maxLength={80} placeholder="写下清晰、可执行的承诺" /></label>
          <label><span>权重 · 最低 {minimumWeight}</span><select value={weight} onChange={(event) => setWeight(Number(event.target.value) as TaskWeight)}>{weightOptions.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        </div>}
        {tokens < 1 && <p className="mutation-warning">本周的 3 次突变机会已全部使用。</p>}
        <button className="mutation-submit" type="button" disabled={!valid} onClick={() => { if (!type) return; onMutate(type, replacement, weight); onClose(); }}>确认突变</button>
      </section>
    </div>
  );
}
