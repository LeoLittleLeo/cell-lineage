import { app, BrowserWindow, Menu, Notification, Tray, globalShortcut, ipcMain, nativeImage, screen, session } from "electron";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const compactSize = { width: 410, height: 430 };
const expandedSize = { width: 720, height: 720 };
const divisionSize = { width: 570, height: 430 };
const clickThroughShortcut = "CommandOrControl+Shift+X";
let cellWindow;
let tray;
let clickThrough = false;
let quitting = false;
const cloudOrigin = "https://cell-lineage.lzw53155228.chatgpt.site";
const cloudSession = () => session.fromPartition("persist:cell-cloud-account");

async function cloudRequest(pathname, init) {
  const response = await cloudSession().fetch(`${cloudOrigin}${pathname}`, init);
  if (!response.ok) return { ok: false, status: response.status };
  return { ok: true, ...(await response.json()) };
}

async function connectCloudAccount() {
  return new Promise((resolve) => {
    const authWindow = new BrowserWindow({ width: 520, height: 720, title: "连接细胞云端", webPreferences: { partition: "persist:cell-cloud-account", contextIsolation: true, nodeIntegration: false } });
    let settled = false;
    const finish = async () => {
      if (settled) return;
      const result = await cloudRequest("/api/sync");
      if (!result.ok) return;
      settled = true;
      authWindow.close();
      resolve({ ok: true });
    };
    authWindow.webContents.on("did-navigate", finish);
    authWindow.webContents.on("did-navigate-in-page", finish);
    authWindow.on("closed", () => { if (!settled) resolve({ ok: false }); });
    authWindow.loadURL(`${cloudOrigin}/signin-with-chatgpt?return_to=%2F`);
  });
}

const statePath = () => path.join(app.getPath("userData"), "window-state.json");
const readBounds = () => {
  try { return JSON.parse(fs.readFileSync(statePath(), "utf8")); } catch { return null; }
};
const saveBounds = () => {
  if (!cellWindow || cellWindow.isDestroyed()) return;
  try { fs.writeFileSync(statePath(), JSON.stringify(cellWindow.getBounds())); } catch { /* best effort */ }
};

function send(command) {
  if (!cellWindow || cellWindow.isDestroyed()) return;
  cellWindow.webContents.send("desktop:command", command);
}

function createWindow() {
  const saved = readBounds();
  const area = screen.getPrimaryDisplay().workArea;
  cellWindow = new BrowserWindow({
    width: compactSize.width,
    height: compactSize.height,
    x: saved?.x ?? area.x + area.width - compactSize.width - 28,
    y: saved?.y ?? area.y + 72,
    transparent: true,
    frame: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    backgroundColor: "#00000000",
    acceptFirstMouse: true,
    webPreferences: {
      preload: path.join(here, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });
  cellWindow.setAlwaysOnTop(true, "floating");
  if (process.platform === "darwin") cellWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  cellWindow.on("move", saveBounds);
  cellWindow.on("close", (event) => {
    if (quitting) return;
    event.preventDefault();
    cellWindow.hide();
  });
  const devUrl = process.env.DESKTOP_DEV_URL;
  if (devUrl) cellWindow.loadURL(devUrl);
  else cellWindow.loadFile(path.join(here, "../dist/index.html"));
}

function updateTrayMenu() {
  if (!tray) return;
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "显示细胞", click: () => { cellWindow.show(); cellWindow.focus(); } },
    { label: "明日基因", click: () => { cellWindow.show(); send("plan"); } },
    { label: clickThrough ? "关闭鼠标穿透" : "开启鼠标穿透", accelerator: clickThroughShortcut, click: () => setClickThrough(!clickThrough) },
    { label: "重置位置", click: () => { const area = screen.getPrimaryDisplay().workArea; cellWindow.setPosition(area.x + area.width - compactSize.width - 28, area.y + 72); } },
    { type: "separator" },
    { label: "退出细胞", click: () => { quitting = true; app.quit(); } },
  ]));
}

function setClickThrough(enabled) {
  clickThrough = enabled;
  cellWindow.setIgnoreMouseEvents(enabled, { forward: true });
  cellWindow.webContents.send("desktop:click-through", enabled);
  if (enabled && Notification.isSupported()) {
    new Notification({ title: "细胞已进入穿透状态", body: "按 ⌘⇧X 可随时恢复细胞交互。" }).show();
  }
  updateTrayMenu();
}

app.whenReady().then(() => {
  createWindow();
  const iconPath = path.join(here, "../../public/favicon.svg");
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 20, height: 20 });
  tray = new Tray(icon);
  tray.setToolTip("细胞 CELL");
  tray.on("click", () => { if (cellWindow.isVisible()) cellWindow.hide(); else { cellWindow.show(); cellWindow.focus(); } });
  const shortcutRegistered = globalShortcut.register(clickThroughShortcut, () => setClickThrough(!clickThrough));
  if (!shortcutRegistered && Notification.isSupported()) {
    new Notification({ title: "穿透快捷键暂不可用", body: "仍可从菜单栏的“细胞 CELL”关闭鼠标穿透。" }).show();
  }
  updateTrayMenu();
});

app.on("window-all-closed", (event) => event.preventDefault());
app.on("before-quit", () => { quitting = true; globalShortcut.unregisterAll(); saveBounds(); });

ipcMain.handle("desktop:set-mode", (_event, mode) => {
  if (!cellWindow) return;
  const next = mode === "expanded" ? expandedSize : mode === "division" ? divisionSize : compactSize;
  const [x, y] = cellWindow.getPosition();
  const [width] = cellWindow.getSize();
  const area = screen.getDisplayMatching(cellWindow.getBounds()).workArea;
  const desiredX = x - Math.round((next.width - width) / 2);
  const nextX = Math.min(Math.max(area.x, desiredX), area.x + area.width - next.width);
  const nextY = Math.min(Math.max(area.y, y), area.y + area.height - next.height);
  cellWindow.setBounds({ x: nextX, y: nextY, ...next }, true);
});
ipcMain.handle("desktop:set-click-through", (_event, enabled) => setClickThrough(Boolean(enabled)));
ipcMain.handle("desktop:hide", () => cellWindow?.hide());
ipcMain.handle("desktop:notify", (_event, payload) => {
  if (Notification.isSupported()) new Notification({ title: payload.title, body: payload.body }).show();
});
ipcMain.handle("desktop:cloud-connect", () => connectCloudAccount());
ipcMain.handle("desktop:cloud-load", () => cloudRequest("/api/sync"));
ipcMain.handle("desktop:cloud-save", (_event, state) => cloudRequest("/api/sync", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(state) }));
