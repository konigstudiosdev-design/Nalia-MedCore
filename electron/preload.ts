import { ipcRenderer, contextBridge } from 'electron'

// Lista blanca de canales IPC permitidos para Renderer Process
const ALLOWED_CHANNELS = ['main-process-message', 'app-notification'];

contextBridge.exposeInMainWorld('ipcRenderer', {
  on(channel: string, listener: (event: any, ...args: any[]) => void) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
    }
  },
  off(channel: string, ...omit: any[]) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.off(channel, ...omit as any)
    }
  },
  send(channel: string, ...omit: any[]) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.send(channel, ...omit)
    }
  },
  invoke(channel: string, ...omit: any[]) {
    if (ALLOWED_CHANNELS.includes(channel)) {
      return ipcRenderer.invoke(channel, ...omit)
    }
    return Promise.reject(new Error(`Canal IPC no autorizado: ${channel}`))
  }
})
