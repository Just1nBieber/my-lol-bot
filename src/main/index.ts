import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { shardManager } from '@shared/yuekui-shard/manager'
import './shards/Hello-world-shard/index'
import './shards/Lcu-connect/index'
import './shards/Auto-pick-shard/index'
import './shards/Champ-asset-shard/index'
import './shards/Simple-matched-shard/index'
import './shards/User-info-shard/index'
import './shards/System-protocol-shard/index'
import './shards/Render-sync/index'

let isQuitting = false

app.commandLine.appendSwitch('ignore-certificate-errors')

process.on('uncaughtException', (error) => {
  console.error('【系统级崩溃拦截】:', error)
  // 如果以后接入了日志库，写到日志里
})

process.on('unhandledRejection', (error) => {
  console.error('【未捕获的异步拒绝】:', error)
})

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    minWidth: 840,
    minHeight: 620,
    show: false,
    frame: false, // 去除默认边框
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  // 窗口控制 IPC
  ipcMain.on('window-minimize', () => {
    mainWindow.minimize()
  })

  ipcMain.on('window-close', () => {
    mainWindow.close()
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // ✅ 1. 正确位置：App 准备好后，立即启动后端分片服务
  console.log('🚀---正在启动 Shard 模块...')
  await shardManager.initAll() // 加上 await，确保服务启动后再弹窗 (可选)

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', async (e) => {
  if (isQuitting) return
  e.preventDefault()
  console.log('正在关闭所有后台服务...')
  await shardManager.disposeAll()
  isQuitting = true
  console.log('后台服务清理完毕，安全退出！')
  app.exit(0)
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
