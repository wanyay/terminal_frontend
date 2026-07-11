export interface SaveFileResult {
  canceled: boolean
  filePath?: string
}

export interface ElectronAPI {
  sendToMain(channel: string, data: unknown): void
  onFromMain(channel: string, callback: (...args: unknown[]) => void): () => void
  saveFile(data: Uint8Array, defaultName: string): Promise<SaveFileResult>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
