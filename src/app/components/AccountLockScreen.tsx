import React, { useState, useEffect } from "react";
import { useTheme, SHADOW } from "./ThemeContext";
import { useLocale } from "./i18n";
import { getAccount, verifyPin, verifyNfcUid } from "../lib/accountAuth";
import { useNfcTap } from "../utils/nfc";
import { Lock, Smartphone, X } from "lucide-react";
import { PinKeypad } from "./MyAccountDialog";
import { guestModeStore } from "../lib/guestMode";

interface Props {
  visible: boolean;
  onUnlock: () => void;
  onClose: () => void;
  onSkipAsGuest: () => void;
}

export function AccountLockScreen({ visible, onUnlock, onClose, onSkipAsGuest }: Props) {
  const { theme: t } = useTheme();
  const { t: tr } = useLocale();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const account = getAccount();

  // Handle NFC tap for unlock
  useNfcTap((uid) => {
    if (visible && account?.nfcCardUid) {
      if (verifyNfcUid(uid)) {
        guestModeStore.exitGuestMode();
        setPin("");
        setError(false);
        onUnlock();
      }
    }
  }, visible);

  // Clear state when visibility changes
  useEffect(() => {
    if (!visible) {
      setPin("");
      setError(false);
    }
  }, [visible]);

  // Handle PIN verification
  const handlePinComplete = async (completedPin: string) => {
    const isCorrect = await verifyPin(completedPin);
    if (isCorrect) {
      guestModeStore.exitGuestMode();
      setPin("");
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => {
        setPin("");
        setError(false);
      }, 1000); // 1s shake/error display
    }
  };

  const handleSkipAsGuest = () => {
    guestModeStore.enterGuestMode();
    onSkipAsGuest();
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        className="relative flex flex-col items-center justify-center"
        style={{
          width: "340px",
          padding: "32px 24px 24px 24px",
          borderRadius: t.radiusXl,
          backgroundColor: "#FFFFFF",
          boxShadow: SHADOW.xl,
          animation: "lockDialogIn 0.2s ease-out",
        }}
      >
        {/* (×) close button */}
        <button
          onClick={onClose}
          className="absolute flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
          style={{
            top: "12px",
            right: "12px",
            width: "32px",
            height: "32px",
            borderRadius: t.radiusFull,
            backgroundColor: t.tileInactiveBg,
            border: "none",
            outline: "none",
          }}
        >
          <X size={18} style={{ color: t.textMuted }} />
        </button>

        <div
          className="flex items-center justify-center mb-6"
          style={{ width: "64px", height: "64px", borderRadius: t.radiusFull, backgroundColor: t.primarySubtle }}
        >
          <Lock size={32} style={{ color: t.primary }} />
        </div>
        
        <span style={{ fontFamily: t.fontFamily, fontSize: "20px", fontWeight: 700, color: t.textHeading, textAlign: "center", marginBottom: "8px" }}>
          {tr("lock.title")}
        </span>

        {account?.nfcCardUid && (
          <div className="flex items-center gap-2 mb-4" style={{ padding: "8px 16px", borderRadius: t.radiusLg, backgroundColor: t.tileInactiveBg }}>
            <Smartphone size={16} style={{ color: t.textMuted }} />
            <span style={{ fontFamily: t.fontFamily, fontSize: "14px", fontWeight: 500, color: t.textMuted }}>
              {tr("lock.nfc.hint")}
            </span>
          </div>
        )}

        {error && (
          <span style={{ fontFamily: t.fontFamily, fontSize: "14px", fontWeight: 600, color: "#D10044", marginBottom: "16px", animation: "settingsFadeIn 0.2s ease-out" }}>
            {tr("lock.wrongPin")}
          </span>
        )}

        <div style={{ marginTop: "16px", width: "100%" }}>
          <PinKeypad pin={pin} setPin={setPin} error={error} onComplete={handlePinComplete} />
        </div>

        <div className="flex flex-col items-center w-full mt-6 gap-2">
          <button
            onClick={handleSkipAsGuest}
            className="flex items-center justify-center w-full cursor-pointer active:scale-[0.98] transition-transform"
            style={{
              height: "48px",
              borderRadius: t.radiusLg,
              backgroundColor: "transparent",
              border: `1.5px solid ${t.borderDefault}`,
              outline: "none",
            }}
          >
            <span style={{ fontFamily: t.fontFamily, fontSize: "14px", fontWeight: 600, color: t.textMuted }}>
              {tr("lock.guest.button")}
            </span>
          </button>
          <span style={{ fontFamily: t.fontFamily, fontSize: "11px", fontWeight: 500, color: t.textMuted, textAlign: "center", opacity: 0.8 }}>
            {tr("lock.guest.subtitle")}
          </span>
        </div>
      </div>
      <style>{`
        @keyframes lockDialogIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
