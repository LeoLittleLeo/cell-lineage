import type { CSSProperties } from "react";
import { getCellSkin, type CellSkinId } from "../domain/skins";

export function DayCell({ onDivide, skinId }: { onDivide: () => void; skinId: CellSkinId }) {
  const parts = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", weekday: "long" })
    .formatToParts(new Date()).reduce<Record<string, string>>((all, part) => ({ ...all, [part.type]: part.value }), {});

  return (
    <section className="day-stage" aria-labelledby="day-state">
      <p className="eyebrow" id="day-state">今天尚未分裂</p>
      <button className="day-cell" data-skin={skinId} style={getCellSkin(skinId).variables as CSSProperties} type="button" onClick={onDivide} aria-label="开始今天的第一次分裂">
        <span className="day-cell__nucleus" aria-hidden="true" />
        <span className="day-cell__date"><strong>{parts.day}</strong><span>{parts.month?.toUpperCase()}</span></span>
        <span className="day-cell__weekday">{parts.weekday?.toUpperCase()}</span>
        <span className="day-cell__prompt">触碰以开始分裂</span>
      </button>
      <p className="day-note">今天还是完整的。</p>
    </section>
  );
}
