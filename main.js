const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const contextMenu = require('electron-context-menu');
contextMenu();

function createWindow () {
  
  let win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    title: "Archiver"
  })

  win.loadFile('views/index.html')
  


  ipcMain.handle('showDialog', async (event, args) => {
    return dialog.showOpenDialogSync({ properties: args });
  })

  if( process.env.DEVELOPMENT ){
    win.webContents.openDevTools({mode:'detaach'})
  }

}

if( process.env.DEVELOPMENT ){
  const path = require('path')
   
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    ignored: /node_modules|airlock|[\/\\]\./,
  });
  
  const chokidar = require('chokidar');
   
  // One-liner for current directory
  chokidar.watch('styles').on('change', (event, path) => {
    console.log(event, path);
    require('child_process').exec( 'lessc styles/index.less dist/styles.css' )
  });

}

app.whenReady().then(createWindow)



