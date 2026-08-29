import type { CSSProperties } from "react";
import { getCellSkin, type CellSkinId } from "../domain/skins";

export function MissingDNA({ skinId, onEmergency }: { skinId: CellSkinId; onEmergency: () => void }) {
  return <section className="missing-dna-stage" aria-labelledby="missing-dna-title">
    <div className="unformed-cell" data-skin={skinId} style={getCellSkin(skinId).variables as CSSProperties}><span /></div>
    <p className="eyebrow">尚未形成的细胞</p>
    <h1 id="missing-dna-title">昨天没有准备今日基因。</h1>
    <p>今天没有可释放的承诺。你可以进行一次明确标记的例外形成。</p>
    <button type="button" onClick={onEmergency}>紧急形成 <span aria-hidden="true">→</span></button>
  </section>;
}
