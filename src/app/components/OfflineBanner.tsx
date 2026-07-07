import { useState, useEffect } from "react";
import { Wifi, WifiOff, Shield } from "lucide-react";
import { useTheme, SHADOW, TEXT_STYLE } from "./ThemeContext";
import { useLocale } from "./i18n";
import { wifi, isAndroidApp } from "../utils/androidBridge";
import { verifyPin } from "../lib/accountAuth";

interface OfflineBannerProps {
  visible: boolean;
  onBypass?: () => void;
}

// Grace period to avoid flashing the banner during initial app load
// or brief network blips. Only render after offline has been confirmed
// for this many ms.
const SHOW_DELAY_MS = 1500;

export function OfflineBanner({ visible, onBypass }: OfflineBannerProps) {
  const { theme: t } = useTheme();
  const { fontFamily, t: tr } = useLocale();
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [render, setRender] = useState(false);

  // Debounce visibility so we don't flash on cold boot or transient drops.
  useEffect(() => {
    if (!visible) {
      setRender(false);
      setShowPinEntry(false);
      setPin("");
      setPinError(false);
      return;
    }
    const id = setTimeout(() => setRender(true), SHOW_DELAY_MS);
    return () => clearTimeout(id);
  }, [visible]);

  if (!render) return null;

  const openWifi = () => {
    if (isAndroidApp()) {
      wifi.openSettings();
    }
  };

  const handleContinueOffline = () => {
    onBypass?.();
  };

  const submitPin = async () => {
    const ok = await verifyPin(pin);
    if (ok) {
      setPin("");
      setShowPinEntry(false);
      setPinError(false);
      if (onBypass) {
        onBypass();
      } else {
        openWifi();
      }
    } else {
      setPinError(true);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 9000,
        }}
      />
      {/* Centered card */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9001,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 440,
            maxWidth: "92vw",
            padding: 28,
            borderRadius: t.radiusLg,
            backgroundColor: t.surface,
            boxShadow: SHADOW.xl,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: t.background,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <WifiOff size={32} color={t.textMuted} />
          </div>

          {/* Title + subtitle */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <p
              style={{
                fontFamily,
                ...TEXT_STYLE.cardTitle,
                color: t.textHeading,
                margin: "0 0 8px 0",
              }}
            >
              {tr("offline.title")}
            </p>
            <p
              style={{
                fontFamily,
                ...TEXT_STYLE.body,
                color: t.textMuted,
                margin: 0,
              }}
            >
              {tr("offline.subtitle")}
            </p>
          </div>

          {!showPinEntry ? (
            /* Action buttons */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
              }}
            >
              <button
                onClick={openWifi}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "14px",
                  borderRadius: t.radiusMd,
                  backgroundColor: t.primary,
                  border: "none",
                  cursor: "pointer",
                  fontFamily,
                  ...TEXT_STYLE.button,
                  color: t.textInverse,
                }}
              >
                <Wifi size={20} color={t.textInverse} />
                {tr("offline.openWifi")}
              </button>

              <button
                onClick={handleContinueOffline}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "14px",
                  borderRadius: t.radiusMd,
                  backgroundColor: t.background,
                  border: `1.5px solid ${t.borderDefault}`,
                  cursor: "pointer",
                  fontFamily,
                  ...TEXT_STYLE.button,
                  color: t.textBody,
                }}
              >
                <Shield size={20} color={t.textMuted} />
                {tr("offline.adminPin")}
              </button>
            </div>
          ) : (
            /* PIN entry */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
              }}
            >
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (pinError) setPinError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitPin();
                }}
                placeholder={tr("offline.enterPin")}
                style={{
                  padding: "14px",
                  borderRadius: t.radiusMd,
                  backgroundColor: t.background,
                  border: `1.5px solid ${pinError ? "#dc2626" : t.borderDefault}`,
                  outline: "none",
                  fontFamily,
                  ...TEXT_STYLE.body,
                  color: t.textBody,
                  textAlign: "center",
                  letterSpacing: "0.4em",
                }}
              />
              <button
                onClick={submitPin}
                disabled={!pin}
                style={{
                  padding: "14px",
                  borderRadius: t.radiusMd,
                  backgroundColor: t.primary,
                  border: "none",
                  cursor: pin ? "pointer" : "not-allowed",
                  opacity: pin ? 1 : 0.5,
                  fontFamily,
                  ...TEXT_STYLE.button,
                  color: t.textInverse,
                }}
              >
                {tr("general.confirm")}
              </button>
              <button
                onClick={() => {
                  setShowPinEntry(false);
                  setPin("");
                  setPinError(false);
                }}
                style={{
                  padding: "8px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily,
                  ...TEXT_STYLE.label,
                  color: t.textMuted,
                }}
              >
                {tr("offline.cancel")}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
