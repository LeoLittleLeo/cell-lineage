import type { ReactNode } from "react";

export function Cell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`cell-shell ${className}`}>
      <span className="cell-shell__cytoplasm" aria-hidden="true" />
      <span className="cell-shell__nucleus" aria-hidden="true" />
      <div className="cell-shell__content">{children}</div>
    </div>
  );
}
