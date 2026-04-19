import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Sun,
  Volume2,
  Globe,
  Wifi,
  Moon,
  BellOff,
  Settings,
  Bluetooth,
  Trash2,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Monitor,
  Cast,
  Tv,
  Loader2,
  Signal,
  Lock,
  Smartphone,
  Headphones,
  Speaker,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Search,
  Maximize,
  Minimize,
  Stethoscope,
  Users,
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useLocale } from "./i18n";
import { CareTeamInterface } from "./CareTeamInterface";
import type { Locale } from "./i18n";
import imgMosque from "../../assets/b51acb5e2ec4a2c930572c53103b020b12e76ee2.png";
import { getPrayerStatus, getCountdown, formatPrayerTime, PRAYER_NAMES } from "../utils/prayerUtils";

/* ═══════════════════════════════════════════════════════════════
 * All colors/fonts/radii in this file come from ThemeContext.
 * To rebrand: change ONLY the theme config in ThemeContext.tsx.
 * ═══════════════════════════════════════════════════════════════ */

/* ─── Slider with touch-friendly +/- buttons ─── */
function SettingsSlider({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const { theme: t } = useTheme();
  const { isRTL } = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calcValue = (e: React.PointerEvent | PointerEvent) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return value;
    
    let percentage: number;
    if (isRTL) {
      percentage = (rect.right - e.clientX) / rect.width;
    } else {
      percentage = (e.clientX - rect.left) / rect.width;
    }
    
    return Math.max(0, Math.min(100, Math.round(percentage * 100)));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    onChange(calcValue(e));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    onChange(calcValue(e));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className="shrink-0 flex items-center justify-center"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: t.radiusMd,
            backgroundColor: t.primarySubtle,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontFamily: t.fontFamily,
            fontSize: "15px",
            fontWeight: 700,
            color: t.textHeading,
          }}
        >
          {label}
        </span>
        <span
          className="ml-auto"
          style={{
            fontFamily: t.fontFamily,
            fontSize: "14px",
            fontWeight: 700,
            color: t.primary,
          }}
        >
          {value}%
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 10))}
          className="shrink-0 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
          style={{
            width: t.touchTargetMin,
            height: t.touchTargetMin,
            borderRadius: t.radiusMd,
            backgroundColor: t.primarySubtle,
            border: "none",
          }}
        >
          <Minus size={18} style={{ color: t.primary }} />
        </button>
        <div
          ref={trackRef}
          className="flex-1 relative cursor-pointer"
          style={{ 
            height: "12px", 
            borderRadius: t.radiusSm, 
            backgroundColor: t.sliderBg, 
            touchAction: "none" 
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Track fill */}
          <div
            style={{
              height: "100%",
              borderRadius: t.radiusSm,
              backgroundColor: t.sliderTrack,
              width: `${value}%`,
              transition: isDragging ? "none" : "width 0.2s ease-out",
            }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2"
            style={{
              [isRTL ? "right" : "left"]: `${value}%`,
              transform: `translate(${isRTL ? "50%" : "-50%"}, -50%)`,
              width: isDragging ? "24px" : "20px",
              height: isDragging ? "24px" : "20px",
              borderRadius: t.radiusFull,
              backgroundColor: t.sliderThumb,
              border: `3px solid ${t.surface}`,
              boxShadow: isDragging ? `0 4px 12px ${t.primary}44` : `0 2px 6px rgba(0,0,0,0.15)`,
              transition: isDragging ? "width 0.1s, height 0.1s" : "all 0.2s ease-out",
              zIndex: 10,
            }}
          />
        </div>
        <button
          onClick={() => onChange(Math.min(100, value + 10))}
          className="shrink-0 flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
          style={{
            width: t.touchTargetMin,
            height: t.touchTargetMin,
            borderRadius: t.radiusMd,
            backgroundColor: t.primarySubtle,
            border: "none",
          }}
        >
          <Plus size={18} style={{ color: t.primary }} />
        </button>
      </div>
    </div>
  );
}

/* ─── Quick Settings Tile (Android-style) ─── */
function QuickTile({
  icon,
  label,
  active,
  onTap,
  onLongPress,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onTap: () => void;
  onLongPress?: () => void;
}) {
  const { theme: t } = useTheme();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const handlePointerDown = useCallback(() => {
    didLongPress.current = false;
    if (onLongPress) {
      timerRef.current = setTimeout(() => {
        didLongPress.current = true;
        onLongPress();
      }, 500);
    }
  }, [onLongPress]);

  const handlePointerUp = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!didLongPress.current) {
      onTap();
    }
  }, [onTap]);

  const handlePointerLeave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className="flex flex-col items-center justify-center gap-2 cursor-pointer active:scale-[0.92] select-none"
      style={{
        flex: 1,
        height: "100px",
        borderRadius: t.radiusLg,
        backgroundColor: active ? t.tileActiveBg : t.tileInactiveBg,
        border: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {icon}
      <span
        style={{
          fontFamily: t.fontFamily,
          fontSize: "13px",
          fontWeight: 700,
          color: active ? t.tileActiveText : t.tileInactiveText,
          letterSpacing: "0.2px",
          textAlign: "center",
          lineHeight: "1.2",
        }}
      >
        {label}
      </span>
    </button>
  );
}

/* ─── Language Picker Inline ─── */
function LanguagePicker({
  selected,
  onSelect,
}: {
  selected: Locale;
  onSelect: (lang: Locale) => void;
}) {
  const { theme: t } = useTheme();
  const options: { key: Locale; label: string; native: string }[] = [
    { key: "en", label: "English", native: "English" },
    { key: "ar", label: "Arabic", native: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
    { key: "ur", label: "Urdu", native: "\u0627\u0631\u062f\u0648" },
  ];

  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const isActive = selected === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            className="flex items-center gap-3 w-full cursor-pointer active:scale-[0.98] transition-transform select-none"
            style={{
              padding: "10px 14px",
              borderRadius: t.radiusLg,
              backgroundColor: isActive ? t.primarySubtle : t.tileInactiveBg,
              border: isActive ? `1.5px solid ${t.borderActive}` : "1.5px solid transparent",
            }}
          >
            <span
              className="flex-1 text-left"
              style={{
                fontFamily: t.fontFamily,
                fontSize: "15px",
                fontWeight: isActive ? 700 : 600,
                color: isActive ? t.primary : t.textHeading,
              }}
            >
              {opt.label}
            </span>
            <span
              style={{
                fontFamily: t.fontFamily,
                fontSize: "13px",
                fontWeight: 500,
                color: t.textMuted,
              }}
            >
              {opt.native}
            </span>
            {isActive && (
              <div
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: t.radiusFull,
                  backgroundColor: t.primary,
                }}
              >
                <Check size={13} style={{ color: t.textInverse }} strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Centered Dialog (reusable for Wi-Fi, Bluetooth, Cast, Clear Data) ─── */
function CenteredDialog({
  children,
  onClose,
  width = 340,
}: {
  children: React.ReactNode;
  onClose: () => void;
  width?: number;
}) {
  const { theme: t } = useTheme();
  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center"
      style={{ animation: "settingsFadeIn 0.15s ease-out" }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: t.overlay }}
        onClick={onClose}
      />
      <div
        className="relative flex flex-col"
        style={{
          width: `${width}px`,
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: t.radiusXl,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 16px 48px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)",
          animation: "castDialogIn 0.2s ease-out",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Dialog Header (reusable) ─── */
function DialogHeader({
  icon,
  title,
  onClose,
}: {
  icon: React.ReactNode;
  title: string;
  onClose: () => void;
}) {
  const { theme: t } = useTheme();
  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: "20px 20px 0 20px" }}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span
          style={{
            fontFamily: t.fontFamily,
            fontSize: "17px",
            fontWeight: 700,
            color: t.textHeading,
          }}
        >
          {title}
        </span>
      </div>
      <button
        onClick={onClose}
        className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
        style={{
          width: "36px",
          height: "36px",
          borderRadius: t.radiusFull,
          backgroundColor: t.tileInactiveBg,
          border: "none",
        }}
      >
        <X size={16} style={{ color: t.textMuted }} />
      </button>
    </div>
  );
}

/* ─── Dialog Section Label ─── */
function DialogSectionLabel({ children }: { children: string }) {
  const { theme: t } = useTheme();
  return (
    <span
      style={{
        fontFamily: t.fontFamily,
        fontSize: "12px",
        fontWeight: 600,
        color: t.textMuted,
        letterSpacing: "0.5px",
        marginBottom: "4px",
      }}
    >
      {children}
    </span>
  );
}

/* ─── Device List Item (reusable for Wi-Fi, Bluetooth, Cast) ─── */
function DeviceListItem({
  icon,
  name,
  subtitle,
  isConnected,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  name: string;
  subtitle: string;
  isConnected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const { theme: t } = useTheme();
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full cursor-pointer active:scale-[0.97] transition-transform select-none"
      style={{
        padding: "12px 14px",
        borderRadius: t.radiusLg,
        backgroundColor: isConnected ? t.primarySubtle : t.tileInactiveBg,
        border: isConnected ? `1.5px solid ${t.borderActive}` : "1.5px solid transparent",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <div
        className="shrink-0 flex items-center justify-center"
        style={{
          width: "36px",
          height: "36px",
          borderRadius: t.radiusMd,
          backgroundColor: isConnected ? t.primarySubtle : t.tileInactiveBg,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 text-left">
        <span
          style={{
            fontFamily: t.fontFamily,
            fontSize: "14px",
            fontWeight: 700,
            color: isConnected ? t.primary : t.textHeading,
            display: "block",
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: t.fontFamily,
            fontSize: "11px",
            fontWeight: 500,
            color: isConnected ? t.primary : t.textMuted,
            display: "block",
            marginTop: "1px",
          }}
        >
          {subtitle}
        </span>
      </div>
      {isConnected && (
        <div
          className="shrink-0 flex items-center justify-center"
          style={{
            width: "22px",
            height: "22px",
            borderRadius: t.radiusFull,
            backgroundColor: t.primary,
          }}
        >
          <Check size={13} style={{ color: t.textInverse }} strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

/* ─── Disconnect Button (reusable) ─── */
function DisconnectButton({ label, onClick }: { label: string; onClick: () => void }) {
  const { theme: t } = useTheme();
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center cursor-pointer active:scale-[0.96] transition-transform"
      style={{
        height: t.touchTargetMin,
        borderRadius: t.radiusMd,
        backgroundColor: "rgba(209,0,68,0.06)",
        marginTop: "8px",
        border: "none",
      }}
    >
      <span
        style={{
          fontFamily: t.fontFamily,
          fontSize: "14px",
          fontWeight: 700,
          color: "#D10044",
        }}
      >
        {label}
      </span>
    </button>
  );
}

/* ─── Scanning State ─── */
function ScanningState({ message }: { message: string }) {
  const { theme: t } = useTheme();
  return (
    <div
      className="flex flex-col items-center justify-center gap-3"
      style={{ padding: "24px 0" }}
    >
      <Loader2
        size={28}
        style={{ color: t.primary, animation: "spin 1s linear infinite" }}
      />
      <span
        style={{
          fontFamily: t.fontFamily,
          fontSize: "14px",
          fontWeight: 600,
          color: t.textMuted,
        }}
      >
        {message}
      </span>
    </div>
  );
}

/* ─── Wi-Fi Dialog ─── */
const wifiNetworks = [
  { id: "dsfh-patient", name: "DSFH-Patient", secured: true, strength: 3 },
  { id: "dsfh-guest", name: "DSFH-Guest", secured: false, strength: 2 },
  { id: "dsfh-staff", name: "DSFH-Staff", secured: true, strength: 3 },
  { id: "eduroam", name: "eduroam", secured: true, strength: 1 },
];

function WifiDialog({
  onClose,
  connectedId,
  onConnect,
  onDisconnect,
}: {
  onClose: () => void;
  connectedId: string | null;
  onConnect: (id: string) => void;
  onDisconnect: () => void;
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLocale();
  const [scanning, setScanning] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setScanning(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CenteredDialog onClose={onClose}>
      <DialogHeader
        icon={<Wifi size={20} style={{ color: t.primary }} />}
        title={tr("settings.wifi")}
        onClose={onClose}
      />
      <div className="flex flex-col" style={{ padding: "16px 20px 20px 20px" }}>
        {scanning ? (
          <ScanningState message={tr("wifi.scanning")} />
        ) : (
          <div className="flex flex-col gap-2">
            <DialogSectionLabel>{tr("wifi.available")}</DialogSectionLabel>
            {wifiNetworks.map((net) => {
              const isConnected = connectedId === net.id;
              return (
                <DeviceListItem
                  key={net.id}
                  icon={<Signal size={18} style={{ color: isConnected ? t.primary : t.iconDefault }} />}
                  name={net.name}
                  subtitle={isConnected ? tr("wifi.connected") : net.secured ? tr("wifi.secured") : tr("wifi.open")}
                  isConnected={isConnected}
                  onClick={() => (isConnected ? onDisconnect() : onConnect(net.id))}
                />
              );
            })}
            {connectedId && (
              <DisconnectButton
                label={tr("settings.disconnect")}
                onClick={() => { onDisconnect(); onClose(); }}
              />
            )}
          </div>
        )}
      </div>
    </CenteredDialog>
  );
}

/* ─── Bluetooth Dialog ─── */
const btDevices = [
  { id: "bt-speaker", name: "Room 412 Speaker", type: "Speaker", icon: Speaker, paired: true },
  { id: "bt-phone", name: "Nurse Call Button", type: "Medical Device", icon: Smartphone, paired: true },
  { id: "bt-headphones", name: "Patient Headphones", type: "Audio", icon: Headphones, paired: true },
  { id: "bt-earbuds", name: "Galaxy Buds Pro", type: "Audio", icon: Headphones, paired: false },
  { id: "bt-speaker2", name: "JBL Flip 6", type: "Speaker", icon: Speaker, paired: false },
  { id: "bt-phone2", name: "iPhone 15", type: "Phone", icon: Smartphone, paired: false },
];

function BluetoothDialog({
  onClose,
  connectedId,
  onConnect,
  onDisconnect,
}: {
  onClose: () => void;
  connectedId: string | null;
  onConnect: (id: string) => void;
  onDisconnect: () => void;
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLocale();
  const [scanning, setScanning] = useState(true);
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setScanning(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  const pairedDevices = btDevices.filter((d) => d.paired);
  const availableDevices = btDevices.filter((d) => !d.paired);

  const filterDevices = (devices: typeof btDevices) =>
    search.trim()
      ? devices.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
      : devices;

  const filteredPaired = filterDevices(pairedDevices);
  const filteredAvailable = filterDevices(availableDevices);

  return (
    <CenteredDialog onClose={onClose}>
      <DialogHeader
        icon={<Bluetooth size={20} style={{ color: t.primary }} />}
        title={tr("settings.bluetooth")}
        onClose={onClose}
      />
      <div className="flex flex-col" style={{ padding: "16px 20px 20px 20px" }}>
        {scanning ? (
          <ScanningState message={tr("bt.searching")} />
        ) : (
          <div className="flex flex-col gap-3">
            {/* Search input */}
            <div
              className="flex items-center gap-2"
              style={{
                padding: "0 12px",
                height: "40px",
                borderRadius: t.radiusMd,
                backgroundColor: t.tileInactiveBg,
                border: `1.5px solid ${t.borderDefault}`,
              }}
            >
              <Search size={16} style={{ color: t.textMuted, flexShrink: 0 }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tr("bt.searchDevices")}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontFamily: t.fontFamily,
                  fontSize: "13px",
                  fontWeight: 500,
                  color: t.textHeading,
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="flex items-center justify-center cursor-pointer"
                  style={{ border: "none", background: "transparent", padding: 0 }}
                >
                  <X size={14} style={{ color: t.textMuted }} />
                </button>
              )}
            </div>

            {/* Paired devices section */}
            {filteredPaired.length > 0 && (
              <div className="flex flex-col gap-2">
                <DialogSectionLabel>{tr("bt.paired")}</DialogSectionLabel>
                {filteredPaired.map((device) => {
                  const isConnected = connectedId === device.id;
                  const DevIcon = device.icon;
                  return (
                    <DeviceListItem
                      key={device.id}
                      icon={<DevIcon size={18} style={{ color: isConnected ? t.primary : t.iconDefault }} />}
                      name={device.name}
                      subtitle={isConnected ? tr("wifi.connected") : tr("bt.pairedStatus")}
                      isConnected={isConnected}
                      onClick={() => (isConnected ? onDisconnect() : onConnect(device.id))}
                    />
                  );
                })}
              </div>
            )}

            {/* Available devices section */}
            {filteredAvailable.length > 0 && (
              <div className="flex flex-col gap-2">
                <DialogSectionLabel>{tr("bt.available")}</DialogSectionLabel>
                {filteredAvailable.map((device) => {
                  const DevIcon = device.icon;
                  return (
                    <DeviceListItem
                      key={device.id}
                      icon={<DevIcon size={18} style={{ color: t.iconDefault }} />}
                      name={device.name}
                      subtitle={device.type}
                      isConnected={false}
                      onClick={() => onConnect(device.id)}
                    />
                  );
                })}
              </div>
            )}

            {/* No results */}
            {filteredPaired.length === 0 && filteredAvailable.length === 0 && (
              <div
                className="flex flex-col items-center justify-center gap-2"
                style={{ padding: "20px 0" }}
              >
                <Search size={24} style={{ color: t.textDisabled }} />
                <span
                  style={{
                    fontFamily: t.fontFamily,
                    fontSize: "13px",
                    fontWeight: 500,
                    color: t.textMuted,
                  }}
                >
                  {tr("bt.noMatch", search)}
                </span>
              </div>
            )}

            {connectedId && (
              <DisconnectButton
                label={tr("settings.disconnect")}
                onClick={() => { onDisconnect(); onClose(); }}
              />
            )}
          </div>
        )}
      </div>
    </CenteredDialog>
  );
}

/* ─── Cast Dialog ─── */
const castDevices = [
  { id: "tv-412", name: "Room 412 TV", type: "Smart TV", available: true },
  { id: "tv-lobby", name: "Lobby Display", type: "Digital Signage", available: false },
];

function CastDialog({
  onClose,
  connectedId,
  onConnect,
  onDisconnect,
}: {
  onClose: () => void;
  connectedId: string | null;
  onConnect: (id: string) => void;
  onDisconnect: () => void;
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLocale();
  const [scanning, setScanning] = useState(false);
  useEffect(() => {
    if (!connectedId) {
      setScanning(true);
      const timer = setTimeout(() => setScanning(false), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <CenteredDialog onClose={onClose}>
      <DialogHeader
        icon={<Cast size={20} style={{ color: t.primary }} />}
        title={tr("settings.castScreen")}
        onClose={onClose}
      />
      <div className="flex flex-col" style={{ padding: "16px 20px 20px 20px" }}>
        {scanning ? (
          <ScanningState message={tr("cast.looking")} />
        ) : (
          <div className="flex flex-col gap-2">
            <DialogSectionLabel>{tr("bt.available")}</DialogSectionLabel>
            {castDevices.map((device) => {
              const isConnected = connectedId === device.id;
              return (
                <DeviceListItem
                  key={device.id}
                  icon={<Tv size={18} style={{ color: isConnected ? t.primary : t.iconDefault }} />}
                  name={device.name}
                  subtitle={isConnected ? tr("wifi.connected") : device.available ? device.type : tr("cast.unavailable")}
                  isConnected={isConnected}
                  disabled={!device.available}
                  onClick={() => {
                    if (!device.available) return;
                    isConnected ? onDisconnect() : onConnect(device.id);
                  }}
                />
              );
            })}
            {connectedId && (
              <DisconnectButton
                label={tr("settings.stopCasting")}
                onClick={() => { onDisconnect(); onClose(); }}
              />
            )}
          </div>
        )}
      </div>
    </CenteredDialog>
  );
}

/* ─── Clear Data Confirmation Dialog ─── */
function ClearDataDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLocale();
  const items = [
    tr("settings.clearData.signOut"),
    tr("settings.clearData.history"),
    tr("settings.clearData.passwords"),
    tr("settings.clearData.reset"),
  ];

  const DANGER = "#D10044";
  const DANGER_SUBTLE = "rgba(209,0,68,0.06)";
  const DANGER_BORDER = "rgba(209,0,68,0.12)";

  return (
    <CenteredDialog onClose={onClose} width={380}>
      <div
        className="flex flex-col items-center"
        style={{ padding: "28px 24px 8px 24px" }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: t.radiusLg,
            backgroundColor: DANGER_SUBTLE,
            marginBottom: "16px",
          }}
        >
          <AlertTriangle size={28} style={{ color: DANGER }} />
        </div>
        <span
          style={{
            fontFamily: t.fontFamily,
            fontSize: "18px",
            fontWeight: 700,
            color: t.textHeading,
            textAlign: "center",
          }}
        >
          {tr("settings.clearData.question")}
        </span>
        <span
          style={{
            fontFamily: t.fontFamily,
            fontSize: "13px",
            fontWeight: 500,
            color: t.textMuted,
            textAlign: "center",
            marginTop: "8px",
            lineHeight: "20px",
          }}
        >
          {tr("settings.clearData.desc")}
        </span>
      </div>

      {/* What will be cleared */}
      <div style={{ padding: "16px 24px" }}>
        <div
          className="flex flex-col gap-2"
          style={{
            padding: "14px 16px",
            borderRadius: t.radiusLg,
            backgroundColor: DANGER_SUBTLE,
            border: `1px solid ${DANGER_BORDER}`,
          }}
        >
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className="shrink-0 mt-0.5"
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: t.radiusFull,
                  backgroundColor: DANGER,
                  opacity: 0.5,
                }}
              />
              <span
                style={{
                  fontFamily: t.fontFamily,
                  fontSize: "12px",
                  fontWeight: 600,
                  color: t.textMuted,
                  lineHeight: "18px",
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div
        className="flex gap-3"
        style={{ padding: "8px 24px 24px 24px" }}
      >
        <button
          onClick={onClose}
          className="flex-1 flex items-center justify-center cursor-pointer active:scale-[0.96] transition-transform"
          style={{
            height: "48px",
            borderRadius: t.radiusLg,
            backgroundColor: t.tileInactiveBg,
            border: "none",
          }}
        >
          <span
            style={{
              fontFamily: t.fontFamily,
              fontSize: "15px",
              fontWeight: 700,
              color: t.textHeading,
            }}
          >
            {tr("general.cancel")}
          </span>
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 flex items-center justify-center cursor-pointer active:scale-[0.96] transition-transform"
          style={{
            height: "48px",
            borderRadius: t.radiusLg,
            backgroundColor: DANGER,
            border: "none",
            boxShadow: `0 4px 16px ${DANGER_SUBTLE}`,
          }}
        >
          <span
            style={{
              fontFamily: t.fontFamily,
              fontSize: "15px",
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            {tr("settings.clearData")}
          </span>
        </button>
      </div>
    </CenteredDialog>
  );
}

/* ─── Language Dialog ─── */
function LanguageDialog({
  onClose,
  selected,
  onSelect,
}: {
  onClose: () => void;
  selected: "en" | "ar";
  onSelect: (lang: "en" | "ar") => void;
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLocale();
  return (
    <CenteredDialog onClose={onClose}>
      <DialogHeader
        icon={<Globe size={20} style={{ color: t.primary }} />}
        title={tr("settings.language")}
        onClose={onClose}
      />
      <div className="flex flex-col" style={{ padding: "16px 20px 20px 20px" }}>
        <span
          style={{
            fontFamily: t.fontFamily,
            fontSize: "13px",
            fontWeight: 500,
            color: t.textMuted,
            marginBottom: "12px",
          }}
        >
          {tr("settings.language.select")}
        </span>
        <LanguagePicker
          selected={selected}
          onSelect={(lang) => {
            onSelect(lang);
            onClose();
          }}
        />
      </div>
    </CenteredDialog>
  );
}

/* ─── Care Team Access PIN Dialog ─── */
function CareTeamAccessDialog({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void; 
  onSuccess: (role: "nurse" | "doctor") => void;
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLocale();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length < 4) {
      const newPin = pin + d;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        if (newPin === "2580") {
          onSuccess("nurse");
          onClose();
        } else if (newPin === "0000") {
          onSuccess("doctor");
          onClose();
        } else {
          setTimeout(() => {
            setError(true);
            setPin("");
          }, 300);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  return (
    <CenteredDialog onClose={onClose} width={320}>
      <div
        className="flex flex-col items-center"
        style={{ padding: "28px 24px 8px 24px" }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: t.radiusLg,
            backgroundColor: "#E0F2FE",
            marginBottom: "16px",
          }}
        >
          <Stethoscope size={28} style={{ color: t.primary }} />
        </div>
        <span
          style={{
            fontFamily: t.fontFamily,
            fontSize: "18px",
            fontWeight: 700,
            color: t.textHeading,
            textAlign: "center",
          }}
        >
          {tr("careteam.title")}
        </span>
        <span
          style={{
            fontFamily: t.fontFamily,
            fontSize: "13px",
            fontWeight: 500,
            color: error ? t.accent : t.textMuted,
            textAlign: "center",
            marginTop: "8px",
            lineHeight: "20px",
            transition: "color 0.2s",
          }}
        >
          {error ? tr("careteam.incorrect") : tr("careteam.enterPin")}
        </span>
      </div>

      {/* PIN dots */}
      <div className="flex items-center justify-center gap-4" style={{ padding: "20px 0 16px 0" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: "16px",
              height: "16px",
              borderRadius: t.radiusFull,
              backgroundColor: i < pin.length ? t.accent : t.borderDefault,
              transition: "background-color 0.15s",
              animation: error ? "pinShake 0.4s ease-out" : undefined,
            }}
          />
        ))}
      </div>

      {/* Numpad */}
      <div
        className="flex flex-col items-center gap-3"
        style={{ padding: "8px 32px 24px 32px" }}
      >
        {[
          ["1", "2", "3"],
          ["4", "5", "6"],
          ["7", "8", "9"],
          ["", "0", "del"],
        ].map((row, ri) => (
          <div key={ri} className="flex items-center gap-3">
            {row.map((key, ki) => {
              if (key === "") return <div key={ki} style={{ width: "64px", height: "52px" }} />;
              return (
                <button
                  key={ki}
                  onClick={() => (key === "del" ? handleDelete() : handleDigit(key))}
                  className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                  style={{
                    width: "64px",
                    height: "52px",
                    borderRadius: t.radiusLg,
                    backgroundColor: key === "del" ? t.accentSubtle : t.tileInactiveBg,
                    border: "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: t.fontFamily,
                      fontSize: key === "del" ? "13px" : "20px",
                      fontWeight: 700,
                      color: key === "del" ? t.accent : t.textHeading,
                    }}
                  >
                    {key === "del" ? tr("careteam.del") : key}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </CenteredDialog>
  );
}

/* ─── Upcoming Prayer Card ─── */
function PrayerCard({
  prayerData,
  countdown,
  prayerAlarm,
  onToggleAlarm,
}: {
  prayerData: ReturnType<typeof getPrayerStatus>;
  countdown: string;
  prayerAlarm: boolean;
  onToggleAlarm: () => void;
}) {
  const { theme: t } = useTheme();
  const { t: tr, isRTL, fontFamily, locale } = useLocale();
  return (
    <div
      style={{
        borderRadius: t.radiusLg,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Gradient background — uses theme's feature gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: t.primary,
        }}
      />
      {/* Subtle pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          background:
            "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.8) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.6) 0%, transparent 40%)",
        }}
      />
      <div
        className="relative flex items-center gap-4"
        style={{ padding: "16px 18px" }}
      >
        {/* Left: Mosque icon + prayer info */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className="shrink-0 flex items-center justify-center"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: t.radiusFull,
                overflow: "hidden",
              }}
            >
              <img
                src={imgMosque}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <span
              style={{
                fontFamily: t.fontFamily,
                fontSize: "11px",
                fontWeight: 700,
                color: t.textInverseMuted,
                letterSpacing: "1.2px",
              }}
            >
              {tr("prayer.upcoming")}
            </span>
          </div>
          <div className="flex items-baseline gap-3" style={{ paddingLeft: "2px" }}>
            <span
              style={{
                fontFamily: t.fontFamily,
                fontSize: "24px",
                fontWeight: 700,
                color: t.textInverse,
                letterSpacing: "-0.5px",
              }}
            >
              {tr(PRAYER_NAMES[prayerData.next])}
            </span>
            <span
              style={{
                fontFamily: t.fontFamily,
                fontSize: "20px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "0.5px",
                fontVariantNumeric: "tabular-nums",
                marginLeft: "4px",
              }}
            >
              {formatPrayerTime(prayerData.targetTime, locale)}
            </span>
          </div>
        </div>

        {/* Right: Countdown + Alarm checkbox */}
        <div className="shrink-0 flex flex-col items-end gap-3">
          <div className="flex items-center gap-1.5">
            <Clock size={14} style={{ color: t.textInverseMuted }} />
            <span
              style={{
                fontFamily: t.fontFamily,
                fontSize: "20px",
                fontWeight: 700,
                color: t.textInverse,
                letterSpacing: "0.5px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {countdown}
            </span>
          </div>
          <button
            onClick={onToggleAlarm}
            className="flex items-center gap-2 cursor-pointer active:scale-[0.95] transition-transform"
            style={{
              padding: "6px 12px 6px 10px",
              borderRadius: t.radiusMd,
              backgroundColor: prayerAlarm
                ? "rgba(255,255,255,0.25)"
                : "rgba(255,255,255,0.1)",
              border: prayerAlarm
                ? "1.5px solid rgba(255,255,255,0.5)"
                : "1.5px solid rgba(255,255,255,0.2)",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: t.radiusSm,
                backgroundColor: prayerAlarm ? t.textInverse : "transparent",
                border: prayerAlarm ? "none" : "2px solid rgba(255,255,255,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              {prayerAlarm && (
                <Check size={13} style={{ color: t.primary }} strokeWidth={3} />
              )}
            </div>
            <span
              style={{
                fontFamily: t.fontFamily,
                fontSize: "13px",
                fontWeight: 700,
                color: t.textInverse,
                whiteSpace: "nowrap",
              }}
            >
              {tr("prayer.alarmMe")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Action Button (Language, Admin — opens dialogs, not toggles) ─── */
function ActionButton({
  icon,
  label,
  subtitle,
  variant,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle: string;
  variant: "primary" | "accent" | "destructive";
  onClick: () => void;
}) {
  const { theme: t } = useTheme();
  const { isRTL } = useLocale();
  const DESTRUCTIVE = "#D10044";
  const DESTRUCTIVE_SUBTLE = "rgba(209,0,68,0.06)";
  const DESTRUCTIVE_BORDER = "rgba(209,0,68,0.18)";

  const bg = variant === "primary" ? t.primarySubtle : variant === "destructive" ? DESTRUCTIVE_SUBTLE : t.accentSubtle;
  const border = variant === "primary"
    ? `1.5px solid ${t.borderActive}33`
    : variant === "destructive"
    ? `1.5px solid ${DESTRUCTIVE_BORDER}`
    : `1.5px solid ${t.borderAccent}`;
  const iconBg = variant === "primary" ? t.primarySubtle : variant === "destructive" ? DESTRUCTIVE_SUBTLE : t.accentSubtle;
  const labelColor = variant === "destructive" ? DESTRUCTIVE : t.textHeading;
  const subtitleColor = variant === "destructive" ? "rgba(209,0,68,0.6)" : t.textMuted;

  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform"
      style={{
        padding: "14px 16px",
        borderRadius: t.radiusLg,
        backgroundColor: bg,
        border,
      }}
    >
      <div
        className="shrink-0 flex items-center justify-center"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: t.radiusMd,
          backgroundColor: iconBg,
        }}
      >
        {icon}
      </div>
      <div className="flex-1" style={{ textAlign: isRTL ? "right" : "left" }}>
        <span
          style={{
            fontFamily: t.fontFamily,
            fontSize: "14px",
            fontWeight: 700,
            color: labelColor,
            display: "block",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: t.fontFamily,
            fontSize: "11px",
            fontWeight: 500,
            color: subtitleColor,
            display: "block",
            marginTop: "1px",
          }}
        >
          {subtitle}
        </span>
      </div>
      <ChevronRight size={16} style={{ color: variant === "destructive" ? "rgba(209,0,68,0.35)" : t.textDisabled, transform: isRTL ? "scaleX(-1)" : undefined }} />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
 * MAIN SETTINGS PANEL
 * ═══════════════════════════════════════════════════════════════ */
export function SettingsPanel({
  onClose,
  onFullscreenTap,
  isFullscreen,
}: {
  onClose: () => void;
  onFullscreenTap: () => void;
  isFullscreen: boolean;
}) {
  const { theme: t, darkMode, setDarkMode, castDevice, setCastDevice, locale: currentLocale, setLocale, prayerAlarm, setPrayerAlarm } = useTheme();
  const { t: tr, isRTL, fontFamily, locale } = useLocale();

  const [brightness, setBrightness] = useState(80);
  const [volume, setVolume] = useState(60);
  const [wifi, setWifi] = useState(true);
  const [wifiNetwork, setWifiNetwork] = useState<string | null>("dsfh-patient");
  const [bluetooth, setBluetooth] = useState(true);
  const [btDevice, setBtDevice] = useState<string | null>("bt-speaker");
  const [dnd, setDnd] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [selectedLang, setSelectedLang] = useState<"en" | "ar" | "ur">(currentLocale);

  // Prayer countdown timer
  const [prayerData, setPrayerData] = useState(() => getPrayerStatus(new Date()));
  const [countdown, setCountdown] = useState(() => getCountdown(new Date(), getPrayerStatus(new Date()).targetTime));

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const status = getPrayerStatus(now);
      setPrayerData(status);
      setCountdown(getCountdown(now, status.targetTime));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dialog states
  const [showWifiDialog, setShowWifiDialog] = useState(false);
  const [showBtDialog, setShowBtDialog] = useState(false);
  const [showCastDialog, setShowCastDialog] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLangDialog, setShowLangDialog] = useState(false);
  const [showCareTeamDialog, setShowCareTeamDialog] = useState(false);
  const [activeCareRole, setActiveCareRole] = useState<"nurse" | "doctor" | null>(null);

  // Get connected names for subtitles
  const connectedCastName = castDevice
    ? castDevices.find((d) => d.id === castDevice)?.name
    : null;

  return (
    <div
      className="absolute inset-0 z-50 flex justify-end"
      style={{ animation: "settingsFadeIn 0.2s ease-out" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: t.overlay }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative h-full flex flex-col"
        style={{
          width: "480px",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          backgroundColor: t.panelBg,
          [isRTL ? "borderRight" : "borderLeft"]: `1px solid ${t.borderSubtle}`,
          boxShadow: `${isRTL ? "8px" : "-8px"} 0 40px rgba(0,0,0,0.12)`,
          animation: "settingsSlideIn 0.25s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="shrink-0 flex items-center justify-between"
          style={{ padding: "24px 24px 16px 24px" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{
                width: t.touchTargetMin,
                height: t.touchTargetMin,
                borderRadius: t.radiusMd,
                backgroundColor: t.primarySubtle,
              }}
            >
              <Settings size={22} style={{ color: t.primary }} />
            </div>
            <span
              style={{
                fontFamily: t.fontFamily,
                fontSize: "22px",
                fontWeight: 700,
                color: t.textHeading,
                letterSpacing: "-0.3px",
              }}
            >
              {tr("settings.title")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onFullscreenTap}
              className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: t.radiusLg,
                backgroundColor: t.tileInactiveBg,
                border: "none",
              }}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize size={22} style={{ color: t.primary }} />
              ) : (
                <Maximize size={22} style={{ color: t.primary }} />
              )}
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: t.radiusLg,
                backgroundColor: t.tileInactiveBg,
                border: "none",
              }}
            >
              <X size={22} style={{ color: t.textMuted }} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 flex flex-col gap-5"
          style={{
            padding: "8px 24px 24px 24px",
            overflowY: "auto",
            scrollbarWidth: "none",
          }}
        >
          {/* Upcoming Prayer */}
          <PrayerCard
            prayerData={prayerData}
            countdown={countdown}
            prayerAlarm={prayerAlarm}
            onToggleAlarm={() => setPrayerAlarm(!prayerAlarm)}
          />

          {/* Brightness */}
          <SettingsSlider
            icon={<Sun size={20} style={{ color: t.iconBrand }} />}
            label={tr("settings.brightness")}
            value={brightness}
            onChange={setBrightness}
          />

          <div style={{ height: "1px", backgroundColor: t.borderDefault }} />

          {/* Volume */}
          <SettingsSlider
            icon={<Volume2 size={20} style={{ color: t.iconBrand }} />}
            label={tr("settings.volume")}
            value={volume}
            onChange={setVolume}
          />

          <div style={{ height: "1px", backgroundColor: t.borderDefault }} />

          {/* Quick Settings Toggle Tiles — 3x2 grid */}
          <div className="flex flex-col gap-2.5">
            {/* Row 1: Connectivity */}
            <div className="flex items-center justify-center gap-2.5">
              <QuickTile
                icon={<Wifi size={24} style={{ color: wifi ? t.tileActiveText : t.iconDefault }} />}
                label={tr("settings.wifi")}
                active={wifi}
                onTap={() => {
                  if (wifi) {
                    setWifi(false);
                    setWifiNetwork(null);
                  } else {
                    setWifi(true);
                    setWifiNetwork("dsfh-patient");
                  }
                }}
                onLongPress={() => setShowWifiDialog(true)}
              />
              <QuickTile
                icon={<Bluetooth size={24} style={{ color: bluetooth ? t.tileActiveText : t.iconDefault }} />}
                label={tr("settings.bluetooth")}
                active={bluetooth}
                onTap={() => {
                  if (bluetooth) {
                    setBluetooth(false);
                    setBtDevice(null);
                  } else {
                    setBluetooth(true);
                  }
                }}
                onLongPress={() => setShowBtDialog(true)}
              />
              <QuickTile
                icon={<Cast size={24} style={{ color: castDevice ? t.tileActiveText : t.iconDefault }} />}
                label={tr("settings.cast")}
                active={!!castDevice}
                onTap={() => setShowCastDialog(true)}
              />
            </div>
            {/* Row 2: Modes */}
            <div className="flex items-center justify-center gap-2.5">
              <QuickTile
                icon={<BellOff size={24} style={{ color: dnd ? t.tileActiveText : t.iconDefault }} />}
                label={tr("settings.dnd")}
                active={dnd}
                onTap={() => setDnd(!dnd)}
              />
              <QuickTile
                icon={<Sun size={24} style={{ color: nightMode ? t.tileActiveText : t.iconDefault }} />}
                label={tr("settings.nightLight")}
                active={nightMode}
                onTap={() => setNightMode(!nightMode)}
              />
              <QuickTile
                icon={<Monitor size={24} style={{ color: darkMode ? t.tileActiveText : t.iconDefault }} />}
                label={tr("settings.darkMode")}
                active={darkMode}
                onTap={() => setDarkMode(!darkMode)}
              />
            </div>

            {/* Status line */}
            {castDevice && connectedCastName && (
              null
            )}
          </div>

          <div style={{ height: "1px", backgroundColor: t.borderDefault }} />

          {/* Action Buttons — Language & Admin (open dialogs, not toggles) */}
          <div className="flex items-center gap-2.5">
            <ActionButton
              icon={<Globe size={20} style={{ color: t.primary }} />}
              label={tr("settings.language")}
              subtitle={selectedLang === "en" ? "English" : "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"}
              variant="primary"
              onClick={() => setShowLangDialog(true)}
            />
            <ActionButton
              icon={<Stethoscope size={20} style={{ color: "#D10044" }} />}
              label={tr("settings.careTeam")}
              subtitle={tr("settings.careTeam.subtitle")}
              variant="destructive"
              onClick={() => setShowCareTeamDialog(true)}
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Clear Data */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center justify-center gap-3 w-full cursor-pointer active:scale-[0.96] transition-transform"
            style={{
              height: "56px",
              flexShrink: 0,
              borderRadius: t.radiusLg,
              backgroundColor: "#D10044",
              boxShadow: "0 4px 16px rgba(209,0,68,0.15)",
              border: "none",
            }}
          >
            <Trash2 size={20} style={{ color: "#FFFFFF" }} />
            <span
              style={{
                fontFamily: t.fontFamily,
                fontSize: "16px",
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              {tr("settings.clearData")}
            </span>
          </button>

          {/* Room & Device info */}
          <div
            className="flex flex-col items-center gap-1"
            style={{ padding: "8px 0 4px 0" }}
          >
            <span
              style={{
                fontFamily: t.fontFamily,
                fontSize: "12px",
                fontWeight: 600,
                color: t.textMuted,
              }}
            >
              Room 412 &middot; Bed A
            </span>
            <span
              style={{
                fontFamily: t.fontFamily,
                fontSize: "11px",
                fontWeight: 500,
                color: t.textDisabled,
              }}
            >
              Device ID: {t.hospitalShortName}-BT-412A &middot; v2.4.1
            </span>
            <span
              style={{
                fontFamily: t.fontFamily,
                fontSize: "11px",
                fontWeight: 500,
                color: t.textDisabled,
              }}
            >
              IP: 10.10.42.118
            </span>
          </div>
        </div>
      </div>

      {/* ─── Dialogs ─── */}
      {showWifiDialog && (
        <WifiDialog
          onClose={() => setShowWifiDialog(false)}
          connectedId={wifiNetwork}
          onConnect={(id) => { setWifi(true); setWifiNetwork(id); }}
          onDisconnect={() => { setWifiNetwork(null); setWifi(false); }}
        />
      )}

      {showBtDialog && (
        <BluetoothDialog
          onClose={() => setShowBtDialog(false)}
          connectedId={btDevice}
          onConnect={(id) => { setBluetooth(true); setBtDevice(id); }}
          onDisconnect={() => setBtDevice(null)}
        />
      )}

      {showCastDialog && (
        <CastDialog
          onClose={() => setShowCastDialog(false)}
          connectedId={castDevice}
          onConnect={(id) => setCastDevice(id)}
          onDisconnect={() => { setCastDevice(null); setShowCastDialog(false); }}
        />
      )}

      {showClearConfirm && (
        <ClearDataDialog
          onClose={() => setShowClearConfirm(false)}
          onConfirm={() => setShowClearConfirm(false)}
        />
      )}

      {showLangDialog && (
        <LanguageDialog
          onClose={() => setShowLangDialog(false)}
          selected={selectedLang}
          onSelect={(lang) => { setSelectedLang(lang); setLocale(lang); }}
        />
      )}

      {showCareTeamDialog && (
        <CareTeamAccessDialog 
          onClose={() => setShowCareTeamDialog(false)} 
          onSuccess={(role) => setActiveCareRole(role)}
        />
      )}

      {activeCareRole && (
        <CareTeamInterface 
          role={activeCareRole} 
          onClose={() => setActiveCareRole(null)} 
        />
      )}

      <style>{`
        @keyframes settingsFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes settingsSlideIn {
          from { transform: translateX(${isRTL ? "-100%" : "100%"}); }
          to { transform: translateX(0); }
        }
        @keyframes castDialogIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pinShake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          50% { transform: translateX(4px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}