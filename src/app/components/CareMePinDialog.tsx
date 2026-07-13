import React, { useState } from "react";
import { useTheme } from "./ThemeContext";
import { useLocale } from "./i18n";
import { verifyPin, verifyNfcUid, getAccount } from "../lib/accountAuth";
import { useNfcTap } from "../utils/nfc";
import { HeartPulse, X } from "lucide-react";

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
      className="absolute inset-0 z-[100] flex items-center justify-center"
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

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  onNfcSuccess: () => void;
}

export function CareMePinDialog({ onClose, onSuccess, onNfcSuccess }: Props) {
  const { theme: t } = useTheme();
  const { t: tr, fontFamily } = useLocale();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const acc = getAccount();
  const hasNfcCard = !!acc?.nfcCardUid;

  useNfcTap((uid: string) => {
    if (verifyNfcUid(uid)) {
      onNfcSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 800);
    }
  });

  const handleDigit = (d: string) => {
    if (pin.length < 4) {
      const newPin = pin + d;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        verifyPin(newPin).then((isValid) => {
          if (isValid) {
            onSuccess();
            onClose();
          } else {
            setError(true);
            setTimeout(() => {
              setPin("");
              setError(false);
            }, 1000); // 1s shake
          }
        });
      }
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  return (
    <CenteredDialog onClose={onClose} width={320}>
      <div className="flex flex-col items-center" style={{ padding: "28px 24px 8px 24px" }}>
        <div className="flex w-full justify-end absolute top-4 right-4">
           <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: t.radiusFull,
              backgroundColor: t.tileInactiveBg,
              border: "none",
            }}
          >
            <X size={14} style={{ color: t.textMuted }} />
          </button>
        </div>
        
        <div
          className="flex items-center justify-center"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: t.radiusLg,
            backgroundColor: t.primarySubtle,
            marginBottom: "16px",
          }}
        >
          <HeartPulse size={28} style={{ color: t.primary }} />
        </div>
        <span
          style={{
            fontFamily,
            fontSize: "18px",
            fontWeight: 700,
            color: t.textHeading,
            textAlign: "center",
          }}
        >
          {tr("guest.careMe.dialog.title")}
        </span>
        <span
          style={{
            fontFamily,
            fontSize: "13px",
            fontWeight: 500,
            color: error ? "#D10044" : t.textMuted,
            textAlign: "center",
            marginTop: "8px",
            lineHeight: "20px",
            transition: "color 0.2s",
          }}
        >
          {error ? tr("guest.careMe.dialog.incorrect") : tr("guest.careMe.dialog.enterPin")}
        </span>

        {hasNfcCard && (
          <p style={{ 
            fontFamily, fontSize: "12px", 
            color: t.textMuted, textAlign: "center",
            marginTop: "12px",
          }}>
            {tr("lock.nfc.hint")}
          </p>
        )}
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
                      fontFamily,
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
