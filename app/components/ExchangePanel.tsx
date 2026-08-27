"use client";

import { useEffect, useRef, useState } from "react";
import { ATP_COST_DEFER } from "../domain/config";
import type { ExchangeType, TaskCellModel } from "../domain/types";

interface Props {
  cell: TaskCellModel;
  atp: number;
  onClose: () => void;
  onExchange: (type: ExchangeType, replacement?: string) => void;
}

export function ExchangePanel({ cell, atp, onClose, onExchange }: Props) {
  const [choice, setChoice] = useState<ExchangeType | null>(null);
  const [replacement, setReplacement] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const replacementRef = useRef<HTMLInputElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => { if (choice && choice !== "atp_defer") replacementRef.current?.focus(); }, [choice]);

  const copy = choice === "minimum_action"
    ? { label: "写下真正能完成的最小版本", placeholder: `例如：先做「${cell.currentTitle}」 5 分钟` }
    : { label: "写下今天能完成的等价事务", placeholder: "难度或价值应与原承诺接近" };

  const submit = () => {
    if (!choice) return;
    if (choice !== "atp_defer" && !replacement.trim()) return;
    onExchange(choice, replacement);
    onClose();
  };

  return (
    <div className="exchange-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="exchange-panel" role="dialog" aria-modal="true" aria-labelledby="exchange-title">
        <button ref={closeRef} className="exchange-close" type="button" onClick={onClose} aria-label="关闭交换面板">×</button>
        <span className="panel-kicker">EXCHANGE / 重新协商</span>
        <h2 id="exchange-title">你可以改变承诺，<br />但不能让它凭空消失。</h2>
        <p className="exchange-origin">当前承诺 <strong>{cell.currentTitle}</strong></p>

        <div className="exchange-options">
          <button className={choice === "minimum_action" ? "is-selected" : ""} type="button" onClick={() => setChoice("minimum_action")}>
            <span className="option-code">A</span><span><strong>最小行动</strong><small>缩小它，然后亲手完成。完成后 +0 ATP。</small></span>
          </button>
          <button className={choice === "equivalent_swap" ? "is-selected" : ""} type="button" onClick={() => setChoice("equivalent_swap")}>
            <span className="option-code">B</span><span><strong>等价交换</strong><small>换成另一件真实事务，仍需完成。</small></span>
          </button>
          <button className={choice === "atp_defer" ? "is-selected" : ""} type="button" onClick={() => setChoice("atp_defer")} disabled={atp < ATP_COST_DEFER}>
            <span className="option-code">C</span><span><strong>ATP 休眠</strong><small>消耗 {ATP_COST_DEFER} ATP，原承诺进入休眠区。{atp < ATP_COST_DEFER ? ` 当前仅 ${atp} ATP。` : ""}</small></span>
          </button>
        </div>

        {choice && choice !== "atp_defer" && (
          <label className="exchange-input"><span>{copy.label}</span><input ref={replacementRef} value={replacement} onChange={(event) => setReplacement(event.target.value)} placeholder={copy.placeholder} maxLength={80} /></label>
        )}
        {choice === "atp_defer" && <p className="dormant-note">这不是删除。该细胞会保留在今日记录中，等待未来唤醒。</p>}

        <button className="exchange-submit" type="button" onClick={submit} disabled={!choice || (choice !== "atp_defer" && !replacement.trim())}>建立交换</button>
      </section>
    </div>
  );
}
