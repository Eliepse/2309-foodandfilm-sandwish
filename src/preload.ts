import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  rootPath: process.resourcesPath,
  mediaPath: ipcRenderer.sendSync("get-resource-path"),
  isProd: ipcRenderer.sendSync("get-is-prod"),
});
