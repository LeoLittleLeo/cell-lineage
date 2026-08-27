"use client";

import { useEffect, useRef } from "react";
import { CELL_SKINS, type SkinSelection } from "../domain/skins";
import { Cell } from "./Cell";

interface Props {
  selected: SkinSelection;
  onSelect: (selection: SkinSelection) => void;
  onClose: () => void;
}

export function SkinPicker({ selected, onSelect, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);

  return (
    <div className="skin-picker-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="skin-picker" role="dialog" aria-modal="true" aria-labelledby="skin-picker-title">
        <div className="skin-picker__heading">
          <div><span className="panel-kicker">CELL SKIN</span><h2 id="skin-picker-title">今天想以什么状态生活？</h2></div>
          <button ref={closeRef} className="skin-picker__close" type="button" onClick={onClose} aria-label="关闭细胞皮肤选择">×</button>
        </div>
        <p className="skin-picker__note">只影响未来生成的细胞。已经存在的谱系会保留它当时的样子。</p>

        <div className="skin-grid">
          {CELL_SKINS.map((skin) => (
            <button key={skin.id} type="button" className={`skin-option ${selected === skin.id ? "is-selected" : ""}`} aria-pressed={selected === skin.id} onClick={() => onSelect(skin.id)}>
              <Cell skinId={skin.id} className="skin-preview-cell" />
              <span className="skin-option__copy"><strong>{skin.name}</strong><small>{skin.description}</small></span>
              {selected === skin.id && <span className="skin-option__selected">SELECTED</span>}
            </button>
          ))}
        </div>

        <button type="button" className={`random-skin-option ${selected === "random" ? "is-selected" : ""}`} aria-pressed={selected === "random"} onClick={() => onSelect("random")}>
          <span className="random-skin-option__cells" aria-hidden="true">
            {(["jelly", "ink", "moss"] as const).map((skinId) => <Cell key={skinId} skinId={skinId} className="random-preview-cell" />)}
          </span>
          <span><strong>Random</strong><small>每一个新 Generation 都随机选择一种生命形态。</small></span>
          {selected === "random" && <span className="skin-option__selected">SELECTED</span>}
        </button>
      </section>
    </div>
  );
}
