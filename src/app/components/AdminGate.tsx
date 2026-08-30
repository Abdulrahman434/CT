import { useCallback, useEffect, useRef, useState } from "react";
import { X, ShieldCheck, RotateCcw } from "lucide-react";
import {
  verifyAdminCode,
  getContentStatus,
  setContentMode,
  setContentBaseUrl,
  resetContentBaseUrl,
  resetFirstRun,
  ContentStatus,
  ContentModeValue,
} from "../utils/androidBridge";

const TAP_COUNT = 4;
const TAP_WINDOW_MS = 2000;

/**
 * Hidden admin entry point: tap the top bar 4 times within 2 seconds to
 * reveal a blank, unlabeled password field. The code itself is verified
 * natively (SystemBridge.verifyAdminCode) — it is never stored or checked
 * in this file, so it can't be read from the web bundle.
 *
 * Mount once near the top bar and call `registerTap()` from its onClick.
 */
export function useAdminGateTap() {
  const taps = useRef<number[]>([]);
  const [armed, setArmed] = useState(false);

  const registerTap = useCallback(() => {
    const now = Date.now();
    taps.current = [...taps.current, now].filter(t => now - t <= TAP_WINDOW_MS);
    if (taps.current.length >= TAP_COUNT) {
      taps.current = [];
      setArmed(true);
    }
  }, []);

  return { armed, setArmed, registerTap };
}

export function AdminGate({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stage, setStage] = useState<"password" | "panel">("password");
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<ContentStatus | null>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStage("password");
    setCode("");
    setError(false);
  }, [open]);

  useEffect(() => {
    if (stage !== "panel") return;
    const s = getContentStatus();
    setStatus(s);
    setUrlDraft(s?.baseUrl || "");
  }, [stage]);

  if (!open) return null;

  const submitCode = () => {
    if (verifyAdminCode(code)) {
      setStage("panel");
      setError(false);
    } else {
      setError(true);
      setCode("");
    }
  };

  const flash = (msg: string) => {
    setSavedFlash(msg);
    setTimeout(() => setSavedFlash(null), 1500);
  };

  const applyMode = (mode: ContentModeValue) => {
    setContentMode(mode);
    setStatus(s => (s ? { ...s, mode, provisioned: true } : s));
    flash(`Mode set to ${mode}`);
  };

  const saveUrl = () => {
    if (!urlDraft.trim()) return;
    setContentBaseUrl(urlDraft.trim());
    setStatus(s => (s ? { ...s, baseUrl: urlDraft.trim() } : s));
    flash("Base URL saved");
  };

  const resetUrl = () => {
    resetContentBaseUrl();
    const s = getContentStatus();
    setStatus(s);
    setUrlDraft(s?.baseUrl || "");
    flash("Base URL reset to default");
  };

  const doResetFirstRun = () => {
    resetFirstRun();
    flash("Setup screen re-opened");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999, backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: stage === "password" ? 280 : 420,
          maxWidth: "92vw",
          backgroundColor: "#1E1F22",
          borderRadius: 14,
          border: "1px solid #3A3A3A",
          boxShadow: "0 16px 48px rgba(0,0,0,.6)",
          padding: 20,
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {stage === "password" ? (
          <>
            {/* Deliberately unlabeled — no title, no hint text */}
            <input
              type="password"
              autoFocus
              value={code}
              onChange={e => { setCode(e.target.value); setError(false); }}
              onKeyDown={e => e.key === "Enter" && submitCode()}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 8,
                border: error ? "1px solid #ef4444" : "1px solid #444",
                backgroundColor: "#111",
                color: "#fff",
                fontSize: 18,
                letterSpacing: 2,
                outline: "none",
                textAlign: "center",
              }}
            />
            <button
              onClick={submitCode}
              style={{
                width: "100%", marginTop: 12, padding: "10px 0",
                borderRadius: 8, border: "none",
                backgroundColor: "#008AAB", color: "#fff",
                fontWeight: 600, cursor: "pointer",
              }}
            >
              OK
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} color="#4ADE80" />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Admin — Content Delivery</span>
              </div>
              <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {savedFlash && (
              <div style={{
                backgroundColor: "rgba(74,222,128,0.12)", color: "#4ADE80",
                borderRadius: 6, padding: "6px 10px", fontSize: 12, marginBottom: 12,
              }}>
                {savedFlash}
              </div>
            )}

            {/* Mode */}
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Delivery Mode</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {(["online", "offline", "noupdates"] as ContentModeValue[]).map(m => (
                <button
                  key={m}
                  onClick={() => applyMode(m)}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 600,
                    cursor: "pointer",
                    border: status?.mode === m ? "1px solid #008AAB" : "1px solid #3A3A3A",
                    backgroundColor: status?.mode === m ? "rgba(0,138,171,0.18)" : "#2A2A2A",
                    color: status?.mode === m ? "#4AC8E8" : "#ccc",
                  }}
                >
                  {m === "online" ? "Online" : m === "offline" ? "Offline" : "No Updates"}
                </button>
              ))}
            </div>

            {/* Base URL */}
            <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>Web Base URL</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                value={urlDraft}
                onChange={e => setUrlDraft(e.target.value)}
                style={{
                  flex: 1, padding: "8px 10px", borderRadius: 8,
                  border: "1px solid #444", backgroundColor: "#111",
                  color: "#fff", fontSize: 13,
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <button onClick={saveUrl} style={{
                flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
                backgroundColor: "#008AAB", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 12,
              }}>
                Save
              </button>
              <button onClick={resetUrl} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                padding: "8px 12px", borderRadius: 8, border: "1px solid #3A3A3A",
                backgroundColor: "#2A2A2A", color: "#ccc", cursor: "pointer", fontSize: 12,
              }}>
                <RotateCcw size={13} /> Default
              </button>
            </div>
            {status?.defaultBaseUrl && (
              <div style={{ fontSize: 11, color: "#666", marginTop: -12, marginBottom: 18 }}>
                Default: {status.defaultBaseUrl}
              </div>
            )}

            {/* Reset first-run */}
            <div style={{ borderTop: "1px solid #2A2A2A", paddingTop: 14 }}>
              <button
                onClick={doResetFirstRun}
                style={{
                  width: "100%", padding: "10px 0", borderRadius: 8,
                  border: "1px solid #3A3A3A", backgroundColor: "#2A2A2A",
                  color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13,
                }}
              >
                Reset First-Run / Show Setup Screen
              </button>
              <div style={{ fontSize: 11, color: "#666", marginTop: 6 }}>
                Re-opens the Online/Offline setup dialog now — for testing
                or re-provisioning without a reinstall.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
