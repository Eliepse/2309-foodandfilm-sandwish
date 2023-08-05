export class Animator {
  private startAt: Date;
  private lastUpdatedAt: Date;
  private playing = false;
  private shiftTimeMs = 0;

  constructor(
    private readonly onUpdate: (deltaTime: number, elapsedTime: number) => void,
  ) {}

  private update(): void {
    if (!this.playing) {
      return;
    }

    const now = new Date();

    this.onUpdate(
      now.getTime() - (this.lastUpdatedAt ?? now).getTime(),
      now.getTime() - this.startAt.getTime() + this.shiftTimeMs,
    );

    this.lastUpdatedAt = now;

    requestAnimationFrame(() => this.update());
  }

  play(): void {
    this.playing = true;
    this.startAt = new Date();
    this.update();
  }

  getStartAt(): Date {
    return this.startAt;
  }

  stop(): void {
    this.playing = false;
  }

  setShiftTime(delayMs: number): void {
    this.shiftTimeMs = delayMs;
  }
}
