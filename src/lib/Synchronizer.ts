import { DataConnection, Peer } from "peerjs";

type MessageType = "sync:video" | "sync:start";

interface Message {
  type: MessageType;
  playbackTime?: number;
}

export type SynchronizerEvent = CustomEvent<Message>;

export class Synchronizer extends EventTarget {
  private localPeer?: Peer;
  private remoteConnections: DataConnection[] = [];

  constructor(
    private readonly isMaster: boolean,
    private host: string,
  ) {
    super();

    if (isMaster) {
      window.config.onPeerConnected((clientId) => {
        console.debug("Peer connected", clientId);
        this.connectPeer(clientId);
      });
    }
  }

  connect() {
    this.localPeer = new Peer(this.isMaster ? "0" : "1", {
      host: this.host,
      port: 9009,
      path: "/sandwich",
      secure: false,
      key: "secure-sandwich",
    });

    if (!this.isMaster) {
      this.localPeer.on("connection", (connection) => {
        console.debug("Received a connection");
        connection.on("data", (msg: Message) => {
          console.debug("New message", msg);
          this.dispatchEvent(new CustomEvent(msg.type, { detail: msg }));
        });
      });
    }
  }

  private connectPeer(peerId: string): void {
    const connection = this.localPeer.connect(peerId);
    this.dispatchEvent(new Event("peer-connected"));
    this.remoteConnections.push(connection);
  }

  private sendToRemoteConnections(msg: Message): void {
    console.debug(
      `Sending a message to ${this.remoteConnections.length} remote connections`,
      msg,
    );
    this.remoteConnections.forEach((connection) => {
      connection.send(msg);
    });
  }

  syncVideo(playbackTime: number) {
    this.sendToRemoteConnections({ type: "sync:video", playbackTime });
  }

  syncStart() {
    this.sendToRemoteConnections({ type: "sync:start" });
  }
}
