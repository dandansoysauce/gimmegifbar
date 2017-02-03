const electron = require('electron')
const path = require('path')
const menubar = require('menubar')

const ipc = electron.ipcMain

const globalShortcut = electron.globalShortcut

const Menu = electron.Menu

const mb = menubar({
	dir: path.join(__dirname, 'app'),
	width: 450,
	height: 670,
	icon: path.join(__dirname, 'app/IconTemplate.png'),
	preloadWindow: true,
	windowPosition: 'trayRight'
})

mb.on('show', () => {
	mb.window.webContents.send('show')
})

mb.app.on('will-quit', () => {
	globalShortcut.unregisterAll()
})

mb.app.on('activate', () => {
	mb.showWindow()
})

ipc.on('abort', () => {
	mb.hideWindow()
})

ipc.on('open-external', (e, url) => {
	mb.window.webContents.on('new-window', () => {
		e.preventDefault()
		electron.shell.openExternal(url)
	})
})

const template = [{
	label: 'GiphyBar',
	submenu: [{label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:'},
		{label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:'},
		{label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:'},
		{label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:'},
		{label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:'},
		{label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:'},
		{label: 'Reload', accelerator: 'CmdOrCtrl+R',
			click(item, focusedWindow) {
				if (focusedWindow) {
					focusedWindow.reload()
				}
			}
		},
		{label: 'Preference', accelerator: 'CmdOrCtrl+,',
			click() {
				mb.window.webContents.send('open-preference')
			}
		},
		{label: 'Quit App', accelerator: 'CmdOrCtrl+Q', role: 'quit'},
		{label: 'Toggle DevTools', accelerator: 'CmdOrCtrl+I',
			click() {
				mb.window.toggleDevTools()
			}
		}
	]
}]

mb.on('ready', () => {
	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)

	const ret = globalShortcut.register('CommandOrControl+Shift+Space', () => {
		const isVisible = mb.window.isVisible()
		if (isVisible) {
			mb.hideWindow()
		} else {
			mb.showWindow()
		}
	})

	if (!ret) {
		console.log('shorcut registration failed')
	}
})
