import { AxiosError } from 'axios'
import axiosClient from '@/lib/api/axiosClient'

export interface SaveFileResult {
  canceled: boolean
  filePath?: string
}

export function getFilenameFromDisposition(disposition?: string): string {
  if (!disposition) return 'download.xlsx'
  const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)/i)
  return match?.[1]?.trim() ?? 'download.xlsx'
}

function buildParams(
  params?: Record<string, string | undefined>
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(
      (entry): entry is [string, string] =>
        entry[1] !== undefined && entry[1] !== ''
    )
  )
}

function getErrorMessageFromArrayBuffer(data: ArrayBuffer): string | null {
  try {
    const json = JSON.parse(new TextDecoder().decode(data)) as {
      message?: string | string[]
    }
    if (Array.isArray(json.message)) return json.message.join(', ')
    return json.message ?? null
  } catch {
    return null
  }
}

async function parseExportError(error: unknown): Promise<never> {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data

    if (data instanceof ArrayBuffer) {
      const message = getErrorMessageFromArrayBuffer(data)
      if (message) throw new Error(message)
    }

    if (typeof data === 'object' && data !== null && 'message' in data) {
      const message = (data as { message?: string | string[] }).message
      throw new Error(
        Array.isArray(message) ? message.join(', ') : message ?? 'Export failed'
      )
    }
  }

  if (error instanceof Error) throw error
  throw new Error('Export failed')
}

export async function saveExportedFile(
  url: string,
  params?: Record<string, string | undefined>,
  defaultFilename = 'download.xlsx'
): Promise<SaveFileResult> {
  try {
    const res = await axiosClient.get(url, {
      params: buildParams(params),
      responseType: 'arraybuffer',
    })

    const contentType = res.headers['content-type'] as string | undefined

    if (contentType?.includes('application/json')) {
      const json = JSON.parse(new TextDecoder().decode(res.data)) as {
        message?: string | string[]
      }
      const message = Array.isArray(json.message)
        ? json.message.join(', ')
        : json.message
      throw new Error(message ?? 'Export failed')
    }

    const filename =
      getFilenameFromDisposition(res.headers['content-disposition']) ||
      defaultFilename
    const data = new Uint8Array(res.data)

    if (window.electronAPI?.saveFile) {
      return window.electronAPI.saveFile(data, filename)
    }

    const blob = new Blob([data], {
      type:
        contentType ??
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)

    return { canceled: false }
  } catch (error) {
    return parseExportError(error)
  }
}
