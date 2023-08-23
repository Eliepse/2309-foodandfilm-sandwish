import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("config", {
  peerId: ipcRenderer.sendSync("peerId"),
  rootPath: process.resourcesPath,
  onPeerConnected: (clb: (peedId: string) => void): void => {
    ipcRenderer.on("peerConnected", (_, peerId) => clb(peerId));
  },
});

contextBridge.exposeInMainWorld("electron", {
  mediaPath: ipcRenderer.sendSync("get-resource-path"),
  isProd: ipcRenderer.sendSync("get-is-prod"),
  peerCount: ipcRenderer.sendSync("get-peer-count"),
  serverHost: ipcRenderer.sendSync("get-server-host"),
});
