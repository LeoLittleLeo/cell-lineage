import type { CSSProperties } from "react";
import { getCellSkin, type CellSkinId } from "../domain/skins";
import { useLanguage } from "../i18n/LanguageContext";

export function DayComplete({ total, mutations, skinId, onPrepare }: { total: number; mutations: number; skinId: CellSkinId; onPrepare: () => void }) {
  const { isZh } = useLanguage();
  const style = getCellSkin(skinId).variables as CSSProperties;
  return <section className="day-complete-stage" aria-labelledby="day-complete-title">
    <div className="complete-cluster" aria-hidden="true">{[0, 1, 2, 3, 4].map((index) => <span key={index} data-skin={skinId} style={style} />)}</div>
    <p className="eyebrow">{isZh ? "今日生命周期完成" : "DAY COMPLETE"}</p>
    <h1 id="day-complete-title">{isZh ? "今天的承诺已经成熟。" : "Today's commitments are mature."}</h1>
    <div className="complete-stats"><span><strong>{total}</strong> {isZh ? "个细胞" : "CELLS"}</span><span><strong>{mutations}</strong> {isZh ? "次突变" : "MUTATIONS"}</span></div>
    <button type="button" onClick={onPrepare}>{isZh ? "规划明日" : "PREPARE TOMORROW"} <span aria-hidden="true">→</span></button>
  </section>;
}
