import type { CSSProperties } from "react";
import { getCellSkin, type CellSkinId } from "../domain/skins";
import type { GenerationModel } from "../domain/types";

export function Lineage({ generations, daySkinId }: { generations: GenerationModel[]; daySkinId: CellSkinId }) {
  if (!generations.length) return null;
  return (
    <aside className="lineage" aria-label="今日细胞谱系">
      <div className="lineage__heading"><span>LINEAGE</span><small>今日生长轨迹</small></div>
      <div className="lineage__rail">
        <span className="lineage__origin" data-skin={daySkinId} style={getCellSkin(daySkinId).variables as CSSProperties} title="Today" />
        {generations.map((generation) => (
          <div className="lineage-generation" key={generation.id}>
            <span className="lineage-generation__stem" aria-hidden="true" />
            <span className="lineage-generation__label">G{generation.index}</span>
            <div className="lineage-generation__cells">
              {generation.cells.map((cell) => (
                <span className={`lineage-cell lineage-cell--${cell.status}`} data-skin={cell.skinId} style={getCellSkin(cell.skinId).variables as CSSProperties} key={cell.id} title={`${getCellSkin(cell.skinId).name} · ${cell.currentTitle || "未命名细胞"}`}>
                  {cell.status === "completed" ? "✓" : cell.status === "dormant" ? "◐" : ""}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
