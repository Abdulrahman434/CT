import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { useLocale } from "./i18n";
import { setAccount, getAccount, updateNfcCard, clearAccount, verifyPin } from "../lib/accountAuth";
import { useNfcTap } from "../utils/nfc";
import { X, CheckCircle, Shield, AlertCircle, Trash2, ChevronRight, Globe, Layout, Settings, Image, Check } from "lucide-react";
import { ApiImage } from "./ApiImage";
import { getApiConfig, saveApiConfig, isCustomConfig, resetApiConfig, SECONDARY_OPTION } from "../lib/apiConfig";
import { fetchAllWallpapers, WallpaperGroup } from "../lib/hospitalApi";
import { proxyImageUrls } from "../lib/imageProxy";
import {
  getSavedHeroImage, saveHeroImage, clearSavedHeroImage,
  isSlideshowEnabled, setSlideshowEnabled,
} from "../lib/backgroundPrefs";

type Step =
  | 'menu'
  | 'overview'
  | 'setup-pin1'
  | 'setup-pin2'
  | 'setup-pin-mismatch'
  | 'nfc-prompt'
  | 'nfc-tap1'
  | 'nfc-tap2'
  | 'nfc-mismatch'
  | 'verify-current-pin'
  | 'remove-confirm'
  | 'success'
  | 'server'
  | 'admin-login'
  | 'admin-controls'
  | 'backgrounds'
  | 'layout-mode';

type PendingAction = 'reset-pin' | 'reset-nfc' | 'remove-account' | 'admin-login' | null;

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

function DialogHeader({
  icon,
  title,
  onClose,
  onBack,
}: {
  icon?: React.ReactNode;
  title: string;
  onClose?: () => void;
  onBack?: () => void;
}) {
  const { theme: t } = useTheme();
  const { isRTL } = useLocale();
  return (
    <div
      className="flex items-center justify-between"
      style={{ padding: "20px 20px 0 20px" }}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: t.radiusFull,
              backgroundColor: t.tileInactiveBg,
              border: "none",
            }}
          >
            <ChevronRight size={20} style={{ color: t.textHeading, transform: isRTL ? '' : 'rotate(180deg)' }} />
          </button>
        )}
        {!onBack && icon}
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
      {onClose && (
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
      )}
    </div>
  );
}

export function PinKeypad({
  pin,
  setPin,
  error,
  onComplete,
}: {
  pin: string;
  setPin: React.Dispatch<React.SetStateAction<string>>;
  error: boolean;
  onComplete: (completedPin: string) => void;
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLocale();

  const handleDigit = (d: string) => {
    if (pin.length < 4) {
      const newPin = pin + d;
      setPin(newPin);
      if (newPin.length === 4) {
        onComplete(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
  };

  return (
    <>
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
    </>
  );
}

export function MyPreferencesDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { theme: t } = useTheme();
  const { t: tr, isRTL } = useLocale();
  const [step, setStep] = useState<Step>('menu');
  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [error, setError] = useState(false);
  const [nfcUid1, setNfcUid1] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [verifyPinVal, setVerifyPinVal] = useState("");
  const [layoutModeValue, setLayoutModeValue] = useState<1 | 2 | 3>(() => {
    try {
      const v = localStorage.getItem('careinn-layout-mode');
      return v === '2' ? 2 : v === '3' ? 3 : 1;
    } catch {
      return 1;
    }
  });

  // Server Config state
  const [serverIp, setServerIp] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [adminPin, setAdminPin] = useState("");
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  const account = getAccount();

  useEffect(() => {
    if (open) {
      setStep('menu');
      setPin1("");
      setPin2("");
      setError(false);
      setNfcUid1(null);
      setPendingAction(null);
      setVerifyPinVal("");
      setIsAdminUnlocked(false);

      const config = getApiConfig();
      setServerIp(config.serverIp);
      setApiKey(config.apiKey);
      setLayoutModeValue((() => { const v = localStorage.getItem('careinn-layout-mode'); return v === '2' ? 2 : v === '3' ? 3 : 1; })());
    }
  }, [open]);

  useNfcTap((uid) => {
    if (step === 'nfc-tap1') {
      setNfcUid1(uid);
      setStep('nfc-tap2');
    } else if (step === 'nfc-tap2') {
      if (uid === nfcUid1) {
        if (getAccount()) {
          updateNfcCard(uid).then(() => setStep('success'));
        } else {
          setAccount(pin1, uid).then(() => setStep('success'));
        }
      } else {
        setStep('nfc-mismatch');
        setTimeout(() => {
          setStep('nfc-tap1');
          setNfcUid1(null);
        }, 1500);
      }
    }
  }, step === 'nfc-tap1' || step === 'nfc-tap2');

  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        setStep('menu');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  function isValidServerUrl(s: string): boolean {
    // Allows IP, DNS, and optional http/https prefix. Also rejects empty spaces.
    return s.trim().length > 0 && !/\s/.test(s) && /^(https?:\/\/)?([a-zA-Z0-9.-]+)(:[0-9]+)?(\/.*)?$/.test(s);
  }

  const handleSaveServer = () => {
    if (!isValidServerUrl(serverIp) || !apiKey.trim()) {
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }
    saveApiConfig({ serverIp, apiKey });
    window.location.reload();
  };

  const handleResetServer = () => {
    resetApiConfig();
    window.location.reload();
  };

  const saveLayoutMode = (mode: 1 | 2 | 3) => {
    try {
      localStorage.setItem('careinn-layout-mode', mode.toString());
    } catch {
      // ignore storage errors
    }
    setLayoutModeValue(mode);
    window.dispatchEvent(new Event('layout-mode-changed'));
  };

  if (!open) return null;

  const renderContent = () => {
    switch (step) {
      case 'menu': {
        const isCustom = isCustomConfig();
        const apiConfig = getApiConfig();
        return (
          <div className="flex flex-col" style={{ padding: "16px 20px 24px" }}>
            <div className="flex flex-col gap-2">
              {/* SECTION 1: Password */}
              <button
                onClick={() => {
                  if (getAccount()) {
                    setStep('overview');
                  } else {
                    setStep('setup-pin1');
                  }
                }}
                className="flex items-center gap-3 w-full text-left cursor-pointer active:scale-[0.98] transition-transform"
                style={{ padding: "16px", borderRadius: t.radiusLg, backgroundColor: t.tileInactiveBg, border: "none" }}
              >
                <div style={{ padding: "8px", borderRadius: t.radiusMd, backgroundColor: t.primarySubtle }}>
                  <Shield size={20} style={{ color: t.primary }} />
                </div>
                <div className="flex flex-col flex-1">
                  <span style={{ fontFamily: t.fontFamily, fontSize: "15px", fontWeight: 700, color: t.textHeading }}>
                    Password
                  </span>
                  <span style={{ fontFamily: t.fontFamily, fontSize: "13px", color: t.textMuted }}>
                    {getAccount() ? "Manage PIN & NFC" : "Set / Change PIN"}
                  </span>
                </div>
                <ChevronRight size={20} style={{ color: t.textMuted, transform: isRTL ? 'rotate(180deg)' : '' }} />
              </button>

              {/* SECTION 2: Server */}
              <button
                onClick={() => isAdminUnlocked && setStep('server')}
                className={`flex items-center gap-3 w-full text-left transition-transform ${isAdminUnlocked ? 'cursor-pointer active:scale-[0.98]' : ''}`}
                style={{ padding: "16px", borderRadius: t.radiusLg, backgroundColor: t.tileInactiveBg, border: "none", opacity: isAdminUnlocked ? 1 : 0.5 }}
              >
                <div style={{ padding: "8px", borderRadius: t.radiusMd, backgroundColor: t.primarySubtle }}>
                  <Globe size={20} style={{ color: t.primary }} />
                </div>
                <div className="flex flex-col flex-1">
                  <span style={{ fontFamily: t.fontFamily, fontSize: "15px", fontWeight: 700, color: t.textHeading }}>
                    Server
                  </span>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: t.fontFamily, fontSize: "13px", color: isCustom ? t.primary : t.textMuted }}>
                      {isAdminUnlocked ? apiConfig.serverIp : "Requires Admin"}
                    </span>
                    {isCustom && isAdminUnlocked && <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: t.primary }} />}
                  </div>
                </div>
                <ChevronRight size={20} style={{ color: t.textMuted, transform: isRTL ? 'rotate(180deg)' : '' }} />
              </button>

              {/* SECTION 3: Backgrounds */}
              <button
                onClick={() => setStep('backgrounds')}
                className="flex items-center gap-3 w-full text-left cursor-pointer active:scale-[0.98] transition-transform"
                style={{ padding: "16px", borderRadius: t.radiusLg, backgroundColor: t.tileInactiveBg, border: "none" }}
              >
                <div style={{ padding: "8px", borderRadius: t.radiusMd, backgroundColor: t.primarySubtle }}>
                  <Image size={20} style={{ color: t.primary }} />
                </div>
                <div className="flex flex-col flex-1">
                  <span style={{ fontFamily: t.fontFamily, fontSize: "15px", fontWeight: 700, color: t.textHeading }}>
                    {tr("prefs.backgrounds")}
                  </span>
                  <span style={{ fontFamily: t.fontFamily, fontSize: "13px", color: t.textMuted }}>
                    {getSavedHeroImage() ? tr("prefs.backgrounds.custom") : (isSlideshowEnabled() ? tr("prefs.backgrounds.slideshow") : tr("prefs.backgrounds.default"))}
                  </span>
                </div>
                <ChevronRight size={20} style={{ color: t.textMuted, transform: isRTL ? 'rotate(180deg)' : '' }} />
              </button>

              {/* SECTION 4: Layout Mode */}
              <button
                onClick={() => setStep('layout-mode')}
                className="flex items-center gap-3 w-full text-left cursor-pointer active:scale-[0.98] transition-transform"
                style={{ padding: "16px", borderRadius: t.radiusLg, backgroundColor: t.tileInactiveBg, border: "none" }}
              >
                <div style={{ padding: "8px", borderRadius: t.radiusMd, backgroundColor: t.primarySubtle }}>
                  <Layout size={20} style={{ color: t.primary }} />
                </div>
                <div className="flex flex-col flex-1">
                  <span style={{ fontFamily: t.fontFamily, fontSize: "15px", fontWeight: 700, color: t.textHeading }}>
                    Layout Mode
                  </span>
                  <span style={{ fontFamily: t.fontFamily, fontSize: "13px", color: t.textMuted }}>
                    {layoutModeValue === 1 ? 'Layout 1 selected' : layoutModeValue === 2 ? 'Layout 2 selected' : 'Layout 3 selected'}
                  </span>
                </div>
                <ChevronRight size={20} style={{ color: t.textMuted, transform: isRTL ? 'rotate(180deg)' : '' }} />
              </button>

              {/* SECTION 5: Admin Settings */}
              <button
                onClick={() => {
                  if (isAdminUnlocked) {
                    setStep('admin-controls');
                  } else {
                    setVerifyPinVal("");
                    setError(false);
                    setPendingAction('admin-login');
                    setStep('verify-current-pin');
                  }
                }}
                className="flex items-center gap-3 w-full text-left cursor-pointer active:scale-[0.98] transition-transform"
                style={{ padding: "16px", borderRadius: t.radiusLg, backgroundColor: t.tileInactiveBg, border: "none" }}
              >
                <div style={{ padding: "8px", borderRadius: t.radiusMd, backgroundColor: t.primarySubtle }}>
                  <Settings size={20} style={{ color: t.primary }} />
                </div>
                <div className="flex flex-col flex-1">
                  <span style={{ fontFamily: t.fontFamily, fontSize: "15px", fontWeight: 700, color: t.textHeading }}>
                    Admin Settings
                  </span>
                  <span style={{ fontFamily: t.fontFamily, fontSize: "13px", color: t.textMuted }}>
                    {isAdminUnlocked ? "Unlocked" : "PIN protected"}
                  </span>
                </div>
                <ChevronRight size={20} style={{ color: t.textMuted, transform: isRTL ? 'rotate(180deg)' : '' }} />
              </button>
            </div>
          </div>
        );
      }

      case 'server':
        return (
          <div className="flex flex-col" style={{ padding: "20px" }}>
            <label style={{ fontFamily: t.fontFamily, fontSize: "13px", fontWeight: 600, color: t.textMuted, marginBottom: 4 }}>Server IP</label>
            <input
              type="text"
              value={serverIp}
              onChange={(e) => setServerIp(e.target.value)}
              placeholder="10.32.0.86"
              style={{
                width: "100%", padding: "12px", borderRadius: t.radiusMd, border: `1px solid ${error && !isValidServerUrl(serverIp) ? '#EF4444' : t.borderDefault}`,
                backgroundColor: t.surfaceElevated, fontFamily: t.fontFamily, fontSize: "15px", marginBottom: "16px", outline: "none",
              }}
            />

            <label style={{ fontFamily: t.fontFamily, fontSize: "13px", fontWeight: 600, color: t.textMuted, marginBottom: 4 }}>API Key</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="20b91694-..."
              style={{
                width: "100%", padding: "12px", borderRadius: t.radiusMd, border: `1px solid ${error && !apiKey.trim() ? '#EF4444' : t.borderDefault}`,
                backgroundColor: t.surfaceElevated, fontFamily: t.fontFamily, fontSize: "15px", marginBottom: "16px", outline: "none",
              }}
            />

            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
              <button
                onClick={() => {
                  setServerIp("https://control.careinn.com/api");
                  setApiKey("efc9bcbf-6951-436a-8694-c13cc6f30913");
                }}
                className="px-3 py-1.5 rounded-full font-bold cursor-pointer transition-all active:scale-95 shrink-0"
                style={{ backgroundColor: t.primarySubtle, color: t.primary, fontSize: "12px", border: "none" }}
              >
                Default Cloud
              </button>
              <button
                onClick={() => {
                  setServerIp(SECONDARY_OPTION.serverIp);
                  setApiKey(SECONDARY_OPTION.apiKey);
                }}
                className="px-3 py-1.5 rounded-full font-bold cursor-pointer transition-all active:scale-95 shrink-0"
                style={{ backgroundColor: t.tileInactiveBg, color: t.textMuted, fontSize: "12px", border: `1px solid ${t.borderDefault}` }}
              >
                Secondary Local (10.32.x)
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSaveServer}
                className="w-full py-3 rounded-lg font-bold text-white transition-transform active:scale-[0.98]"
                style={{ backgroundColor: t.primary, fontFamily: t.fontFamily, border: "none" }}
              >
                Save & Reconnect
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleResetServer}
                  className="flex-1 py-3 rounded-lg font-semibold transition-transform active:scale-[0.98]"
                  style={{ backgroundColor: t.tileInactiveBg, color: t.textHeading, fontFamily: t.fontFamily, border: "none" }}
                >
                  Reset to Default
                </button>
                <button
                  onClick={() => setStep('menu')}
                  className="flex-1 py-3 rounded-lg font-semibold transition-transform active:scale-[0.98]"
                  style={{ backgroundColor: "transparent", color: t.textMuted, fontFamily: t.fontFamily, border: `1px solid ${t.borderDefault}` }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );

      case 'admin-controls':
        return (
          <div className="flex flex-col items-center" style={{ padding: "28px 24px" }}>
            <Shield size={40} style={{ color: t.primary, marginBottom: 16 }} />
            <span style={{ fontFamily: t.fontFamily, fontSize: "18px", fontWeight: 700, color: t.textHeading, marginBottom: 8, textAlign: "center" }}>
              Admin Controls
            </span>
            <span style={{ fontFamily: t.fontFamily, fontSize: "14px", color: t.textMuted, marginBottom: 24, textAlign: "center" }}>
              Admin mode active — 10 min window
            </span>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  window.AndroidSystem?.exitKioskMode?.(adminPin);
                  window.AndroidSystem?.triggerMaintenanceMode?.(adminPin);
                  setStep('menu');
                }}
                className="w-full py-3 rounded-lg font-bold transition-transform active:scale-[0.98]"
                style={{ backgroundColor: t.primarySubtle, color: t.primary, fontFamily: t.fontFamily, border: "none" }}
              >
                Exit Kiosk Mode
              </button>
              <button
                onClick={() => {
                  window.AndroidSystem?.returnToKioskMode?.();
                  setStep('menu');
                }}
                className="w-full py-3 rounded-lg font-bold transition-transform active:scale-[0.98]"
                style={{ backgroundColor: t.tileInactiveBg, color: t.textHeading, fontFamily: t.fontFamily, border: "none" }}
              >
                Return to Kiosk Mode
              </button>
              {/* TODO: Add more admin controls here */}
            </div>
          </div>
        );

      case 'overview':
        return (
          <div className="flex flex-col items-center" style={{ padding: "28px 24px" }}>
            <div
              className="flex items-center justify-center mb-4"
              style={{ width: "56px", height: "56px", borderRadius: t.radiusFull, backgroundColor: t.primarySubtle }}
            >
              <CheckCircle size={28} style={{ color: t.primary }} />
            </div>
            <span style={{ fontFamily: t.fontFamily, fontSize: "18px", fontWeight: 700, color: t.textHeading, marginBottom: "4px" }}>
              {tr("settings.preferences.subtitle.set")}
            </span>
            <span style={{ fontFamily: t.fontFamily, fontSize: "13px", fontWeight: 500, color: t.textMuted, marginBottom: "24px" }}>
              Last updated: {account?.setAt ? new Date(account.setAt).toLocaleDateString() : 'Unknown'}
            </span>

            <div className="flex flex-col w-full gap-3">
              <button
                onClick={() => {
                  setVerifyPinVal("");
                  setError(false);
                  setPendingAction('reset-pin');
                  setStep('verify-current-pin');
                }}
                className="flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]"
                style={{ height: "44px", borderRadius: t.radiusMd, backgroundColor: t.primarySubtle, border: `1px solid ${t.primary}44` }}
              >
                <span style={{ fontFamily: t.fontFamily, fontSize: "14px", fontWeight: 600, color: t.primary }}>
                  Change PIN
                </span>
              </button>
              <button
                onClick={() => {
                  setVerifyPinVal("");
                  setError(false);
                  setPendingAction('reset-nfc');
                  setStep('verify-current-pin');
                }}
                className="flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97]"
                style={{ height: "44px", borderRadius: t.radiusMd, backgroundColor: t.tileInactiveBg, border: `1px solid ${t.borderDefault}` }}
              >
                <span style={{ fontFamily: t.fontFamily, fontSize: "14px", fontWeight: 600, color: t.textHeading }}>
                  Update NFC
                </span>
              </button>
              <button
                onClick={() => {
                  setVerifyPinVal("");
                  setError(false);
                  setPendingAction('remove-account');
                  setStep('verify-current-pin');
                }}
                className="flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] mt-2"
                style={{ height: "44px", border: "none", background: "none" }}
              >
                <Trash2 size={16} style={{ color: "#EF4444" }} />
                <span style={{ fontFamily: t.fontFamily, fontSize: "14px", fontWeight: 600, color: "#EF4444" }}>
                  Remove PIN
                </span>
              </button>
            </div>
          </div>
        );

      case 'setup-pin1':
        return (
          <>
            <div className="flex flex-col items-center" style={{ padding: "28px 24px 0 24px" }}>
              <Shield size={28} style={{ color: t.primary, marginBottom: "16px" }} />
              <span style={{ fontFamily: t.fontFamily, fontSize: "18px", fontWeight: 700, color: t.textHeading, textAlign: "center" }}>
                Set up a PIN
              </span>
              <span style={{ fontFamily: t.fontFamily, fontSize: "13px", fontWeight: 500, color: t.textMuted, textAlign: "center", marginTop: "8px" }}>
                Enter a 4-digit PIN for your settings
              </span>
            </div>
            <PinKeypad pin={pin1} setPin={setPin1} error={false} onComplete={() => setStep('setup-pin2')} />
          </>
        );

      case 'setup-pin2':
        return (
          <>
            <div className="flex flex-col items-center" style={{ padding: "28px 24px 0 24px" }}>
              <Shield size={28} style={{ color: t.primary, marginBottom: "16px" }} />
              <span style={{ fontFamily: t.fontFamily, fontSize: "18px", fontWeight: 700, color: t.textHeading, textAlign: "center" }}>
                Confirm your PIN
              </span>
            </div>
            <PinKeypad
              pin={pin2}
              setPin={setPin2}
              error={error}
              onComplete={(p) => {
                if (p === pin1) {
                  setStep('nfc-prompt');
                } else {
                  setError(true);
                  setStep('setup-pin-mismatch');
                  setTimeout(() => {
                    setPin1("");
                    setPin2("");
                    setError(false);
                    setStep('setup-pin1');
                  }, 1500);
                }
              }}
            />
          </>
        );

      case 'setup-pin-mismatch':
        return (
          <div className="flex flex-col items-center justify-center" style={{ padding: "40px 24px" }}>
            <AlertCircle size={40} style={{ color: "#D10044", marginBottom: "16px" }} />
            <span style={{ fontFamily: t.fontFamily, fontSize: "16px", fontWeight: 600, color: t.textHeading, textAlign: "center" }}>
              PINs do not match
            </span>
          </div>
        );

      case 'nfc-prompt':
        return (
          <div className="flex flex-col items-center" style={{ padding: "32px 24px" }}>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Shield size={32} style={{ color: t.primary }} />
            </div>
            <span style={{ fontFamily: t.fontFamily, fontSize: "18px", fontWeight: 700, color: t.textHeading, textAlign: "center" }}>
              Add NFC Card (Optional)
            </span>
            <span style={{ fontFamily: t.fontFamily, fontSize: "14px", fontWeight: 500, color: t.textMuted, textAlign: "center", marginTop: "12px", marginBottom: "24px" }}>
              You can pair an NFC card to easily unlock your screen later.
            </span>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  setAccount(pin1, null).then(() => setStep('success'));
                }}
                className="flex-1 flex items-center justify-center"
                style={{ height: "48px", borderRadius: t.radiusLg, backgroundColor: t.tileInactiveBg, border: "none" }}
              >
                <span style={{ fontFamily: t.fontFamily, fontSize: "15px", fontWeight: 600, color: t.textHeading }}>
                  Skip
                </span>
              </button>
              <button
                onClick={() => setStep('nfc-tap1')}
                className="flex-1 flex items-center justify-center"
                style={{ height: "48px", borderRadius: t.radiusLg, backgroundColor: t.primary, border: "none" }}
              >
                <span style={{ fontFamily: t.fontFamily, fontSize: "15px", fontWeight: 600, color: "#fff" }}>
                  Pair NFC
                </span>
              </button>
            </div>
          </div>
        );

      case 'nfc-tap1':
      case 'nfc-tap2':
        return (
          <div className="flex flex-col items-center" style={{ padding: "40px 24px" }}>
            <div className="relative mb-8 flex items-center justify-center" style={{ width: 100, height: 100 }}>
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: t.primary }}></div>
              <div className="absolute inset-2 rounded-full animate-ping opacity-40 animation-delay-150" style={{ backgroundColor: t.primary }}></div>
              <div className="relative rounded-full z-10 flex items-center justify-center" style={{ width: 64, height: 64, backgroundColor: t.primary }}>
                <Shield size={32} color="#FFFFFF" />
              </div>
            </div>
            <span style={{ fontFamily: t.fontFamily, fontSize: "18px", fontWeight: 700, color: t.textHeading, textAlign: "center" }}>
              {step === 'nfc-tap1' ? "Tap your NFC card" : "Tap it again to confirm"}
            </span>
            <span style={{ fontFamily: t.fontFamily, fontSize: "14px", fontWeight: 500, color: t.textMuted, textAlign: "center", marginTop: "12px", marginBottom: "24px" }}>
              Hold the card near the reader
            </span>
            <button
              onClick={() => {
                if (getAccount()) setStep('menu');
                else setStep('nfc-prompt');
              }}
              style={{ padding: "10px 20px", color: t.textMuted, background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        );

      case 'nfc-mismatch':
        return (
          <div className="flex flex-col items-center justify-center" style={{ padding: "40px 24px" }}>
            <AlertCircle size={40} style={{ color: "#D10044", marginBottom: "16px" }} />
            <span style={{ fontFamily: t.fontFamily, fontSize: "16px", fontWeight: 600, color: t.textHeading, textAlign: "center" }}>
              NFC cards do not match
            </span>
          </div>
        );

      case 'verify-current-pin':
        return (
          <div className="flex flex-col items-center" style={{ padding: "32px 24px" }}>
            <div
              className="flex items-center justify-center mb-6"
              style={{ width: "56px", height: "56px", borderRadius: t.radiusLg, backgroundColor: t.primarySubtle }}
            >
              <Shield size={28} style={{ color: t.primary }} />
            </div>
            <span style={{ fontFamily: t.fontFamily, fontSize: "18px", fontWeight: 700, color: t.textHeading, textAlign: "center", marginBottom: "8px" }}>
              {pendingAction === 'admin-login' ? "Admin Login" : "Verify PIN"}
            </span>
            <span style={{ fontFamily: t.fontFamily, fontSize: "13px", color: t.textMuted, textAlign: "center", marginBottom: "24px" }}>
              {pendingAction === 'admin-login' ? "Enter admin password" : "Enter your current PIN to continue"}
            </span>

            <PinKeypad
              pin={verifyPinVal}
              setPin={setVerifyPinVal}
              error={error}
              onComplete={async (p) => {
                if (pendingAction === 'admin-login') {
                  if (p === '2580') {
                    setAdminPin(p);
                    setIsAdminUnlocked(true);
                    setStep('admin-controls');
                  } else {
                    setError(true);
                    setTimeout(() => {
                      setVerifyPinVal("");
                      setError(false);
                    }, 1000);
                  }
                  return;
                }

                const ok = await verifyPin(p);
                if (ok) {
                  if (pendingAction === 'remove-account') {
                    setStep('remove-confirm');
                  } else if (pendingAction === 'reset-pin') {
                    setPin1("");
                    setPin2("");
                    setStep('setup-pin1');
                  } else if (pendingAction === 'reset-nfc') {
                    setNfcUid1(null);
                    setStep('nfc-tap1');
                  }
                } else {
                  setError(true);
                  setTimeout(() => {
                    setVerifyPinVal("");
                    setError(false);
                  }, 1000);
                }
              }}
            />
          </div>
        );

      case 'remove-confirm':
        return (
          <div className="flex flex-col items-center" style={{ padding: "32px 24px" }}>
            <div
              className="flex items-center justify-center mb-6"
              style={{ width: "64px", height: "64px", borderRadius: t.radiusFull, backgroundColor: "#FEE2E2" }}
            >
              <Trash2 size={32} style={{ color: "#EF4444" }} />
            </div>
            <span style={{ fontFamily: t.fontFamily, fontSize: "20px", fontWeight: 700, color: t.textHeading, textAlign: "center", marginBottom: "8px" }}>
              Remove PIN?
            </span>
            <span style={{ fontFamily: t.fontFamily, fontSize: "14px", color: t.textMuted, textAlign: "center", marginBottom: "24px" }}>
              This will disable PIN protection for settings.
            </span>

            <div className="flex flex-col w-full gap-3">
              <button
                onClick={() => {
                  clearAccount();
                  setStep('success');
                }}
                className="flex items-center justify-center w-full py-3.5 cursor-pointer active:scale-95 transition-transform"
                style={{
                  backgroundColor: "#EF4444",
                  borderRadius: t.radiusLg,
                  border: "none",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "16px"
                }}
              >
                Remove PIN
              </button>
              <button
                onClick={() => setStep('menu')}
                className="flex items-center justify-center w-full py-3.5 cursor-pointer active:scale-95 transition-transform"
                style={{
                  backgroundColor: "transparent",
                  borderRadius: t.radiusLg,
                  border: `1.5px solid ${t.borderDefault}`,
                  color: t.textMuted,
                  fontWeight: 600,
                  fontSize: "16px"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center" style={{ padding: "40px 24px" }}>
            <CheckCircle size={48} style={{ color: "#10B981", marginBottom: "16px" }} />
            <span style={{ fontFamily: t.fontFamily, fontSize: "18px", fontWeight: 700, color: t.textHeading, textAlign: "center" }}>
              {pendingAction === 'remove-account' ? "Removed" : "Saved successfully"}
            </span>
          </div>
        );

      case 'layout-mode':
        return (
          <div className="flex flex-col" style={{ padding: "16px 20px 24px" }}>
            <div className="flex flex-col gap-3" style={{ padding: "8px 0 0" }}>
              {[
                { id: 1, title: "Layout 1", subtitle: "Current layout (existing design)" },
                { id: 2, title: "Layout 2", subtitle: "CareInn15 design" },
                { id: 3, title: "Layout 3", subtitle: "Kids mode — playful pediatric design" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => saveLayoutMode(option.id as 1 | 2 | 3)}
                  className="flex items-center gap-3 w-full text-left cursor-pointer active:scale-[0.98] transition-transform"
                  style={{ padding: "16px", borderRadius: t.radiusLg, backgroundColor: t.tileInactiveBg, border: "none" }}
                >
                  <div className="flex-1 flex flex-col gap-1">
                    <span style={{ fontFamily: t.fontFamily, fontSize: "15px", fontWeight: 700, color: t.textHeading }}>
                      {option.title}
                    </span>
                    <span style={{ fontFamily: t.fontFamily, fontSize: "13px", color: t.textMuted }}>
                      {option.subtitle}
                    </span>
                  </div>
                  {layoutModeValue === option.id ? (
                    <Check size={18} style={{ color: t.primary }} />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        );

      case 'backgrounds':
        return <BackgroundsPanel />;
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'menu': return tr("settings.preferences");
      case 'server': return "Server Configuration";
      case 'layout-mode': return "Layout Mode";
      case 'admin-controls': return "Admin Settings";
      case 'setup-pin1':
      case 'setup-pin2':
      case 'nfc-prompt':
      case 'nfc-tap1':
      case 'nfc-tap2':
      case 'overview':
      case 'verify-current-pin':
        return pendingAction === 'admin-login' ? "Admin Login" : "Password";
      case 'remove-confirm':
        return "Password";
      case 'backgrounds': return tr("prefs.backgrounds");
      default: return tr("settings.preferences");
    }
  };

  const showHeader = step !== 'success' && step !== 'setup-pin-mismatch' && step !== 'nfc-mismatch';
  const canGoBack = step !== 'menu' && step !== 'success';
  const dialogWidth = step === 'backgrounds' ? 420 : 340;

  return (
    <CenteredDialog onClose={onClose} width={dialogWidth}>
      {showHeader && (
        <DialogHeader
          title={getTitle()}
          onClose={onClose}
          onBack={canGoBack ? () => setStep('menu') : undefined}
        />
      )}
      {renderContent()}
    </CenteredDialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * BACKGROUNDS PANEL
 * ═══════════════════════════════════════════════════════════════════════════ */

function BackgroundsPanel() {
  const { theme: t } = useTheme();
  const { t: tr } = useLocale();

  const [groups, setGroups] = useState<WallpaperGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrl, setSelectedUrl] = useState<string>(
    getSavedHeroImage() ?? "");
  const [slideshow, setSlideshow] = useState(isSlideshowEnabled());

  const doFetch = async () => {
    setLoading(true);
    const data = await fetchAllWallpapers();
    setGroups(data);
    setLoading(false);
  };

  useEffect(() => {
    doFetch();
    window.addEventListener("api-config-changed", doFetch);
    return () => window.removeEventListener("api-config-changed", doFetch);
  }, []);

  const handleSelect = (originalUrl: string) => {
    setSelectedUrl(originalUrl);
    saveHeroImage(originalUrl);
    setSlideshowEnabled(false);
    setSlideshow(false);
  };

  const handleSlideshow = (enabled: boolean) => {
    setSlideshow(enabled);
    setSlideshowEnabled(enabled);
    if (enabled) {
      setSelectedUrl("");
      clearSavedHeroImage();
    }
  };

  // Hardcoded theme images (always available as fallback)
  const themeImages: string[] = (t as any).heroImageUrls ?? [];

  return (
    <div style={{ padding: "16px 20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* Slideshow toggle */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", backgroundColor: t.tileInactiveBg,
        borderRadius: t.radiusMd, border: `1px solid ${t.borderSubtle}`,
      }}>
        <div>
          <p style={{ fontFamily: t.fontFamily, fontSize: "15px", fontWeight: 600, color: t.textHeading, margin: 0 }}>
            {tr("prefs.backgrounds.slideshow.label")}
          </p>
          <p style={{ fontFamily: t.fontFamily, fontSize: "12px", color: t.textMuted, margin: "2px 0 0 0" }}>
            {tr("prefs.backgrounds.slideshow.hint")}
          </p>
        </div>
        <div
          onClick={() => handleSlideshow(!slideshow)}
          style={{
            width: 44, height: 24, borderRadius: 12, cursor: "pointer",
            backgroundColor: slideshow ? t.primary : t.borderDefault,
            position: "relative", transition: "background-color 0.2s",
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: "50%", backgroundColor: "#fff",
            position: "absolute", top: 2,
            left: slideshow ? 22 : 2,
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }} />
        </div>
      </div>

      {loading && (
        <p style={{ fontFamily: t.fontFamily, color: t.textMuted, fontSize: "14px", textAlign: "center", padding: "16px 0" }}>
          {tr("prefs.backgrounds.loading")}
        </p>
      )}

      {/* API wallpaper groups */}
      {!loading && groups.map(group => (
        <div key={group.id}>
          <p style={{
            fontFamily: t.fontFamily, fontSize: "12px", fontWeight: 700, color: t.textMuted,
            textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px 0",
          }}>
            {group.title}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))", gap: "8px", marginBottom: "16px" }}>
            {group.images.map(img => {
              const isSelected = selectedUrl === img.imageUrl && !slideshow;
              return (
                <button
                  key={img.id}
                  onClick={() => handleSelect(img.imageUrl)}
                  style={{
                    position: "relative", width: "100%", aspectRatio: "16/9",
                    borderRadius: t.radiusMd, overflow: "hidden", cursor: "pointer", padding: 0,
                    border: isSelected ? `3px solid ${t.primary}` : `2px solid ${t.borderSubtle}`,
                    background: t.tileInactiveBg,
                  }}
                >
                  <ApiImage src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                  {isSelected && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={22} color="#fff" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Hardcoded theme images */}
      {themeImages.length > 0 && (
        <div>
          <p style={{
            fontFamily: t.fontFamily, fontSize: "12px", fontWeight: 700, color: t.textMuted,
            textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px 0",
          }}>
            {tr("prefs.backgrounds.default")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))", gap: "8px", marginBottom: "16px" }}>
            {themeImages.map((url, i) => {
              const isSelected = selectedUrl === url && !slideshow;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(url)}
                  style={{
                    position: "relative", width: "100%", aspectRatio: "16/9",
                    borderRadius: t.radiusMd, overflow: "hidden", cursor: "pointer", padding: 0,
                    border: isSelected ? `3px solid ${t.primary}` : `2px solid ${t.borderSubtle}`,
                    background: t.tileInactiveBg,
                  }}
                >
                  <ApiImage src={url} alt="" className="w-full h-full object-cover" />
                  {isSelected && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={22} color="#fff" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No images at all */}
      {!loading && groups.length === 0 && themeImages.length === 0 && (
        <p style={{ fontFamily: t.fontFamily, color: t.textMuted, fontSize: "14px", textAlign: "center", padding: "16px 0" }}>
          {tr("prefs.backgrounds.empty")}
        </p>
      )}
    </div>
  );
}
