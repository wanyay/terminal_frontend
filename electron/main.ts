import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import fs from 'fs/promises'
import path from 'path';

const APP_NAME = 'Terminal Port Management System';
const isDev = process.env.NODE_ENV !== 'production';
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173';

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: APP_NAME,
    autoHideMenuBar: true,
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

  if (isDev) {
    await win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    const indexHtml = path.join(__dirname, '..', 'dist', 'index.html');
    await win.loadFile(indexHtml);
  }
}

app.whenReady().then(() => {
  app.setName(APP_NAME);
  Menu.setApplicationMenu(null);
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Example IPC handler
ipcMain.on('toMain', (event) => {
  event.reply('fromMain', { ok: true, ts: Date.now() });
});

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