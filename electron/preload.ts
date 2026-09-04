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

contextBridge.exposeInMainWorld('usbAPI', {
  connect: async (config: any) => {
    return await ipcRenderer.invoke('usb:connect', config);
  },

  disconnect: async () => {
    return await ipcRenderer.invoke('usb:disconnect');
  },

  setRelay: async (channel: number, state: 'on' | 'off') => {
    return await ipcRenderer.invoke('usb:set-relay', { channel, state });
  },

  toggleRelay: async (channel: number) => {
    return await ipcRenderer.invoke('usb:toggle-relay', { channel });
  },

  setAllRelays: async (state: 'on' | 'off') => {
    return await ipcRenderer.invoke('usb:set-all-relays', { state });
  },

  getStatus: async () => {
    return await ipcRenderer.invoke('usb:get-status');
  },

  getDeviceInfo: async () => {
    return await ipcRenderer.invoke('usb:get-device-info');
  },

  // Events
  onStatusUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('usb:status', (_event, data) => callback(data));
    return () => {
      ipcRenderer.removeAllListeners('usb:status');
    };
  },

  onError: (callback: (error: any) => void) => {
    ipcRenderer.on('usb:error', (_event, error) => callback(error));
    return () => {
      ipcRenderer.removeAllListeners('usb:error');
    };
  },

  onData: (callback: (data: any) => void) => {
    ipcRenderer.on('usb:data', (_event, data) => callback(data));
    return () => {
      ipcRenderer.removeAllListeners('usb:data');
    };
  },
});

declare global {
    interface Window {
        usbAPI: {
            connect: (config: any) => Promise<boolean>;
            disconnect: () => Promise<void>;
            setRelay: (channel: number, state: 'on' | 'off') => Promise<boolean>;
            toggleRelay: (channel: number) => Promise<boolean>;
            setAllRelays: (state: 'on' | 'off') => Promise<boolean>;
            getStatus: () => Promise<any>;
            getDeviceInfo: () => Promise<any>;
            onStatusUpdate: (callback: (data: any) => void) => () => void;
            onError: (callback: (error: any) => void) => () => void;
            onData: (callback: (data: any) => void) => () => void;
        };
    }
}
