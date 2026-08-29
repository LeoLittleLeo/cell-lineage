/// <reference types="vite/client" />

interface DesktopBridge {
  setMode: (mode: "compact" | "expanded" | "division") => Promise<void>;
  setClickThrough: (enabled: boolean) => Promise<void>;
  hide: () => Promise<void>;
  notify: (title: string, body: string) => Promise<void>;
  onCommand: (callback: (command: string) => void) => () => void;
  onClickThroughChange: (callback: (enabled: boolean) => void) => () => void;
}

interface Window {
  desktop?: DesktopBridge;
}
