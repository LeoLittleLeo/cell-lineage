import { Cell } from "./Cell";
import type { TaskCellModel } from "../domain/types";

interface Props {
  cell: TaskCellModel;
  label: string;
  onTitle: (title: string) => void;
  onComplete: () => void;
  onExchange: () => void;
}

export function TaskCell({ cell, label, onTitle, onComplete, onExchange }: Props) {
  const resolved = cell.status === "completed" || cell.status === "dormant";
  const descriptor = cell.status === "completed" ? "已成熟" : cell.status === "dormant" ? "休眠中" : cell.resolutionType === "minimum_action" ? "最小行动已建立" : cell.resolutionType === "equivalent_swap" ? "等价交换已建立" : "生长中";

  return (
    <article className={`task-cell-wrap ${resolved ? "is-resolved" : ""}`}>
      <span className="cell-index">{label}</span>
      <Cell className={`task-cell task-cell--${cell.status}`} skinId={cell.skinId}>
        {resolved ? (
          <div className="resolved-cell-copy">
            <span className="mature-mark" aria-hidden="true">{cell.status === "dormant" ? "◐" : "✓"}</span>
            <strong>{cell.currentTitle}</strong>
          </div>
        ) : (
          <label className="task-input-label">
            <span className="sr-only">{label} 的承诺</span>
            <textarea value={cell.currentTitle} onChange={(event) => onTitle(event.target.value)} maxLength={80} rows={3} placeholder={label === "CELL A" ? "今天最重要的一件事" : "一个生活维护事项"} />
          </label>
        )}
      </Cell>
      <p className="cell-status"><span aria-hidden="true" />{descriptor}</p>
      {!resolved && (
        <div className="cell-actions">
          <button className="action-primary" type="button" disabled={!cell.currentTitle.trim()} onClick={onComplete}>使其成熟</button>
          <button className="action-quiet" type="button" disabled={!cell.currentTitle.trim()} onClick={onExchange}>重新协商</button>
        </div>
      )}
    </article>
  );
}
