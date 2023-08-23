export interface ElectronConfig {
  peerId: string;
  rootPath: string;
  onPeerConnected: (clb: (clientId: string) => void) => void;
}

declare global {
  interface Window {
    config: ElectronConfig;
    electron: {
      mediaPath: string;
      isProd: boolean;
      serverHost: string;
      peerCount: string;
    };
  }
}

import "./index.css";
import { VideoScreen } from "./lib/VideoScreen";
import { Synchronizer, SynchronizerEvent } from "./lib/Synchronizer";

const path = `file://${window.electron.mediaPath}`;
const scrollDuration = 30_000;
const iterationDelayMs = 2_000;

const screens = [
  new VideoScreen(path, scrollDuration, iterationDelayMs, 0, window.electron.isProd ? undefined : 600),
];

if (!window.electron.isProd) {
  screens.push(new VideoScreen(path, scrollDuration, 0, 0, 600));
}

const peerId = window.config.peerId;
const screen = screens[0];
const isMaster = peerId === "0";
const synchronizer = new Synchronizer(isMaster, window.electron.serverHost);

// synchronizer.connect();

synchronizer.addEventListener("sync:start", (e: SynchronizerEvent) => {
  console.debug(e.detail);
  screen.play();
});

screen.init(document.body);

document.addEventListener("keydown", (e) => {
  if(e.key !== "s") {
    return;
  }

  screen.play();
})

if (isMaster) {
  let peerReadyCount = 1;

  synchronizer.addEventListener("peer-connected", () => {
    peerReadyCount++;
    if (peerReadyCount >= parseInt(window.electron.peerCount)) {
      synchronizer.syncStart();
      screen.play();
    }
  });
}
