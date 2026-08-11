import React, { useState } from "react";
import { Lock, CheckCircle2, ShieldAlert, X } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useLocale } from "./i18n";
import { isAccountSet, setAccount } from "../lib/accountAuth";
import { lockedAppsStore } from "../lib/lockedApps";
import { PinKeypad } from "./MyAccountDialog";

interface AppLockSetupModalProps {
  appId: string;
  appName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = "confirm-lock" | "create-pin1" | "create-pin2" | "success";

export function AppLockSetupModal({
  appId,
  appName,
  onClose,
  onSuccess,
}: AppLockSetupModalProps) {
  const { theme: t } = useTheme();
  const { t: tr, fontFamily, isRTL } = useLocale();

  const hasPin = isAccountSet();
  const [step, setStep] = useState<Step>(hasPin ? "confirm-lock" : "create-pin1");
  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [error, setError] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const primaryCyan = "#0090B8";

  /* ─── Lock immediately if PIN already exists ─── */
  const handleLockExistingPin = () => {
    lockedAppsStore.lock(appId);
    showToastAndClose(`${appName} ${tr("appLock.lockedSuccessSuffix") || "is now locked."}`);
  };

  /* ─── Finish 4-digit PIN Step 1 ─── */
  const handlePin1Complete = (val: string) => {
    setPin1(val);
    setStep("create-pin2");
  };

  /* ─── Finish 4-digit PIN Step 2 ─── */
  const handlePin2Complete = async (val: string) => {
    setPin2(val);
    if (val === pin1) {
      await setAccount(val, null);
      lockedAppsStore.lock(appId);
      showToastAndClose(`${appName} ${tr("appLock.lockedSuccessSuffix") || "is now locked."}`);
    } else {
      setError(true);
      setTimeout(() => {
        setPin1("");
        setPin2("");
        setError(false);
        setStep("create-pin1");
      }, 1000);
    }
  };

  const showToastAndClose = (msg: string) => {
    setToastMessage(msg);
    setStep("success");
    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 1400);
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center select-none"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        fontFamily,
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative flex flex-col items-center bg-white rounded-3xl p-7 shadow-2xl w-[360px] animate-in fade-in zoom-in-95 duration-200"
        style={{
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>

        {/* ─── CONFIRM LOCK (When PIN already exists) ─── */}
        {step === "confirm-lock" && (
          <div className="flex flex-col items-center text-center w-full pt-2">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{ backgroundColor: "rgba(0, 144, 184, 0.1)", color: primaryCyan }}
            >
              <Lock size={32} strokeWidth={2.2} />
            </div>

            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {tr("appLock.setup.title")?.replace("{name}", appName) || `Lock ${appName}?`}
            </h3>

            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed px-2">
              {tr("appLock.setup.desc") || "A PIN will be required whenever someone opens this app."}
            </p>

            <div className="flex flex-col w-full gap-2.5 mt-6">
              <button
                onClick={handleLockExistingPin}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm cursor-pointer active:scale-98 transition-all shadow-sm"
                style={{ backgroundColor: primaryCyan }}
              >
                {tr("appLock.setup.confirm") || "Lock App"}
              </button>
              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl text-slate-600 font-semibold text-sm border border-slate-200 hover:bg-slate-50 cursor-pointer active:scale-98 transition-all"
              >
                {tr("appLock.cancel") || "Cancel"}
              </button>
            </div>
          </div>
        )}

        {/* ─── CREATE PIN STEP 1 ─── */}
        {step === "create-pin1" && (
          <div className="flex flex-col items-center text-center w-full pt-2">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: "rgba(0, 144, 184, 0.1)", color: primaryCyan }}
            >
              <Lock size={26} />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {tr("appLock.createPin.title") || "Create Privacy PIN"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {tr("appLock.createPin.sub1") || `Set a 4-digit PIN to lock ${appName}`}
            </p>

            <div className="w-full">
              <PinKeypad
                pin={pin1}
                setPin={setPin1}
                error={error}
                onComplete={handlePin1Complete}
              />
            </div>
          </div>
        )}

        {/* ─── CREATE PIN STEP 2 (CONFIRMATION) ─── */}
        {step === "create-pin2" && (
          <div className="flex flex-col items-center text-center w-full pt-2">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: "rgba(0, 144, 184, 0.1)", color: primaryCyan }}
            >
              <Lock size={26} />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {tr("appLock.createPin.confirmTitle") || "Confirm Privacy PIN"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {tr("appLock.createPin.sub2") || "Re-enter your 4-digit PIN to confirm"}
            </p>

            <div className="w-full">
              <PinKeypad
                pin={pin2}
                setPin={setPin2}
                error={error}
                onComplete={handlePin2Complete}
              />
            </div>
          </div>
        )}

        {/* ─── SUCCESS TOAST ─── */}
        {step === "success" && (
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 animate-in zoom-in-75 duration-200">
              <CheckCircle2 size={40} strokeWidth={2.2} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {toastMessage}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
