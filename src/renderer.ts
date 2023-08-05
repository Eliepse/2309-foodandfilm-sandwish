export interface ElectronConfig {
  peerId: () => Promise<string>;
  rootPath: string;
  onPeerConnected: (clb: (clientId: string) => void) => void;
}

declare global {
  interface Window {
    config: ElectronConfig;
    electron: {
      mediaPath: string;
      isProd: boolean;
    };
  }
}

import "./index.css";
import { VideoScreen } from "./lib/VideoScreen";
import { Synchronizer } from "./lib/Synchronizer";

const path = `file://${window.electron.mediaPath}`;
const scrollDuration = 10_000;
const iterationDelayMs = 2_000;

const screens = [
  new VideoScreen(path, scrollDuration, iterationDelayMs, 0, 600),
];

if (!window.electron.isProd) {
  screens.push(new VideoScreen(path, scrollDuration, iterationDelayMs, 1, 600));
}

window.config
  .peerId()
  .then((peerId) => {
    const isMaster = peerId === "0";
    const synchronizer = new Synchronizer(isMaster);
    synchronizer.connect();

    // synchronizer.addEventListener("sync:video", (e: SynchronizerEvent) => {
    //     screen.resync(e.detail.playbackTime);
    //
    //     if (!isMaster && screen.isPaused()) {
    //         screen.play();
    //     }
    // });
    // synchronizer.addEventListener("sync:start", (e: SynchronizerEvent) => {
    //     console.debug(e.detail);
    //     screen.play();
    // });

    let timeout: string | number | NodeJS.Timeout;

    screens.forEach((screen) => {
      screen.init(document.body);
      screen.addEventListener("loaded", () => {
        if (screens.some((screen) => !screen.loaded)) {
          return;
        }

        clearTimeout(timeout);
        timeout = setTimeout(() => {
          screens.forEach((screen) => screen.play());
        }, 2000);
      });
    });

    if (isMaster) {
      // screen.addEventListener("resync", (e: CustomEvent) => {
      //     synchronizer.syncVideo(e.detail.playbackTime);
      // })
      // setTimeout(() => {
      // synchronizer.syncStart();
      // screen.play();
      // screenB.play();
      // screenC.play();
      // }, 2000);
    }
  })
  .catch(console.error);
