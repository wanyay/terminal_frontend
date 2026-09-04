export interface SaveFileResult {
  canceled: boolean
  filePath?: string
}

export interface ElectronAPI {
  sendToMain(channel: string, data: unknown): void
  onFromMain(
    channel: string,
    callback: (...args: unknown[]) => void
  ): () => void
  saveFile(data: Uint8Array, defaultName: string): Promise<SaveFileResult>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
    usbAPI: {
      connect: (config: any) => Promise<boolean>
      disconnect: () => Promise<void>
      setRelay: (channel: number, state: 'on' | 'off') => Promise<boolean>
      toggleRelay: (channel: number) => Promise<boolean>
      setAllRelays: (state: 'on' | 'off') => Promise<boolean>
      getStatus: () => Promise<any>
      getDeviceInfo: () => Promise<any>
      onStatusUpdate: (callback: (data: any) => void) => () => void
      onError: (callback: (error: any) => void) => () => void
      onData: (callback: (data: any) => void) => () => void
    }
  }
}

export {}
