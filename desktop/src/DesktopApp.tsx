import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useCellStore } from "@hooks/useCellStore";
import { CELL_SKINS, getCellSkin, resolveSkinSelection, type CellSkinId, type SkinSelection } from "@domain/skins";
import type { MutationType, TaskCellModel, TaskWeight } from "@domain/types";

type Panel = "nucleus" | "mutation" | "plan" | "skin" | "lineage" | null;

const statusLabel: Record<TaskCellModel["status"], string> = {
  idle: "等待生长", active: "生长中", completed: "已经成熟", exchanged: "完成交换", mutated: "完成突变", dormant: "进入休眠",
};

export function DesktopApp() {
  const store = useCellStore(true);
  const [panel, setPanel] = useState<Panel>(null);
  const [planToday, setPlanToday] = useState(false);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [clickThrough, setClickThrough] = useState(false);
  const [isDividing, setIsDividing] = useState(false);
  const [divisionSkinId, setDivisionSkinId] = useState<CellSkinId>(store.day.skinId);
  const notifiedTimers = useRef(new Set<string>());
  const latestCells = useMemo(() => store.latest?.cells ?? [], [store.latest]);
  const selectedCell = latestCells.find((cell) => cell.id === selectedCellId)
    ?? latestCells.find((cell) => cell.status === "active")
    ?? latestCells[0];
  const skinId = selectedCell?.skinId ?? store.latest?.skinId ?? store.day.skinId;
  const skin = getCellSkin(skinId);

  useEffect(() => { window.desktop?.setMode(isDividing ? "division" : panel ? "expanded" : "compact"); }, [panel, isDividing]);
  useEffect(() => window.desktop?.onCommand((command) => {
    if (command === "plan") { setPlanToday(false); setPanel("plan"); }
  }), []);
  useEffect(() => window.desktop?.onClickThroughChange((enabled) => setClickThrough(enabled)), []);
  useEffect(() => {
    const timer = window.setInterval(() => {
      for (const cell of latestCells) {
        if (!cell.timerEndsAt || notifiedTimers.current.has(cell.id)) continue;
        if (new Date(cell.timerEndsAt).getTime() <= Date.now()) {
          notifiedTimers.current.add(cell.id);
          window.desktop?.notify("细胞计时完成", `「${cell.currentTitle}」已经完成本次生长时间。`);
        }
      }
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [latestCells]);

  const openPanel = (next: Exclude<Panel, null>, cellId?: string) => {
    if (cellId) setSelectedCellId(cellId);
    setPanel((current) => current === next ? null : next);
  };
  const beginDivision = () => {
    if (isDividing || store.remainingQueued < 1) return;
    const nextSkin = resolveSkinSelection(store.selectedSkinId);
    setPanel(null);
    setDivisionSkinId(nextSkin);
    setIsDividing(true);
    window.setTimeout(() => {
      store.divide(nextSkin);
      setSelectedCellId(null);
    }, 1_500);
    window.setTimeout(() => setIsDividing(false), 1_900);
  };
  const startToday = () => {
    if (store.day.status === "missing_dna") { setPlanToday(true); setPanel("plan"); return; }
    beginDivision();
  };
  const applySkin = (selection: SkinSelection) => {
    const resolved = resolveSkinSelection(selection);
    store.setSkin(selection);
    if (selectedCell) store.setCurrentCellSkin(selectedCell.id, resolved);
  };
  const toggleThrough = async () => {
    const next = !clickThrough;
    setClickThrough(next);
    await window.desktop?.setClickThrough(next);
  };

  return <main className={`desktop-stage ${panel ? "is-expanded" : ""} ${isDividing ? "is-dividing" : ""}`}>
    <div className="cell-cluster" data-skin={skinId} style={skin.variables as CSSProperties}>
      <div className="pet-status"><i />{isDividing ? "正在分裂" : selectedCell ? statusLabel[selectedCell.status] : store.day.status === "missing_dna" ? "等待形成" : "基因已封存"}</div>
      <button className={`cloud-status no-drag is-${store.syncStatus}`} type="button" onClick={async () => { if (store.syncStatus !== "offline") return; const result = await window.desktop?.connectCloud(); if (result?.ok) window.location.reload(); }} title={store.syncStatus === "offline" ? "点击登录 ChatGPT 并连接云同步" : "桌面端与 Web 使用同一份谱系数据"}>{store.syncStatus === "synced" ? "云端已同步" : store.syncStatus === "syncing" ? "同步中" : "连接云端"}</button>
      {!isDividing && <>
        <button className="bud bud--plan no-drag" type="button" onClick={() => { setPlanToday(false); openPanel("plan"); }} aria-label="明日基因"><span>DNA</span><strong>明日基因</strong></button>
        <button className="bud bud--skin no-drag" type="button" onClick={() => openPanel("skin")} aria-label="切换细胞皮肤"><span>◌</span><strong>皮肤</strong></button>
        <button className="bud bud--lineage no-drag" type="button" onClick={() => openPanel("lineage")} aria-label="查看细胞谱系"><span>⌘</span><strong>谱系</strong></button>
        <button className="bud bud--hide no-drag" type="button" onClick={() => window.desktop?.hide()} aria-label="隐藏到菜单栏"><span>−</span><strong>休眠</strong></button>
        <button className={`bud bud--through no-drag ${clickThrough ? "is-active" : ""}`} type="button" onClick={toggleThrough} aria-label={clickThrough ? "关闭鼠标穿透，快捷键 Command Shift X" : "开启鼠标穿透，快捷键 Command Shift X"}><span>{clickThrough ? "◎" : "◉"}</span><strong>穿透</strong><small>⌘⇧X</small></button>
      </>}

      {isDividing ? <DivisionAnimation skinId={divisionSkinId} generation={(store.latest?.index ?? 0) + 1} /> :
        <section key={skinId} className="desktop-cell drag-region" data-skin={skinId} style={skin.variables as CSSProperties} aria-label="桌面细胞">
          <span className="cell-texture" aria-hidden="true" />
          {!selectedCell ? <button className="formation-core no-drag" type="button" onClick={startToday}>
            <strong>{store.day.status === "missing_dna" ? "写入今日基因" : "形成第一代"}</strong>
            <small>{store.day.status === "missing_dna" ? "昨天没有留下计划" : `${store.remainingQueued} 个承诺等待释放`}</small>
          </button> : <CellOrganelles cell={selectedCell} store={store} onPanel={openPanel} />}
        </section>}

      {latestCells.length > 1 && <div className="sibling-switch no-drag" aria-label="切换同代细胞">
        {latestCells.map((cell, index) => <button key={cell.id} className={cell.id === selectedCell?.id ? "is-active" : ""} type="button" onClick={() => setSelectedCellId(cell.id)} title={`${index === 0 ? "芽一" : "芽二"} · ${cell.currentTitle}`}>{index === 0 ? "芽一" : "芽二"}</button>)}
      </div>}
      {!isDividing && store.canDivide && store.remainingQueued > 0 && <button className="division-bud no-drag" type="button" onClick={beginDivision}><span className="division-icon"><i /><i /></span><strong>开始分裂</strong><small>释放下一代</small></button>}
    </div>

    {panel && <div className="attached-panel no-drag">
      <button className="panel-close" type="button" onClick={() => setPanel(null)} aria-label="关闭">×</button>
      {panel === "nucleus" && selectedCell && <NucleusPanel cell={selectedCell} onTitle={(title) => store.updateTitle(selectedCell.id, title)} />}
      {panel === "mutation" && selectedCell && <MutationPanel cell={selectedCell} tokens={store.mutationTokens} onMutate={(type, replacement, weight, reason, emergency) => { store.mutate(selectedCell.id, type, replacement, weight, reason, emergency); setPanel(null); }} />}
      {panel === "plan" && <PlanPanel store={store} today={planToday || store.day.status === "missing_dna"} onSealed={() => setPanel(null)} />}
      {panel === "skin" && <SkinPanel selected={store.selectedSkinId} active={skinId} hasCurrent={Boolean(selectedCell)} onSelect={applySkin} />}
      {panel === "lineage" && <LineagePanel store={store} />}
    </div>}
  </main>;
}

function DivisionAnimation({ skinId, generation }: { skinId: CellSkinId; generation: number }) {
  const skin = getCellSkin(skinId);
  return <section className="mitosis-stage drag-region" data-skin={skinId} style={skin.variables as CSSProperties} aria-label={`正在形成第 ${generation} 代细胞`}>
    <div className="mitosis-parent"><span className="mitosis-texture" /><i className="mitosis-nucleus mitosis-nucleus--a" /><i className="mitosis-nucleus mitosis-nucleus--b" /><b className="cleavage-furrow" /></div>
    <div className="daughter-cell daughter-cell--a"><i /></div><div className="daughter-cell daughter-cell--b"><i /></div>
    <div className="mitosis-caption"><strong>细胞正在分裂</strong><span>复制细胞核 · 形成第 {generation} 代</span></div>
  </section>;
}

function CellOrganelles({ cell, store, onPanel }: { cell: TaskCellModel; store: ReturnType<typeof useCellStore>; onPanel: (panel: Exclude<Panel, null>, cellId?: string) => void }) {
  const resolved = cell.status !== "active" && cell.status !== "idle";
  const remaining = cell.remainingMinutes ?? cell.estimatedMinutes ?? 30;
  return <div className={`organelles ${resolved ? "is-resolved" : ""}`}>
    <button className="nucleus no-drag" type="button" onClick={() => onPanel("nucleus", cell.id)}>
      <strong>{cell.currentTitle || "未命名承诺"}</strong><small>细胞核 · 当前事项</small>
    </button>
    {!resolved && <button className={`mitochondria no-drag ${cell.timerEndsAt ? "is-running" : ""}`} type="button" onClick={() => store.toggleTimer(cell.id)} title={cell.timerEndsAt ? "暂停计时" : "开始计时"}>
      <i /><i /><span>{remaining}<small>分钟</small></span>
    </button>}
    {!resolved && <button className="lysosome no-drag" type="button" onClick={() => onPanel("mutation", cell.id)} title="可控突变"><i /><span>突变</span></button>}
    {!resolved && <button className="complete-organelle no-drag" type="button" onClick={() => store.complete(cell.id)} title="完成当前承诺"><i /><span>完成</span></button>}
    {(cell.subtasks?.length ?? 0) > 0 && <div className="ribosomes no-drag">
      {cell.subtasks!.map((subtask, index) => <button key={subtask.id} type="button" className={subtask.completed ? "is-complete" : ""} title={subtask.title} onClick={() => store.toggleSubtask(cell.id, subtask.id)}>{index + 1}</button>)}
    </div>}
    {resolved && <div className="mature-mark"><span>✓</span><small>{statusLabel[cell.status]}</small></div>}
  </div>;
}

function NucleusPanel({ cell, onTitle }: { cell: TaskCellModel; onTitle: (title: string) => void }) {
  return <section><span className="panel-kicker">NUCLEUS / 细胞核</span><h2>当前承诺</h2><label className="field"><span>事项名称</span><input value={cell.currentTitle} onChange={(event) => onTitle(event.target.value)} maxLength={80} /></label><div className="metrics"><span>权重 <strong>{cell.weight}</strong></span><span>精力 <strong>{cell.energy ?? 3}</strong></span><span>时间 <strong>{cell.estimatedMinutes ?? 30}′</strong></span></div>{cell.description && <p className="panel-note">{cell.description}</p>}</section>;
}

function MutationPanel({ cell, tokens, onMutate }: { cell: TaskCellModel; tokens: number; onMutate: (type: MutationType, replacement?: string, weight?: TaskWeight, reason?: string, emergency?: boolean) => void }) {
  const [type, setType] = useState<MutationType>("mutation_token");
  const [replacement, setReplacement] = useState("");
  const [weight, setWeight] = useState<TaskWeight>(cell.weight);
  const [reason, setReason] = useState("");
  const needsTitle = type !== "mutation_token";
  const minimum = type === "tomorrow_debt" ? Math.min(3, cell.weight + 1) as TaskWeight : cell.weight;
  const emergency = tokens < 1;
  const valid = Boolean(reason.trim() && (!needsTitle || (replacement.trim() && weight >= minimum)));
  return <section><span className="panel-kicker">LYSOSOME / 溶酶体</span><h2>改变生长路径</h2><p className="token-line">本周剩余 <strong>{tokens}</strong> / 3 次突变</p><div className="mutation-grid">
    <button className={type === "tomorrow_debt" ? "is-selected" : ""} type="button" onClick={() => { setType("tomorrow_debt"); setWeight(Math.min(3, cell.weight + 1) as TaskWeight); }}><strong>明日债务</strong><small>今天释放，明天偿还</small></button>
    <button className={type === "task_exchange" ? "is-selected" : ""} type="button" onClick={() => { setType("task_exchange"); setWeight(cell.weight); }}><strong>事项交换</strong><small>换成同等或更重承诺</small></button>
    <button className={type === "mutation_token" ? "is-selected" : ""} type="button" onClick={() => setType("mutation_token")}><strong>突变机会</strong><small>承认这次计划失配</small></button>
  </div>{needsTitle && <><label className="field"><span>替代承诺</span><input value={replacement} onChange={(event) => setReplacement(event.target.value)} placeholder="写下清晰、可执行的承诺" /></label><label className="field field--small"><span>权重（最低 {minimum}）</span><select value={weight} onChange={(event) => setWeight(Number(event.target.value) as TaskWeight)}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option></select></label></>}<label className="field"><span>为什么改变？</span><input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="诚实记录这次计划失配" /></label>{emergency && <p className="panel-note">额度已用完：本次为紧急突变，将留下永久伤疤。</p>}<button className="primary-action" type="button" disabled={!valid} onClick={() => onMutate(type, replacement, weight, reason, emergency)}>{emergency ? "紧急突变并留下伤疤" : "开始突变仪式"}</button></section>;
}

function PlanPanel({ store, today, onSealed }: { store: ReturnType<typeof useCellStore>; today: boolean; onSealed: () => void }) {
  const date = today ? store.state.currentDate : store.tomorrowDate;
  const plan = today ? store.todayPlan : store.tomorrowPlan;
  const tasks = plan?.tasks ?? [];
  const sealed = plan?.status === "sealed";
  return <section><span className="panel-kicker">DNA / {today ? "紧急形成" : "明日基因"}</span><h2>{today ? "形成今日细胞" : "写入明日承诺"}</h2><p className="date-line">{date} · {sealed ? "基因已封存" : `${tasks.filter((task) => task.title.trim()).length} 个事项`}</p><div className="plan-list">{tasks.map((task, index) => <div className="plan-row" key={task.id}><span>{String(index + 1).padStart(2, "0")}</span><input value={task.title} disabled={sealed} onChange={(event) => store.editPlanTask(date, task.id, { title: event.target.value })} placeholder="一个真实承诺" /><select value={task.weight} disabled={sealed} onChange={(event) => store.editPlanTask(date, task.id, { weight: Number(event.target.value) as TaskWeight })}><option value={1}>轻</option><option value={2}>中</option><option value={3}>深</option></select>{!sealed && <button type="button" onClick={() => store.removePlanTask(date, task.id)}>×</button>}<label><small>开始</small><input type="time" value={task.scheduledStart ?? "09:00"} disabled={sealed} onChange={(event) => store.editPlanTask(date, task.id, { scheduledStart: event.target.value })} /></label><label><small>结束</small><input type="time" value={task.scheduledEnd ?? "09:30"} disabled={sealed} onChange={(event) => store.editPlanTask(date, task.id, { scheduledEnd: event.target.value })} /></label></div>)}{!tasks.length && <p className="empty-note">基因序列还是空白的。</p>}</div>{!sealed && <button className="secondary-action" type="button" onClick={() => store.addPlanTask(date, today ? "emergency" : "planned")}>＋ 添加承诺</button>}{!sealed && <button className="primary-action" type="button" disabled={!tasks.some((task) => task.title.trim())} onClick={() => { store.sealDailyPlan(date, today); onSealed(); }}>{today ? "形成今日细胞" : "封存明日基因"}</button>}{sealed && <p className="sealed-note">● 已封存。目标日期只负责执行。</p>}</section>;
}

function SkinPanel({ selected, active, hasCurrent, onSelect }: { selected: string; active: CellSkinId; hasCurrent: boolean; onSelect: (skinId: SkinSelection) => void }) {
  return <section><span className="panel-kicker">MEMBRANE / 细胞皮肤</span><h2>切换细胞皮肤</h2><p className="skin-help">点击即可{hasCurrent ? "立即换到当前细胞，并" : ""}设为未来细胞的默认皮肤。</p><div className="skin-grid">{CELL_SKINS.map((skin) => <button key={skin.id} type="button" className={active === skin.id ? "is-selected" : ""} onClick={() => onSelect(skin.id)}><i data-skin={skin.id} style={skin.variables as CSSProperties} />{active === skin.id && <em>当前</em>}<strong>{skin.name}</strong><small>{skin.description}</small></button>)}<button type="button" className={selected === "random" ? "is-selected is-random" : ""} onClick={() => onSelect("random")}><i className="random-skin">∿</i>{selected === "random" && <em>默认</em>}<strong>随机皮肤</strong><small>当前随机一次，之后每代随机</small></button></div></section>;
}

function LineagePanel({ store }: { store: ReturnType<typeof useCellStore> }) {
  const generations = store.day.generations;
  const archiveCount = useMemo(() => store.state.days.filter((day) => day.date !== store.state.currentDate).length, [store.state]);
  return <section><span className="panel-kicker">LINEAGE / 细胞谱系</span><h2>今日生长轨迹</h2><div className="lineage-list"><div className="lineage-origin"><i /><span>今日基因</span></div>{generations.map((generation) => <div className="lineage-generation" key={generation.id}><span>第 {generation.index} 代</span><div>{generation.cells.map((cell) => <i key={cell.id} className={`status-${cell.status}`} data-skin={cell.skinId} style={getCellSkin(cell.skinId).variables as CSSProperties} title={cell.currentTitle}>{cell.status === "completed" ? "✓" : cell.status === "mutated" ? "∿" : ""}</i>)}</div></div>)}</div><p className="panel-note">{archiveCount} 个过往日期已封存 · 当前能量 {store.atp}</p></section>;
}
