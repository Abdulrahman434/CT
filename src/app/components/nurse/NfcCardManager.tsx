import { useState, useCallback } from "react";
import { CreditCard, Wifi, CheckCircle, X } from "lucide-react";
import { useTheme, TEXT_STYLE } from "../ThemeContext";
import { useLocale } from "../i18n";
import { useNfcTap } from "../../utils/nfc";
import {
  getRegisteredCards,
  saveRegisteredCards,
  clearRegisteredCards,
  RegisteredNfcCards,
} from "../../utils/nfc";

  const HARDCODED_PATIENT_UID = "043F1BFA577080";
  const HARDCODED_NURSE_UID   = "045D260A881090";

  type CardSlot = "patient" | "nurse";

  function maskUid(uid: string): string {
    if (!uid || uid.length <= 4) return uid;
    return "*".repeat(uid.length - 4) + uid.slice(-4);
  }

  export function NfcCardManager() {
    const { theme: t } = useTheme();
    const { fontFamily, t: tr } = useLocale();

    const [cards, setCards] = useState<RegisteredNfcCards>(
      getRegisteredCards
    );
    const [scanning, setScanning] = useState<CardSlot | null>(null);
    const [lastScanned, setLastScanned] = useState<string | null>(null);
    const [justSaved, setJustSaved] = useState<CardSlot | null>(null);

    // Listen for NFC tap while scanning
    useNfcTap(useCallback((uid: string) => {
      if (!scanning) return;

      setLastScanned(uid);
      const updated: RegisteredNfcCards = {
        ...cards,
        patientCardUid: scanning === "patient" ? uid : cards.patientCardUid,
        nurseCardUid:   scanning === "nurse"   ? uid : cards.nurseCardUid,
      };
      setCards(updated);
      saveRegisteredCards(updated);
      setJustSaved(scanning);
      setScanning(null);

      // Clear success indicator after 2s
      setTimeout(() => setJustSaved(null), 2000);
    }, [scanning, cards]));

    const startScan = (slot: CardSlot) => {
      setScanning(slot);
      setLastScanned(null);
    };

    const cancelScan = () => {
      setScanning(null);
    };

    const resetCard = (slot: CardSlot) => {
      const updated: RegisteredNfcCards = {
        ...cards,
        patientCardUid: slot === "patient" ? null : cards.patientCardUid,
        nurseCardUid:   slot === "nurse"   ? null : cards.nurseCardUid,
      };
      setCards(updated);
      saveRegisteredCards(updated);
    };

    const cardUid = (slot: CardSlot): string => {
      const registered = slot === "patient"
        ? cards.patientCardUid
        : cards.nurseCardUid;
      const hardcoded = slot === "patient"
        ? HARDCODED_PATIENT_UID
        : HARDCODED_NURSE_UID;
      return registered ?? hardcoded;
    };

    const isCustom = (slot: CardSlot): boolean => {
      return slot === "patient"
        ? !!cards.patientCardUid
        : !!cards.nurseCardUid;
    };

    const CardRow = ({ slot, label }: {
      slot: CardSlot;
      label: string;
    }) => {
      const isScanning  = scanning === slot;
      const isSaved     = justSaved === slot;
      const custom      = isCustom(slot);
      const uid         = cardUid(slot);
      const displayUid  = maskUid(uid);

      return (
        <div style={{
          padding:         "16px",
          borderRadius:    t.radiusMd,
          backgroundColor: t.background,
          border:          `1.5px solid ${
            isScanning ? t.primary
            : isSaved  ? t.success
            : t.borderSubtle
          }`,
          display:         "flex",
          flexDirection:   "column",
          gap:             "10px",
          transition:      "border-color 0.2s",
        }}>

          {/* Row header */}
          <div style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
          }}>
            <div style={{
              display:    "flex",
              alignItems: "center",
              gap:        "10px",
            }}>
              <CreditCard
                size={18}
                color={custom ? t.primary : t.textMuted}
              />
              <div>
                <p style={{
                  fontFamily,
                  ...TEXT_STYLE.subtitle,
                  color:  t.textHeading,
                  margin: 0,
                }}>
                  {label}
                </p>
                <p style={{
                  fontFamily: "monospace",
                  fontSize: "11px",
                  color:    t.textMuted,
                  margin:   "2px 0 0 0",
                }}>
                  {displayUid}
                  {custom && (
                    <span style={{
                      marginLeft:      "8px",
                      color:           t.primary,
                      fontFamily,
                      fontSize:        "10px",
                      fontWeight:      700,
                      backgroundColor: t.primarySubtle,
                      padding:         "1px 6px",
                      borderRadius:    t.radiusFull,
                    }}>
                      {tr("nfc.custom")}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Reset button — only when custom */}
            {custom && !isScanning && (
              <button
                onClick={() => resetCard(slot)}
                style={{
                  background:   "none",
                  border:       "none",
                  cursor:       "pointer",
                  padding:      "4px",
                  color:        t.textMuted,
                  display:      "flex",
                  alignItems:   "center",
                }}
                title={tr("nfc.resetToDefault")}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Scanning state */}
          {isScanning ? (
            <div style={{
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "space-between",
              padding:         "12px 14px",
              borderRadius:    t.radiusMd,
              backgroundColor: t.primarySubtle,
              border:          `1px dashed ${t.primary}`,
            }}>
              <div style={{
                display:    "flex",
                alignItems: "center",
                gap:        "10px",
              }}>
                <Wifi
                  size={18}
                  color={t.primary}
                  style={{ animation: "pulse 1s infinite" }}
                />
                <span style={{
                  fontFamily,
                  ...TEXT_STYLE.label,
                  color: t.primary,
                }}>
                  {tr("nfc.tapCard")}
                </span>
              </div>
              <button
                onClick={cancelScan}
                style={{
                  background:   "none",
                  border:       "none",
                  cursor:       "pointer",
                  fontFamily,
                  fontSize:     "13px",
                  color:        t.textMuted,
                }}
              >
                {tr("nfc.cancel")}
              </button>
            </div>
          ) : isSaved ? (
            <div style={{
              display:         "flex",
              alignItems:      "center",
              gap:             "8px",
              padding:         "10px 14px",
              borderRadius:    t.radiusMd,
              backgroundColor: t.successSubtle,
            }}>
              <CheckCircle size={16} color={t.success} />
              <span style={{
                fontFamily,
                ...TEXT_STYLE.label,
                color: t.success,
              }}>
                {tr("nfc.saved")}
              </span>
            </div>
          ) : (
            <button
              onClick={() => startScan(slot)}
              style={{
                padding:         "10px 14px",
                borderRadius:    t.radiusMd,
                backgroundColor: t.surface,
                border:          `1px solid ${t.borderDefault}`,
                cursor:          "pointer",
                fontFamily,
                ...TEXT_STYLE.label,
                color:           t.textBody,
                textAlign:       "left",
              }}
            >
              {custom
                ? tr("nfc.replaceCard")
                : tr("nfc.registerCard")}
            </button>
          )}
        </div>
      );
    };

    return (
      <div style={{
        display:       "flex",
        flexDirection: "column",
        gap:           "12px",
        marginTop:     "8px",
      }}>

        {/* Section header */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
        }}>
          <p style={{
            fontFamily,
            ...TEXT_STYLE.sectionTitle,
            color:  t.textHeading,
            margin: 0,
          }}>
            {tr("nfc.title")}
          </p>
          {/* Reset all */}
          {(cards.patientCardUid || cards.nurseCardUid) && (
            <button
              onClick={() => {
                clearRegisteredCards();
                setCards({
                  patientCardUid: null,
                  nurseCardUid:   null,
                });
              }}
              style={{
                background: "none",
                border:     "none",
                cursor:     "pointer",
                fontFamily,
                fontSize:   "13px",
                color:      t.textMuted,
              }}
            >
              {tr("nfc.resetAll")}
            </button>
          )}
        </div>

        <p style={{
          fontFamily,
          ...TEXT_STYLE.caption,
          color:  t.textMuted,
          margin: 0,
        }}>
          {tr("nfc.description")}
        </p>

        <CardRow
          slot="patient"
          label={tr("nfc.patientCard")}
        />
        <CardRow
          slot="nurse"
          label={tr("nfc.nurseCard")}
        />
      </div>
    );
  }
