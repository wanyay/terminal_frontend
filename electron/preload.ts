import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

type Callback = (...args: any[]) => void;

const sendAllowed = ['toMain'];
const receiveAllowed = ['fromMain'];

contextBridge.exposeInMainWorld('electronAPI', {
  sendToMain: (channel: string, data: any) => {
    if (sendAllowed.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  onFromMain: (channel: string, callback: Callback) => {
    if (receiveAllowed.includes(channel)) {
      const handler = (_event: IpcRendererEvent, ...args: any[]) => callback(...args);
      ipcRenderer.on(channel, handler);
      return () => ipcRenderer.removeListener(channel, handler);
    }
    return () => {};
  },
  saveFile: (data: Uint8Array, defaultName: string) => ipcRenderer.invoke('save-file', { data, defaultName }),
});