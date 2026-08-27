import type { CSSProperties } from "react";
import { getCellSkin, type CellSkinId } from "../domain/skins";

export function DayComplete({ total, mutations, skinId, onPrepare }: { total: number; mutations: number; skinId: CellSkinId; onPrepare: () => void }) {
  const style = getCellSkin(skinId).variables as CSSProperties;
  return <section className="day-complete-stage" aria-labelledby="day-complete-title">
    <div className="complete-cluster" aria-hidden="true">{[0, 1, 2, 3, 4].map((index) => <span key={index} data-skin={skinId} style={style} />)}</div>
    <p className="eyebrow">DAY COMPLETE</p>
    <h1 id="day-complete-title">今天的承诺已经成熟。</h1>
    <div className="complete-stats"><span><strong>{total}</strong> CELLS</span><span><strong>{mutations}</strong> MUTATIONS</span></div>
    <button type="button" onClick={onPrepare}>Prepare tomorrow <span aria-hidden="true">→</span></button>
  </section>;
}
