import { useState } from "react";
import {
  Activity, Droplet, Thermometer, Wind, Save, CheckCircle2,
  Clock, Trash2, Stethoscope, AlertTriangle, ClipboardList, Eye
} from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { useLocale } from "../../i18n";
import { useNurseStore, nurseActions, type ClinicalObservation, type DoctorNote } from "../../NurseDataStore";

function fmtFull(d: Date) {
  return `${d.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" })} • ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}
function painColor(n: number) {
  if (n <= 0) return "#94A3B8";
  if (n < 4) return "#10B981";
  if (n < 7) return "#F59E0B";
  return "#EF4444";
}

export function ObservationsTab({ role }: { role: "nurse" | "doctor" }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLocale();
  const store = useNurseStore();
  const isNurse = role === "nurse";

  const [isAdding, setIsAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Form state
  const blankForm = { vitals: { bp: "", hr: "", temp: "", spo2: "" }, painLevel: 0, risks: { fall: false, pressure: false, allergies: false, other: false }, nurseNotes: "" };
  const [form, setForm] = useState(blankForm);

  // Doctor note
  const [docNote, setDocNote] = useState("");
  const [docSaved, setDocSaved] = useState(false);

  const activeObs = store.observations.find((o) => o.id === selectedId) || store.observations[store.observations.length - 1] || null;

  const handleSave = () => {
    const obs: ClinicalObservation = {
      id: Date.now().toString(36),
      timestamp: new Date(),
      nurseName: "clinical.nurse.nura",
      vitals: form.vitals,
      painLevel: form.painLevel,
      risks: form.risks,
      nurseNotes: form.nurseNotes,
      doctorNote: null,
    };
    nurseActions.addObservation(obs);
    setSelectedId(obs.id);
    setForm(blankForm);
    setIsAdding(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDocSave = () => {
    if (!activeObs || !docNote.trim()) return;
    nurseActions.addDoctorNote(activeObs.id, { text: docNote.trim(), addedAt: new Date(), doctorName: "Dr. Omar Abdulhalim" });
    setDocNote("");
    setDocSaved(true);
    setTimeout(() => setDocSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      {isNurse && (
        <div className="nurse-card flex items-center justify-between" style={{ marginBottom: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: t.primarySubtle }}>
              <Eye size={18} style={{ color: t.primary }} />
            </div>
            <div>
              <span style={{ fontSize: "14px", fontWeight: 700, color: t.textHeading, display: "block" }}>Show Section to Patient</span>
              <span style={{ fontSize: "12px", color: t.textMuted }}>Toggle visibility for "Observations" on the bedside screen</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={store.sectionVisibility.observations}
              onChange={(e) => nurseActions.setSectionVisible("observations", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"
              style={{ backgroundColor: store.sectionVisibility.observations ? t.primary : "#E5E7EB" }} />
          </label>
        </div>
      )}

      <div className="flex gap-5" style={{ minHeight: 500 }}>
      {/* Main content */}
      <div className="flex-1">
        {isAdding ? (
          <div className="nurse-card">
            <h3 style={{ color: t.textHeading }}><ClipboardList size={18} style={{ color: t.primary }} /> New Observation</h3>
            <p style={{ fontSize: "13px", color: t.textMuted, marginBottom: 16 }}>{fmtFull(new Date())}</p>

            {/* Vitals */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { key: "bp", label: "Blood Pressure", unit: "mmHg", icon: <Droplet size={14} color="#EF4444" />, placeholder: "120/80" },
                { key: "hr", label: "Heart Rate", unit: "BPM", icon: <Activity size={14} color="#F43F5E" />, placeholder: "72" },
                { key: "temp", label: "Temperature", unit: "°C", icon: <Thermometer size={14} color="#F59E0B" />, placeholder: "37.0" },
                { key: "spo2", label: "O₂ Saturation", unit: "%", icon: <Wind size={14} style={{ color: t.primary }} />, placeholder: "98" },
              ].map((v) => (
                <div key={v.key} className="p-3 rounded-xl" style={{ backgroundColor: "#F9FAFB", border: `1px solid ${t.borderDefault}` }}>
                  <div className="flex items-center gap-1.5 mb-2">{v.icon}<span style={{ fontSize: "10px", fontWeight: 700, color: t.textMuted }}>{v.label}</span></div>
                  <div className="flex items-baseline gap-1">
                    <input
                      value={(form.vitals as any)[v.key]}
                      onChange={(e) => {
                        let val = e.target.value;
                        
                        if (v.key === "hr") {
                          val = val.replace(/\D/g, "").slice(0, 3);
                        } else if (v.key === "spo2") {
                          val = val.replace(/\D/g, "");
                          if (Number(val) > 100) val = "100";
                        } else if (v.key === "temp") {
                          val = val.replace(/[^0-9.]/g, "");
                          if ((val.match(/\./g) || []).length > 1) val = val.slice(0, -1);
                        } else if (v.key === "bp") {
                          // Allow numbers and one slash, max 3 digits per side
                          val = val.replace(/[^0-9/]/g, "");
                          const parts = val.split("/");
                          if (parts.length > 2) val = parts[0] + "/" + parts[1];
                          const p0 = parts[0]?.slice(0, 3) || "";
                          const p1 = parts[1]?.slice(0, 3) || "";
                          val = parts.length > 1 ? `${p0}/${p1}` : p0;
                        }

                        setForm({ ...form, vitals: { ...form.vitals, [v.key]: val } });
                      }}
                      placeholder={v.placeholder}
                      inputMode={v.key === "temp" ? "decimal" : "numeric"}
                      className="bg-transparent border-none outline-none w-full"
                      style={{ fontSize: "20px", fontWeight: 900, color: t.textHeading }}
                    />
                    <span style={{ fontSize: "11px", color: t.textMuted }}>{v.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pain */}
            <div className="mb-5">
              <span style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted }}>Pain Level: {form.painLevel}/10</span>
              <input type="range" min={0} max={10} value={form.painLevel}
                onChange={(e) => setForm({ ...form, painLevel: Number(e.target.value) })}
                className="w-full mt-2" style={{ accentColor: painColor(form.painLevel) }} />
            </div>

            {/* Risks */}
            <div className="mb-5">
              <span style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted }}>Risk Assessment</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {(["fall", "pressure", "allergies", "other"] as const).map((k) => (
                  <button key={k} onClick={() => setForm({ ...form, risks: { ...form.risks, [k]: !form.risks[k] } })}
                    className="px-3 py-1.5 rounded-full cursor-pointer transition-all"
                    style={{ fontSize: "12px", fontWeight: 700, backgroundColor: form.risks[k] ? t.errorSubtle : "#F9FAFB", color: form.risks[k] ? t.error : t.textMuted, border: `1px solid ${form.risks[k] ? t.errorSubtle : t.borderDefault}` }}>
                    <AlertTriangle size={12} className="inline mr-1" /> {k.charAt(0).toUpperCase() + k.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <textarea value={form.nurseNotes} onChange={(e) => setForm({ ...form, nurseNotes: e.target.value })}
              placeholder="Progress notes..." rows={3} className="w-full resize-none outline-none mb-4"
              style={{ padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${t.borderDefault}`, fontSize: "14px", fontFamily: "inherit" }} />

            <div className="flex items-center gap-3">
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
                style={{ backgroundColor: saved ? t.success : t.primary, color: "#fff", fontSize: "14px", border: "none" }}>
                {saved ? <CheckCircle2 size={16} /> : <Save size={16} />} {saved ? "Saved!" : "Save Observation"}
              </button>
              <button onClick={() => { setIsAdding(false); setForm(blankForm); }}
                className="px-6 py-3 rounded-xl font-bold cursor-pointer" style={{ fontSize: "14px", color: t.textMuted, border: `1.5px solid ${t.borderDefault}`, backgroundColor: "#fff" }}>
                Cancel
              </button>
            </div>
          </div>
        ) : activeObs ? (
          <div className="nurse-card">
            <div className="mb-4">
              <span style={{ fontSize: "12px", fontWeight: 700, color: t.primary }}>Observation Review</span>
              <div className="flex items-center gap-2 mt-1">
                <span style={{ fontSize: "16px", fontWeight: 800, color: t.textHeading }}>{tr(activeObs.nurseName)}</span>
                <span style={{ color: t.textMuted, opacity: 0.3 }}>|</span>
                <span style={{ fontSize: "13px", color: t.textMuted }}>{fmtFull(activeObs.timestamp)}</span>
              </div>
            </div>

            {/* Vitals */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { val: activeObs.vitals.bp, label: "BP", unit: "mmHg", icon: <Droplet size={14} color="#EF4444" /> },
                { val: activeObs.vitals.hr, label: "HR", unit: "BPM", icon: <Activity size={14} color="#F43F5E" /> },
                { val: activeObs.vitals.temp, label: "Temp", unit: "°C", icon: <Thermometer size={14} color="#F59E0B" /> },
                { val: activeObs.vitals.spo2, label: "SpO₂", unit: "%", icon: <Wind size={14} style={{ color: t.primary }} /> },
              ].map((v) => (
                <div key={v.label} className="p-3 rounded-xl" style={{ backgroundColor: "#F9FAFB", border: `1px solid ${t.borderDefault}` }}>
                  <div className="flex items-center gap-1.5 mb-2">{v.icon}<span style={{ fontSize: "10px", fontWeight: 700, color: t.textMuted }}>{v.label}</span></div>
                  <span style={{ fontSize: "20px", fontWeight: 900, color: t.textHeading }}>{v.val || "—"}</span>
                  <span style={{ fontSize: "11px", color: t.textMuted, marginLeft: 4 }}>{v.unit}</span>
                </div>
              ))}
            </div>

            {/* Pain + Notes */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="p-4 rounded-xl" style={{ backgroundColor: "#F9FAFB", border: `1px solid ${t.borderDefault}` }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted }}>Pain</span>
                <div className="flex items-center gap-2 mt-2">
                  <span style={{ fontSize: "28px", fontWeight: 900, color: painColor(activeObs.painLevel) }}>{activeObs.painLevel}<span style={{ fontSize: "14px", color: t.textMuted }}>/10</span></span>
                </div>
              </div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: "#F9FAFB", border: `1px solid ${t.borderDefault}` }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted }}>Notes</span>
                <p className="mt-2" style={{ fontSize: "14px", color: t.textBody, lineHeight: 1.6 }}>{activeObs.nurseNotes || "—"}</p>
              </div>
            </div>

            {/* Doctor Note */}
            {activeObs.doctorNote && (
              <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: t.primarySubtle, border: `1px solid ${t.borderDefault}` }}>
                <div className="flex items-center gap-2 mb-2"><Stethoscope size={14} style={{ color: t.primary }} /><span style={{ fontSize: "13px", fontWeight: 700, color: t.primary }}>Physician Note</span></div>
                <p style={{ fontSize: "14px", color: t.textBody, fontStyle: "italic" }}>{activeObs.doctorNote.text}</p>
                <p style={{ fontSize: "12px", color: t.primary, fontWeight: 700, marginTop: 6 }}>{activeObs.doctorNote.doctorName} · {fmtFull(activeObs.doctorNote.addedAt)}</p>
              </div>
            )}

            {/* Doctor add note */}
            {role === "doctor" && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${t.borderDefault}` }}>
                <div className="flex items-center gap-2 mb-3"><Stethoscope size={14} style={{ color: t.primary }} /><span style={{ fontSize: "14px", fontWeight: 700, color: t.textHeading }}>Add Physician Note</span></div>
                <textarea value={docNote} onChange={(e) => setDocNote(e.target.value)} placeholder="Enter physician note..."
                  rows={2} className="w-full resize-none outline-none mb-3"
                  style={{ padding: "10px 14px", borderRadius: 12, border: `1.5px solid ${t.borderDefault}`, fontSize: "14px", fontFamily: "inherit" }} />
                <button onClick={handleDocSave} disabled={!docNote.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
                  style={{ backgroundColor: docSaved ? t.success : (docNote.trim() ? t.primary : t.borderDefault), color: "#fff", fontSize: "13px", border: "none" }}>
                  {docSaved ? <CheckCircle2 size={14} /> : <Save size={14} />} {docSaved ? "Saved" : "Save Note"}
                </button>
              </div>
            )}

            {isNurse && (
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${t.borderDefault}` }}>
                <button onClick={() => setIsAdding(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl cursor-pointer transition-all active:scale-95"
                  style={{ backgroundColor: t.primary, color: "#fff", fontSize: "14px", fontWeight: 700, border: "none" }}>
                  Add New Observation
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="nurse-card flex flex-col items-center justify-center py-16">
            <ClipboardList size={40} style={{ color: t.textMuted, opacity: 0.5 }} />
            <p className="mt-4" style={{ fontSize: "14px", color: t.textMuted }}>No observations recorded yet.</p>
            {isNurse && (
              <button onClick={() => setIsAdding(true)} className="mt-4 px-5 py-3 rounded-xl cursor-pointer"
                style={{ backgroundColor: t.primary, color: "#fff", fontWeight: 700, border: "none" }}>
                Add First Observation
              </button>
            )}
          </div>
        )}
      </div>

      {/* History sidebar */}
      <div className="shrink-0" style={{ width: 300 }}>
        <div className="nurse-card" style={{ position: "sticky", top: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontSize: "14px", fontWeight: 700, color: t.textHeading }}>History</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: t.primary, backgroundColor: t.primarySubtle, padding: "2px 10px", borderRadius: 99 }}>{store.observations.length}</span>
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto ni-scroll">
            {[...store.observations].reverse().map((obs) => (
              <div key={obs.id} onClick={() => { setSelectedId(obs.id); setIsAdding(false); }}
                className="group p-3 rounded-xl cursor-pointer transition-all hover:shadow-md"
                style={{ backgroundColor: "#fff", border: selectedId === obs.id || (!selectedId && obs.id === activeObs?.id) ? `2px solid ${t.primary}` : `1px solid ${t.borderDefault}` }}>
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: t.primary, backgroundColor: t.primarySubtle, padding: "2px 8px", borderRadius: 99 }}>NURSE</span>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: t.textHeading, marginTop: 4 }}>{tr(obs.nurseName)}</p>
                    <p className="flex items-center gap-1 mt-0.5" style={{ fontSize: "11px", color: t.textMuted }}><Clock size={10} /> {fmtFull(obs.timestamp)}</p>
                  </div>
                  {isNurse && (
                    <button onClick={(e) => { e.stopPropagation(); nurseActions.deleteObservation(obs.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded cursor-pointer" style={{ background: "none", border: "none" }}>
                      <Trash2 size={12} style={{ color: t.error }} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[obs.vitals.bp, obs.vitals.hr, obs.vitals.temp + "°", obs.vitals.spo2 + "%"].map((v, i) => (
                    <div key={i} className="px-1.5 py-1 rounded-lg text-center" style={{ backgroundColor: t.primarySubtle, fontSize: "10px", fontWeight: 700, color: t.textHeading }}>{v}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
