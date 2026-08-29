const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  setMode: (mode) => ipcRenderer.invoke("desktop:set-mode", mode),
  setClickThrough: (enabled) => ipcRenderer.invoke("desktop:set-click-through", enabled),
  hide: () => ipcRenderer.invoke("desktop:hide"),
  notify: (title, body) => ipcRenderer.invoke("desktop:notify", { title, body }),
  connectCloud: () => ipcRenderer.invoke("desktop:cloud-connect"),
  cloudLoad: () => ipcRenderer.invoke("desktop:cloud-load"),
  cloudSave: (state) => ipcRenderer.invoke("desktop:cloud-save", state),
  onCommand: (callback) => {
    const listener = (_event, command) => callback(command);
    ipcRenderer.on("desktop:command", listener);
    return () => ipcRenderer.removeListener("desktop:command", listener);
  },
  onClickThroughChange: (callback) => {
    const listener = (_event, enabled) => callback(Boolean(enabled));
    ipcRenderer.on("desktop:click-through", listener);
    return () => ipcRenderer.removeListener("desktop:click-through", listener);
  },
});
