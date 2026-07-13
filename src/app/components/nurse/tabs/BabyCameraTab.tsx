import { Baby, Eye, EyeOff, Circle } from "lucide-react";
import { ApiImage } from "../../ApiImage";
import { useTheme } from "../../ThemeContext";
import { useNurseStore, nurseActions } from "../../NurseDataStore";

export function BabyCameraTab({ role }: { role: "nurse" | "doctor" }) {
  const { theme: t } = useTheme();
  const store = useNurseStore();
  const isNurse = role === "nurse";

  return (
    <div className="space-y-5">
      {isNurse && (
        <div className="nurse-card flex items-center justify-between" style={{ marginBottom: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: t.primarySubtle }}>
              <Eye size={18} style={{ color: t.primary }} />
            </div>
            <div>
              <span style={{ fontSize: "14px", fontWeight: 700, color: t.textHeading, display: "block" }}>Show Section to Patient</span>
              <span style={{ fontSize: "12px", color: t.textMuted }}>Toggle visibility for "Baby Camera" on the bedside screen</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={store.sectionVisibility.baby}
              onChange={(e) => nurseActions.setSectionVisible("baby", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"
              style={{ backgroundColor: store.sectionVisibility.baby ? t.primary : "#E5E7EB" }} />
          </label>
        </div>
      )}

      <div className="nurse-card">
      <h3 style={{ color: t.textHeading }}><Baby size={18} style={{ color: t.primary }} /> Baby Camera</h3>
      <div className="space-y-4">
        {store.babyCameras.map((cam) => (
          <div key={cam.id} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${t.borderDefault}`, opacity: cam.visible ? 1 : 0.4 }}>
            {/* Video placeholder */}
            <div className="relative w-full" style={{ aspectRatio: "16/9", backgroundColor: "#000" }}>
              <ApiImage src={cam.src} alt={cam.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md" style={{ backgroundColor: "rgba(239,68,68,0.9)" }}>
                <Circle size={7} fill="#fff" style={{ color: "#fff" }} />
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#fff", letterSpacing: "0.5px" }}>LIVE</span>
              </div>
            </div>
            {/* Info */}
            <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#fff" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: t.primarySubtle }}>
                  <Baby size={16} style={{ color: t.primary }} />
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: t.textHeading }}>{cam.name}</p>
                  <p style={{ fontSize: "12px", color: t.textMuted }}>{cam.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {cam.connected && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: t.successSubtle }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.success }} />
                    <span style={{ fontSize: "11px", fontWeight: 700, color: t.success }}>Connected</span>
                  </div>
                )}
                {isNurse && (
                  <button onClick={() => nurseActions.setBabyCameraVisible(cam.id, !cam.visible)}
                    className="p-2 rounded-lg cursor-pointer" style={{ backgroundColor: cam.visible ? t.primarySubtle : t.errorSubtle, border: "none" }}>
                    {cam.visible ? <Eye size={14} style={{ color: t.primary }} /> : <EyeOff size={14} style={{ color: t.error }} />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
