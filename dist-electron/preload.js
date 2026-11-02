import { contextBridge, ipcRenderer } from "electron";
const ALLOWED_CHANNELS = ["main-process-message", "app-notification"];
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(channel, listener) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
    }
  },
  off(channel, ...omit) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.off(channel, ...omit);
    }
  },
  send(channel, ...omit) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.send(channel, ...omit);
    }
  },
  invoke(channel, ...omit) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, ...omit);
    }
    return Promise.reject(new Error(`Canal IPC no autorizado: ${channel}`));
  }
});
