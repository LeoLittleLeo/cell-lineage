const steps = [
  { meta:"01 / 06 · 写入明日基因", title:"先承诺，\n再开始一天。", copy:"在前一天写入事项、时间和精力。封存后的 DNA 会在目标日期形成第一代细胞，让规划和执行不再互相打断。", principle:"产品原则：规划发生在执行之前，今天不再无限重写今天。", product:"DNA / 明日基因", state:"明天 · 2 个承诺", next:"封存基因 →" },
  { meta:"02 / 06 · 形成第一代", title:"承诺不是清单，\n而是一段生命。", copy:"目标日期到来后，封存的 DNA 等待释放。每次最多形成两个细胞，控制用户此刻真正需要面对的任务数量。", principle:"约束：每一代最多两个细胞，上一代成熟后才能继续分裂。", product:"GENESIS / 细胞形成", state:"今日 DNA 已封存", next:"形成第一代 →" },
  { meta:"03 / 06 · 细胞器执行", title:"让细胞内部，\n承担真实功能。", copy:"细胞核承载当前承诺；线粒体启动计时；核糖体对应子事项；溶酶体负责可控突变。用户直接在细胞内部完成执行。", principle:"试着点击线粒体和右上方的核糖体，观察细胞如何回应执行状态。", product:"GENERATION 01 / 生长执行", state:"细胞生长中", next:"完成当前承诺 →" },
  { meta:"04 / 06 · 成熟反馈", title:"完成不是划掉，\n而是细胞成熟。", copy:"承诺完成后，细胞进入成熟状态并产生 ATP。成熟留下可感知的视觉反馈，也成为下一次分裂的必要条件。", principle:"反馈：完成产生 ATP，但同一个承诺只能获得一次奖励。", product:"MATURITY / 成熟", state:"ATP +1", next:"开始细胞分裂 →" },
  { meta:"05 / 06 · 细胞分裂", title:"解决这一代，\n才能释放下一代。", copy:"细胞先收缩、复制细胞核，再形成分裂沟和两个子细胞。新的承诺不是突然出现，而是从已完成的行动中生长出来。", principle:"分裂不是装饰动画，而是任务释放规则的可视化。", product:"MITOSIS / 第 02 代", state:"正在分裂", next:"查看桌面细胞 →" },
  { meta:"06 / 06 · 桌面细胞", title:"离开网页，\n让承诺陪在桌面。", copy:"桌面版把细胞变成始终悬浮的小型生命体。膜受体承担基因、皮肤、谱系、休眠和穿透操作，任务执行无需回到网页。", principle:"点击右侧皮肤样本，查看膜受体与细胞内部如何共同改变生命形态。", product:"DESKTOP PET / 桌面伴生", state:"始终悬浮", next:"重新演示 ↻" }
];

let current = 0;
let autoTimer = null;
let skin = "native";
const $ = (id) => document.getElementById(id);
const scene = $("scene");
const toast = $("toast");

const skinMap = {
  native:{ bg:"radial-gradient(circle at 34% 28%,rgba(255,255,255,.68),transparent 25%),rgba(186,199,176,.5)", nucleus:"rgba(113,139,109,.2)", border:"rgba(66,92,71,.46)", ink:"#2d3c31", name:"原生" },
  gel:{ bg:"radial-gradient(circle at 35% 28%,rgba(255,255,255,.86),transparent 29%),rgba(183,215,217,.5)", nucleus:"rgba(105,174,178,.18)", border:"rgba(77,137,142,.44)", ink:"#274346", name:"凝胶" },
  yolk:{ bg:"radial-gradient(circle at 34% 27%,rgba(255,255,255,.72),transparent 24%),rgba(231,189,103,.56)", nucleus:"rgba(191,132,47,.2)", border:"rgba(160,110,39,.46)", ink:"#4b3925", name:"卵黄" },
  moss:{ bg:"radial-gradient(circle at 34% 28%,rgba(239,244,232,.62),transparent 25%),rgba(137,159,117,.62)", nucleus:"rgba(73,105,66,.24)", border:"rgba(58,86,52,.53)", ink:"#263728", name:"苔藓" }
};

function flash(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1400);
}

function geneMarkup(seed, className = "") {
  const bases = ["A", "T", "C", "G"];
  const hash = [...seed].reduce((total, character) => total + character.charCodeAt(0), 0);
  return `<span class="demo-gene ${className}" aria-hidden="true"><i></i><i></i><b>${Array.from({ length: 11 }, (_, index) => `<em data-base="${bases[(hash + index * 7) % 4]}"><span>${bases[(hash + index * 7) % 4]}</span></em>`).join("")}</b></span>`;
}

function renderPlan() {
  return `<div class="plan-sheet"><span class="scene-kicker">DNA / TOMORROW</span><h2>写入明日承诺</h2><p>标题决定序列身份，权重、时间与精力改变碱基节奏。</p><label class="task"><span>01</span><input value="完善秋招作品集" aria-label="第一个承诺"><em>深 · 50′</em><span class="task-gene">${geneMarkup("完善秋招作品集")}</span></label><label class="task"><span>02</span><input value="准备 AI 产品面试案例" aria-label="第二个承诺"><em>中 · 35′</em><span class="task-gene">${geneMarkup("准备 AI 产品面试案例")}</span></label><button class="dna-seal" type="button" data-next>闭合双链并封存</button></div>`;
}

function renderFormation() {
  return `<div class="formation"><div class="formation-cell"><div class="formation-core">${geneMarkup("第一代", "demo-gene--vertical")}<strong>形成第一代</strong><small>2 段编码等待表达</small></div></div><div class="formation-status"><strong>今日 DNA 已就绪</strong><span class="scene-note">封存序列将进入细胞核并表达为今日承诺</span></div><button class="scene-action" type="button" data-next>表达第一代细胞</button></div>`;
}

function renderCell() {
  return `<div class="cell-scene"><div class="cell-live"><button class="mitochondria" id="timerControl" type="button" aria-label="开始计时"><i></i><i></i><span>25<small>分钟</small></span></button><div class="ribosomes"><button type="button" data-ribosome>1</button><button type="button" data-ribosome>2</button><button type="button" data-ribosome>3</button></div><div class="nucleus">${geneMarkup("完善秋招作品集", "demo-gene--vertical nucleus-dna")}<strong>完善秋招<br>作品集</strong><small>细胞核 · 核酸表达</small></div><button class="org-btn complete" type="button" data-next><i></i><span>完成</span></button><button class="org-btn mutate" type="button" id="mutateButton"><i></i><span>突变</span></button></div><div class="cell-hint"><i></i>核酸链保留任务身份 · 细胞器承担执行功能</div></div>`;
}

function renderMature() {
  return `<div class="mature-wrap"><div class="mature-cell"><div class="mature-mark"><span>✓</span><strong>承诺已经成熟</strong><small>完善秋招作品集 · ATP +1</small></div></div><div class="centrosome-ready"><i></i>中心体已就绪 · 可以释放下一代</div><button class="scene-action" type="button" data-next>开始细胞分裂</button></div>`;
}

function renderMitosis() {
  return `<div class="mitosis-wrap"><div class="mitosis"><div class="mitosis-body">${geneMarkup("第二代", "demo-gene--vertical division-dna")}<i class="mitosis-nucleus a">${geneMarkup("第二代", "daughter-dna")}</i><i class="mitosis-nucleus b">${geneMarkup("第二代", "daughter-dna")}</i><b class="furrow"></b></div></div><div class="mitosis-copy"><strong>核酸复制后进入两个子细胞</strong><small>收缩 · 复制 · 分配 · 分裂 · 表达</small></div></div>`;
}

function renderDesktop() {
  return `<div class="desktop-demo"><div class="desktop-space"><div class="pet"><div class="pet-cell"><div class="pet-nucleus">准备 AI 产品<br>面试案例</div></div><button class="receptor dna"><i>DNA</i>明日基因</button><button class="receptor skin"><i>◌</i>皮肤</button><button class="receptor sleep"><i>−</i>休眠</button><button class="receptor lineage"><i>⌘</i>谱系</button><button class="receptor pass" id="passButton"><i>◉</i>穿透</button></div></div><aside class="skin-panel"><span>MEMBRANE</span><h3>切换皮肤</h3><button class="skin-choice" data-skin="native" style="--sample-bg:#c8d2c0;--sample-border:#66806b"><i></i>原生</button><button class="skin-choice" data-skin="gel" style="--sample-bg:#c9e1e2;--sample-border:#5e9397"><i></i>凝胶</button><button class="skin-choice" data-skin="yolk" style="--sample-bg:#e8c57e;--sample-border:#a8732c"><i></i>卵黄</button><button class="skin-choice" data-skin="moss" style="--sample-bg:#91a77c;--sample-border:#496342"><i></i>苔藓</button><p class="desktop-tip">桌面版始终悬浮。开启穿透后按 ⌘⇧X 恢复交互。</p></aside></div>`;
}

function applySkin(id, notify = true) {
  skin = id;
  const value = skinMap[id];
  const root = document.documentElement.style;
  root.setProperty("--cell-bg", value.bg);
  root.setProperty("--cell-nucleus", value.nucleus);
  root.setProperty("--cell-border", value.border);
  root.setProperty("--cell-ink", value.ink);
  scene.querySelectorAll("[data-skin]").forEach((button) => button.classList.toggle("is-selected", button.dataset.skin === id));
  if (notify) flash(`已切换为${value.name}皮肤`);
}

function bindScene() {
  scene.querySelectorAll("[data-next]").forEach((element) => element.addEventListener("click", next));
  const timer = $("timerControl");
  if (timer) timer.addEventListener("click", () => {
    const running = timer.classList.toggle("is-running");
    timer.setAttribute("aria-label", running ? "暂停计时" : "开始计时");
    flash(running ? "线粒体已激活 · 开始计时" : "计时已暂停");
  });
  scene.querySelectorAll("[data-ribosome]").forEach((element) => element.addEventListener("click", () => {
    element.classList.toggle("done");
    flash(element.classList.contains("done") ? "子事项已完成" : "子事项重新激活");
  }));
  const mutate = $("mutateButton");
  if (mutate) mutate.addEventListener("click", () => flash("突变需要消耗本周机会 · 还剩 3 次"));
  scene.querySelectorAll("[data-skin]").forEach((element) => element.addEventListener("click", () => applySkin(element.dataset.skin)));
  const pass = $("passButton");
  if (pass) pass.addEventListener("click", () => {
    pass.querySelector("i").textContent = "◎";
    flash("穿透已开启 · 按 ⌘⇧X 恢复");
  });
}

function render() {
  const step = steps[current];
  $("stepMeta").textContent = step.meta;
  $("stepTitle").innerHTML = step.title.replace("\n", "<br>");
  $("stepCopy").textContent = step.copy;
  $("principle").textContent = step.principle;
  $("productTitle").textContent = step.product;
  $("productState").textContent = step.state;
  $("prevButton").disabled = current === 0;
  $("nextButton").textContent = step.next;
  $("timeline").innerHTML = steps.map((_, index) => `<button type="button" data-step="${index}" class="${index === current ? "is-active" : index < current ? "is-past" : ""}" aria-label="第 ${index + 1} 步"><span>${String(index + 1).padStart(2, "0")}</span></button>`).join("");
  scene.innerHTML = [renderPlan, renderFormation, renderCell, renderMature, renderMitosis, renderDesktop][current]();
  $("timeline").querySelectorAll("button").forEach((element) => element.addEventListener("click", () => go(Number(element.dataset.step))));
  bindScene();
  if (current === 5) applySkin(skin, false);
}

function go(index) {
  current = (index + steps.length) % steps.length;
  render();
  if (autoTimer) restartAuto();
}
function next() { go(current === steps.length - 1 ? 0 : current + 1); }
function previous() { go(Math.max(0, current - 1)); }
function restartAuto() { window.clearInterval(autoTimer); autoTimer = window.setInterval(next, 5200); }
function toggleAuto() {
  if (autoTimer) {
    window.clearInterval(autoTimer); autoTimer = null;
    $("autoButton").classList.remove("is-on"); $("autoButton").textContent = "自动演示";
  } else {
    $("autoButton").classList.add("is-on"); $("autoButton").textContent = "暂停自动";
    restartAuto();
  }
}

$("nextButton").addEventListener("click", next);
$("prevButton").addEventListener("click", previous);
$("autoButton").addEventListener("click", toggleAuto);
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") next();
  if (event.key === "ArrowLeft") previous();
  if (event.key === " ") { event.preventDefault(); toggleAuto(); }
});
render();
