"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { createRoot, type Root } from "react-dom/client";
import { getCellSkin, type CellSkinId } from "../domain/skins";

interface PetSnapshot {
  title: string;
  minutes?: number;
  status: "等待形成" | "尚未开始" | "生长中" | "可以分裂" | "今日完成";
  skinId: CellSkinId;
}

interface Props {
  snapshot: PetSnapshot;
  onComplete?: () => void;
  onTimer?: () => void;
}

interface PictureInPictureController {
  requestWindow(options: { width: number; height: number }): Promise<Window>;
}

const PET_CSS = `
*{box-sizing:border-box}html,body,#desktop-pet-root{width:100%;height:100%;margin:0;background:transparent;overflow:hidden}
body{font-family:system-ui,-apple-system,sans-serif;color:#243029}
.desktop-pet-card{position:relative;width:100%;height:100%;display:grid;place-items:center;padding:16px;background:rgba(241,239,231,.94);border:1px solid rgba(50,69,57,.18);border-radius:24px;box-shadow:0 18px 45px rgba(31,44,35,.18)}
.desktop-pet-cell{position:relative;width:155px;aspect-ratio:1;display:grid;place-items:center;border:1px solid var(--skin-border);border-radius:var(--skin-radius);background:var(--skin-cell-bg);box-shadow:var(--skin-shadow);animation:petBreathe 4.8s ease-in-out infinite}
.desktop-pet-cell:before{content:"";position:absolute;inset:7px;border:1px solid var(--skin-inner-border);border-radius:var(--skin-inner-radius)}
.desktop-pet-nucleus{position:relative;z-index:2;width:62%;aspect-ratio:1;display:grid;place-items:center;padding:14px;border:1px solid var(--skin-inner-border);border-radius:var(--skin-inner-radius);background:var(--skin-nucleus);text-align:center}
.desktop-pet-nucleus strong{display:-webkit-box;overflow:hidden;-webkit-line-clamp:3;-webkit-box-orient:vertical;font:500 15px/1.25 Georgia,serif}.desktop-pet-nucleus small{margin-top:5px;font-size:8px;opacity:.58}
.desktop-pet-state{position:absolute;left:14px;top:12px;font-size:8px;letter-spacing:.12em;color:#59655e}.desktop-pet-close{position:absolute;z-index:5;right:10px;top:8px;width:27px;height:27px;border:1px solid rgba(50,69,57,.15);border-radius:50%;background:transparent;color:#59655e;cursor:pointer}
.desktop-pet-actions{position:absolute;z-index:4;left:50%;bottom:10px;display:flex;gap:6px;transform:translateX(-50%)}.desktop-pet-actions button{min-width:62px;height:27px;border:1px solid rgba(64,84,71,.28);border-radius:99px;background:rgba(245,244,237,.78);font-size:8px;cursor:pointer}.desktop-pet-actions button:last-child{background:#405448;color:#f5f3eb}
@keyframes petBreathe{50%{transform:scale(1.025) rotate(.5deg)}}`;

function PetBody({ snapshot, onClose, onComplete, onTimer }: Props & { onClose: () => void }) {
  return <div className="desktop-pet-card">
    <span className="desktop-pet-state">{snapshot.status}</span>
    <button className="desktop-pet-close" type="button" onClick={onClose} aria-label="关闭桌面细胞">×</button>
    <div className="desktop-pet-cell" data-skin={snapshot.skinId} style={getCellSkin(snapshot.skinId).variables as CSSProperties}>
      <div className="desktop-pet-nucleus"><strong>{snapshot.title}</strong>{snapshot.minutes !== undefined && <small>{snapshot.minutes} 分钟</small>}</div>
    </div>
    {(onTimer || onComplete) && <div className="desktop-pet-actions">{onTimer && <button type="button" onClick={onTimer}>计时</button>}{onComplete && <button type="button" onClick={onComplete}>完成</button>}</div>}
  </div>;
}

export function DesktopPet({ snapshot, onComplete, onTimer }: Props) {
  const [fallbackOpen, setFallbackOpen] = useState(true);
  const [position, setPosition] = useState({ x: 24, y: 92 });
  const pipWindow = useRef<Window | null>(null);
  const pipRoot = useRef<Root | null>(null);
  const drag = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

  const closePip = () => { pipRoot.current?.unmount(); pipRoot.current = null; pipWindow.current?.close(); pipWindow.current = null; };

  const renderPip = () => pipRoot.current?.render(<PetBody snapshot={snapshot} onComplete={onComplete} onTimer={onTimer} onClose={closePip} />);

  useEffect(() => { renderPip(); });
  useEffect(() => () => closePip(), []);

  const launch = async () => {
    const controller = (window as Window & { documentPictureInPicture?: PictureInPictureController }).documentPictureInPicture;
    if (!controller) { setFallbackOpen(true); return; }
    closePip();
    try {
      const petWindow = await controller.requestWindow({ width: 230, height: 240 });
      setFallbackOpen(false);
      petWindow.document.title = "桌面细胞";
      const style = petWindow.document.createElement("style"); style.textContent = PET_CSS; petWindow.document.head.append(style);
      const rootNode = petWindow.document.createElement("div"); rootNode.id = "desktop-pet-root"; petWindow.document.body.append(rootNode);
      pipWindow.current = petWindow; pipRoot.current = createRoot(rootNode); renderPip();
      petWindow.addEventListener("pagehide", () => { pipRoot.current = null; pipWindow.current = null; }, { once: true });
    } catch { setFallbackOpen(true); }
  };

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    drag.current = { x: event.clientX, y: event.clientY, startX: position.x, startY: position.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setPosition({ x: Math.max(8, drag.current.startX - (event.clientX - drag.current.x)), y: Math.max(64, drag.current.startY + (event.clientY - drag.current.y)) });
  };

  return <>
    <button className="desktop-pet-trigger" type="button" onClick={launch}>桌面细胞</button>
    {fallbackOpen && <div className="desktop-pet-fallback" style={{ right: position.x, top: position.y }} onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={() => { drag.current = null; }}>
      <PetBody snapshot={snapshot} onComplete={onComplete} onTimer={onTimer} onClose={() => setFallbackOpen(false)} />
    </div>}
  </>;
}
