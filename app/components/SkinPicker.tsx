"use client";

import { useEffect, useRef } from "react";
import { CELL_SKINS, type SkinSelection } from "../domain/skins";
import { useLanguage } from "../i18n/LanguageContext";
import { Cell } from "./Cell";

interface Props {
  selected: SkinSelection;
  onSelect: (selection: SkinSelection) => void;
  onClose: () => void;
}

export function SkinPicker({ selected, onSelect, onClose }: Props) {
  const { isZh } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);
  const english = {
    cell: { name: "Cell", description: "Quiet and gentle, preserving today's sense of wholeness." },
    jelly: { name: "Jelly", description: "Transparent and slow, breathing with a gel-like rhythm." },
    petri: { name: "Petri", description: "Delicate and restrained, like microscopic life in culture." },
    yolk: { name: "Yolk", description: "Warm and full, carrying the vitality of new tissue." },
    ink: { name: "Ink", description: "Still and fluid, like a drop of ink opening in water." },
    moss: { name: "Moss", description: "Slow and resilient, growing quietly like moss." },
  } as const;

  return (
    <div className="skin-picker-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="skin-picker" role="dialog" aria-modal="true" aria-labelledby="skin-picker-title">
        <div className="skin-picker__heading">
          <div><span className="panel-kicker">{isZh ? "细胞皮肤" : "CELL SKIN"}</span><h2 id="skin-picker-title">{isZh ? "今天想以什么状态生活？" : "How do you want to live today?"}</h2></div>
          <button ref={closeRef} className="skin-picker__close" type="button" onClick={onClose} aria-label={isZh ? "关闭细胞皮肤选择" : "Close cell skin picker"}>×</button>
        </div>
        <p className="skin-picker__note">{isZh ? "只影响未来生成的细胞。已经存在的谱系会保留它当时的样子。" : "This only affects future cells. Existing lineages keep the appearance they were born with."}</p>

        <div className="skin-grid">
          {CELL_SKINS.map((skin) => (
            <button key={skin.id} type="button" className={`skin-option ${selected === skin.id ? "is-selected" : ""}`} aria-pressed={selected === skin.id} onClick={() => onSelect(skin.id)}>
              <Cell skinId={skin.id} className="skin-preview-cell" />
              <span className="skin-option__copy"><strong>{isZh ? skin.name : english[skin.id].name}</strong><small>{isZh ? skin.description : english[skin.id].description}</small></span>
              {selected === skin.id && <span className="skin-option__selected">{isZh ? "已选择" : "SELECTED"}</span>}
            </button>
          ))}
        </div>

        <button type="button" className={`random-skin-option ${selected === "random" ? "is-selected" : ""}`} aria-pressed={selected === "random"} onClick={() => onSelect("random")}>
          <span className="random-skin-option__cells" aria-hidden="true">
            {(["jelly", "ink", "moss"] as const).map((skinId) => <Cell key={skinId} skinId={skinId} className="random-preview-cell" />)}
          </span>
          <span><strong>{isZh ? "随机" : "Random"}</strong><small>{isZh ? "每一代新细胞都随机选择一种生命形态。" : "Every new generation chooses a life form at random."}</small></span>
          {selected === "random" && <span className="skin-option__selected">{isZh ? "已选择" : "SELECTED"}</span>}
        </button>
      </section>
    </div>
  );
}
