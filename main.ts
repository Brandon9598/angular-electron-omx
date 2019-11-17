import { app, BrowserWindow, screen } from 'electron';
const spawn = require('child_process').spawn;
import * as path from 'path';
import * as url from 'url';
import * as fse from 'fs-extra';
import * as OmxPlayer from 'omxplayer-dbus';


let win, serve;
let omxPlayer;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

const VIDEOS = ['short_a.mov', 'short_b.mov'];
let videoIndex = 0;

const ANGULAR_ELECTRON_OMX = path.join(app.getPath("appData"), "angular-electron-omx/");
const ANGULAR_ELECTRON_OMX_ASSETS = path.join(ANGULAR_ELECTRON_OMX, "/assets/");
const ANGULAR_ELECTRON_OMX_LOG = path.join(ANGULAR_ELECTRON_OMX, "aeo_log.txt");

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

  // Prepare and Play OMXPlayer
  omxPlayer = new OmxPlayer();
  playOMXVideos();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });


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

async function playOMXVideos(){
  logMessage("Starting the process of playing the video");

  const videoSource = path.join(ANGULAR_ELECTRON_OMX_ASSETS, VIDEOS[videoIndex]);
  omxPlayer.open(videoSource, {}).then(() => {
    console.log("Video starting", videoSource);
  })
    

  omxPlayer.on('close', (exitCode)=>{
    console.log(`player closed with exitCode ${exitCode}`);
    videoIndex = (videoIndex++) % VIDEOS.length;
    omxPlayer.removeAllListeners();
    playOMXVideos();
  });
  
  omxPlayer.on('error', (error)=>{
    console.log(`player return error: ${error}`);
  });
}

async function logMessage(message) {
  const formmattedMessage = `${new Date()}:\n${message}\n`
  console.log(formmattedMessage);
  try {
    await fse.outputFile(ANGULAR_ELECTRON_OMX_LOG, formmattedMessage, {
      flag: "a"
    });
  } catch (err) {
    console.log("error writing to file", err);
  }
}

function poll(){

  console.log('** poll **');

  // omxPlayer.setPosition(10, (err, seconds)=>{
  //   console.log(`setPosition: ${err||seconds}`);
  // });

  // omxPlayer.seek(5, (err, seconds)=>{
  //   console.log(`seek: ${err||seconds}`);
  // });

  omxPlayer.mute((err)=>{
    console.log(`mute: ${err}`);
  });

  omxPlayer.unmute((err)=>{
    console.log(`mute: ${err}`);
  });

  omxPlayer.getCanSeek((err, can)=>{
    console.log(`can seek: ${err||can}`);
  });

  omxPlayer.getCanPlay((err, can)=>{
    console.log(`can play: ${err||can}`);
  });

  omxPlayer.getCanPause((err, can)=>{
    console.log(`can pause: ${err||can}`);
  });

  omxPlayer.getPlaybackStatus((err, state)=>{
    console.log(`playback state: ${err||state}`);
  });

  omxPlayer.getPlaying((err, state)=>{
    console.log(`playing: ${err||state}`);
  });

  omxPlayer.getPaused((err, state)=>{
    console.log(`paused: ${err||state}`);
  });

  omxPlayer.getVolume((err, volume)=>{
    console.log(`volume: ${err||volume}`);
  });

  omxPlayer.setVolume(0.5, (err, volume)=>{
    console.log(`volume: ${err||volume}`);
  });

  omxPlayer.getPosition((err, seconds)=>{
    console.log(`position: ${err||seconds}`);
  });

  omxPlayer.getDuration((err, duration)=>{
    console.log(`duration: ${err||duration}`);
  });

}
