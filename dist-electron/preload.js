import { contextBridge, ipcRenderer } from "electron";
const ALLOWED_CHANNELS = ["main-process-message", "app-notification"];
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(channel, listener) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      const subscription = (event, ...args) => listener(event, ...args);
      ipcRenderer.on(channel, subscription);
      return subscription;
    }
  },
  off(channel, listener) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.off(channel, listener);
    }
  },
  send(channel, ...args) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.send(channel, ...args);
    }
  },
  invoke(channel, ...args) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    return Promise.reject(new Error(`Canal IPC no autorizado: ${channel}`));
  }
});
