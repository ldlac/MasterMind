const electron = require('electron');
const fs = require('fs');
const app = electron.app;
const Menu = electron.Menu;
const dialog = electron.dialog;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');

let mainWindow, splashWindow;

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'File Finder',
        accelerator: 'CmdOrCtrl+T',
        click: () => {mainWindow.webContents.send('show-filefinder', true)}
      },
      {
        label: 'Open...',
        accelerator: 'CmdOrCtrl+O',
        click () { openFile() }
      },
      {
        label: 'Save...',
        accelerator: 'CmdOrCtrl+S',
        click () {
          // We can't call saveFile(content) directly because we need to get
          // the content from the renderer process. So, send a message to the
          // renderer, telling it we want to save the file.
          mainWindow.webContents.send('save-file')
        }
      }
    ]
  },
  {
    label: 'Panels',
    submenu: [
      {
        label: 'Schedule whole panel',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {mainWindow.webContents.send('show-schedule', true)}
      },
      {
        label: 'Editor left panel',
        accelerator: 'CmdOrCtrl+1',
        click: () => {mainWindow.webContents.send('lview', 'editor')}
      },
      {
        label: 'Editor right panel',
        accelerator: 'Shift+CmdOrCtrl+1',
        click: () => {mainWindow.webContents.send('rview', 'editor')}
      },
      {
        label: 'Viewer left panel',
        accelerator: 'CmdOrCtrl+2',
        click: () => {mainWindow.webContents.send('lview', 'view')}
      },
      {
        label: 'Viewer right panel',
        accelerator: 'Shift+CmdOrCtrl+2',
        click: () => {mainWindow.webContents.send('rview', 'view')}
      },
      {
        label: 'Agenda left panel',
        accelerator: 'CmdOrCtrl+3',
        click: () => {mainWindow.webContents.send('lview', 'agenda')}
      },
      {
        label: 'Agenda right panel',
        accelerator: 'Shift+CmdOrCtrl+3',
        click: () => {mainWindow.webContents.send('rview', 'agenda')}
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Mini Calendar',
        accelerator: 'CmdOrCtrl+K',
        click: () => {mainWindow.webContents.send('show-calendar', true)}
      },
      {
        type: 'separator'
      },
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  },
  {
    label: 'Editor Theme',
    submenu: [
      {
        label: 'Monokai',
        click () { mainWindow.webContents.send('change-theme', 'monokai') }
      },
      {
        label: '3024-night',
        click () { mainWindow.webContents.send('change-theme', '3024-night') }
      },
      {
        label: 'icecoder',
        click () { mainWindow.webContents.send('change-theme', 'icecoder') }
      }
    ]
  },
  {
    label: 'Developer',
    submenu: [
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin'
          ? 'Alt+Command+I'
          : 'Ctrl+Shift+I',
        click () { mainWindow.webContents.toggleDevTools() }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  const name = app.getName()
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click () { app.quit() }
      }
    ]
  })
}

function openFile() {
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }
    ]
  })

  if (!files) return

  const file = files[0]
  const content = fs.readFileSync(file).toString()

  app.addRecentDocument(file)

  mainWindow.webContents.send('file-opened', file, content)
}

function createWindow() {
  mainWindow = new BrowserWindow({frame:false, width: 900, height: 680, show: false, center: true});
  mainWindow.setTitle("MasterMind");
  splashWindow = new BrowserWindow({frame:false, width: 600, height: 600, alwaysOnTop: true, transparent: true, show: false, center: true});
  splashWindow.setTitle("SplashScreen");
  splashWindow.loadURL(isDev ? `file://${__dirname}/splash.html` : `file://${path.join(__dirname, '../build/splash.html')}`);
  splashWindow.once('ready-to-show', () => {
    splashWindow.show()
  })

  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    splashWindow.destroy()
  })
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

exports.openFile = openFile
