/**
 * Ambient type declarations for the Android kiosk app's JavaScript bridge.
 *
 * The kiosk WebView injects `window.AndroidSystem` before the page loads.
 * In a normal browser this property is `undefined`.
 */
export {};

/* ─── Method interface exposed by the native side ─── */
interface AndroidSystemInterface {
  // Brightness (0.0 – 1.0)
  setBrightness(value: number): void;
  getBrightness(): number;

  // Bluetooth
  isBluetoothEnabled(): boolean;
  setBluetoothEnabled(enabled: boolean): void;
  startBluetoothScan(): void;
  stopBluetoothScan(): void;
  connectBluetoothDevice(address: string): void;
  disconnectBluetoothDevice(address: string): void;

  // Wi-Fi
  isWifiEnabled(): boolean;
  openWifiSettings(): void;
  startWifiScan(): void;
  connectWifiNetwork(ssid: string, password: string): void;
  disconnectWifi(): void;

  // Cast
  isCastAvailable(): boolean;
  startCastScan(): void;
  stopCastScan(): void;
  connectCastDevice(deviceId: string): void;
  stopCasting(): void;
  openCastSettings(): void;

  // DND
  isDndEnabled(): boolean;
  setDndEnabled(enabled: boolean): void;

  // Night Light
  setNightLight(enabled: boolean): void;
  isNightLightEnabled(): boolean;
  openNightLightSettings(): void;

  // Volume (system media volume, 0.0 – 1.0)
  setVolume(value: number): void;
  getVolume(): number;

  // Apps
  launchApp(componentName: string): void;
  isAppInstalled(packageName: string): boolean;
  installApk?(apkUrl: string, packageName: string): void;
  showToast?(message: string, longDuration: boolean): void;
  setLaunchableApps?(packagesJson: string): void;

  // IPTV
  fetchIptvChannels(): void;
  playIptv(url: string, channelName: string): void;
  playChannelList?(channelsJson: string, startIndex: number): void;
  stopIptv(): void;
  isIptvPlaying(): boolean;

  // SIP methods
  sipGetContacts(): string;           // returns JSON string
  sipCall(extension: string): void;
  sipAnswer(): void;
  sipHangup(): void;
  sipSetMuted(muted: boolean): void;
  sipIsMuted(): boolean;
  sipGetCallState(): string;
  sipGetRegistrationState(): string;
  sipGetLocalExtension(): string;

  // Clear All Data
  clearAllDataAndReload?(): void;

  // Device Info
  getDeviceInfo?(): string;           // returns JSON string

  // API Config
  getApiConfig?(): string;
  updateApiConfig?(serverIp: string, apiKey: string): void;
  resetApiConfig?(): void;

  // Image proxy — fetches http:// image, returns base64 data URL
  // Used to bypass mixed content restrictions in HTTPS WebView
  fetchImageAsBase64?(url: string): string;
}
/* ─── CustomEvent detail shapes dispatched by the Android side ─── */
export interface BrightnessChangedDetail {
  value: number; // 0.0 – 1.0
}

export interface VolumeChangedDetail {
  value: number; // 0.0 – 1.0
}

export interface BluetoothStateChangedDetail {
  enabled: boolean;
}

export interface BluetoothDeviceFoundDetail {
  name: string;
  address: string;
  rssi: number;
  paired: boolean;
}

export interface BluetoothDeviceConnectedDetail {
  address: string;
}

export interface WifiStateChangedDetail {
  enabled: boolean;
}

export interface WifiNetworkFoundDetail {
  ssid: string;
  bssid: string;
  signalLevel: number; // dBm, typically -100 to 0
  secured: boolean;
}

export interface WifiConnectedDetail {
  ssid: string;
}

export interface CastDeviceFoundDetail {
  id: string;
  name: string;
  modelName: string;
}

export interface CastConnectedDetail {
  id: string;
}

export interface PermissionDeniedDetail {
  feature: string;
}

/* ─── Union of all event names the native side may dispatch ─── */
export type AndroidEventName =
  | "brightness-changed"
  | "volume-changed"
  | "bluetooth-state-changed"
  | "bluetooth-device-found"
  | "bluetooth-device-connected"
  | "wifi-state-changed"
  | "wifi-network-found"
  | "wifi-connected"
  | "cast-device-found"
  | "cast-connected"
  | "permission-denied"
  | "dnd-state-changed"
  | "night-light-changed"
  | "app-launched"
  | "app-launch-failed"
  | "iptv-channels-loaded"
  | "iptv-channels-error"
  | "iptv-playing"
  | "iptv-stopped"
  | "sip-registration-state"
  | "sip-call-state"
  | "sip-contacts-updated"
  | "sip-credentials-updated"
  | "api-config-updated"
  | "update-available"
  | "update-progress"
  | "update-installed"
  | "apk-install-progress"
  | "apk-install-success"
  | "apk-install-error"
  | "kiosk-resumed";

/* ─── Augment the global Window type ─── */
declare global {
  interface Window {
    AndroidSystem?: AndroidSystemInterface;
  }
}
