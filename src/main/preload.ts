import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  fetchFiles: (url: string) => ipcRenderer.invoke("fetch-xsnl-files", url),
  downloadFiles: (files: string[]) => ipcRenderer.invoke("download-xsnl", files),
  onDownloadProgress: (callback: (progress: number) => void) => {
    ipcRenderer.on("download-progress", (_event, progress: number) => callback(progress));
  },
});
