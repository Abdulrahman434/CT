import { useState } from "react";
import { User, Save, X, CheckCircle2 } from "lucide-react";
import { useTheme } from "../../ThemeContext";
import { useNurseStore, nurseActions } from "../../NurseDataStore";

export function PatientProfileTab({ role }: { role: "nurse" | "doctor" }) {
  const { theme: t } = useTheme();
  const store = useNurseStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(store.patient);
  const [saved, setSaved] = useState(false);
  const isReadOnly = role === "doctor";

  const handleSave = () => {
    nurseActions.updatePatientFromNurse(draft);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCancel = () => {
    setDraft(store.patient);
    setEditing(false);
  };

  const fields = [
    { key: "name", label: "Full Name (English)", span: 1, disabled: true },
    { key: "nameAr", label: "Full Name (Arabic)", span: 1, disabled: true },
    { key: "age", label: "Age" },
    { key: "mrn", label: "MRN" },
    { key: "room", label: "Room" },
    { key: "bed", label: "Bed" },
    { key: "extension", label: "Extension" },
    { key: "admissionDate", label: "Admission Date" },
    { key: "dischargeDate", label: "Expected Discharge" },
    { key: "contact", label: "Contact Number", span: 2 },
    { key: "emergencyName", label: "Emergency Contact Name" },
    { key: "emergencyContact", label: "Emergency Contact Number" },
  ] as const;

  return (
    <div className="nurse-card">
      <div className="flex items-center justify-between mb-6">
        <h3 style={{ color: t.textHeading, margin: 0 }}>
          <User size={20} style={{ color: t.primary }} /> Patient Profile
        </h3>
        {!isReadOnly && !editing && (
          <button
            onClick={() => { setDraft(store.patient); setEditing(true); }}
            className="px-4 py-2 rounded-xl cursor-pointer transition-all active:scale-95"
            style={{ fontSize: "13px", fontWeight: 700, color: t.primary, backgroundColor: t.primarySubtle, border: "none" }}
          >
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} style={{ gridColumn: f.span === 2 ? "span 2" : undefined }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted, display: "block", marginBottom: 6 }}>
              {f.label}
            </label>
            {editing ? (
              <input
                value={draft[f.key]}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                disabled={(f as any).disabled}
                className="w-full outline-none transition-all"
                style={{
                  padding: "10px 14px", borderRadius: 12, fontSize: "15px", fontWeight: 600,
                  color: (f as any).disabled ? t.textDisabled : t.textHeading, 
                  border: `1.5px solid ${t.borderDefault}`, 
                  backgroundColor: (f as any).disabled ? t.borderSubtle : t.surface,
                  cursor: (f as any).disabled ? "not-allowed" : "text"
                }}
                onFocus={(e) => !(f as any).disabled && (e.target.style.borderColor = t.primary)}
                onBlur={(e) => (e.target.style.borderColor = t.borderDefault)}
              />
            ) : (
              <div
                style={{
                  padding: "10px 14px", borderRadius: 12, fontSize: "15px", fontWeight: 600,
                  color: t.textHeading, backgroundColor: "#F9FAFB", border: `1px solid ${t.borderDefault}`,
                }}
              >
                {store.patient[f.key] || "—"}
              </div>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="flex items-center gap-3 mt-6 pt-5" style={{ borderTop: `1px solid ${t.borderDefault}` }}>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
            style={{ backgroundColor: t.primary, color: "#fff", fontSize: "14px", border: "none" }}
          >
            <Save size={16} /> Save
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-3 rounded-xl font-bold cursor-pointer"
            style={{ fontSize: "14px", color: t.textMuted, border: `1.5px solid ${t.borderDefault}`, backgroundColor: "#fff" }}
          >
            Cancel
          </button>
        </div>
      )}

      {!editing && !isReadOnly && (
        <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${t.borderDefault}` }}>
          <h4 style={{ fontSize: "14px", fontWeight: 700, color: t.textHeading, marginBottom: 12 }}>
            CareMe Integration
          </h4>
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: "#F9FAFB", border: `1px solid ${t.borderDefault}` }}>
            <div className="flex flex-col gap-1">
              <span style={{ fontSize: "14px", fontWeight: 700, color: t.textHeading }}>
                "Nurse View" Shortcut Button
              </span>
              <span style={{ fontSize: "12px", color: t.textMuted }}>
                Show the stethoscope button on the patient's CareMe widget header
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={store.nurseViewShortcutVisible}
                onChange={(e) => nurseActions.setNurseViewShortcutVisible(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"
                style={{ backgroundColor: store.nurseViewShortcutVisible ? t.primary : "#E5E7EB" }} />
            </label>
          </div>
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 mt-4" style={{ color: t.success, fontSize: "14px", fontWeight: 700 }}>
          <CheckCircle2 size={16} /> Saved successfully
        </div>
      )}
    </div>
  );
}
