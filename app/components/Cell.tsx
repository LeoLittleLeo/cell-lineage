import type { CSSProperties, ReactNode } from "react";
import { getCellSkin, type CellSkinId } from "../domain/skins";

export function Cell({ children, className = "", skinId }: { children?: ReactNode; className?: string; skinId: CellSkinId }) {
  const skin = getCellSkin(skinId);
  return (
    <div className={`cell-shell ${className}`} data-skin={skinId} style={skin.variables as CSSProperties}>
      <span className="cell-shell__cytoplasm" aria-hidden="true" />
      <span className="cell-shell__nucleus" aria-hidden="true" />
      <div className="cell-shell__content">{children}</div>
    </div>
  );
}
