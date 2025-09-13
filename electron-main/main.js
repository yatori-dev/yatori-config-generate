"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path_1 = require("path");
var createWindow = function () {
    var win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
        },
    });
    win.loadURL('http://localhost:5173'); // 或打包后用 loadFile('dist/index.html')
};
electron_1.app.whenReady().then(createWindow);
