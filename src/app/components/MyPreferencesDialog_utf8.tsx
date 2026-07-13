import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";
import { useLocale } from "./i18n";
import { setAccount, getAccount, updateNfcCard, clearAccount, verifyPin } from "../lib/accountAuth";
import { useNfcTap } from "../utils/nfc";
import { X, CheckCircle, Shield, AlertCircle, Trash2 } from "lucide-react";

type Step =
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
  | 'success';

type PendingAction = 'reset-pin' | 'reset-nfc' | 'remove-account' | null;

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

export function MyAccountDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { theme: t } = useTheme();
  const { t: tr } = useLocale();
  const [step, setStep] = useState<Step>('overview');
  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [error, setError] = useState(false);
  const [nfcUid1, setNfcUid1] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [verifyPinVal, setVerifyPinVal] = useState("");

  const account = getAccount();

  useEffect(() => {
    if (open) {
      if (getAccount()) {
        setStep('overview');
      } else {
        setStep('setup-pin1');
      }
      setPin1("");
      setPin2("");
      setError(false);
      setNfcUid1(null);
      setPendingAction(null);
      setVerifyPinVal("");
    }
  }, [open]);

  // Only listen to NFC if we are in an NFC tap step
  useNfcTap((uid) => {
    if (step === 'nfc-tap1') {
      setNfcUid1(uid);
      setStep('nfc-tap2');
    } else if (step === 'nfc-tap2') {
      if (uid === nfcUid1) {
        if (getAccount()) {
          // just updating
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
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, onClose]);

  if (!open) return null;

  const renderContent = () => {
    switch (step) {
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
              {tr("settings.account.subtitle.set")}
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
                  {tr("settings.account.overview.changeP")}
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
                  {tr("settings.account.overview.changeNfc")}
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
                  {tr("settings.account.overview.remove")}
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
                {tr("settings.account.setPin.title")}
              </span>
              <span style={{ fontFamily: t.fontFamily, fontSize: "13px", fontWeight: 500, color: t.textMuted, textAlign: "center", marginTop: "8px" }}>
                {tr("settings.account.setPin.subtitle")}
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
                {tr("settings.account.confirmPin.title")}
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
              {tr("settings.account.pin.mismatch")}
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
              {tr("settings.account.nfc.prompt.title")}
            </span>
            <span style={{ fontFamily: t.fontFamily, fontSize: "14px", fontWeight: 500, color: t.textMuted, textAlign: "center", marginTop: "12px", marginBottom: "24px" }}>
              {tr("settings.account.nfc.prompt.body")}
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
                  {tr("settings.account.nfc.skip")}
                </span>
              </button>
              <button
                onClick={() => setStep('nfc-tap1')}
                className="flex-1 flex items-center justify-center"
                style={{ height: "48px", borderRadius: t.radiusLg, backgroundColor: t.primary, border: "none" }}
              >
                <span style={{ fontFamily: t.fontFamily, fontSize: "15px", fontWeight: 600, color: "#fff" }}>
                  {tr("settings.account.nfc.register")}
                </span>
              </button>
            </div>
          </div>
        );

      case 'nfc-tap1':
      case 'nfc-tap2':
        return (
          <div className="flex flex-col items-center" style={{ padding: "40px 24px" }}>
            {/* NFC Pulse Animation */}
            <div className="relative mb-8 flex items-center justify-center" style={{ width: 100, height: 100 }}>
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: t.primary }}></div>
              <div className="absolute inset-2 rounded-full animate-ping opacity-40 animation-delay-150" style={{ backgroundColor: t.primary }}></div>
              <div className="relative rounded-full z-10 flex items-center justify-center" style={{ width: 64, height: 64, backgroundColor: t.primary }}>
                <Shield size={32} color="#FFFFFF" />
              </div>
            </div>
            <span style={{ fontFamily: t.fontFamily, fontSize: "18px", fontWeight: 700, color: t.textHeading, textAlign: "center" }}>
              {step === 'nfc-tap1' ? tr("settings.account.nfc.tap1.title") : tr("settings.account.nfc.tap2.title")}
            </span>
            <span style={{ fontFamily: t.fontFamily, fontSize: "14px", fontWeight: 500, color: t.textMuted, textAlign: "center", marginTop: "12px", marginBottom: "24px" }}>
              {tr("settings.account.nfc.tap1.body")}
            </span>
            <button
              onClick={() => {
                if (getAccount()) setStep('overview');
                else onClose();
              }}
              style={{ padding: "10px 20px", color: t.textMuted, background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              {tr("settings.account.cancel")}
            </button>
          </div>
        );

      case 'nfc-mismatch':
        return (
          <div className="flex flex-col items-center justify-center" style={{ padding: "40px 24px" }}>
            <AlertCircle size={40} style={{ color: "#D10044", marginBottom: "16px" }} />
            <span style={{ fontFamily: t.fontFamily, fontSize: "16px", fontWeight: 600, color: t.textHeading, textAlign: "center" }}>
              {tr("settings.account.nfc.mismatch")}
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
              {tr("appLock.verify.title")}
            </span>
            <span style={{ fontFamily: t.fontFamily, fontSize: "13px", color: t.textMuted, textAlign: "center", marginBottom: "24px" }}>
              {tr("settings.account.setPin.subtitle")}
            </span>

            <PinKeypad 
              pin={verifyPinVal} 
              setPin={setVerifyPinVal} 
              error={error} 
              onComplete={async (p) => {
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
              {tr("settings.account.overview.removeConfirm")}
            </span>
            <span style={{ fontFamily: t.fontFamily, fontSize: "14px", color: t.textMuted, textAlign: "center", marginBottom: "24px" }}>
              {tr("appLock.lock.subtitle")} {/* Or another descriptive key */}
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
                {tr("settings.account.overview.remove")}
              </button>
              <button
                onClick={() => setStep('overview')}
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
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center" style={{ padding: "40px 24px" }}>
            <CheckCircle size={48} style={{ color: "#10B981", marginBottom: "16px" }} />
            <span style={{ fontFamily: t.fontFamily, fontSize: "18px", fontWeight: 700, color: t.textHeading, textAlign: "center" }}>
              {pendingAction === 'remove-account' ? tr("general.done") : (getAccount() ? tr("settings.account.success.updated") : tr("settings.account.success.set"))}
            </span>
          </div>
        );
    }
  };

  return (
    <CenteredDialog onClose={onClose} width={340}>
      {step !== 'success' && step !== 'setup-pin-mismatch' && step !== 'nfc-mismatch' && (
        <DialogHeader
          icon={<Shield size={20} style={{ color: t.primary }} />}
          title={tr("settings.account")}
          onClose={onClose}
        />
      )}
      {renderContent()}
    </CenteredDialog>
  );
}
