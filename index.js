const { app, BrowserWindow } = require('electron')

app.on('ready', () => {
    let window = new BrowserWindow({
        width: 1000,
        height: 500,
        webPreferences: {
            nodeIntegration: true,
        }
    })

    window.setMenuBarVisibility(false)
    window.loadFile('index.html')
})
