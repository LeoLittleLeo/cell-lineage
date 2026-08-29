"use client";

import { useEffect, useRef, useState } from "react";
import { ATP_COST_DEFER } from "../domain/config";
import type { ExchangeType, TaskCellModel } from "../domain/types";
import { useLanguage } from "../i18n/LanguageContext";

interface Props {
  cell: TaskCellModel;
  atp: number;
  onClose: () => void;
  onExchange: (type: ExchangeType, replacement?: string) => void;
}

export function ExchangePanel({ cell, atp, onClose, onExchange }: Props) {
  const { isZh } = useLanguage();
  const [choice, setChoice] = useState<ExchangeType | null>(null);
  const [replacement, setReplacement] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const replacementRef = useRef<HTMLInputElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => { if (choice && choice !== "atp_defer") replacementRef.current?.focus(); }, [choice]);

  const copy = choice === "minimum_action"
    ? { label: isZh ? "写下真正能完成的最小版本" : "Write the smallest version you can truly complete", placeholder: isZh ? `例如：先做「${cell.currentTitle}」 5 分钟` : `Example: work on “${cell.currentTitle}” for 5 minutes` }
    : { label: isZh ? "写下今天能完成的等价事务" : "Write an equivalent task you can complete today", placeholder: isZh ? "难度或价值应与原承诺接近" : "Its difficulty or value should be close to the original" };

  const submit = () => {
    if (!choice) return;
    if (choice !== "atp_defer" && !replacement.trim()) return;
    onExchange(choice, replacement);
    onClose();
  };

  return (
    <div className="exchange-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="exchange-panel" role="dialog" aria-modal="true" aria-labelledby="exchange-title">
        <button ref={closeRef} className="exchange-close" type="button" onClick={onClose} aria-label={isZh ? "关闭交换面板" : "Close exchange panel"}>×</button>
        <span className="panel-kicker">{isZh ? "重新协商" : "RENEGOTIATE"}</span>
        <h2 id="exchange-title">{isZh ? <>你可以改变承诺，<br />但不能让它凭空消失。</> : <>You may change a commitment,<br />but it cannot simply disappear.</>}</h2>
        <p className="exchange-origin">{isZh ? "当前承诺" : "CURRENT COMMITMENT"} <strong>{cell.currentTitle}</strong></p>

        <div className="exchange-options">
          <button className={choice === "minimum_action" ? "is-selected" : ""} type="button" onClick={() => setChoice("minimum_action")}>
            <span className="option-code">{isZh ? "甲" : "A"}</span><span><strong>{isZh ? "最小行动" : "MINIMUM ACTION"}</strong><small>{isZh ? "缩小它，然后亲手完成。完成后不增加能量。" : "Make it smaller, then finish it yourself. No energy is gained."}</small></span>
          </button>
          <button className={choice === "equivalent_swap" ? "is-selected" : ""} type="button" onClick={() => setChoice("equivalent_swap")}>
            <span className="option-code">{isZh ? "乙" : "B"}</span><span><strong>{isZh ? "等价交换" : "EQUIVALENT SWAP"}</strong><small>{isZh ? "换成另一件真实事务，仍需完成。" : "Exchange it for another real task that still must be completed."}</small></span>
          </button>
          <button className={choice === "atp_defer" ? "is-selected" : ""} type="button" onClick={() => setChoice("atp_defer")} disabled={atp < ATP_COST_DEFER}>
            <span className="option-code">{isZh ? "丙" : "C"}</span><span><strong>{isZh ? "能量休眠" : "ENERGY DORMANCY"}</strong><small>{isZh ? `消耗 ${ATP_COST_DEFER} 点能量，原承诺进入休眠区。${atp < ATP_COST_DEFER ? ` 当前仅有 ${atp} 点能量。` : ""}` : `Spend ${ATP_COST_DEFER} energy to move the original commitment into dormancy.${atp < ATP_COST_DEFER ? ` You only have ${atp}.` : ""}`}</small></span>
          </button>
        </div>

        {choice && choice !== "atp_defer" && (
          <label className="exchange-input"><span>{copy.label}</span><input ref={replacementRef} value={replacement} onChange={(event) => setReplacement(event.target.value)} placeholder={copy.placeholder} maxLength={80} /></label>
        )}
        {choice === "atp_defer" && <p className="dormant-note">{isZh ? "这不是删除。该细胞会保留在今日记录中，等待未来唤醒。" : "This is not deletion. The cell remains in today's record, waiting to be awakened."}</p>}

        <button className="exchange-submit" type="button" onClick={submit} disabled={!choice || (choice !== "atp_defer" && !replacement.trim())}>{isZh ? "建立交换" : "CREATE EXCHANGE"}</button>
      </section>
    </div>
  );
}
