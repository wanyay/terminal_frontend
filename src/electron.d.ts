export interface ElectronAPI {
  sendToMain(channel: string, data: any): void;
  onFromMain(channel: string, callback: (...args: any[]) => void): () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
