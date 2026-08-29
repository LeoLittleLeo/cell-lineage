"use client";

import { useState, type CSSProperties } from "react";
import { deriveMonthlyReview } from "../domain/analytics";
import { getCellSkin, type CellSkinId } from "../domain/skins";
import type { DaySession, GenerationModel } from "../domain/types";
import { useLanguage } from "../i18n/LanguageContext";

export function Lineage({ generations, daySkinId, days, currentDate }: { generations: GenerationModel[]; daySkinId: CellSkinId; days: DaySession[]; currentDate: string }) {
  const { isZh } = useLanguage();
  const [reviewOpen, setReviewOpen] = useState(false);
  const review = deriveMonthlyReview(days, currentDate);
  if (!generations.length && !days.some((day) => day.generations.length)) return null;
  return (
    <aside className="lineage" aria-label={isZh ? "今日细胞谱系" : "Today's cell lineage"}>
      <div className="lineage__heading"><span>{isZh ? "细胞谱系" : "LINEAGE"}</span><button type="button" onClick={() => setReviewOpen((open) => !open)}>{reviewOpen ? (isZh ? "返回今日" : "TODAY") : (isZh ? "月度回望" : "MONTHLY REVIEW")}</button></div>
      {reviewOpen ? <div className="monthly-review">
        <div className="review-stats"><span><strong>{Math.round(review.fulfillmentRate * 100)}%</strong>{isZh ? "承诺兑现率" : "FULFILLMENT"}</span><span><strong>{review.mutated}</strong>{isZh ? "次诚实突变" : "MUTATIONS"}</span><span><strong>{review.energySurplus >= 0 ? "+" : ""}{review.energySurplus}</strong>{isZh ? "能量盈余" : "ENERGY SURPLUS"}</span><span><strong>{review.scars}</strong>{isZh ? "道紧急伤疤" : "EMERGENCY SCARS"}</span></div>
        <p className="fulfillment-definition">{isZh ? "兑现率 = 完成的承诺 ÷（完成 + 突变的承诺）。它不奖励隐藏，而记录真实改变。" : "Fulfillment = completed commitments ÷ (completed + mutated). It rewards honesty, not hiding."}</p>
        <div className="month-tree" aria-label={isZh ? `${review.month} 月度谱系树` : `${review.month} monthly lineage tree`}>
          {review.days.map((day) => <div className="month-branch" key={day.id}><time>{day.date.slice(8)}</time><i /><div>{day.generations.flatMap((generation) => generation.cells).map((cell) => <span key={cell.id} className={`status-${cell.status} ${cell.emergencyScar ? "has-scar" : ""}`} title={`${cell.currentTitle}${cell.exchangeHistory.at(-1)?.reason ? ` · ${cell.exchangeHistory.at(-1)?.reason}` : ""}`}>{cell.emergencyScar ? "≠" : cell.debtGene && !cell.debtGene.clearedAt ? "δ" : cell.status === "completed" ? "✓" : cell.status === "mutated" ? "∿" : "·"}</span>)}</div></div>)}
        </div>
      </div> : <>
      <div className="lineage__rail">
        <span className="lineage__origin" data-skin={daySkinId} style={getCellSkin(daySkinId).variables as CSSProperties} title={isZh ? "今日" : "Today"} />
        {generations.map((generation) => (
          <div className="lineage-generation" key={generation.id}>
            <span className="lineage-generation__stem" aria-hidden="true" />
            <span className="lineage-generation__label">{isZh ? `第 ${generation.index} 代` : `GEN ${generation.index}`}</span>
            <div className="lineage-generation__cells">
              {generation.cells.map((cell) => (
                <span className={`lineage-cell lineage-cell--${cell.status} ${cell.emergencyScar ? "has-scar" : ""}`} data-skin={cell.skinId} style={getCellSkin(cell.skinId).variables as CSSProperties} key={cell.id} title={`${getCellSkin(cell.skinId).name} · ${cell.currentTitle || (isZh ? "未命名细胞" : "Untitled cell")}${cell.exchangeHistory.at(-1)?.reason ? ` · ${isZh ? "突变原因" : "Reason"}: ${cell.exchangeHistory.at(-1)?.reason}` : ""}`}>
                  {cell.emergencyScar ? "≠" : cell.debtGene && !cell.debtGene.clearedAt ? "δ" : cell.status === "completed" ? "✓" : cell.status === "mutated" ? "∿" : cell.status === "dormant" ? "◐" : ""}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      </>}
    </aside>
  );
}
