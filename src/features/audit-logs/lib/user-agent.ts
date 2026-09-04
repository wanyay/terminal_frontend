import { getT } from '@/lib/i18n'

export interface ParsedUserAgent {
  browser: string
  os: string
  device: string
}

const BROWSER_PATTERNS: Array<[RegExp, string]> = [
  [/Edg[Ai]?\//i, 'Edge'],
  [/OPR\/|Opera/i, 'Opera'],
  [/SamsungBrowser\//i, 'Samsung Internet'],
  [/Chrome\//i, 'Chrome'],
  [/Firefox\//i, 'Firefox'],
  [/Safari\//i, 'Safari'],
  [/MSIE|Trident/i, 'Internet Explorer'],
]

const OS_PATTERNS: Array<[RegExp, string]> = [
  [/Windows NT 10\.\d+/i, 'Windows 10'],
  [/Windows NT 6\.3/i, 'Windows 8.1'],
  [/Windows NT 6\.2/i, 'Windows 8'],
  [/Windows NT 6\.1/i, 'Windows 7'],
  [/Windows/i, 'Windows'],
  [/Android/i, 'Android'],
  [/iPhone/i, 'iOS'],
  [/iPad/i, 'iPadOS'],
  [/Mac OS X/i, 'macOS'],
  [/Linux/i, 'Linux'],
]

const DEVICE_PATTERNS: Array<[RegExp, () => string]> = [
  [/iPhone/i, () => getT('auditLogs.smartphone' as never)],
  [/iPad/i, () => getT('auditLogs.tablet' as never)],
  [/Android.*Mobile/i, () => getT('auditLogs.smartphone' as never)],
  [/Android/i, () => getT('auditLogs.tablet' as never)],
  [/Windows Phone/i, () => getT('auditLogs.smartphone' as never)],
  [/Macintosh|Mac OS X/i, () => getT('auditLogs.desktop' as never)],
  [/Windows/i, () => getT('auditLogs.desktop' as never)],
  [/X11|Linux/i, () => getT('auditLogs.desktop' as never)],
]

function extractVersion(ua: string, name: string): string {
  const regex = new RegExp(
    `${name === 'Safari' || name === 'Internet Explorer' ? '' : name}\\s*\\/?\\s*(\\d+\\.\\d+)`,
    'i'
  )
  const match = ua.match(regex)
  return match ? match[1] : ''
}

function findMatch(
  ua: string,
  patterns: Array<[RegExp, string]>
): string | null {
  for (const [regex, label] of patterns) {
    if (regex.test(ua)) return label
  }
  return null
}

function findDeviceMatch(
  ua: string,
  patterns: Array<[RegExp, () => string]>
): string | null {
  for (const [regex, label] of patterns) {
    if (regex.test(ua)) return label()
  }
  return null
}

function parseBrowser(ua: string): string {
  const browser = findMatch(ua, BROWSER_PATTERNS)
  if (!browser) return getT('auditLogs.unknownBrowser' as never)

  if (browser === 'Chrome') {
    const match = ua.match(/Chrome\/(\d+)/i)
    if (match) return `Chrome ${match[1]}`
    return browser
  }

  if (browser === 'Firefox') {
    const match = ua.match(/Firefox\/(\d+)/i)
    if (match) return `Firefox ${match[1]}`
    return browser
  }

  if (browser === 'Edge') {
    const match = ua.match(/Edg[Ai]?\/(\d+)/i)
    if (match) return `Edge ${match[1]}`
    return browser
  }

  if (browser === 'Safari') {
    const version = extractVersion(ua, 'Safari')
    return version ? `Safari ${version}` : 'Safari'
  }

  return browser
}

function parseOs(ua: string): string {
  const os = findMatch(ua, OS_PATTERNS)
  return os ?? getT('auditLogs.unknownOs' as never)
}

function parseDevice(ua: string): string {
  const device = findDeviceMatch(ua, DEVICE_PATTERNS)
  return device ?? getT('auditLogs.unknownDevice' as never)
}

export function parseUserAgent(ua: string | null | undefined): ParsedUserAgent {
  if (!ua) {
    return {
      browser: getT('auditLogs.unknownBrowser' as never),
      os: getT('auditLogs.unknownOs' as never),
      device: getT('auditLogs.unknownDevice' as never),
    }
  }
  return {
    browser: parseBrowser(ua),
    os: parseOs(ua),
    device: parseDevice(ua),
  }
}
