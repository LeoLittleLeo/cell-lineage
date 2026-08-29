import type { CSSProperties } from "react";
import { getCellSkin, type CellSkinId } from "../domain/skins";
import { useLanguage } from "../i18n/LanguageContext";
import { GeneStrand } from "./GeneStrand";

export function DivisionStage({ generation, skinId }: { generation: number; skinId: CellSkinId }) {
  const { isZh } = useLanguage();
  return (
    <section className="division-stage" aria-live="polite" aria-label={isZh ? `正在形成第 ${generation} 代` : `Forming generation ${generation}`}>
      <p className="eyebrow">{isZh ? "承诺正在成形" : "COMMITMENTS ARE TAKING SHAPE"}</p>
      <div className="mitosis" data-skin={skinId} style={getCellSkin(skinId).variables as CSSProperties} aria-hidden="true">
        <span className="mitosis__body"><GeneStrand seed={`generation-${generation}`} weight={2} minutes={generation * 30} energy={3} className="mitosis__gene mitosis__gene--source" /></span>
        <span className="mitosis__nucleus mitosis__nucleus--a"><GeneStrand seed={`generation-${generation}`} weight={2} minutes={generation * 30} energy={3} compact className="mitosis__gene-copy" /></span>
        <span className="mitosis__nucleus mitosis__nucleus--b"><GeneStrand seed={`generation-${generation}`} weight={2} minutes={generation * 30} energy={3} compact className="mitosis__gene-copy" /></span>
        <span className="mitosis__furrow" />
      </div>
      <p className="division-stage__caption">{isZh ? `第 ${String(generation).padStart(2, "0")} 代` : `GENERATION ${String(generation).padStart(2, "0")}`}</p>
    </section>
  );
}
