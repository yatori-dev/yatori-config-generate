import { app, BrowserWindow } from 'electron';
import path from 'path';

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    win.loadURL('http://localhost:5173'); // 或打包后用 loadFile('dist/index.html')
};

app.whenReady().then(createWindow);
