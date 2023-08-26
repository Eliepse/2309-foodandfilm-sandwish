declare global {
  interface Window {
    electron: {
      mediaPath: string;
      isProd: boolean;
      rootPath: string;
      time: number;
    };
  }
}

import "./index.css";
import { VideoScreen } from "./lib/VideoScreen";

const path = `file://${window.electron.mediaPath}`;
const scrollDuration = 15_000;

const screen = new VideoScreen(
  path,
  window.electron.time ?? scrollDuration,
  window.electron.isProd ? undefined : 600,
);

screen.init(document.body);

screen.addEventListener("loaded", () => {
  screen.play();
});
