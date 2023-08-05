import { Animator } from "./Animator";

export class VideoScreen extends EventTarget {
  private videos: HTMLVideoElement[] = [];
  private container?: HTMLElement;
  private animator: Animator;
  private readonly halfScrollingDurationMs: number;
  private lastFrameTimeMs: [number, number] = [-1, -1];
  private readonly playTimeFactorMs: number;
  public loaded: boolean = false;

  constructor(
    private readonly videoSrc: string,
    private readonly scrollingDurationMs: number,
    private readonly iterationDelayMs: number,
    private readonly iteration: number,
    private readonly debugWidth?: number,
  ) {
    super();

    /**
     * This is the factor to compute the video.currentTime each
     * time there is a new iteration (a video element is sent
     * back at the beginning).
     *
     * This formula is a simplified version of:
     *
     * factor = (iterationDelay / (scrollingDuration / 2)) * 2
     *
     * Where both "2" are from the fact we have two videos elements
     * revolving each half of scrollingDuration (=> *twice* a revolution).
     */
    this.playTimeFactorMs =
      1 + (2 * this.iterationDelayMs) / this.scrollingDurationMs;
    this.halfScrollingDurationMs = this.scrollingDurationMs / 2;

    if (this.scrollingDurationMs % 2 !== 0) {
      console.warn(
        "Using an odd duration will result in playback shifting in the long term",
      );
    }
  }

  init(root: HTMLElement) {
    if (this.container) {
      this.container.remove();
    }

    // Create the container
    this.container = document.createElement("div");
    this.container.classList.add("container");

    for (let i = 0; i < 2; i++) {
      const video = document.createElement("video");
      // video.src = this.videoSrc;
      video.loop = true;
      video.style.animationDuration = `${this.scrollingDurationMs}ms`;
      video.muted = true;
      video.autoplay = false;
      video.ariaLabel = i.toString();
      video.load();

      this.videos[i] = video;
      this.container.append(video);
    }

    root.append(this.container);

    this.animator = new Animator((_deltaTime, elapsedTime) => {
      this.updateVideo(
        0,
        elapsedTime,
        (elapsedTime + this.halfScrollingDurationMs) % this.scrollingDurationMs,
      );
      this.updateVideo(
        1,
        elapsedTime,
        (elapsedTime + this.scrollingDurationMs) % this.scrollingDurationMs,
      );
    });

    fetch(this.videoSrc)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        this.videos.forEach((v) => (v.src = url));
        this.loaded = true;
        this.dispatchEvent(new Event("loaded"));
      });

    if (this.debugWidth) {
      this.container.classList.add("debug");
      this.container.style.width = this.debugWidth + "px";
      this.container.style.height = (9 * this.debugWidth) / 16 + "px";
    }
  }

  private updateVideo(
    videoIndex: number,
    elapsedTime: number,
    iterationTime: number,
  ): void {
    // Update the position of the frames
    this.videos[videoIndex].style.transform = `translate3d(${(
      -200 * (iterationTime / this.scrollingDurationMs) +
      100
    ).toFixed(3)}%, 0px, 0px)`;

    if (
      -1 !== this.lastFrameTimeMs[videoIndex] &&
      iterationTime < this.lastFrameTimeMs[videoIndex]
    ) {
      this.videos[videoIndex].currentTime = this.getVideoTimeSec(elapsedTime);
    }

    this.lastFrameTimeMs[videoIndex] = iterationTime;
  }

  private getVideoTimeSec(realTime: number): number {
    // const delay = this.iteration * this.iterationDelayMs;
    // return ((realTime + delay) * this.playTimeFactorMs) / 1000;
    const delay =
      (realTime / this.halfScrollingDurationMs + this.iteration) *
      this.iterationDelayMs;
    return (realTime + delay) / 1000;
  }

  resync(time: number) {
    console.debug(time);
  }

  isPaused() {
    return this.videos[0].paused;
  }

  play() {
    this.videos[0].currentTime = this.getVideoTimeSec(0);
    this.videos[1].currentTime = this.getVideoTimeSec(this.iterationDelayMs);

    this.videos.forEach((video) => video.play());
    this.animator.play();
  }
}
