import React, { useState, useEffect, useCallback } from "react";
import {
  X, Stethoscope, Activity, Thermometer, Wind, Droplet,
  Save, User, ClipboardList, CheckCircle2, Clock, Plus,
  History, Trash2, FileText, AlertTriangle,
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useLocale } from "./i18n";

// ─── Shared Clinical Store ────────────────────────────────────────────────────
// A simple module-level singleton so nurse and doctor interfaces share the same
// observations in real-time within the same session.

interface DoctorNote {
  text: string;
  addedAt: Date;
  doctorName: string;
}

interface ClinicalObservation {
  id: string;
  timestamp: Date;
  nurseName: string;
  vitals: { bp: string; hr: string; temp: string; spo2: string };
  painLevel: number;
  risks: { fall: boolean; pressure: boolean; allergies: boolean; other: boolean };
  otherRiskNotes?: string;
  nurseNotes: string;
  doctorNote: DoctorNote | null;
}

type StoreListener = (obs: ClinicalObservation[]) => void;

const clinicalStore = (() => {
  let observations: ClinicalObservation[] = [
    {
      id: "seed-1",
      timestamp: new Date(Date.now() - 3600000 * 4),
      nurseName: "RN Nura Al-Rashid",
      vitals: { bp: "118/78", hr: "68", temp: "37.0", spo2: "99" },
      painLevel: 1,
      risks: { fall: true, pressure: false, allergies: true, other: false },
      nurseNotes: "Patient resting comfortably. Vitals stable. Tolerating oral intake.",
      doctorNote: {
        text: "Continue current plan. Reassess in the morning.",
        addedAt: new Date(Date.now() - 3600000 * 2),
        doctorName: "Dr. Khalid Al-Ghamdi",
      },
    },
  ];
  const listeners = new Set<StoreListener>();

  return {
    get: () => observations,
    add: (obs: ClinicalObservation) => {
      observations = [...observations, obs];
      listeners.forEach((l) => l(observations));
    },
    addDoctorNote: (id: string, note: DoctorNote) => {
      observations = observations.map((o) =>
        o.id === id ? { ...o, doctorNote: note } : o
      );
      listeners.forEach((l) => l(observations));
    },
    delete: (id: string) => {
      observations = observations.filter((o) => o.id !== id);
      listeners.forEach((l) => l(observations));
    },
    subscribe: (listener: StoreListener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
})();

function useClinicalStore() {
  const [obs, setObs] = useState<ClinicalObservation[]>(clinicalStore.get());
  useEffect(() => clinicalStore.subscribe(setObs), []);
  return obs;
}

// ─── Utilities ─────────────────────────────────────────────────────────────────
function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(d: Date) {
  return d.toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
}
function fmtFull(d: Date) {
  return `${fmtDate(d)} • ${fmtTime(d)}`;
}

// ─── painLabel ─────────────────────────────────────────────────────────────────
function painLabel(n: number) {
  if (n === 0) return "None";
  if (n < 4)  return "Mild";
  if (n < 7)  return "Moderate";
  return "Severe";
}
function painColor(n: number) {
  if (n === 0) return "#22C55E";
  if (n < 4)  return "#F59E0B";
  if (n < 7)  return "#F97316";
  return "#EF4444";
}

// ─── Main Component ────────────────────────────────────────────────────────────
interface CareTeamInterfaceProps {
  role: "nurse" | "doctor";
  onClose: () => void;
}

export function CareTeamInterface({ role, onClose }: CareTeamInterfaceProps) {
  const { theme: t } = useTheme();
  const { t: tr, dir } = useLocale();
  const observations = useClinicalStore();

  const patient = {
    name: "Sara Ahmed", age: "32",
    mrn: "1022340", room: "412-A", admissionDate: "15 Apr 2026",
  };

  // ── Selection State ──────────────────────────────────────────────────────────
  const [selectedObsId, setSelectedObsId] = useState<string | null>(null);
  
  // Active observation: the selected one OR the latest one
  const activeRecord = observations.find(o => o.id === selectedObsId) || (observations[observations.length - 1] ?? null);

  // ── Nurse observation form ──────────────────────────────────────────────────
  type FormState = {
    vitals: ClinicalObservation["vitals"];
    painLevel: number;
    risks: ClinicalObservation["risks"];
    otherRiskNotes: string;
    nurseNotes: string;
  };
  const blankForm: FormState = {
    vitals: { bp: "", hr: "", temp: "", spo2: "" },
    painLevel: 0,
    risks: { fall: false, pressure: false, allergies: false, other: false },
    otherRiskNotes: "",
    nurseNotes: "",
  };
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [form, setForm] = useState<FormState>(blankForm);
  const [nurseSaved, setNurseSaved] = useState(false);

  // ── Doctor note ─────────────────────────────────────────────────────────────
  const [doctorNoteText, setDoctorNoteText] = useState("");
  const [doctorSaved, setDoctorSaved] = useState(false);

  const handleNurseSave = useCallback(() => {
    const obs: ClinicalObservation = {
      id: Date.now().toString(36),
      timestamp: new Date(),
      nurseName: "RN Nura Al-Rashid",
      vitals: form.vitals,
      painLevel: form.painLevel,
      risks: form.risks,
      otherRiskNotes: form.otherRiskNotes,
      nurseNotes: form.nurseNotes,
      doctorNote: null,
    };
    clinicalStore.add(obs);
    setSelectedObsId(obs.id); // View the new one immediately
    setForm(blankForm);
    setIsAddingNew(false);
    setNurseSaved(true);
    setTimeout(() => setNurseSaved(false), 2500);
  }, [form]);

  const handleDoctorSave = useCallback(() => {
    if (!activeRecord || !doctorNoteText.trim()) return;
    clinicalStore.addDoctorNote(activeRecord.id, {
      text: doctorNoteText.trim(),
      addedAt: new Date(),
      doctorName: "Dr. Khalid Al-Ghamdi",
    });
    setDoctorNoteText("");
    setDoctorSaved(true);
    setTimeout(() => setDoctorSaved(false), 2500);
  }, [activeRecord, doctorNoteText]);

  const handleDelete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    clinicalStore.delete(id);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.72)", direction: dir }}
    >
      <div
        className="relative w-full flex flex-col shadow-2xl"
        style={{
          maxWidth: 1280,
          minHeight: "88vh",
          maxHeight: "94vh",
          backgroundColor: "#FFFFFF",
          borderRadius: "24px",
          border: "1px solid rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {/* ── Header: solid brand color, NO gradient ── */}
        <div
          className="flex items-center justify-between px-8 py-5 shrink-0"
          style={{ backgroundColor: t.primary }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
            >
              {role === "nurse"
                ? <ClipboardList size={22} color="#fff" />
                : <Stethoscope size={22} color="#fff" />}
            </div>
            <div>
              <h1 style={{ fontFamily: t.fontFamily, fontSize: "20px", fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>
                {role === "nurse" ? tr("careteam.nurseRole") : tr("careteam.doctorRole")}
              </h1>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", fontWeight: 500, marginTop: 1 }}>
                {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <X size={20} color="rgba(255,255,255,0.9)" />
          </button>
        </div>

        {/* ── Patient Info Banner — below header, inside popup content ── */}
        <div
          className="flex items-center justify-between px-8 py-4 shrink-0"
          style={{ backgroundColor: t.surface, borderBottom: `1px solid ${t.borderDefault}` }}
        >
          <div className="flex items-center gap-10">
            {[
              { label: "MRN",                icon: <User size={14} style={{ color: t.primary }} />, value: patient.mrn },
              { label: "Patient",            icon: null, value: `${patient.name} (${patient.age}y)` },
              { label: "Room",              icon: null, value: patient.room },
              { label: "Admitted",          icon: <Clock size={14} style={{ color: t.primary }} />, value: patient.admissionDate },
            ].map(({ label, icon, value }, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ width: 1, height: 36, backgroundColor: t.borderDefault }} />}
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-1" style={{ fontSize: "11px", fontWeight: 600, color: t.textMuted }}>
                    {icon}{label}
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: t.textHeading }}>{value}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          {role === "nurse" && !isAddingNew && (
            <AddBtn onClick={() => setIsAddingNew(true)} label="+ Add New Observation" t={t} />
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Main content ── */}
          <div className="flex-1 overflow-y-auto px-8 py-7 custom-scrollbar">
            {role === "nurse" && (
              <>
                {isAddingNew ? (
                  <NurseForm form={form} setForm={setForm} tr={tr} t={t}
                    onSave={handleNurseSave}
                    onCancel={() => { setIsAddingNew(false); setForm(blankForm); }}
                    saved={nurseSaved}
                  />
                ) : (
                  <NurseView record={activeRecord} tr={tr} t={t} />
                )}
              </>
            )}
            {role === "doctor" && (
              <DoctorView record={activeRecord} tr={tr} t={t}
                doctorNoteText={doctorNoteText}
                setDoctorNoteText={setDoctorNoteText}
                onSave={handleDoctorSave}
                saved={doctorSaved}
              />
            )}
          </div>

          {/* ── History Sidebar ── */}
          <div
            className="shrink-0 flex flex-col"
            style={{
              width: 360,
              borderLeft: "1px solid rgba(0,0,0,0.07)",
              backgroundColor: "#F8FAFC",
            }}
          >
            <div
              className="px-5 py-4 shrink-0 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#FFFFFF" }}
            >
              <div className="flex items-center gap-2.5">
                <History size={17} style={{ color: t.primary }} />
                <span style={{ fontFamily: t.fontFamily, fontSize: "15px", fontWeight: 700, color: t.textHeading }}>
                  {tr("careteam.history")}
                </span>
              </div>
              {observations.length > 0 && (
                <span
                  style={{
                    fontSize: "12px", fontWeight: 700,
                    color: t.primary,
                    backgroundColor: t.primarySubtle,
                    padding: "2px 10px",
                    borderRadius: "99px",
                  }}
                >
                  {observations.length}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {observations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 opacity-50">
                  <FileText size={30} style={{ color: t.textMuted }} />
                  <p style={{ fontSize: "13px", color: t.textMuted, marginTop: 10 }}>No observations yet</p>
                </div>
              )}
              {[...observations].reverse().map((obs) => (
                <HistoryCard
                  key={obs.id}
                  obs={obs}
                  isLatest={obs.id === activeRecord?.id}
                  onDelete={role === "nurse" ? (e: any) => handleDelete(obs.id, e) : null}
                  onClick={() => { setSelectedObsId(obs.id); setIsAddingNew(false); }}
                  t={t}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}

function NurseView({ record, tr, t }: any) {
  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5 opacity-60">
        <ClipboardList size={40} style={{ color: t.textMuted }} />
        <p style={{ fontSize: "15px", color: t.textMuted }}>No observations available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      {/* Observation header */}
      <div className="flex items-start justify-between">
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted, letterSpacing: "0.2px" }}>
            Viewing Observation
          </p>
          <p style={{ fontSize: "14px", color: t.textBody, marginTop: 2 }}>
            <span style={{ fontWeight: 700, color: t.textHeading }}>{record.nurseName}</span>
            {" — "}
            <span style={{ color: t.textMuted }}>{fmtFull(record.timestamp)}</span>
          </p>
        </div>
      </div>

      {/* Vitals */}
      <VitalsSection vitals={record.vitals} tr={tr} t={t} readOnly />

      {/* Pain + Notes row */}
      <div className="grid grid-cols-2 gap-5">
        <PainSection painLevel={record.painLevel} tr={tr} t={t} readOnly />
        <NotesSection notes={record.nurseNotes} tr={tr} t={t} readOnly />
      </div>

      {/* Risks */}
      <div className="-mt-2">
        <RisksSection risks={record.risks} otherRiskNotes={record.otherRiskNotes} tr={tr} t={t} readOnly />
      </div>

      {/* Physician note — READ ONLY for nurse */}
      <div style={{ borderTop: `1px solid ${t.borderDefault}`, paddingTop: 20 }}>
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope size={16} style={{ color: t.primary }} />
          <span style={{ fontSize: "16px", fontWeight: 700, color: t.textHeading }}>
            Physician Note
          </span>
        </div>
        {record.doctorNote ? (
          <div
            className="p-4 rounded-2xl"
            style={{ backgroundColor: t.primarySubtle, border: `1px solid ${t.borderDefault}` }}
          >
            <p style={{ fontSize: "15px", color: t.textBody, lineHeight: 1.75, fontStyle: "italic" }}>
              {record.doctorNote.text}
            </p>
            <p style={{ fontSize: "12px", color: t.primary, fontWeight: 700, marginTop: 8 }}>
              {record.doctorNote.doctorName} · {fmtFull(record.doctorNote.addedAt)}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl" style={{ border: `1.5px dashed ${t.borderDefault}`, backgroundColor: "#FAFAFA" }}>
            <p style={{ fontSize: "14px", color: t.textMuted, fontStyle: "italic" }}>
              No physician note has been added yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Doctor View ───────────────────────────────────────────────────────────────
function DoctorView({ record, tr, t, doctorNoteText, setDoctorNoteText, onSave, saved }: any) {
  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center py-24 opacity-60">
        <ClipboardList size={40} style={{ color: t.textMuted }} />
        <p style={{ fontSize: "15px", color: t.textMuted, marginTop: 12 }}>No nurse observations available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
      {/* Header */}
      <div>
        <p style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted }}>Reviewing observation</p>
        <p style={{ fontSize: "14px", color: t.textBody, marginTop: 2 }}>
          <span style={{ fontWeight: 700, color: t.textHeading }}>{record.nurseName}</span>
          {" — "}
          <span style={{ color: t.textMuted }}>{fmtFull(record.timestamp)}</span>
        </p>
      </div>

      <VitalsSection vitals={record.vitals} tr={tr} t={t} readOnly />

      <div className="grid grid-cols-2 gap-5">
        <PainSection painLevel={record.painLevel} tr={tr} t={t} readOnly />
        <NotesSection notes={record.nurseNotes} tr={tr} t={t} readOnly />
      </div>

      <div className="-mt-2">
        <RisksSection risks={record.risks} otherRiskNotes={record.otherRiskNotes} tr={tr} t={t} readOnly />
      </div>

      {/* Existing physician note (if any) */}
      {record.doctorNote && (
        <div style={{ borderTop: `1px solid ${t.borderDefault}`, paddingTop: 20 }}>
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope size={16} style={{ color: t.primary }} />
            <span style={{ fontSize: "15px", fontWeight: 700, color: t.textHeading }}>Previous Physician Note</span>
          </div>
          <div className="p-4 rounded-2xl" style={{ backgroundColor: t.primarySubtle, border: `1px solid ${t.borderDefault}` }}>
            <p style={{ fontSize: "15px", color: t.textBody, lineHeight: 1.75, fontStyle: "italic" }}>
              {record.doctorNote.text}
            </p>
            <p style={{ fontSize: "12px", color: t.primary, fontWeight: 700, marginTop: 8 }}>
              {record.doctorNote.doctorName} · {fmtFull(record.doctorNote.addedAt)}
            </p>
          </div>
        </div>
      )}

      {/* Compose physician note — ALWAYS last */}
      <div style={{ borderTop: `1px solid ${t.borderDefault}`, paddingTop: 20 }}>
        <div className="flex items-center gap-2 mb-3">
          <Stethoscope size={16} style={{ color: t.primary }} />
          <span style={{ fontSize: "16px", fontWeight: 700, color: t.textHeading }}>
            {tr("clinical.addDocNote")}
          </span>
        </div>
        <textarea
          value={doctorNoteText}
          onChange={(e) => setDoctorNoteText(e.target.value)}
          placeholder="Enter physician orders, observations, or plan of care..."
          rows={2}
          className="w-full resize-none outline-none transition-all"
          style={{
            padding: "10px 14px",
            borderRadius: "14px",
            border: `1.5px solid ${t.borderDefault}`,
            backgroundColor: t.surface,
            fontSize: "15px",
            color: t.textBody,
            fontFamily: "inherit",
            lineHeight: 1.7,
          }}
          onFocus={(e) => (e.target.style.borderColor = t.primary)}
          onBlur={(e) => (e.target.style.borderColor = t.borderDefault)}
        />
        <div className="flex justify-start mt-3">
          <button
            onClick={onSave}
            disabled={!doctorNoteText.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95"
            style={{
              backgroundColor: saved ? t.success : (doctorNoteText.trim() ? t.primary : t.borderDefault),
              color: "#fff",
              fontSize: "14px",
              cursor: doctorNoteText.trim() ? "pointer" : "not-allowed",
            }}
          >
            {saved ? <CheckCircle2 size={17} /> : <Save size={17} />}
            {saved ? tr("general.done") : tr("clinical.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Nurse Add-Observation Form ────────────────────────────────────────────────
function NurseForm({ form, setForm, tr, t, onSave, onCancel, saved }: any) {
  const pc = painColor(form.painLevel);
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-400">
      <div>
        <p style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted }}>New Observation</p>
        <p style={{ fontSize: "14px", color: t.textMuted, marginTop: 2 }}>{fmtFull(new Date())}</p>
      </div>

      <VitalsSection
        vitals={form.vitals} tr={tr} t={t} readOnly={false}
        onChange={(v: typeof form.vitals) => setForm({ ...form, vitals: v })}
      />

      <div className="grid grid-cols-2 gap-5">
        <PainSection
          painLevel={form.painLevel} tr={tr} t={t} readOnly={false}
          onChange={(v: number) => setForm({ ...form, painLevel: v })}
        />
        <NotesSection
          notes={form.nurseNotes} tr={tr} t={t} readOnly={false}
          onChange={(v: string) => setForm({ ...form, nurseNotes: v })}
        />
      </div>

      <div className="-mt-2">
        <RisksSection
          risks={form.risks} 
          otherRiskNotes={form.otherRiskNotes}
          tr={tr} 
          t={t} 
          readOnly={false}
          onChange={(v: typeof form.risks) => setForm({ ...form, risks: v })}
          onOtherChange={(txt: string) => setForm({ ...form, otherRiskNotes: txt })}
        />
      </div>

      <div className="flex items-center gap-3" style={{ borderTop: `1px solid ${t.borderDefault}`, paddingTop: 20 }}>
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95"
          style={{ backgroundColor: saved ? t.success : t.primary, color: "#fff", fontSize: "14px" }}
        >
          {saved ? <CheckCircle2 size={17} /> : <Save size={17} />}
          {saved ? tr("general.done") : tr("clinical.save")}
        </button>
        <button
          onClick={onCancel}
          style={{ fontSize: "14px", fontWeight: 600, color: t.textMuted, padding: "12px 20px", borderRadius: "16px", border: `1px solid ${t.borderDefault}`, backgroundColor: t.surface }}
        >
          {tr("general.cancel")}
        </button>
      </div>
      <style>{`
        .pain-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid ${pc};
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
        }
        .pain-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .pain-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid ${pc};
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}

// ─── Shared Section Components ─────────────────────────────────────────────────

function VitalsSection({ vitals, tr, t, readOnly, onChange }: any) {
  const fields = [
    { key: "bp",   label: tr("clinical.bp"),   unit: "mmHg", icon: <Droplet size={14} color="#EF4444" /> },
    { key: "hr",   label: tr("clinical.hr"),   unit: "BPM",  icon: <Activity size={14} color="#F43F5E" /> },
    { key: "temp", label: tr("clinical.temp"), unit: "°C",   icon: <Thermometer size={14} color="#F59E0B" /> },
    { key: "spo2", label: tr("clinical.spo2"), unit: "%",    icon: <Wind size={14} color={t.primary} /> },
  ];
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Activity size={17} style={{ color: t.primary }} />
        <span style={{ fontSize: "16px", fontWeight: 700, color: t.textHeading }}>{tr("clinical.vitals")}</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {fields.map(({ key, label, unit, icon }) => (
          <div
            key={key}
            className="p-4 rounded-2xl transition-all"
            style={{ backgroundColor: t.surface, border: `1px solid ${t.borderDefault}` }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              {icon}
              <span style={{ fontSize: "10px", fontWeight: 700, color: t.textMuted, letterSpacing: "0.3px", textTransform: "uppercase" }}>
                {label}
              </span>
            </div>
            {readOnly ? (
              <div className="flex items-baseline gap-1">
                <span style={{ fontSize: "22px", fontWeight: 900, color: t.textHeading, fontVariantNumeric: "tabular-nums" }}>
                  {vitals[key] || "—"}
                </span>
                <span style={{ fontSize: "11px", color: t.textMuted, fontWeight: 600 }}>{unit}</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-1">
                <input
                  type="text"
                  value={vitals[key]}
                  onChange={(e) => onChange({ ...vitals, [key]: e.target.value })}
                  placeholder="—"
                  className="bg-transparent border-none outline-none w-full"
                  style={{ fontSize: "22px", fontWeight: 900, color: t.textHeading, fontVariantNumeric: "tabular-nums" }}
                />
                <span style={{ fontSize: "11px", color: t.textMuted, fontWeight: 600 }}>{unit}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PainSection({ painLevel, tr, t, readOnly, onChange }: any) {
  const pc = painColor(painLevel);
  const pl = painLabel(painLevel);
  return (
    <div>
      <span style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted, letterSpacing: "0.2px" }}>
        {tr("clinical.painReport")}
      </span>
      <div className="mt-2 p-4 rounded-2xl" style={{ backgroundColor: t.surface, border: `1px solid ${t.borderDefault}` }}>
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: "32px", fontWeight: 900, color: pc, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
            {painLevel}
            <span style={{ fontSize: "16px", color: t.textMuted, fontWeight: 600 }}>/10</span>
          </span>
          <span style={{
            fontSize: "11px", fontWeight: 800, color: pc,
            backgroundColor: `${pc}18`,
            padding: "3px 10px", borderRadius: "99px",
            letterSpacing: "0.3px",
          }}>
            {pl.toUpperCase()}
          </span>
        </div>
        {/* Read-only: show static bar. Edit mode: show slider only (slider IS the bar) */}
        {readOnly ? (
          <div style={{ width: "100%", height: 8, borderRadius: 99, backgroundColor: "rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{
              width: `${painLevel * 10}%`,
              height: "100%",
              backgroundColor: pc,
              borderRadius: 99,
              transition: "width 0.3s ease",
            }} />
          </div>
        ) : (
          <div className="relative flex items-center h-8">
            <input
              type="range" min={0} max={10}
              value={painLevel}
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="pain-slider w-full cursor-pointer accent-transparent"
              style={{ 
                height: 8, 
                borderRadius: 4, 
                background: `linear-gradient(to right, ${pc} ${painLevel * 10}%, rgba(0,0,0,0.05) ${painLevel * 10}%)`,
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function NotesSection({ notes, tr, t, readOnly, onChange }: any) {
  return (
    <div>
      <span style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted, letterSpacing: "0.2px" }}>
        {tr("clinical.dailyNotes")}
      </span>
      {readOnly ? (
        <div className="mt-2 p-4 rounded-2xl min-h-[100px]" style={{ backgroundColor: t.surface, border: `1px solid ${t.borderDefault}` }}>
          <p style={{ fontSize: "15px", color: notes ? t.textBody : t.textMuted, lineHeight: 1.7, fontStyle: notes ? "normal" : "italic" }}>
            {notes || "No notes entered."}
          </p>
        </div>
      ) : (
        <textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder={tr("clinical.notesPlaceholder")}
          rows={3}
          className="w-full resize-none outline-none mt-2 transition-all"
          style={{
            padding: "12px 14px",
            borderRadius: "14px",
            border: `1.5px solid ${t.borderDefault}`,
            backgroundColor: t.surface,
            fontSize: "15px",
            color: t.textBody,
            fontFamily: "inherit",
            lineHeight: 1.7,
          }}
          onFocus={(e) => (e.target.style.borderColor = t.primary)}
          onBlur={(e) => (e.target.style.borderColor = t.borderDefault)}
        />
      )}
    </div>
  );
}

function RisksSection({ risks, otherRiskNotes, tr, t, readOnly, onChange, onOtherChange }: any) {
  const items = [
    { key: "fall",     label: tr("clinical.fallRisk") },
    { key: "pressure", label: tr("clinical.pressureUlcer") },
    { key: "allergies",label: tr("care.allergies") },
    { key: "other",    label: "Other" },
  ];
  return (
    <div className="space-y-3">
      <span style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted, letterSpacing: "0.2px" }}>
        {tr("clinical.risks")}
      </span>
      <div className="flex flex-wrap gap-2">
        {readOnly ? (
          items.some((i) => risks[i.key]) ? (
            items.filter((i) => risks[i.key]).map(({ key, label }) => (
              <span key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ fontSize: "13px", fontWeight: 700, color: "#EF4444", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                <AlertTriangle size={13} /> {label === "Other" && otherRiskNotes ? `${label}: ${otherRiskNotes}` : label}
              </span>
            ))
          ) : (
            <span style={{ fontSize: "14px", color: t.textMuted, fontStyle: "italic" }}>No active risk flags</span>
          )
        ) : (
          items.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onChange({ ...risks, [key]: !risks[key] })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold transition-all active:scale-95"
              style={{
                fontSize: "13px",
                backgroundColor: risks[key] ? "rgba(239, 68, 68, 0.1)" : t.surface,
                color: risks[key] ? "#EF4444" : t.textMuted,
                border: `1.5px solid ${risks[key] ? "rgba(239, 68, 68, 0.2)" : t.borderDefault}`,
              }}
            >
              <AlertTriangle size={13} />
              {label}
            </button>
          ))
        )}
      </div>
      {!readOnly && risks.other && (
        <textarea
          value={otherRiskNotes || ""}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Specify other risk factors..."
          className="w-full p-4 rounded-xl border outline-none transition-all animate-in fade-in slide-in-from-top-2"
          style={{ 
            backgroundColor: t.surface, 
            borderColor: t.borderDefault,
            fontSize: "14px",
            minHeight: "80px"
          }}
          onFocus={(e) => e.target.style.borderColor = "#EF4444"}
          onBlur={(e) => e.target.style.borderColor = t.borderDefault}
        />
      )}
    </div>
  );
}

// ─── AddBtn (shared) ───────────────────────────────────────────────────────────
function AddBtn({ onClick, label, t }: any) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all active:scale-95"
      style={{ backgroundColor: t.primary, color: "#fff", fontSize: "13px" }}
    >
      {label}
    </button>
  );
}

// ─── History Card ──────────────────────────────────────────────────────────────
function HistoryCard({ obs, isLatest, onDelete, onClick, t }: any) {
  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden transition-all cursor-pointer hover:shadow-lg active:scale-[0.98]"
      style={{
        backgroundColor: "#FFFFFF",
        border: isLatest ? `2px solid ${t.primary}` : `1px solid ${t.borderDefault}`,
        boxShadow: isLatest ? `0 8px 24px rgba(0,0,0,0.08)` : "none",
      }}
    >
      {/* Nurse section */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <span style={{
              fontSize: "10px", fontWeight: 800, color: t.primary,
              backgroundColor: t.primarySubtle,
              padding: "2px 8px", borderRadius: "99px", letterSpacing: "0.3px",
            }}>
              NURSE
            </span>
            <p style={{ fontSize: "12.5px", fontWeight: 700, color: t.textHeading, marginTop: 5 }}>
              {obs.nurseName}
            </p>
            <p className="flex items-center gap-1 mt-0.5" style={{ fontSize: "11px", color: t.textMuted }}>
              <Clock size={10} /> {fmtFull(obs.timestamp)}
            </p>
          </div>
          {onDelete && (
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg"
              style={{ backgroundColor: "transparent" }}
              title="Delete"
            >
              <Trash2 size={13} style={{ color: t.accent }} />
            </button>
          )}
        </div>

        {/* Mini vitals */}
        <div className="grid grid-cols-4 gap-1 mb-3">
          {[
            { val: obs.vitals.bp,   icon: <Droplet size={9} color="#EF4444" /> },
            { val: obs.vitals.hr,   icon: <Activity size={9} color="#F43F5E" /> },
            { val: obs.vitals.temp + "°", icon: <Thermometer size={9} color="#F59E0B" /> },
            { val: obs.vitals.spo2 + "%", icon: <Wind size={9} color={t.primary} /> },
          ].map((v, i) => (
            <div key={i} className="flex items-center gap-1 px-2 py-1.5 rounded-xl"
              style={{ backgroundColor: t.primarySubtle }}>
              {v.icon}
              <span style={{ fontSize: "11px", fontWeight: 700, color: t.textHeading }}>{v.val}</span>
            </div>
          ))}
        </div>

        {/* Pain mini bar */}
        <div className="flex items-center gap-2 mb-2">
          <span style={{ fontSize: "11px", color: t.textMuted, fontWeight: 600, whiteSpace: "nowrap" }}>
            Pain {obs.painLevel}/10
          </span>
          <div style={{ flex: 1, height: 5, borderRadius: 99, backgroundColor: t.borderDefault, overflow: "hidden" }}>
            <div style={{
              width: `${obs.painLevel * 10}%`,
              height: "100%",
              backgroundColor: painColor(obs.painLevel),
              borderRadius: 99,
            }} />
          </div>
        </div>

        {obs.nurseNotes && (
          <p style={{ fontSize: "12.5px", color: t.textBody, lineHeight: 1.55, fontStyle: "italic" }} className="line-clamp-2">
            "{obs.nurseNotes}"
          </p>
        )}
      </div>

      {/* Doctor note strip */}
      {obs.doctorNote && (
        <div className="px-4 py-3" style={{ backgroundColor: t.primarySubtle, borderTop: `1px solid ${t.borderDefault}` }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Stethoscope size={11} style={{ color: t.primary }} />
            <span style={{ fontSize: "10px", fontWeight: 800, color: t.primary, letterSpacing: "0.3px" }}>
              PHYSICIAN NOTE
            </span>
          </div>
          <p style={{ fontSize: "12.5px", color: t.textBody, lineHeight: 1.5, fontStyle: "italic" }} className="line-clamp-2">
            "{obs.doctorNote.text}"
          </p>
          <p style={{ fontSize: "11px", color: t.primary, fontWeight: 700, marginTop: 5 }}>
            {obs.doctorNote.doctorName} · {fmtFull(obs.doctorNote.addedAt)}
          </p>
        </div>
      )}
    </div>
  );
}
