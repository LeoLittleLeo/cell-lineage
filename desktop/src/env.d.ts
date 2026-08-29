/// <reference types="vite/client" />

interface DesktopBridge {
  setMode: (mode: "compact" | "expanded" | "division") => Promise<void>;
  setClickThrough: (enabled: boolean) => Promise<void>;
  hide: () => Promise<void>;
  notify: (title: string, body: string) => Promise<void>;
  onCommand: (callback: (command: string) => void) => () => void;
  onClickThroughChange: (callback: (enabled: boolean) => void) => () => void;
  connectCloud: () => Promise<{ ok: boolean }>;
  cloudLoad: () => Promise<{ ok: boolean; state?: import("../../app/domain/types").CellState | null }>;
  cloudSave: (state: import("../../app/domain/types").CellState) => Promise<{ ok: boolean }>;
}

interface Window {
  desktop?: DesktopBridge;
}
