import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X, Stethoscope, Activity, Thermometer, Wind, Droplet,
  Save, User, ClipboardList, CheckCircle2, Clock, Plus,
  History, Trash2, FileText, AlertTriangle, Hash, DoorOpen
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
      nurseName: "clinical.nurse.nura",
      vitals: { bp: "118/78", hr: "68", temp: "37.0", spo2: "99" },
      painLevel: 1,
      risks: { fall: true, pressure: false, allergies: true, other: false },
      nurseNotes: "Patient resting comfortably. Vitals stable. Tolerating oral intake.",
      doctorNote: {
        text: "Continue current plan. Reassess in the morning.",
        addedAt: new Date(Date.now() - 3600000 * 2),
        doctorName: "Dr. Omar Abdulhalim",
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
  if (n <= 0) return "None";
  if (n < 4)  return "Mild";
  if (n < 7)  return "Moderate";
  return "Severe";
}
function painColor(n: number) {
  if (n <= 0) return "#94A3B8";
  if (n < 4)  return "#10B981"; // Success/Green
  if (n < 7)  return "#F59E0B"; // Warning/Orange
  return "#EF4444"; // Error/Red
}

function DraggablePainSlider({ value, onChange, theme: t, isRTL }: { value: number; onChange: (v: number) => void; theme: any; isRTL: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calcValue = (e: React.PointerEvent | PointerEvent) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return value;
    
    let percentage: number;
    if (isRTL) {
      percentage = (rect.right - (e as any).clientX) / rect.width;
    } else {
      percentage = ((e as any).clientX - rect.left) / rect.width;
    }
    
    // For pain (0-10)
    const val = Math.max(0, Math.min(10, Math.round(percentage * 10)));
    return val;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    onChange(calcValue(e));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    onChange(calcValue(e));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const pc = painColor(value);

  return (
    <div
      ref={trackRef}
      className="flex-1 relative cursor-pointer"
      style={{ 
        height: "12px", 
        borderRadius: t.radiusSm, 
        backgroundColor: "rgba(0,0,0,0.05)", 
        touchAction: "none" 
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Track fill */}
      <div
        style={{
          height: "100%",
          borderRadius: "inherit",
          backgroundColor: pc,
          width: `${value * 10}%`,
          transition: isDragging ? "none" : "width 0.2s ease-out",
          [isRTL ? "marginRight" : "marginLeft"]: 0,
          position: "absolute",
          [isRTL ? "right" : "left"]: 0
        }}
      />
      {/* Thumb */}
      <div
        className="absolute top-1/2"
        style={{
          [isRTL ? "right" : "left"]: `${value * 10}%`,
          transform: `translate(${isRTL ? "50%" : "-50%"}, -50%)`,
          width: isDragging ? "24px" : "20px",
          height: isDragging ? "24px" : "20px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          border: `3px solid ${pc}`,
          boxShadow: isDragging ? `0 4px 12px ${pc}44` : `0 2px 6px rgba(0,0,0,0.15)`,
          transition: isDragging ? "width 0.1s, height 0.1s" : "all 0.2s ease-out",
          zIndex: 10,
        }}
      />
    </div>
  );
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
    nameKey: "clinical.patient.sara",
    age: "32",
    mrn: "00-284619",
    room: "412",
    admissionDate: "10 Mar 2026",
    extension: "4217"
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
      nurseName: "clinical.nurse.nura",
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
      doctorName: "Dr. Omar Abdulhalim",
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
            className="w-9 h-9 flex items-center justify-center rounded-full transition-transform"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <X size={20} color="rgba(255,255,255,0.9)" />
          </button>
        </div>

        {/* ── Patient Info Banner ── */}
        <div
          className="flex items-center px-10 py-5 shrink-0"
          style={{ backgroundColor: t.surface, borderBottom: `1px solid ${t.borderDefault}` }}
        >
          <div className="flex-1 grid grid-cols-4 gap-0">
            {[
              { labelKey: "clinical.mrn",      value: patient.mrn,           icon: <Hash size={16} /> },
              { labelKey: "clinical.patient",  value: `${tr(patient.nameKey)} (${patient.age}y)`, icon: <User size={16} /> },
              { labelKey: "clinical.room",     value: patient.room,          icon: <DoorOpen size={16} /> },
              { labelKey: "clinical.admitted", value: patient.admissionDate, icon: <Clock size={16} /> },
            ].map(({ labelKey, value, icon }, i) => (
              <div key={i} className="flex relative items-center justify-center">
                {i > 0 && (
                  <div 
                    className="absolute inset-inline-start-0 top-1/2 -translate-y-1/2 w-[1.5px] h-10" 
                    style={{ backgroundColor: t.borderDefault, opacity: 0.6 }} 
                  />
                )}
                <div className="flex flex-col items-center">
                  <span className="flex items-center gap-1.5 mb-1" style={{ fontSize: "12px", fontWeight: 600, color: t.textMuted }}>
                    {icon && <span style={{ color: t.primary }}>{icon}</span>} {tr(labelKey)}
                  </span>
                  <span style={{ fontSize: "18px", fontWeight: 800, color: t.textHeading, letterSpacing: "-0.2px" }}>
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Moved Add Observation Button here for Nurse */}
          {role === "nurse" && !isAddingNew && (
            <div className="ps-6">
              <AddBtn onClick={() => setIsAddingNew(true)} label={tr("clinical.addObs")} t={t} tr={tr} />
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar" style={{ backgroundColor: "#F9FAFB" }}>
            <div className="mx-auto" style={{ maxWidth: "800px" }}>
              {isAddingNew ? (
                <NurseForm form={form} setForm={setForm} tr={tr} t={t}
                  onSave={handleNurseSave}
                  onCancel={() => { setIsAddingNew(false); setForm(blankForm); }}
                  saved={nurseSaved}
                />
              ) : (
                <>
                  {/* Status Indicator / Role Action Area */}
                  <div className="flex justify-start mb-8">
                    
                    {activeRecord && (
                      <div className="flex flex-col items-start w-full">
                        <span style={{ fontSize: "12px", fontWeight: 700, color: t.primary, opacity: 0.9, letterSpacing: "0.5px" }}>
                          {tr("clinical.reviewing")}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span style={{ fontSize: "17px", fontWeight: 800, color: t.textHeading }}>
                            {tr(activeRecord.nurseName)}
                          </span>
                          <span style={{ color: t.textMuted, opacity: 0.3 }}>|</span>
                          <span style={{ fontSize: "13px", color: t.textMuted, fontWeight: 500 }}>
                            {fmtFull(activeRecord.timestamp)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {role === "nurse" ? (
                    <NurseView record={activeRecord} tr={tr} t={t} />
                  ) : (
                    <DoctorView record={activeRecord} tr={tr} t={t}
                      doctorNoteText={doctorNoteText}
                      setDoctorNoteText={setDoctorNoteText}
                      onSave={handleDoctorSave}
                      saved={doctorSaved}
                    />
                  )}
                </>
              )}
            </div>
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
                  <p style={{ fontSize: "13px", color: t.textMuted, marginTop: 10 }}>{tr("clinical.noObs")}</p>
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
                  tr={tr}
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
        <p style={{ fontSize: "15px", color: t.textMuted }}>{tr("clinical.noObs")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
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
            {tr("clinical.docNote")}
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
              {tr("clinical.noDocNote")}
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
        <p style={{ fontSize: "15px", color: t.textMuted, marginTop: 12 }}>{tr("clinical.noObs")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-400">
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
            <span style={{ fontSize: "15px", fontWeight: 700, color: t.textHeading }}>{tr("clinical.previousDocNote")}</span>
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
          className="w-full resize-none outline-none transition-transform"
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
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-transform active:scale-95"
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
        <p style={{ fontSize: "12px", fontWeight: 700, color: t.primary, letterSpacing: "0.5px" }}>{tr("careteam.addRecord")}</p>
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
          className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-transform active:scale-95 shadow-md shadow-blue-500/20"
          style={{ backgroundColor: saved ? t.success : t.primary, color: "#fff", fontSize: "15px" }}
        >
          {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
          {saved ? tr("general.done") : tr("clinical.save")}
        </button>
        <button
          onClick={onCancel}
          style={{ fontSize: "15px", fontWeight: 700, color: t.textMuted, padding: "14px 24px", borderRadius: "18px", border: `1.5px solid ${t.borderDefault}`, backgroundColor: t.surface }}
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Activity size={18} style={{ color: t.primary }} />
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: t.textHeading }}>{tr("clinical.vitals")}</h3>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {fields.map(({ key, label, unit, icon }) => (
          <div
            key={key}
            className="p-4 rounded-2xl transition-transform"
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
          <div style={{ width: "100%", height: 10, borderRadius: 99, backgroundColor: "rgba(0,0,0,0.05)", overflow: "hidden", display: "flex", direction: "ltr" }}>
            <div style={{
              width: `${painLevel * 10}%`,
              height: "100%",
              backgroundColor: pc,
              borderRadius: 99,
              transition: "width 0.3s ease",
            }} />
          </div>
        ) : (
          <DraggablePainSlider 
            value={painLevel} 
            onChange={onChange} 
            theme={t} 
            isRTL={t.direction === 'rtl'} 
          />
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
            {notes || tr("clinical.noNotes")}
          </p>
        </div>
      ) : (
        <textarea
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          placeholder={tr("clinical.notesPlaceholder")}
          rows={3}
          className="w-full resize-none outline-none mt-2 transition-transform"
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
    { key: "other",    label: tr("clinical.otherRisk") },
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
                <AlertTriangle size={13} /> {label === tr("clinical.otherRisk") && otherRiskNotes ? `${label}: ${otherRiskNotes}` : label}
              </span>
            ))
          ) : (
            <span style={{ fontSize: "14px", color: t.textMuted, fontStyle: "italic" }}>{tr("clinical.noRisks")}</span>
          )
        ) : (
          items.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onChange({ ...risks, [key]: !risks[key] })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold transition-transform active:scale-95"
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
          placeholder={tr("clinical.otherRiskPlaceholder")}
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
      className="flex items-center gap-2 px-6 py-3 cursor-pointer transition-transform active:scale-95 shadow-md shadow-blue-500/20"
      style={{ 
        backgroundColor: t.primary, 
        color: "#fff", 
        fontSize: "15px", 
        fontWeight: 800,
        borderRadius: "16px",
        border: "none"
      }}
    >
      {label}
    </button>
  );
}

// ─── History Card ──────────────────────────────────────────────────────────────
function HistoryCard({ obs, isLatest, onDelete, onClick, t, tr }: any) {
  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden transition-transform cursor-pointer hover:shadow-lg active:scale-[0.98]"
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
              {tr(obs.nurseName)}
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
            {tr("clinical.painLevel")} {obs.painLevel}/10
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
              {tr("clinical.docNote").toUpperCase()}
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
