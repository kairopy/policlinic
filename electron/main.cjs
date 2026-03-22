const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { startServer } = require('../server/index.js');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    icon: path.join(__dirname, '../public/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true,
    title: "Lic Karina Podología"
  });

  // Load the Vite dev server URL in development, or the local index.html in production
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools automatically in dev
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Intercept links to Google Auth or external sites to open in the user's default Chrome/Edge/Firefox!
  // This is CRUCIAL for Google OAuth, as Google blocks embedded Chromium browsers.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // If it's a google auth link OR our local auth trigger, send to system browser
    if (
      url.startsWith('https://accounts.google.com/') || 
      url.includes('google.com') ||
      url.includes('localhost:3001/auth/google')
    ) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (
      url.startsWith('https://accounts.google.com/') || 
      url.includes('google.com') ||
      url.includes('localhost:3001/auth/google')
    ) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

// Start everything when Electron is ready
app.whenReady().then(() => {
  // 1. Start the Node.js Express server
  console.log('Starting internal Backend Server on port 3001...');
  startServer();

  // 2. Open the React window
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// IPC Handlers for Custom Title Bar
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
