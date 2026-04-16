import React, { useState, useEffect } from "react";
import { 
  X, 
  Stethoscope, 
  Activity, 
  Thermometer, 
  Wind, 
  Droplet, 
  AlertCircle, 
  Save, 
  User, 
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Plus
} from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useLocale } from "./i18n";

interface CareTeamInterfaceProps {
  role: "nurse" | "doctor";
  onClose: () => void;
}

export function CareTeamInterface({ role, onClose }: CareTeamInterfaceProps) {
  const { theme: t } = useTheme();
  const { t: tr, isRTL, dir } = useLocale();

  // Mock Patient Data
  const patient = {
    name: "Sara Ahmed",
    age: "32",
    mrn: "1022340",
    room: "412-A",
    admissionDate: "15 Apr 2026",
  };

  // State for clinical data
  const [vitals, setVitals] = useState({
    bp: "120/80",
    hr: "72",
    temp: "37.2",
    spo2: "98",
    resp: "18",
  });
  const [painLevel, setPainLevel] = useState(2);
  const [notes, setNotes] = useState("");
  const [risks, setRisks] = useState({
    fall: true,
    pressure: false,
    allergies: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
    >
      <div 
        className="relative w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        style={{ 
          backgroundColor: t.bgPanel, 
          borderRadius: t.radiusXl,
          border: `1px solid ${t.borderDefault}`,
          direction: dir
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-8 py-5 border-b"
          style={{ borderColor: t.borderDefault, backgroundColor: t.bgSecondary }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl"
              style={{ backgroundColor: role === "nurse" ? "#E0F2FE" : "#F0FDF4" }}
            >
              {role === "nurse" ? (
                <ClipboardList size={26} style={{ color: "#0284C7" }} />
              ) : (
                <Stethoscope size={26} style={{ color: "#16A34A" }} />
              )}
            </div>
            <div>
              <h1 
                style={{ 
                  fontFamily: t.fontFamily, 
                  fontSize: "20px", 
                  fontWeight: 800, 
                  color: t.textHeading 
                }}
              >
                {role === "nurse" ? tr("careteam.nurseRole") : tr("careteam.doctorRole")}
              </h1>
              <p style={{ fontSize: "13px", color: t.textMuted, opacity: 0.8 }}>
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 active:scale-90 rounded-full transition-all"
          >
            <X size={24} style={{ color: t.textMuted }} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Form/View Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {/* Patient Segment */}
            <div 
              className="mb-8 p-6 grid grid-cols-4 gap-6"
              style={{ 
                backgroundColor: t.bgSecondary, 
                borderRadius: t.radiusLg,
                border: `1px solid ${t.borderDefault}` 
              }}
            >
              <InfoItem label={tr("greeting.mrn")} value={patient.mrn} icon={<User size={16} />} />
              <InfoItem label={tr("clinical.patientInfo")} value={`${patient.name} (${patient.age}y)`} />
              <InfoItem label={tr("general.room")} value={patient.room} />
              <InfoItem label={tr("care.admitted")} value={patient.admissionDate} icon={<Clock size={16} />} />
            </div>

            {role === "nurse" ? (
              <NurseForm 
                vitals={vitals} 
                setVitals={setVitals}
                painLevel={painLevel}
                setPainLevel={setPainLevel}
                notes={notes}
                setNotes={setNotes}
                risks={risks}
                setRisks={setRisks}
                tr={tr}
                t={t}
              />
            ) : (
              <DoctorView 
                vitals={vitals}
                painLevel={painLevel}
                nurseNotes={notes}
                risks={risks}
                tr={tr}
                t={t}
              />
            )}
          </div>

          {/* Side Actions/History */}
          <div 
            className="w-80 border-l p-6 flex flex-col gap-6"
            style={{ borderColor: t.borderDefault, backgroundColor: t.bgSecondary + "44" }}
          >
            <h3 style={{ fontWeight: 700, fontSize: "15px", color: t.textHeading }}>
              {tr("care.plan.title")}
            </h3>
            
            <div className="flex flex-col gap-3">
              <TimelineItem time="08:00 AM" event="Morning Vitals" completed tr={tr} t={t} />
              <TimelineItem time="09:30 AM" event="Medication Round" completed tr={tr} t={t} />
              <TimelineItem time="11:00 AM" event="Physiotherapy" tr={tr} t={t} />
              <TimelineItem time="02:00 PM" event="Doctor Rounds" active tr={tr} t={t} />
            </div>

            <div className="flex-1" />

            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-3 w-full py-4 rounded-xl shadow-lg active:scale-95 transition-all"
              style={{ 
                backgroundColor: saved ? "#10B981" : t.primary,
                color: "#FFFFFF",
                fontWeight: 700
              }}
            >
              {saved ? <CheckCircle2 size={20} /> : <Save size={20} />}
              {saved ? tr("general.done") : (role === "nurse" ? tr("clinical.save") : tr("clinical.addDocNote"))}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}

function NurseForm({ vitals, setVitals, painLevel, setPainLevel, notes, setNotes, risks, setRisks, tr, t }: any) {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Vitals Grid */}
      <section>
        <h2 className="flex items-center gap-2 mb-4 font-bold text-lg" style={{ color: t.textHeading }}>
          <Activity size={20} className="text-blue-500" />
          {tr("clinical.vitals")}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <VitalInput 
            icon={<Droplet size={18} className="text-red-500" />}
            label={tr("clinical.bp")} 
            value={vitals.bp} 
            onChange={(v) => setVitals({...vitals, bp: v})} 
            t={t}
          />
          <VitalInput 
            icon={<Activity size={18} className="text-rose-500" />}
            label={tr("clinical.hr")} 
            value={vitals.hr} 
            onChange={(v) => setVitals({...vitals, hr: v})} 
            unit="BPM"
            t={t}
          />
          <VitalInput 
            icon={<Thermometer size={18} className="text-orange-500" />}
            label={tr("clinical.temp")} 
            value={vitals.temp} 
            onChange={(v) => setVitals({...vitals, temp: v})} 
            unit="°C"
            t={t}
          />
          <VitalInput 
            icon={<Wind size={18} className="text-blue-500" />}
            label={tr("clinical.spo2")} 
            value={vitals.spo2} 
            onChange={(v) => setVitals({...vitals, spo2: v})} 
            unit="%"
            t={t}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pain & Risks */}
        <div className="space-y-8">
          <section>
            <h2 className="flex items-center gap-2 mb-4 font-bold text-lg" style={{ color: t.textHeading }}>
              <AlertCircle size={20} className="text-orange-500" />
              {tr("clinical.painReport")}
            </h2>
            <div className="p-6 rounded-2xl bg-orange-50/50 border border-orange-100">
               <div className="flex justify-between items-end mb-4">
                 <span className="text-lg font-bold text-orange-700">{painLevel} / 10</span>
                 <span className="text-xs uppercase font-bold tracking-wider text-orange-400">
                   {painLevel === 0 ? "None" : painLevel < 4 ? "Mild" : painLevel < 8 ? "Moderate" : "Severe"}
                 </span>
               </div>
               <input 
                type="range" min="0" max="10" 
                value={painLevel} 
                onChange={(e) => setPainLevel(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-orange-200 accent-orange-500"
               />
            </div>
          </section>

          <section>
            <h2 className="flex items-center gap-2 mb-4 font-bold text-lg" style={{ color: t.textHeading }}>
              <AlertTriangle size={20} className="text-rose-500" />
              {tr("clinical.risks")}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <RiskToggle label={tr("clinical.fallRisk")} active={risks.fall} onToggle={() => setRisks({...risks, fall: !risks.fall})} t={t} />
              <RiskToggle label={tr("clinical.pressureUlcer")} active={risks.pressure} onToggle={() => setRisks({...risks, pressure: !risks.pressure})} t={t} />
              <RiskToggle label={tr("care.allergies")} active={risks.allergies} onToggle={() => setRisks({...risks, allergies: !risks.allergies})} t={t} />
            </div>
          </section>
        </div>

        {/* Notes */}
        <section className="flex flex-col">
          <h2 className="flex items-center gap-2 mb-4 font-bold text-lg" style={{ color: t.textHeading }}>
            <ClipboardList size={20} className="text-indigo-500" />
            {tr("clinical.dailyNotes")}
          </h2>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={tr("clinical.notesPlaceholder")}
            className="flex-1 w-full p-4 rounded-2xl border resize-none focus:ring-2 outline-none transition-all"
            style={{ 
              borderColor: t.borderDefault, 
              backgroundColor: t.bgPanel,
              fontFamily: t.fontFamily 
            }}
          />
        </section>
      </div>
    </div>
  );
}

function DoctorView({ vitals, painLevel, nurseNotes, risks, tr, t }: any) {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
       {/* Physician Note Entry */}
       <section>
        <h2 className="flex items-center gap-2 mb-4 font-bold text-lg" style={{ color: t.textHeading }}>
          <Plus size={22} className="text-green-600" />
          {tr("clinical.addDocNote")}
        </h2>
        <textarea 
          placeholder="Enter physician orders or plan change..."
          className="w-full h-32 p-4 rounded-2xl border resize-none focus:ring-2 focus:ring-green-500/20 outline-none transition-all border-green-100 bg-green-50/20"
          style={{ fontFamily: t.fontFamily }}
        />
      </section>

      <section>
        <h2 className="flex items-center gap-2 mb-4 font-bold text-lg" style={{ color: t.textHeading }}>
          <ClipboardList size={20} className="text-blue-500" />
          {tr("clinical.lastNurseNote")}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Summary Cards */}
          <div className="space-y-4">
             <div className="p-5 rounded-2xl border shadow-sm" style={{ backgroundColor: t.bgPanel, borderColor: t.borderDefault }}>
                <div className="flex items-center justify-between mb-4">
                   <h4 className="font-bold text-sm text-blue-600 uppercase tracking-tighter">Vitals Summary</h4>
                   <span className="text-[10px] text-muted-foreground bg-blue-50 px-2 py-0.5 rounded-full">Reported 20m ago</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3">
                   <SummaryItem label={tr("clinical.bp")} value={vitals.bp} labelColor={t.textMuted} />
                   <SummaryItem label={tr("clinical.hr")} value={vitals.hr} unit="bpm" labelColor={t.textMuted} />
                   <SummaryItem label={tr("clinical.temp")} value={vitals.temp} unit="°c" labelColor={t.textMuted} />
                   <SummaryItem label={tr("clinical.spo2")} value={vitals.spo2} unit="%" labelColor={t.textMuted} />
                </div>
             </div>

             <div className="p-5 rounded-2xl border shadow-sm border-orange-100 bg-orange-50/10">
                <div className="flex items-center justify-between mb-2">
                   <h4 className="font-bold text-sm text-orange-600 uppercase tracking-tighter">{tr("clinical.painReport")}</h4>
                   <span className="text-lg font-black text-orange-600">{painLevel}/10</span>
                </div>
                <div className="w-full bg-orange-100 h-1.5 rounded-full overflow-hidden">
                   <div className="h-full bg-orange-500" style={{ width: `${painLevel * 10}%` }} />
                </div>
             </div>
          </div>

          <div className="p-6 rounded-2xl border shadow-sm" style={{ backgroundColor: t.bgPanel, borderColor: t.borderDefault }}>
             <h4 className="font-bold text-sm text-indigo-600 uppercase tracking-tighter mb-3">{tr("clinical.dailyNotes")}</h4>
             <p className="text-sm leading-relaxed" style={{ color: t.textDefault }}>
               {nurseNotes || "No nurse notes entered for this shift yet."}
             </p>
             <div className="mt-4 pt-4 border-t flex items-center gap-2" style={{ borderColor: t.borderDefault }}>
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold">N</div>
                <span className="text-xs font-semibold" style={{ color: t.textHeading }}>RN Nura Al-Rashid</span>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Helper Components
function InfoItem({ label, value, icon }: any) {
  const { theme: t } = useTheme();
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wider opacity-50 flex items-center gap-1">
        {icon} {label}
      </span>
      <span className="text-sm font-bold truncate" style={{ color: t.textHeading }}>{value}</span>
    </div>
  );
}

function VitalInput({ icon, label, value, onChange, unit, t }: any) {
  return (
    <div 
      className="p-4 rounded-2xl border transition-all hover:shadow-md"
      style={{ backgroundColor: t.bgPanel, borderColor: t.borderDefault }}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-bold text-muted-foreground uppercase">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border-none outline-none font-black text-xl"
          style={{ color: t.textHeading, fontFamily: t.fontFamily }}
        />
        <span className="text-xs font-bold opacity-40">{unit}</span>
      </div>
    </div>
  );
}

function RiskToggle({ label, active, onToggle, t }: any) {
  return (
    <button 
      onClick={onToggle}
      className={`flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98] ${active ? 'bg-rose-50 border-rose-200' : ''}`}
      style={{ backgroundColor: active ? undefined : t.bgPanel, borderColor: active ? undefined : t.borderDefault }}
    >
      <span className={`text-sm font-bold ${active ? 'text-rose-700' : ''}`} style={{ color: active ? undefined : t.textHeading }}>
        {label}
      </span>
      <div className={`w-10 h-5 rounded-full p-1 transition-colors ${active ? 'bg-rose-500' : 'bg-gray-200'}`}>
        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </button>
  );
}

function SummaryItem({ label, value, unit, labelColor }: any) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase mb-0.5 opacity-60" style={{ color: labelColor }}>{label}</p>
      <p className="text-sm font-black">
        {value} <span className="text-[10px] opacity-40 uppercase">{unit}</span>
      </p>
    </div>
  );
}

function TimelineItem({ time, event, completed, active, t }: any) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${active ? 'bg-blue-50 border border-blue-100' : ''}`}>
      <div className="flex flex-col items-center gap-1 mt-1">
        <div className={`w-3 h-3 rounded-full border-2 ${completed ? 'bg-blue-500 border-blue-500' : active ? 'bg-white border-blue-500' : 'bg-white border-gray-300'}`} />
        <div className="w-[1px] h-6 bg-gray-200" />
      </div>
      <div className="flex-1">
        <p className={`text-[10px] font-bold uppercase ${completed ? 'opacity-40' : 'text-blue-600'}`}>{time}</p>
        <p className={`text-xs font-bold ${completed ? 'opacity-40 line-through' : ''}`} style={{ color: t.textHeading }}>{event}</p>
      </div>
      {(completed || active) && <ChevronRight size={14} className="mt-2 opacity-30" />}
    </div>
  );
}
