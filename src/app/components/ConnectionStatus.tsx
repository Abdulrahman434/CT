import { RefreshCw } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useLocale } from "./i18n";
import {
  useConnectionStatus, timeAgo, ConnState,
} from "../lib/connectionStatus";

const DOT: Record<ConnState, string> = {
  connected: "#22c55e",  // green
  stale:     "#f59e0b",  // amber
  bundled:   "#f59e0b",  // amber (active offline)
  offline:   "#ef4444",  // red
};

export function ConnectionStatus() {
  const { theme: t } = useTheme();
  const { t: tr, fontFamily } = useLocale();
  const { state, lastContact, showRefresh, refresh } =
    useConnectionStatus();

  const label =
    state === "connected" ? tr("conn.connected")
    : state === "offline" ? tr("conn.offline")
    : state === "bundled" ? tr("conn.activeOffline")
    : `${tr("conn.lastUpdate")} ${timeAgo(lastContact)} ${tr("conn.ago")}`;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        backgroundColor: DOT[state], flexShrink: 0,
      }} />
      <span style={{
        fontFamily, fontSize: 11, color: t.textMuted,
        whiteSpace: "nowrap", letterSpacing: 0.2,
      }}>{label}</span>
      {showRefresh && (
        <button
          onClick={refresh}
          aria-label={tr("conn.refresh")}
          style={{
            background: "none", border: "none", padding: 2,
            cursor: "pointer", display: "flex", alignItems: "center",
            color: t.textMuted,
          }}
        >
          <RefreshCw size={12} />
        </button>
      )}
    </div>
  );
}
