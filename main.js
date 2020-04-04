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
  

  if( process.env.DEVELOPMENT ){
    win.webContents.openDevTools()
  }

}

if( process.env.DEVELOPMENT ){
  const path = require('path')
   
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
  });
  
  const chokidar = require('chokidar');
   
  // One-liner for current directory
  chokidar.watch('styles').on('change', (event, path) => {
    console.log(event, path);
    require('child_process').exec( 'lessc styles/index.less dist/styles.css' )
  });

}

app.whenReady().then(createWindow)

