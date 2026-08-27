import type { CSSProperties } from "react";
import { getCellSkin, type CellSkinId } from "../domain/skins";

export function MissingDNA({ skinId, onEmergency }: { skinId: CellSkinId; onEmergency: () => void }) {
  return <section className="missing-dna-stage" aria-labelledby="missing-dna-title">
    <div className="unformed-cell" data-skin={skinId} style={getCellSkin(skinId).variables as CSSProperties}><span /></div>
    <p className="eyebrow">UNFORMED CELL</p>
    <h1 id="missing-dna-title">No DNA was prepared yesterday.</h1>
    <p>今天没有可释放的承诺。你可以进行一次明确标记的例外形成。</p>
    <button type="button" onClick={onEmergency}>Emergency Formation <span aria-hidden="true">→</span></button>
  </section>;
}
