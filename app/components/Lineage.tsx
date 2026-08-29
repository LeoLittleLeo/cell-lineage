import type { CSSProperties } from "react";
import { getCellSkin, type CellSkinId } from "../domain/skins";
import type { GenerationModel } from "../domain/types";
import { useLanguage } from "../i18n/LanguageContext";

export function Lineage({ generations, daySkinId }: { generations: GenerationModel[]; daySkinId: CellSkinId }) {
  const { isZh } = useLanguage();
  if (!generations.length) return null;
  return (
    <aside className="lineage" aria-label={isZh ? "今日细胞谱系" : "Today's cell lineage"}>
      <div className="lineage__heading"><span>{isZh ? "细胞谱系" : "LINEAGE"}</span><small>{isZh ? "今日生长轨迹" : "TODAY'S GROWTH TRAIL"}</small></div>
      <div className="lineage__rail">
        <span className="lineage__origin" data-skin={daySkinId} style={getCellSkin(daySkinId).variables as CSSProperties} title={isZh ? "今日" : "Today"} />
        {generations.map((generation) => (
          <div className="lineage-generation" key={generation.id}>
            <span className="lineage-generation__stem" aria-hidden="true" />
            <span className="lineage-generation__label">{isZh ? `第 ${generation.index} 代` : `GEN ${generation.index}`}</span>
            <div className="lineage-generation__cells">
              {generation.cells.map((cell) => (
                <span className={`lineage-cell lineage-cell--${cell.status}`} data-skin={cell.skinId} style={getCellSkin(cell.skinId).variables as CSSProperties} key={cell.id} title={`${getCellSkin(cell.skinId).name} · ${cell.currentTitle || (isZh ? "未命名细胞" : "Untitled cell")}`}>
                  {cell.status === "completed" ? "✓" : cell.status === "mutated" ? "∿" : cell.status === "dormant" ? "◐" : ""}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
