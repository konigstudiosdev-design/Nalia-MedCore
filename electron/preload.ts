import { ipcRenderer, contextBridge } from 'electron'

// Lista blanca de canales IPC permitidos para Renderer Process
const ALLOWED_CHANNELS = ['main-process-message', 'app-notification'];

contextBridge.exposeInMainWorld('ipcRenderer', {
  on(channel: string, listener: (event: any, ...args: any[]) => void) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      const subscription = (event: any, ...args: any[]) => listener(event, ...args);
      ipcRenderer.on(channel, subscription);
      return subscription;
    }
  },
  off(channel: string, listener: (...args: any[]) => void) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.off(channel, listener as any);
    }
  },
  send(channel: string, ...args: any[]) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.send(channel, ...args);
    }
  },
  invoke(channel: string, ...args: any[]) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    return Promise.reject(new Error(`Canal IPC no autorizado: ${channel}`));
  }
})
