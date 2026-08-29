import type { CSSProperties } from "react";
import { getCellSkin, type CellSkinId } from "../domain/skins";
import { useLanguage } from "../i18n/LanguageContext";

export function MissingDNA({ skinId, onEmergency }: { skinId: CellSkinId; onEmergency: () => void }) {
  const { isZh } = useLanguage();
  return <section className="missing-dna-stage" aria-labelledby="missing-dna-title">
    <div className="unformed-cell" data-skin={skinId} style={getCellSkin(skinId).variables as CSSProperties}><span /></div>
    <p className="eyebrow">{isZh ? "尚未形成的细胞" : "UNFORMED CELL"}</p>
    <h1 id="missing-dna-title">{isZh ? "昨天没有准备今日基因。" : "No DNA was prepared yesterday."}</h1>
    <p>{isZh ? "今天没有可释放的承诺。你可以进行一次明确标记的例外形成。" : "There are no commitments to release today. You can create one clearly marked exception."}</p>
    <button type="button" onClick={onEmergency}>{isZh ? "紧急形成" : "EMERGENCY FORMATION"} <span aria-hidden="true">→</span></button>
  </section>;
}
