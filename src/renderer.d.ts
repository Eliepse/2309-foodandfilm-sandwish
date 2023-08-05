export interface ElectronConfig {
  peerId: () => Promise<string>;
  onPeerConnected: (clb: (clientId: string) => void) => void;
}

declare global {
  interface Window {
    config: ElectronConfig;
  }
}
