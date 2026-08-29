# 细胞 CELL

> 以“细胞分裂”为核心交互隐喻的个人事务管理程序。<br>
> A personal task manager built around cell division as its central interaction metaphor.

[中文](#中文) · [English](#english) · [在线站点 / Live Site](https://cell-lineage.lzw53155228.chatgpt.site/) · [中文作品展示 / Chinese Case Study](public/showcase.html)

![细胞 CELL](public/og-dna.png)

## 中文

### 产品理念

细胞不是传统的 Todo List。你在前一天把明日计划写成“基因”，第二天这些基因会成为可执行的今日细胞。完成当前细胞后，下一组承诺才会通过分裂显现。

这个模型把任务从静态清单变成一个有生命周期的系统：规划、形成、生长、突变、分裂与成熟。

### 核心功能

- **前一天规划**：为明天录入事项、时间窗、权重、精力与子事项，并封存为明日基因。
- **当天执行**：封存的基因按顺序释放，每一代最多形成两个任务细胞。
- **细胞分裂**：只有当前一代全部解决后，中心体才会激活并释放下一代。
- **功能性细胞器**：细胞核承载当前事项，线粒体负责计时，核糖体对应子事项，溶酶体负责突变。
- **突变仪式**：细胞经历解体与重组，突变理由进入谱系；每周额度耗尽后仍可紧急突变，但会留下永久伤疤。
- **健康与遗传**：能量直接影响细胞膜健康度；未完成承诺可形成债务基因，由子代额外消耗能量清除。
- **细胞皮肤**：提供原生、凝胶、培养皿、卵黄、水墨和苔藓六种皮肤，以及随机模式。
- **细胞谱系**：保留每一代细胞的生长轨迹，并提供月度谱系树、承诺兑现率、突变次数与能量盈余。
- **原生桌面细胞**：独立透明置顶窗口，可拖动、呼吸、鼠标穿透并隐藏到系统托盘；所有操作直接从细胞器进入。
- **账号与云同步**：使用 ChatGPT 账号隔离数据，D1 云端持久化与 localStorage 离线缓存双写。
- **移动 PWA**：支持添加到主屏幕、离线打开和从快捷入口捕捉明日基因。

### 本地运行

环境要求：Node.js `>=22.13.0`

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

### 运行桌面细胞（macOS）

```bash
cd desktop
npm install
npm run dev
```

生成可安装的 macOS 应用：

```bash
npm run desktop:dist
```

桌面版作为独立 Electron 应用运行，不依赖浏览器。透明细胞可以拖动、置顶、隐藏到菜单栏，并支持明日基因、任务计时、子事项、完成、突变、皮肤与谱系操作。

### 验证与构建

```bash
npm run lint
npm test
npm run build
```

### 技术栈

- React 19 + TypeScript
- vinext + Vite
- Cloudflare Workers / OpenAI Sites
- Cloudflare D1 + Drizzle ORM
- CSS 动画与响应式布局
- ChatGPT Sites 身份认证 + Local Storage 离线缓存
- Document Picture-in-Picture API（支持时启用）
- Electron 透明桌面窗口与系统托盘

### 数据说明

未登录时，数据只保存在当前设备；登录 ChatGPT 后，计划、每日谱系和突变额度会按账号同步到 D1。localStorage 始终作为离线缓存，网络恢复后自动补写云端。桌面端通过独立的 ChatGPT 登录窗口连接同一同步接口。

在线站点目前采用私有访问设置。

独立中文展示页位于 [`public/showcase.html`](public/showcase.html)，可直接在浏览器中打开并打印为 PDF。

---

## English

### Product idea

CELL is not a traditional todo list. You encode tomorrow's plan as “DNA” the day before. On the target day, that DNA becomes executable cells. The next commitments only emerge through division after the current cells are resolved.

The model turns a static checklist into a living cycle of planning, formation, growth, mutation, division, and maturity.

### Core features

- **Plan the day before**: define tomorrow's tasks, time windows, weight, energy, and subtasks, then seal them as DNA.
- **Execute today**: sealed DNA is released in order, forming up to two task cells per generation.
- **Cell division**: the centrosome activates and releases the next generation only after every cell in the current generation is resolved.
- **Functional organelles**: the nucleus holds the commitment, mitochondria manage time, ribosomes represent subtasks, and the lysosome controls mutation.
- **Mutation ritual**: cells disassemble and recombine; every mutation keeps its reason. Emergency mutations remain possible after the weekly allowance but leave a permanent scar.
- **Health and inheritance**: energy visibly shapes membrane health, while deferred commitments create debt genes that offspring must spend energy to clear.
- **Cell skins**: choose Cell, Jelly, Petri, Yolk, Ink, Moss, or a random skin for future generations.
- **Cell lineage**: preserve every generation and review monthly fulfillment, mutations, emergency scars, and energy surplus.
- **Native desktop cell**: run a transparent always-on-top window with dragging, breathing animation, click-through mode, tray controls, and direct organelle interactions.
- **Account-scoped cloud sync**: ChatGPT identity isolates D1 data, with Local Storage retained as an offline write-through cache.
- **Mobile PWA**: install to the home screen, open offline, and capture tomorrow's DNA from an app shortcut.

### Run locally

Requirement: Node.js `>=22.13.0`

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run the desktop cell (macOS)

```bash
cd desktop
npm install
npm run dev
```

Build an installable macOS application:

```bash
npm run desktop:dist
```

The desktop edition is a standalone Electron application and does not depend on a browser. Planning, timers, subtasks, completion, mutation, skins, and lineage are operated directly from the cell.

### Validate and build

```bash
npm run lint
npm test
npm run build
```

### Tech stack

- React 19 + TypeScript
- vinext + Vite
- Cloudflare Workers / OpenAI Sites
- Cloudflare D1 + Drizzle ORM
- CSS animation and responsive layout
- ChatGPT Sites authentication + Local Storage offline cache
- Document Picture-in-Picture API when supported
- Electron transparent desktop window and system tray

### Data and privacy

Anonymous use remains local-only. After ChatGPT sign-in, plans, daily lineage, and mutation allowance sync to account-isolated D1 rows. Local Storage remains the offline cache and pending changes are written back when connectivity returns. The Electron app connects to the same API through its own persistent ChatGPT session.

The hosted site currently uses private access.

The standalone Chinese portfolio case study is available at [`public/showcase.html`](public/showcase.html) and is optimized for browser viewing and PDF printing.

## License

No open-source license has been declared yet. All rights are reserved by the repository owner.
