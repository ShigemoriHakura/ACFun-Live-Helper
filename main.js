// Issues with node package? Rebuild
// .\node_modules\.bin\electron-rebuild.cmd

const electron = require('electron')
// Module to control application life.
const app = electron.app
const Tray = electron.Tray
const Menu = electron.Menu
const ipcMain = require('electron').ipcMain
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow



function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({ 
        titleBarStyle: 'hidden', 
        frame: false, 
        width: 400, 
        height: 600, 
        transparent: true,
    });

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.setAlwaysOnTop(true);
    // mainWindow.setIgnoreMouseEvents(true);


    // Open the DevTools.
    //mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null
    })

    tray = new Tray(path.join(__dirname, 'favicon.ico'));
    const contextMenu = Menu.buildFromTemplate([
       {label: '退出', click: () => {mainWindow.destroy()}},//我们需要在这里有一个真正的退出（这里直接强制退出）
       {label: '显示', click: () => {
            console.log("Clickthrough disabled");
            mainWindow.setIgnoreMouseEvents(false)
            mainWindow.webContents.send('setClickable');
       }},
     ])
     tray.setToolTip('弹幕助手')
     tray.setContextMenu(contextMenu)
     tray.on('click', ()=>{ //我们这里模拟桌面程序点击通知区图标实现打开关闭应用的功能
        console.log("Clickthrough disabled");
        mainWindow.setIgnoreMouseEvents(false)
        mainWindow.webContents.send('setClickable');
        
     })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
