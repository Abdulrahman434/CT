import { useState } from "react";
import { ApiImage } from "../../ApiImage";
import { Users, AlertTriangle, Apple, Plus, X, Activity, Eye, EyeOff, Info } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { useLocale } from "../../i18n";
import { useNurseStore, nurseActions } from "../../NurseDataStore";

const DIET_OPTIONS = [
  { value: "regular",        label: "Regular" },
  { value: "diabetic",       label: "Diabetic" },
  { value: "low-sodium",     label: "Low Sodium" },
  { value: "low-potassium",  label: "Low Potassium" },
  { value: "soft-diet",      label: "Soft Diet" },
  { value: "chemotherapy",   label: "Chemotherapy" },
  { value: "ob",             label: "OB" },
  { value: "kids",           label: "Kids Menu" },
  { value: "npo",            label: "NPO" },
];

function painColor(n: number) {
  if (n <= 0) return "#94A3B8";
  if (n < 4) return "#10B981";
  if (n < 7) return "#F59E0B";
  return "#EF4444";
}
function painLabel(n: number) {
  if (n <= 0) return "None";
  if (n < 4) return "Mild";
  if (n < 7) return "Moderate";
  return "Severe";
}

export function CareOverviewTab({ role }: { role: "nurse" | "doctor" }) {
  const { theme: t } = useTheme();
  const { t: tr } = useLocale();
  const store = useNurseStore();
  const isNurse = role === "nurse";

  const [newAllergy, setNewAllergy] = useState("");

  const pc = painColor(store.painScore);

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
              <span style={{ fontSize: "12px", color: t.textMuted }}>Toggle visibility for "Care Overview" on the bedside screen</span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={store.sectionVisibility.careOverview}
              onChange={(e) => nurseActions.setSectionVisible("careOverview", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"
              style={{ backgroundColor: store.sectionVisibility.careOverview ? t.primary : "#E5E7EB" }} />
          </label>
        </div>
      )}

      {/* Care Team */}
      <div className="nurse-card">
        <h3 style={{ color: t.textHeading }}><Users size={18} style={{ color: t.primary }} /> Care Team</h3>
        <div className="space-y-3">
          {store.careTeam.map((m) => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ backgroundColor: "#F9FAFB", border: `1px solid ${t.borderDefault}` }}>
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                <ApiImage src={m.img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p style={{ fontSize: "14px", fontWeight: 700, color: t.textHeading }}>{tr(m.nameKey)}</p>
                <p style={{ fontSize: "12px", fontWeight: 600, color: t.primary }}>{tr(m.roleKey)}</p>
              </div>
              {isNurse && (
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "11px", color: t.textMuted }}>{m.visible ? "Visible" : "Hidden"}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={m.visible}
                      onChange={() => nurseActions.toggleCareTeamMemberVisibility(m.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"
                      style={{ backgroundColor: m.visible ? t.primary : "#E5E7EB" }} />
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Allergies */}
      <div className="nurse-card">
        <h3 style={{ color: t.textHeading }}><AlertTriangle size={18} style={{ color: t.error }} /> Allergies</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {store.allergies.map((a) => (
            <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ fontSize: "13px", fontWeight: 700, color: t.error, backgroundColor: t.errorSubtle, border: `1px solid ${t.errorSubtle}` }}>
              <AlertTriangle size={12} /> {a}
              {isNurse && (
                <button onClick={() => nurseActions.removeAllergy(a)} className="ml-1 cursor-pointer" style={{ background: "none", border: "none", color: t.error }}>
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
        {isNurse && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p style={{ fontSize: "12px", fontWeight: 700, color: t.textMuted, marginBottom: 8 }}>Available Allergies (Tap to add/remove):</p>
            <div className="flex flex-wrap gap-2">
              {["Penicillin", "Latex", "Shellfish", "Aspirin", "Peanuts", "Sulfonamides", "Morphine", "Eggs", "Dairy"].map(allergy => {
                const isActive = store.allergies.includes(allergy);
                return (
                  <button
                    key={allergy}
                    onClick={() => isActive ? nurseActions.removeAllergy(allergy) : nurseActions.addAllergy(allergy)}
                    className="px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all"
                    style={{
                      backgroundColor: isActive ? t.errorSubtle : "#F3F4F6",
                      color: isActive ? t.error : t.textMuted,
                      border: `1px solid ${isActive ? t.error : "transparent"}`,
                      cursor: "pointer"
                    }}
                  >
                    {allergy}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Patient Diet (single-select) */}
      <div className="nurse-card">
        <h3 style={{ color: t.textHeading }}><Apple size={18} style={{ color: t.primary }} /> Patient Diet</h3>
        {/* Current selection */}
        <div className="mb-3">
          <span className="px-4 py-2 rounded-xl inline-flex items-center gap-2"
            style={{ fontSize: "14px", fontWeight: 700, color: store.patientDiet === "npo" ? t.error : t.primary, backgroundColor: store.patientDiet === "npo" ? t.errorSubtle : t.primarySubtle }}>
            {(DIET_OPTIONS.find(d => d.value === store.patientDiet) || DIET_OPTIONS[0]).label}
          </span>
        </div>
        {isNurse && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p style={{ fontSize: "12px", fontWeight: 700, color: t.textMuted, marginBottom: 8 }}>Select Patient Diet:</p>
            <div className="flex flex-wrap gap-2">
              {DIET_OPTIONS.map(diet => {
                const isActive = store.patientDiet === diet.value;
                const isNpo = diet.value === "npo";
                return (
                  <button
                    key={diet.value}
                    onClick={() => nurseActions.setPatientDiet(diet.value)}
                    className="px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all text-left cursor-pointer"
                    style={{
                      backgroundColor: isActive ? (isNpo ? t.errorSubtle : t.primarySubtle) : "#F3F4F6",
                      color: isActive ? (isNpo ? t.error : t.primary) : t.textMuted,
                      border: `1px solid ${isActive ? (isNpo ? t.error : t.primary) : "transparent"}`,
                    }}
                  >
                    {diet.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pain Score */}
      <div className="nurse-card">
        <h3 style={{ color: t.textHeading }}><Activity size={18} style={{ color: pc }} /> Pain Score</h3>
        <div className="flex items-center gap-4">
          <span style={{ fontSize: "36px", fontWeight: 900, color: pc }}>{store.painScore}<span style={{ fontSize: "18px", color: t.textMuted }}>/10</span></span>
          <span style={{ fontSize: "12px", fontWeight: 800, color: pc, backgroundColor: `${pc}18`, padding: "4px 12px", borderRadius: 99 }}>{painLabel(store.painScore).toUpperCase()}</span>
        </div>
        {isNurse && (
          <div className="mt-4">
            <input type="range" min={0} max={10} value={store.painScore}
              onChange={(e) => nurseActions.setPainScore(Number(e.target.value))}
              className="w-full cursor-pointer" style={{ accentColor: pc }} />
            <div className="flex justify-between mt-1" style={{ fontSize: "11px", color: t.textMuted }}>
              <span>0 — None</span><span>10 — Severe</span>
            </div>
          </div>
        )}
      </div>
      {/* HIS Disclaimer Note */}
      <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ backgroundColor: `${t.primary}08`, border: `1px dashed ${t.primary}40` }}>
        <Info size={20} style={{ color: t.primary, marginTop: 2 }} />
        <div className="flex flex-col gap-1">
          <p style={{ fontSize: "13px", fontWeight: 700, color: t.textHeading }}>Clinical Data Source Note</p>
          <p style={{ fontSize: "12px", color: t.textMuted, lineHeight: "1.5" }}>
            Information is synchronized from the Hospital Information System (HIS). Manual adjustments made here are for <strong>local bedside display only</strong> and will not update the patient's permanent Electronic Medical Record (EMR).
            <br />
            <em>Note: Any future updates from the HIS will automatically overwrite manual adjustments.</em>
          </p>
        </div>
      </div>
    </div>
  );
}
