const { app, BrowserWindow } = require('electron')

function createWindow () {
  
  let win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    },
    title: "Archiver"
  })

  win.loadFile('views/index.html')
  
  win.webContents.openDevTools()

}

const path = require('path')
 
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
});

app.whenReady().then(createWindow)

