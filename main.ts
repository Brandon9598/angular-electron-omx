import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as Omx from 'node-omxplayer';
import * as fse from "fs-extra";

let win, serve;
let omxPlayer;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');


const ANGULAR_ELECTRON_OMX = path.join(app.getPath("appData"), "angular-electron-omx/");
const ANGULAR_ELECTRON_OMX_ASSETS = path.join(ANGULAR_ELECTRON_OMX, "/assets/");
// const ANGULAR_ELECTRON_OMX_LOG = path.join(ANGULAR_ELECTRON_OMX, "sd_log.txt");

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      devTools: true
    },
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  playOMXVideos();

}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

function playOMXVideos(){
  logMessage("Starting the process of playing the video");
  const videoSource = path.join(ANGULAR_ELECTRON_OMX_ASSETS, 'Jose.mp4')
  omxPlayer = Omx(videoSource, "both", false, 100);
  omxPlayer.on("close", (e, videoResp) => {
    // Log that the video finished
    const message = `Video Finish Response: ${videoResp}\nError: ${e}`
    logMessage(message);
    // quit all children proccess


    // Call function again
    playOMXVideos();
  })
  omxPlayer.on("error", err => logMessage(`OMXPlayer encountered an error: ${err}`))
}

async function logMessage(message) {
  const formmattedMessage = `${new Date()}:\n${message}\n`
  console.log(formmattedMessage);
  try {
    await fse.outputFile(ANGULAR_ELECTRON_OMX, formmattedMessage, {
      flag: "a"
    });
  } catch (err) {
    console.log("error writing to file");
  }
}