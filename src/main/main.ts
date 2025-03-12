import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import { downloadFiles } from './download';

let mainWindow: BrowserWindow | null;
let splash: BrowserWindow | null;

app.whenReady().then(() => {
  splash = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  setTimeout(() => {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'), // ✅ Ensure this is set!
      },
    });

    mainWindow.loadURL('http://localhost:3000');

    splash?.close();
  }, 3000);
  // Load the EJS file
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.ejs'));
});

ipcMain.handle('fetch-xsnl-files', async (_event, url: string) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    let files: string[] = [];
    $('a[href$=".xsnl"]').each((_, link) => {
      files.push(new URL($(link).attr('href') || '', url).href);
    });

    return files;
  } catch (error) {
    console.error('Error fetching files:', error);
    return { error: 'Failed to fetch the page' };
  }
});

ipcMain.handle('download-xsnl', async (_event, files: string[]) => {
  try {
    return await downloadFiles(files);
  } catch (error) {
    console.error('Download error:', error);
    return { error: 'Failed to download files' };
  }
});
