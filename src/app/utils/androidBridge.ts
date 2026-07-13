/**
 * androidBridge.ts
 *
 * Self-contained bridge module between the React UI and the Android kiosk
 * app's `window.AndroidSystem` object. Every native call is wrapped in
 * try/catch so a missing or misbehaving bridge never crashes the UI.
 *
 * When the page is loaded in a regular browser (`AndroidSystem` is
 * undefined), all getters return sensible defaults and all setters are
 * no-ops with a console.warn.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { AndroidEventName } from "../types/android";
import { Bluetooth } from "lucide-react";
import { rewriteImageUrl } from "../lib/apiConfig";

/* ─── Re-exported helper types for components ─── */

export type BTDevice = {
  id: string;
  name: string;
  type: string;
  icon: typeof Bluetooth;
  paired: boolean;
  rssi?: number;
};

export type WifiNetwork = {
  id: string;
  name: string;
  secured: boolean;
  strength: 1 | 2 | 3;
};

export type CastDevice = {
  id: string;
  name: string;
  type: string;
  available: boolean;
};

export type IptvChannel = {
  id: number;
  name: string;
  url: string;
  nameAr?: string;
  logo?: string;
};

/* ─── Detection ─── */

export function isAndroidApp(): boolean {
  return typeof window !== "undefined" && typeof window.AndroidSystem !== "undefined";
}

/** Shorthand to the bridge, or undefined */
function sys() {
  return window.AndroidSystem;
}

/* ─── Brightness ─── */

export const brightness = {
  /** Returns current brightness 0..1, default 0.8 when bridge absent. */
  get(): number {
    try {
      return sys()?.getBrightness() ?? 0.8;
    } catch (e) {
      console.warn("[androidBridge] getBrightness failed:", e);
      return 0.8;
    }
  },

  /** Sets brightness, clamped to 0..1. */
  set(value: number): void {
    try {
      const clamped = Math.max(0, Math.min(1, value));
      sys()?.setBrightness(clamped);
    } catch (e) {
      console.warn("[androidBridge] setBrightness failed:", e);
    }
  },
};

/* ─── Volume ─── */

export const volume = {
  /** Returns current volume 0..1, default 0.6 when bridge absent. */
  get(): number {
    try {
      return sys()?.getVolume() ?? 0.6;
    } catch (e) {
      console.warn("[androidBridge] getVolume failed:", e);
      return 0.6;
    }
  },

  /** Sets volume, clamped to 0..1. */
  set(value: number): void {
    try {
      const clamped = Math.max(0, Math.min(1, value));
      sys()?.setVolume(clamped);
    } catch (e) {
      console.warn("[androidBridge] setVolume failed:", e);
    }
  },
};

/* ─── Bluetooth ─── */

export const bluetooth = {
  isEnabled(): boolean {
    try {
      return sys()?.isBluetoothEnabled() ?? false;
    } catch (e) {
      console.warn("[androidBridge] isBluetoothEnabled failed:", e);
      return false;
    }
  },

  setEnabled(enabled: boolean): void {
    try {
      sys()?.setBluetoothEnabled(enabled);
    } catch (e) {
      console.warn("[androidBridge] setBluetoothEnabled failed:", e);
    }
  },

  startScan(): void {
    try {
      sys()?.startBluetoothScan();
    } catch (e) {
      console.warn("[androidBridge] startBluetoothScan failed:", e);
    }
  },

  stopScan(): void {
    try {
      sys()?.stopBluetoothScan();
    } catch (e) {
      console.warn("[androidBridge] stopBluetoothScan failed:", e);
    }
  },

  connect(address: string): void {
    try {
      sys()?.connectBluetoothDevice(address);
    } catch (e) {
      console.warn("[androidBridge] connectBluetoothDevice failed:", e);
    }
  },

  disconnect(address: string): void {
    try {
      sys()?.disconnectBluetoothDevice(address);
    } catch (e) {
      console.warn("[androidBridge] disconnectBluetoothDevice failed:", e);
    }
  },
};

/* ─── Wi-Fi ─── */

export const wifi = {
  isEnabled(): boolean {
    try {
      return sys()?.isWifiEnabled() ?? false;
    } catch (e) {
      console.warn("[androidBridge] isWifiEnabled failed:", e);
      return false;
    }
  },

  openSettings(): void {
    try {
      sys()?.openWifiSettings();
    } catch (e) {
      console.warn("[androidBridge] openWifiSettings failed:", e);
    }
  },

  startScan(): void {
    try {
      sys()?.startWifiScan();
    } catch (e) {
      console.warn("[androidBridge] startWifiScan failed:", e);
    }
  },

  connect(ssid: string, password?: string): void {
    try {
      sys()?.connectWifiNetwork(ssid, password ?? "");
    } catch (e) {
      console.warn("[androidBridge] connectWifiNetwork failed:", e);
    }
  },

  disconnect(): void {
    try {
      sys()?.disconnectWifi();
    } catch (e) {
      console.warn("[androidBridge] disconnectWifi failed:", e);
    }
  },
};

/* ─── Cast ─── */

export const cast = {
  isAvailable(): boolean {
    try {
      return sys()?.isCastAvailable() ?? false;
    } catch (e) {
      console.warn("[androidBridge] isCastAvailable failed:", e);
      return false;
    }
  },

  startScan(): void {
    try {
      sys()?.startCastScan();
    } catch (e) {
      console.warn("[androidBridge] startCastScan failed:", e);
    }
  },

  stopScan(): void {
    try {
      sys()?.stopCastScan();
    } catch (e) {
      console.warn("[androidBridge] stopCastScan failed:", e);
    }
  },

  connect(deviceId: string): void {
    try {
      sys()?.connectCastDevice(deviceId);
    } catch (e) {
      console.warn("[androidBridge] connectCastDevice failed:", e);
    }
  },

  stop(): void {
    try {
      sys()?.stopCasting();
    } catch (e) {
      console.warn("[androidBridge] stopCasting failed:", e);
    }
  },

  openSettings(): void {
    try {
      sys()?.openCastSettings();
    } catch (e) {
      console.warn("[androidBridge] openCastSettings failed:", e);
    }
  },
};

/* ─── DND ─── */

export const dnd = {
  isEnabled(): boolean {
    try {
      return sys()?.isDndEnabled() ?? false;
    } catch (e) {
      console.warn("[androidBridge] isDndEnabled failed:", e);
      return false;
    }
  },

  setEnabled(enabled: boolean): void {
    try {
      sys()?.setDndEnabled(enabled);
    } catch (e) {
      console.warn("[androidBridge] setDndEnabled failed:", e);
    }
  },
};

/* ─── Night Light ─── */

export const nightLight = {
  isEnabled(): boolean {
    try {
      return sys()?.isNightLightEnabled() ?? false;
    } catch (e) {
      console.warn("[androidBridge] isNightLightEnabled failed:", e);
      return false;
    }
  },

  setEnabled(enabled: boolean): void {
    try {
      sys()?.setNightLight(enabled);
    } catch (e) {
      console.warn("[androidBridge] setNightLight failed:", e);
    }
  },

  openSettings(): void {
    try {
      sys()?.openNightLightSettings();
    } catch (e) {
      console.warn("[androidBridge] openNightLightSettings failed:", e);
    }
  },
};

/* ─── Apps ─── */

export const apps = {
  launch(componentName: string): void {
    try {
      window.AndroidSystem?.launchApp(componentName);
    } catch (e) {
      console.warn('apps.launch failed', e);
    }
  },
  isInstalled(packageName: string): boolean {
    try {
      return window.AndroidSystem?.isAppInstalled(packageName) ?? false;
    } catch {
      return false;
    }
  },
};

// Pre-known component for the bedside IPTV app
export const KNOWN_APPS = {
  iptv: 'com.bitsarabia.bedsideterminalsolution/.careinn.iptvStreamActivity',
} as const;

// ── Module-level IPTV state ─────────────────────────────────────────
// Persists across component mounts/unmounts so channel switching 
// works even when IptvChannels UI is not mounted.

let _iptvChannels: IptvChannel[] = [];
let _iptvPlayingId: number | null = null;

/** Called by useIptvChannels when channels load */
export function _setIptvChannels(channels: IptvChannel[]) {
  _iptvChannels = channels;
}

/** Called by IptvChannels when playing state changes */
export function _setIptvPlayingId(id: number | null) {
  _iptvPlayingId = id;
}

export function _getIptvChannels() { return _iptvChannels; }
export function _getIptvPlayingId() { return _iptvPlayingId; }
// ───────────────────────────────────────────────────────────────────

export const iptv = {
  /**
   * Trigger an async channel fetch. Listen for 'iptv-channels-loaded' 
   * (or use the React hook below). Resolves to [] if no bridge.
   */
  fetchChannels(): void {
    try { sys()?.fetchIptvChannels(); } 
    catch (e) { console.warn('[androidBridge] iptv.fetchChannels failed:', e); }
  },
  
  play(channel: IptvChannel): void {
    try {
      sys()?.playIptv(channel.url, channel.name);
    } catch (e) { console.warn('[androidBridge] iptv.play failed:', e); }
  },

  /**
   * Hand the entire channel list to the native overlay and start at `startIndex`.
   * Falls back to single-channel `playIptv` on old APKs without `playChannelList`.
   * JSON shape matches SystemBridge.playChannelList: { channel_url, name_en, name_ar, channel_image }.
   */
  playList(channels: IptvChannel[], startIndex: number): void {
    try {
      if (!channels.length) return;
      const start = Math.max(0, Math.min(startIndex, channels.length - 1));
      if (typeof sys()?.playChannelList === 'function') {
        const json = JSON.stringify(channels.map(ch => ({
          channel_url:   ch.url,
          name_en:       ch.name,
          name_ar:       ch.nameAr || ch.name,
          channel_image: ch.logo   || "",
        })));
        sys()!.playChannelList!(json, start);
      } else {
        // Old APK fallback — single channel
        const ch = channels[start];
        if (ch) sys()?.playIptv(ch.url, ch.name);
      }
    } catch (e) {
      console.warn("[androidBridge] iptv.playList failed:", e);
    }
  },

  stop(): void {
    try { sys()?.stopIptv(); } 
    catch (e) { console.warn('[androidBridge] iptv.stop failed:', e); }
  },
  
  isPlaying(): boolean {
    try { return sys()?.isIptvPlaying() ?? false; } 
    catch { return false; }
  },

  channelNext(): void {
    const channels = _iptvChannels;
    const currentId = _iptvPlayingId;
    if (!channels.length) {
      console.warn('[iptv] No channels loaded yet');
      return;
    }
    if (currentId === null) {
      // Nothing playing — start from first channel
      iptv.play(channels[0]);
      return;
    }
    const idx = channels.findIndex(c => c.id === currentId);
    const next = channels[(idx + 1) % channels.length];
    iptv.play(next);
  },

  channelPrev(): void {
    const channels = _iptvChannels;
    const currentId = _iptvPlayingId;
    if (!channels.length) {
      console.warn('[iptv] No channels loaded yet');
      return;
    }
    if (currentId === null) {
      iptv.play(channels[channels.length - 1]);
      return;
    }
    const idx = channels.findIndex(c => c.id === currentId);
    const prev = channels[(idx - 1 + channels.length) % channels.length];
    iptv.play(prev);
  },
};

/* ─── Device Info ─── */

export interface DeviceInfo {
  serial: string;       // ro.serialno e.g. "mt15pwjn896694018"
  androidId: string;    // e.g. "a190325536d38954"
  ipAddress: string;    // e.g. "10.32.0.51"
  model: string;        // e.g. "MT15"
  manufacturer: string; // e.g. "Queclink"
}

export function getDeviceInfo(): DeviceInfo | null {
  try {
    const json = sys()?.getDeviceInfo?.();
    if (!json) return null;
    return JSON.parse(json);
  } catch { return null; }
}

/**
 * Reactive hook — reads device info once on mount.
 * Refreshes when the bridge becomes available.
 */
export function useDeviceInfo(): DeviceInfo | null {
  const [info, setInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    // Try immediately
    const d = getDeviceInfo();
    if (d) {
      setInfo(d);
      return;
    }

    // If bridge not ready yet, retry after 1s (WebView load timing)
    const t = setTimeout(() => {
      setInfo(getDeviceInfo());
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  return info;
}

/**
 * React hook: triggers a channel fetch on mount, parses the result, 
 * exposes loading / error state. Returns [] in regular browsers.
 */
export function useAndroidEvent<T = unknown>(
  eventName: AndroidEventName,
  callback: (detail: T) => void
): void {
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent<T>).detail;
        savedCallback.current(detail);
      } catch (err) {
        console.warn(`[androidBridge] Error handling event "${eventName}":`, err);
      }
    };

    window.addEventListener(eventName, handler);
    return () => {
      window.removeEventListener(eventName, handler);
    };
  }, [eventName]);
}

/**
 * React hook to manage IPTV channel list.
 * Handles fetching, error states, and event listeners.
 */
export function useIptvChannels() {
  const [channels, setChannels] = useState<IptvChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!isAndroidApp()) {
      setError('TV is only available on the kiosk');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    iptv.fetchChannels();
  }, []);

  useAndroidEvent<any>('iptv-channels-loaded', (d) => {
    try {
      let arr: any;
      if (typeof d.json === 'string') {
        arr = JSON.parse(d.json);
      } else if (d.json && typeof d.json === 'object') {
        arr = d.json;
      } else if (Array.isArray(d)) {
        arr = d;
      } else if (d.channels && Array.isArray(d.channels)) {
        arr = d.channels;
      }

      const mapped: IptvChannel[] = (Array.isArray(arr) ? arr : [])
        .map((ch: any, idx: number) => {
          const locales = ch.channel_locale ?? [];
          const nameEn = locales.find(
            (l: any) => l.language_id === 1)?.locale_name
            ?? ch.name ?? `Channel ${idx + 1}`;
          const nameAr = locales.find(
            (l: any) => l.language_id === 2)?.locale_name
            ?? nameEn;
          return {
            id:     ch.id ?? idx,
            name:   nameEn,
            nameAr: nameAr,
            url:    ch.channel_url ?? ch.url ?? "",
            logo:   rewriteImageUrl(ch.channel_image ?? ch.logo ?? ""),
          };
        })
        .filter((ch: IptvChannel) => ch.url); // skip channels with no URL
      setChannels(mapped);
      _setIptvChannels(mapped); // sync to module store
      setLoading(false);
      setError(null);
    } catch (e) {
      console.error('[androidBridge] Failed to parse IPTV channels:', e, d);
      setError('Failed to parse channel list');
      setLoading(false);
    }
  });

  useAndroidEvent<{ message: string }>('iptv-channels-error', (d) => {
    setError(d.message || 'Failed to load channels');
    setLoading(false);
  });

  useEffect(() => {
    reload();
  }, [reload]);

  return { channels, loading, error, reload };
}

// ─── SIP Types ────────────────────────────────────────────────────────

export type SipContact = {
  extension: string;
  nameEn: string;
  nameAr: string;
  emergency: boolean;
};

export type SipCallState =
  | 'Idle' | 'OutgoingInit' | 'OutgoingProgress' | 'OutgoingRinging'
  | 'OutgoingEarlyMedia' | 'Connected' | 'StreamsRunning'
  | 'IncomingReceived' | 'Pausing' | 'Paused' | 'Resuming'
  | 'Released' | 'Error' | 'End';

export type SipRegistrationState =
  | 'None' | 'Progress' | 'Ok' | 'Cleared' | 'Failed' | 'Refreshing';

// ─── SIP Bridge Object ────────────────────────────────────────────────

export const sip = {

  /**
   * Get the current contact directory. The Android app fetches this 
   * from http://10.32.0.86/api/sip/directory/devices/ on startup.
   * Always returns at least the hardcoded fallback (Sara, ext 629).
   */
  getContacts(): SipContact[] {
    try {
      const json = window.AndroidSystem?.sipGetContacts();
      if (!json) return [];
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  },

  call(extension: string): void {
    try { window.AndroidSystem?.sipCall(extension); }
    catch (e) { console.warn('sip.call failed', e); }
  },

  answer(): void {
    try { window.AndroidSystem?.sipAnswer(); }
    catch (e) { console.warn('sip.answer failed', e); }
  },

  hangup(): void {
    try { window.AndroidSystem?.sipHangup(); }
    catch (e) { console.warn('sip.hangup failed', e); }
  },

  setMuted(muted: boolean): void {
    try { window.AndroidSystem?.sipSetMuted(muted); }
    catch (e) { console.warn('sip.setMuted failed', e); }
  },

  isMuted(): boolean {
    try { return window.AndroidSystem?.sipIsMuted() ?? false; }
    catch { return false; }
  },

  getCallState(): SipCallState {
    try {
      return (window.AndroidSystem?.sipGetCallState() 
          ?? 'Idle') as SipCallState;
    } catch { return 'Idle'; }
  },

  getRegistrationState(): SipRegistrationState {
    try {
      return (window.AndroidSystem?.sipGetRegistrationState() 
          ?? 'None') as SipRegistrationState;
    } catch { return 'None'; }
  },

  getLocalExtension(): string {
    try {
      return window.AndroidSystem?.sipGetLocalExtension?.() ?? '';
    } catch { return ''; }
  },

  /**
   * Returns true only when running inside the Android kiosk app
   * AND the SIP account has successfully registered.
   */
  isAvailable(): boolean {
    try {
      return isAndroidApp() &&
             window.AndroidSystem?.sipGetRegistrationState() === 'Ok';
    } catch { return false; }
  },
};

// ─── SIP React Hooks ──────────────────────────────────────────────────

/**
 * Reactive call state. Polls sipGetCallState() with adaptive interval:
 *   - 2 000 ms when idle (barely any overhead)
 *   - 300 ms during an active/ringing call (sub-second feedback)
 * Also listens to 'sip-call-state' bridge events as a fast-path.
 */
export function useSipCallState() {
  const [callState, setCallState] = useState<SipCallState>(
    () => sip.getCallState()
  );
  const [remote, setRemote] = useState('');
  const [direction, setDirection] =
    useState<'incoming' | 'outgoing' | null>(null);
  const [durationMs, setDurationMs] = useState(0);

  // Track last polled state without triggering re-renders
  const prevStateRef = useRef<SipCallState>(sip.getCallState());

  // Fast-path: bridge-dispatched events (fires immediately when available)
  useAndroidEvent<{
    state: SipCallState;
    remote: string;
    direction: 'incoming' | 'outgoing';
    durationMs: number;
  }>('sip-call-state', (d) => {
    prevStateRef.current = d.state;
    setCallState(d.state);
    setRemote(d.remote);
    setDirection(d.direction);
    setDurationMs(d.durationMs);
  });

  // Adaptive polling — fallback when bridge events are not dispatched
  useEffect(() => {
    if (!isAndroidApp()) return;

    let intervalMs = 2000; // slow when idle — barely noticeable
    let intervalId: ReturnType<typeof setInterval>;

    const poll = () => {
      try {
        const polled = (window.AndroidSystem?.sipGetCallState()
            ?? 'Idle') as SipCallState;

        if (polled !== prevStateRef.current) {
          prevStateRef.current = polled;
          setCallState(polled);

          if (polled === 'IncomingReceived') {
            setDirection('incoming');
          } else if (
            polled === 'OutgoingInit' ||
            polled === 'OutgoingProgress' ||
            polled === 'OutgoingRinging' ||
            polled === 'OutgoingEarlyMedia'
          ) {
            setDirection('outgoing');
          }

          // State changed — switch to fast polling
          const newMs = (polled === 'Idle' || polled === 'Released' ||
                         polled === 'End' || polled === 'Error')
              ? 2000   // back to slow after call ends
              : 300;   // fast during active call

          if (newMs !== intervalMs) {
            intervalMs = newMs;
            clearInterval(intervalId);
            intervalId = setInterval(poll, intervalMs);
          }
        }
      } catch (e) {
        // silent
      }
    };

    intervalId = setInterval(poll, intervalMs);
    return () => clearInterval(intervalId);
  }, []);

  // Auto-reset to Idle after terminal states so the UI clears cleanly
  useEffect(() => {
    if (callState === 'Released' || callState === 'End' ||
        callState === 'Error') {
      const t = setTimeout(() => {
        setCallState('Idle');
        setRemote('');
        setDirection(null);
        setDurationMs(0);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [callState]);

  return { callState, remote, direction, durationMs };
}

/**
 * Lightweight hook for global incoming call detection.
 * Only returns true when an incoming call needs attention.
 */
export function useIncomingCall(): {
  isIncoming: boolean;
  callerExtension: string;
  callerName: string;
} {
  const { callState, remote } = useSipCallState();
  const contacts = useSipContacts();

  const isIncoming = callState === 'IncomingReceived';

  const contact = contacts.find(c => c.extension === remote);
  const callerName = contact
    ? contact.nameEn
    : remote || 'Unknown';

  return { isIncoming, callerExtension: remote, callerName };
}


/**
 * Reactive registration state. Updates when the Android bridge 
 * dispatches 'sip-registration-state' events.
 */
export function useSipRegistration() {
  const [regState, setRegState] = useState<SipRegistrationState>(
    () => sip.getRegistrationState()
  );
  useAndroidEvent<{ state: SipRegistrationState }>(
    'sip-registration-state',
    (d) => setRegState(d.state)
  );
  return regState;
}

/**
 * Reactive contact list. Refreshes when the Android app updates 
 * the directory from the hospital API.
 */
export function useSipContacts() {
  const [contacts, setContacts] = useState<SipContact[]>(
    () => sip.getContacts()
  );
  useAndroidEvent('sip-contacts-updated', () => {
    setContacts(sip.getContacts());
  });
  return contacts;
}
/**
 * Reactive hook for the local SIP extension.
 * Updates when the Android app refreshes SIP credentials from the API.
 */
export function useSipLocalExtension(): string {
  const [extension, setExtension] = useState<string>(
    () => {
      try {
        return window.AndroidSystem?.sipGetLocalExtension?.() ?? '';
      } catch { return ''; }
    }
  );

  // Update when API refresh completes
  useAndroidEvent<{ extension: string }>(
    'sip-credentials-updated',
    (d) => {
      if (d.extension) setExtension(d.extension);
    }
  );

  // Also poll once after 3 seconds to catch the initial API refresh
  useEffect(() => {
    if (!isAndroidApp()) return;
    const t = setTimeout(() => {
      try {
        const ext = window.AndroidSystem?.sipGetLocalExtension?.() ?? '';
        if (ext) setExtension(ext);
      } catch {}
    }, 3500);  // slightly after the 2s API refresh delay
    return () => clearTimeout(t);
  }, []);

  return extension;
}

/**
 * Convenience hook — returns true when running inside the Android app
 * and SIP registration is 'Ok'. Components can use this instead of
 * combining isAndroidApp() + useSipRegistration() manually.
 */
export function useSipAvailable() {
  const regState = useSipRegistration();
  return isAndroidApp() && regState === 'Ok';
}
