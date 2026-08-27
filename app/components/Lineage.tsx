import type { GenerationModel } from "../domain/types";

export function Lineage({ generations }: { generations: GenerationModel[] }) {
  if (!generations.length) return null;
  return (
    <aside className="lineage" aria-label="今日细胞谱系">
      <div className="lineage__heading"><span>LINEAGE</span><small>今日生长轨迹</small></div>
      <div className="lineage__rail">
        <span className="lineage__origin" title="Today" />
        {generations.map((generation) => (
          <div className="lineage-generation" key={generation.id}>
            <span className="lineage-generation__stem" aria-hidden="true" />
            <span className="lineage-generation__label">G{generation.index}</span>
            <div className="lineage-generation__cells">
              {generation.cells.map((cell) => (
                <span className={`lineage-cell lineage-cell--${cell.status}`} key={cell.id} title={cell.currentTitle || "未命名细胞"}>
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
