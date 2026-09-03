import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import fs from 'fs/promises'
import path from 'path';
import { usbRelayService } from './usb-relay.service';

const APP_NAME = 'Terminal Port Management System'
// In development, default to the standard Vite dev server URL if not explicitly set
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173'

function isDevMode() {
  return !app.isPackaged
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: APP_NAME,
    autoHideMenuBar: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setMenuBarVisibility(false);

  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
  });

  win.webContents.session.on('select-usb-device', (event, details, callback) => {
    const devices = details.deviceList;
    if (devices.length > 0) {
      console.log(devices);
      callback(devices[0].deviceId)
    } else {
      callback('')
    }
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
    dialog.showErrorBox('Load Error', `Failed to load: ${errorDescription}\nURL: ${validatedURL}`);
  });

  if (isDevMode() && VITE_DEV_SERVER_URL) {
    await win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    // In production, the dist folder is in the same directory as the electron files
    const indexHtml = path.join(__dirname, '..', 'dist', 'index.html')
    console.log('Loading index.html from:', indexHtml)

    try {
      await win.loadFile(indexHtml)
    } catch (error) {
      console.error('Error loading index.html:', error)
      dialog.showErrorBox('Load Error', `Failed to load index.html from: ${indexHtml}\nError: ${String(error)}`)
      throw error
    }
  }
}

app.whenReady().then(() => {
  app.setName(APP_NAME)
  Menu.setApplicationMenu(null)
  void createWindow().catch((error: unknown) => {
    dialog.showErrorBox('Startup Error', String(error))
    app.quit()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow().catch((error: unknown) => {
      dialog.showErrorBox('Startup Error', String(error))
    })
  }
})

// USB Relay IPC handlers
ipcMain.handle('usb:connect', async (_event, config) => {
  return await usbRelayService.connect(config);
});

ipcMain.handle('usb:disconnect', async () => {
  await usbRelayService.disconnect();
});

ipcMain.handle('usb:set-relay', async (_event, { channel, state }) => {
  return await usbRelayService.setRelay(channel, state);
});

ipcMain.handle('usb:toggle-relay', async (_event, { channel }) => {
  return await usbRelayService.toggleRelay(channel);
});

ipcMain.handle('usb:set-all-relays', async (_event, { state }) => {
  return await usbRelayService.setAllRelays(state);
});

ipcMain.handle('usb:get-status', async () => {
  return await usbRelayService.getStatus();
});

ipcMain.handle('usb:get-device-info', async () => {
  return await usbRelayService.getDeviceInfo();
});

// Example IPC handler
ipcMain.on('toMain', (event) => {
  event.reply('fromMain', { ok: true, ts: Date.now() })
})

ipcMain.handle(
  'save-file',
  async (_event, payload: { data: Uint8Array; defaultName: string }) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return { canceled: true }
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      defaultPath: payload.defaultName,
      filters: [{ name: 'Excel', extensions: ['xlsx'] }],
    })
    if (canceled || !filePath) return { canceled: true }
    await fs.writeFile(filePath, Buffer.from(payload.data))
    return { canceled: false, filePath }
  }
)
