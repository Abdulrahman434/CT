import { Lock } from "lucide-react";

export function LockBadge() {
  return (
    <div style={{
      position: "absolute",
      bottom: "10px", right: "10px",
      width: "24px", height: "24px",
      borderRadius: "50%",
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)",
      zIndex: 10,
    }}>
      <Lock size={12} color="#fff" />
    </div>
  );
}
