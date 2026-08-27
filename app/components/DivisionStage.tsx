import type { CSSProperties } from "react";
import { getCellSkin, type CellSkinId } from "../domain/skins";

export function DivisionStage({ generation, skinId }: { generation: number; skinId: CellSkinId }) {
  return (
    <section className="division-stage" aria-live="polite" aria-label={`正在形成第 ${generation} 代`}>
      <p className="eyebrow">承诺正在成形</p>
      <div className="mitosis" data-skin={skinId} style={getCellSkin(skinId).variables as CSSProperties} aria-hidden="true">
        <span className="mitosis__body" />
        <span className="mitosis__nucleus mitosis__nucleus--a" />
        <span className="mitosis__nucleus mitosis__nucleus--b" />
        <span className="mitosis__furrow" />
      </div>
      <p className="division-stage__caption">GENERATION {String(generation).padStart(2, "0")}</p>
    </section>
  );
}
