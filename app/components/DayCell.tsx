import type { CSSProperties } from "react";
import { getCellSkin, type CellSkinId } from "../domain/skins";
import { useLanguage } from "../i18n/LanguageContext";
import { GeneStrand } from "./GeneStrand";

export function DayCell({ onDivide, skinId, taskCount }: { onDivide: () => void; skinId: CellSkinId; taskCount: number }) {
  const { isZh } = useLanguage();
  const parts = new Intl.DateTimeFormat(isZh ? "zh-CN" : "en-US", { day: "2-digit", month: "short", weekday: "long" })
    .formatToParts(new Date()).reduce<Record<string, string>>((all, part) => ({ ...all, [part.type]: part.value }), {});

  return (
    <section className="day-stage" aria-labelledby="day-state">
      <p className="eyebrow" id="day-state">{isZh ? "今天尚未分裂" : "TODAY HAS NOT DIVIDED"}</p>
      <button className="day-cell" data-skin={skinId} style={getCellSkin(skinId).variables as CSSProperties} type="button" onClick={onDivide} aria-label={isZh ? "开始今天的第一次分裂" : "Start today's first division"}>
        <span className="day-cell__nucleus" aria-hidden="true"><GeneStrand seed={`${parts.day}-${taskCount}`} weight={Math.min(3, Math.max(1, taskCount))} minutes={taskCount * 30} energy={3} className="day-cell__gene" /></span>
        <span className="day-cell__date"><strong>{parts.day}</strong><span>{parts.month?.toUpperCase()}</span></span>
        <span className="day-cell__weekday">{parts.weekday?.toUpperCase()}</span>
        <span className="day-cell__task-count">{isZh ? `${taskCount} 个事项 · 基因已封存` : `${taskCount} TASKS · DNA SEALED`}</span>
        <span className="day-cell__prompt">{isZh ? "触碰以释放第一组承诺" : "TOUCH TO RELEASE THE FIRST COMMITMENTS"}</span>
      </button>
      <p className="day-note">{isZh ? "昨天的计划，已经被写进今天。" : "Yesterday's plan has been written into today."}</p>
    </section>
  );
}
