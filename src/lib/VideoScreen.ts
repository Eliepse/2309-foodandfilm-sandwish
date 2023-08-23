export class VideoScreen extends EventTarget {
  private videos: HTMLVideoElement[] = [];
  private container?: HTMLElement;
  private startedAt: Date;

  constructor(
    private readonly videoSrc: string,
    private readonly scrollingDurationMs: number,
    private readonly debugWidth?: number,
  ) {
    super();

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
      video.style.animationDelay = `${(this.scrollingDurationMs / 2) * i}ms`;
      video.muted = true;
      video.autoplay = false;
      video.ariaLabel = i.toString();
      video.addEventListener("animationiteration", () => this.rsyncVideo(i));
      video.load();

      this.videos[i] = video;
      this.container.append(video);
    }

    root.append(this.container);

    fetch(this.videoSrc)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        this.videos.forEach((v) => (v.src = url));
        this.dispatchEvent(new Event("loaded"));
      });

    if (this.debugWidth) {
      this.container.classList.add("debug");
      this.container.style.width = this.debugWidth + "px";
      this.container.style.height = (9 * this.debugWidth) / 16 + "px";
    }
  }

  private rsyncVideo(videoIndex: number): void {
    const video = this.videos[videoIndex];
    const elapsedTimeMs = new Date().getTime() - this.startedAt.getTime();
    const elapsedTimeSec = elapsedTimeMs / 1_000;
    video.currentTime = elapsedTimeSec % video.duration;
  }

  isPaused() {
    return this.videos[0].paused;
  }

  play() {
    this.startedAt = new Date();
    this.videos.forEach((video) => {
      video.style.animationPlayState = "running";
      void video.play();
    });
  }
}
