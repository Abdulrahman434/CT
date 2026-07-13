import React, { useState, useEffect } from "react";
import { useTheme, SHADOW } from "./ThemeContext";
import { useLocale } from "./i18n";
import { Lock, Unlock, X, CheckCircle, ShieldAlert } from "lucide-react";
import { lockedAppsStore } from "../lib/lockedApps";
import { verifyPin, isAccountSet } from "../lib/accountAuth";
import { PinKeypad } from "./MyAccountDialog";

interface AppLockMenuProps {
  appId: string;
  appName: string;
  isCurrentlyLocked: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onRequestPinSetup: () => void;
  onOpenApp?: () => void;
}

type Step = "menu" | "verify-pin" | "success";

export function AppLockMenu({
  appId,
  appName,
  isCurrentlyLocked,
  onClose,
  onRequestPinSetup,
  onOpenApp
}: AppLockMenuProps) {
  const { theme: t } = useTheme();
  const { t: tr, fontFamily } = useLocale();
  const [step, setStep] = useState<Step>(onOpenApp ? "verify-pin" : "menu");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [successMode, setSuccessMode] = useState<"locked" | "unlocked">("locked");

  const handleLock = () => {
    if (!isAccountSet()) {
      onRequestPinSetup();
      onClose();
      return;
    }
    lockedAppsStore.lock(appId);
    setSuccessMode("locked");
    setStep("success");
  };

  const handleUnlock = () => {
    setStep("verify-pin");
  };

  const handlePinComplete = async (completedPin: string) => {
    const isValid = await verifyPin(completedPin);
    if (isValid) {
      if (onOpenApp) {
        onOpenApp();
        onClose();
      } else {
        lockedAppsStore.unlock(appId);
        setSuccessMode("unlocked");
        setStep("success");
      }
    } else {
      setError(true);
      setTimeout(() => {
        setPin("");
        setError(false);
      }, 1000);
    }
  };

  useEffect(() => {
    if (step === "success") {
      const timer = setTimeout(onClose, 1200);
      return () => clearTimeout(timer);
    }
  }, [step, onClose]);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{
        backgroundColor: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        className="relative flex flex-col items-center"
        style={{
          width: "340px",
          padding: "32px 24px 24px 24px",
          borderRadius: t.radiusXl,
          backgroundColor: "#FFFFFF",
          boxShadow: SHADOW.xl,
          animation: "lockDialogIn 0.2s ease-out",
        }}
      >
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

        {step === "menu" && (
          <>
            <div
              className="flex items-center justify-center mb-6"
              style={{ 
                width: "64px", height: "64px", 
                borderRadius: t.radiusFull, 
                backgroundColor: isCurrentlyLocked ? "#FEE2E2" : t.primarySubtle 
              }}
            >
              {isCurrentlyLocked ? (
                <Unlock size={32} style={{ color: "#EF4444" }} />
              ) : (
                <Lock size={32} style={{ color: t.primary }} />
              )}
            </div>
            <span style={{ fontFamily, fontSize: "20px", fontWeight: 700, color: t.textHeading, textAlign: "center", marginBottom: "8px" }}>
              {isCurrentlyLocked ? tr("appLock.unlock.title") : tr("appLock.lock.title")}
            </span>
            <span style={{ fontFamily, fontSize: "14px", color: t.textMuted, textAlign: "center", marginBottom: "24px" }}>
              {isCurrentlyLocked ? tr("appLock.unlock.subtitle") : tr("appLock.lock.subtitle")}
            </span>
            
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={isCurrentlyLocked ? handleUnlock : handleLock}
                className="flex items-center justify-center w-full py-3.5 cursor-pointer active:scale-95 transition-transform"
                style={{
                  backgroundColor: isCurrentlyLocked ? "#EF4444" : t.primary,
                  borderRadius: t.radiusLg,
                  border: "none",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "16px"
                }}
              >
                {isCurrentlyLocked ? tr("appLock.unlock.button") : tr("appLock.lock.button")}
              </button>
              <button
                onClick={onClose}
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
                {tr("appLock.cancel")}
              </button>
            </div>
          </>
        )}

        {step === "verify-pin" && (
          <>
            {!isAccountSet() ? (
              <>
                <div
                  className="flex items-center justify-center mb-6"
                  style={{ width: "64px", height: "64px", borderRadius: t.radiusFull, backgroundColor: "#FEF3C7" }}
                >
                  <ShieldAlert size={32} style={{ color: "#D97706" }} />
                </div>
                <span style={{ fontFamily, fontSize: "20px", fontWeight: 700, color: t.textHeading, textAlign: "center", marginBottom: "8px" }}>
                  {tr("appLock.noPinSetup.title")}
                </span>
                <span style={{ fontFamily, fontSize: "14px", color: t.textMuted, textAlign: "center", marginBottom: "24px" }}>
                  {tr("appLock.noPinSetup.subtitle")}
                </span>
                <button
                  onClick={onRequestPinSetup}
                  className="flex items-center justify-center w-full py-3.5 cursor-pointer active:scale-95 transition-transform"
                  style={{
                    backgroundColor: t.primary,
                    borderRadius: t.radiusLg,
                    border: "none",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "16px"
                  }}
                >
                  {tr("appLock.noPinSetup.button")}
                </button>
              </>
            ) : (
              <>
                <div
                  className="flex items-center justify-center mb-6"
                  style={{ width: "56px", height: "56px", borderRadius: t.radiusLg, backgroundColor: t.primarySubtle }}
                >
                  <Lock size={28} style={{ color: t.primary }} />
                </div>
                <span style={{ fontFamily, fontSize: "18px", fontWeight: 700, color: t.textHeading, textAlign: "center", marginBottom: "4px" }}>
                  {onOpenApp ? tr("appLock.open.title") : tr("appLock.verify.title")}
                </span>
                <span style={{ fontFamily, fontSize: "13px", color: t.textMuted, textAlign: "center", marginBottom: "16px" }}>
                  {appName}
                </span>

                {/* PIN dots are included in PinKeypad */}
                <div className="w-full">
                  <PinKeypad pin={pin} setPin={setPin} error={error} onComplete={handlePinComplete} />
                </div>
              </>
            )}
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center py-8">
            <CheckCircle size={64} style={{ color: t.primary, marginBottom: "16px" }} />
            <span style={{ fontFamily, fontSize: "24px", fontWeight: 700, color: t.textHeading }}>
              {successMode === "locked" ? tr("appLock.locked") : tr("appLock.unlocked")}
            </span>
          </div>
        )}
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
