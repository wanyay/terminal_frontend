import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

const isDev = process.env.NODE_ENV !== 'production';
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173';

async function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    await win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    // In production, the renderer build output should be copied into dist/ or included by the packager.
    const indexHtml = path.join(__dirname, '..', 'dist', 'index.html');
    await win.loadFile(indexHtml);
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Example IPC handler
ipcMain.on('toMain', (event, data) => {
  console.log('from renderer:', data);
  event.reply('fromMain', { ok: true, ts: Date.now() });
});
