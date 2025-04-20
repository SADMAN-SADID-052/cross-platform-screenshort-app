const { app, BrowserWindow, ipcMain, Tray, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const screenshot = require('screenshot-desktop');

let mainWindow;
let tray;
let captureInterval;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  try {
    tray = new Tray(path.join(__dirname, 'icon.png'));
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show App', click: () => mainWindow.show() },
      { label: 'Quit', click: () => app.quit() }
    ]);
    tray.setToolTip('Screenshot App');
    tray.setContextMenu(contextMenu);
  } catch (error) {
    console.warn('Tray icon load failed:', error.message);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.on('start-capturing', (event, config) => {
  if (captureInterval) clearInterval(captureInterval);

  captureInterval = setInterval(() => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot_${timestamp}.${config.format}`;
    const filePath = path.join(config.folder || app.getPath('desktop'), filename);

    screenshot({ format: config.format })
      .then((img) => {
        fs.writeFile(filePath, img, (err) => {
          if (err) {
            console.error('File write error:', err);
            return;
          }

          // ✅ Send toast notification
          if (config.notify) {
            mainWindow.webContents.send('show-toast', `Saved: ${filename}`);
          }

          // ✅ Send path for preview
          mainWindow.webContents.send('screenshot-saved', filePath);
        });
      })
      .catch((err) => console.error('Screenshot error:', err));
  }, config.interval * 1000);
});

ipcMain.on('stop-capturing', () => {
  clearInterval(captureInterval);
});
