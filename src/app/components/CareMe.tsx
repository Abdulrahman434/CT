import { useTheme, TYPE_SCALE, WEIGHT, SHADOW, primaryRgba, TEXT_STYLE, SPACE } from "./ThemeContext";
import { useLocale } from "./i18n";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Heart,
  Users,
  ClipboardList,
  Apple,
  AlertTriangle,
  Baby,
  LogOut,
  CheckCircle2,
  Check,
  Clock,
  Video,
  Circle,
  CalendarDays,
  Maximize2,
  Minimize2,
  X,
  DoorOpen,
  Phone,
  Hash,
  Activity,
  Utensils,
  Eye,
  EyeOff,
  Pin,
  PinOff,
  FlaskConical,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import svgPaths from "../../imports/svg-ca68x68c4i";

/* ─── Assets ─── */
import imgNuraAlRashid from "@/assets/a7907a91bbdb1ced8824b3333ece109b3cd92b62.png";
import imgDrOmarAbdulhalim from "@/assets/2318867853acb678569427c88b9e543e22bd46b6.png";
import imgBabyCam from "@/assets/68ba9ba13c5aa1cc7d2af5bee7bc955298b612dd.png";
import imgDallahBabyCam from "@/assets/dallah-baby-cam.jpg";
import imgCareMedBabyCam from "@/assets/CareMedicalHospital.jpeg";

const careTeam = [
  { nameKey: "care.team.name.nura", roleKey: "care.team.primaryNurse", specialtyKey: "care.team.specialty.icu", img: imgNuraAlRashid },
  { nameKey: "care.team.name.omar", roleKey: "care.team.attendingDoctor", specialtyKey: "care.team.specialty.cardiology", img: imgDrOmarAbdulhalim },
];

const carePlan = [
  { labelKey: "care.plan.initialAssessment", time: "Done", timeKey: "care.plan.done", done: true },
  { labelKey: "care.plan.bloodWork", time: "Done", timeKey: "care.plan.done", done: true },
  { labelKey: "care.plan.medicationRound", minutes: 45, done: false, active: true },
  { labelKey: "care.plan.checkup", minutes: 15, done: false },
  { labelKey: "care.plan.physicalTherapy", minutes: 30, done: false },
  { labelKey: "care.plan.doctorReview", minutes: 10, done: false },
];

const dietCodes = [
  { code: "NAS", labelKey: "care.diet.nas" },
  { code: "DM", labelKey: "care.diet.dm" },
];

const allergies = [
  { nameKey: "care.allergy.penicillin" },
  { nameKey: "care.allergy.latex" },
  { nameKey: "care.allergy.shellfish" },
];

const dischargePlan = [
  { labelKey: "care.discharge.order", time: "Done", timeKey: "care.plan.done", done: true },
  { labelKey: "care.discharge.insurance", time: "Done", timeKey: "care.plan.done", done: true },
  { labelKey: "care.discharge.medication", minutes: 45, done: false, active: true },
  { labelKey: "care.discharge.education", minutes: 20, done: false },
  { labelKey: "care.discharge.finalCheckup", minutes: 25, done: false },
  { labelKey: "care.discharge.confirm", minutes: 10, done: false },
];

/* ─── Slide Definitions ─── */
interface SlideConfig {
  key: string;
  title: string;
  titleKey: string;
  icon: typeof Heart;
}

const slides: SlideConfig[] = [
  { key: "team", title: "My Care Team", titleKey: "care.team.title", icon: Users },
  { key: "plan", title: "My Care Plan", titleKey: "care.plan.title", icon: ClipboardList },
  { key: "dietAllergy", title: "Diet Codes", titleKey: "care.diet.title", icon: Apple },
  { key: "labs", title: "Lab Results", titleKey: "care.labs.title", icon: FlaskConical },
  { key: "imaging", title: "Scans & Imaging", titleKey: "care.imaging.title", icon: ImageIcon },
  { key: "baby", title: "Baby Camera", titleKey: "care.baby.title", icon: Baby },
  { key: "discharge", title: "Discharge Plan", titleKey: "care.discharge.title", icon: LogOut },
];

const labResults = [
  { labelKey: "care.labs.cbc", value: "Normal range", status: "normal", date: "10 Mar", summaryKey: "care.labs.cbcSummary", pdfUrl: "/reports/lab-report-cbc.html" },
  { labelKey: "care.labs.hemoglobin", value: "11.2 g/dL", status: "low", date: "10 Mar", summaryKey: "care.labs.hgbSummary", pdfUrl: "/reports/lab-report-cbc.html" },
  { labelKey: "care.labs.glucose", value: "98 mg/dL", status: "normal", date: "11 Mar", summaryKey: "care.labs.normalRange", pdfUrl: "/reports/lab-report-cbc.html" },
  { labelKey: "care.labs.potassium", value: "4.1 mmol/L", status: "normal", date: "11 Mar", summaryKey: "care.labs.normalRange", pdfUrl: "/reports/lab-report-cbc.html" },
];

const imagingResults = [
  { labelKey: "care.imaging.ultrasound", date: "09 Mar", summaryKey: "care.imaging.summary", type: "Obstetric", pdfUrl: "/reports/obstetric-ultrasound.html" },
  { labelKey: "care.imaging.xray", date: "05 Mar", summaryKey: "care.imaging.xraySummary", type: "Chest", pdfUrl: "/reports/chest-xray.html" },
  { labelKey: "care.imaging.doppler", date: "12 Mar", summaryKey: "care.imaging.dopplerSummary", type: "Ultrasound", pdfUrl: "/reports/venous-doppler.html" },
];

/* ─── Reported Pain ─── */
function ReportedPain({ theme }: { theme: any }) {
  const { t } = useLocale();
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5"
      style={{ backgroundColor: theme.warningSubtle, border: `1px solid ${theme.warningSubtle}`, borderRadius: theme.radiusLg }}
    >
      <div
        className="w-9 h-9 flex items-center justify-center shrink-0"
        style={{ backgroundColor: theme.warningSubtle, borderRadius: theme.radiusMd }}
      >
        <AlertTriangle size={18} style={{ color: theme.warning }} />
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.subtitle, color: theme.textHeading }}>{t("care.pain.score")}</p>
        <p style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.caption, fontWeight: WEIGHT.normal, color: theme.textMuted }}>{t("care.pain.lastUpdated")}</p>
      </div>
      <div
        className="flex items-center gap-1 px-2.5 py-1 shrink-0"
        style={{ backgroundColor: theme.warningSubtle, borderRadius: theme.radiusSm }}
      >
        <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.label, color: theme.warning }}>5 / 10</span>
      </div>
    </div>
  );
}

/* ─── Slide-title-style section heading (matches "My Care Team" title bar) ─── */
function SlideSectionHeading({ icon, label, theme }: { icon: React.ReactNode; label: string; theme: any }) {
  return (
    <div className="flex items-center gap-2" style={{ padding: "4px 0" }}>
      {icon}
      <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.subtitle, color: theme.primary }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Slide Renders ─── */

function CareTeamSlide({ theme }: { theme: any }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-3 h-full">
      {careTeam.map((m, i) => (
        <div
          key={m.nameKey + i}
          className="flex items-center gap-3 px-3 py-2"
          style={{ backgroundColor: "rgba(232,236,238,0.5)", borderRadius: theme.radiusLg }}
        >
          <div className="relative rounded-full shrink-0 overflow-hidden"
            style={{ width: "44px", height: "44px" }}
          >
            <img src={m.img} alt={t(m.nameKey)} className="absolute left-0 top-0 w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.subtitle, color: theme.textHeading }}>{t(m.nameKey)}</p>
            <p style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.bodyEmphasis, fontWeight: WEIGHT.medium, color: theme.primary }}>{t(m.roleKey)}</p>
            <p style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.caption, fontWeight: WEIGHT.normal, color: theme.textMuted }}>{t(m.specialtyKey)}</p>
          </div>
        </div>
      ))}
      <SlideSectionHeading
        icon={<AlertTriangle size={16} strokeWidth={2} style={{ color: theme.primary }} />}
        label={t("care.pain.reported")}
        theme={theme}
      />
      <ReportedPain theme={theme} />
    </div>
  );
}

function TimelineSlide({
  items,
  theme,
  completedLabel,
}: {
  items: typeof carePlan;
  theme: any;
  completedLabel?: string;
}) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-0">
      {completedLabel && (
        null
      )}
      {items.map((step, i) => {
        const hasConnector = i < items.length - 1;
        const hasPrev = i > 0;
        return (
          <div key={step.labelKey} className="flex items-center gap-3 relative">
            {/* Top half connector — color follows previous step */}
            {hasPrev && (
              <div
                className="absolute z-0"
                style={{
                  insetInlineStart: "11px",
                  top: 0,
                  height: "50%",
                  width: "2px",
                  backgroundColor: items[i - 1].done ? theme.success : theme.borderDefault,
                }}
              />
            )}
            {/* Bottom half connector — color follows current step */}
            {hasConnector && (
              <div
                className="absolute z-0"
                style={{
                  insetInlineStart: "11px",
                  top: "50%",
                  height: "50%",
                  width: "2px",
                  backgroundColor: step.done ? theme.success : theme.borderDefault,
                }}
              />
            )}
            {/* Timeline icon — surface bg circle masks the connector line behind it */}
            <div
              className="shrink-0 flex items-center justify-center relative z-[1]"
              style={{ width: "24px", height: "24px", backgroundColor: theme.surface, borderRadius: theme.radiusFull }}
            >
              {step.done ? (
                <CheckCircle2 size={20} style={{ color: theme.success }} />
              ) : step.active ? (
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primary }}>
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full" style={{ border: `2px solid ${theme.borderDefault}`, backgroundColor: theme.surface }} />
              )}
            </div>
            {/* Content row */}
            <div
              className="flex-1 flex items-center justify-between px-3 py-4"
              style={{
                borderRadius: theme.radiusLg,
                backgroundColor: step.active ? `${theme.primarySubtle}` : "transparent",
                border: step.active ? `1px solid ${theme.primarySubtle}` : "1px solid transparent",
              }}
            >
              <span style={{
                fontFamily: theme.fontFamily,
                ...TEXT_STYLE.body,
                fontWeight: step.active ? WEIGHT.semibold : WEIGHT.normal,
                color: step.active ? theme.primary : step.done ? theme.textMuted : theme.textHeading,
                textDecoration: step.done ? "line-through" : "none",
              }}>
                {t(step.labelKey)}
              </span>
              <span
                className="flex items-center gap-1 shrink-0 ml-2 px-2 py-0.5"
                style={{
                  borderRadius: theme.radiusSm,
                  ...TEXT_STYLE.label,
                  color: step.done ? theme.success : step.active ? theme.primary : theme.textMuted,
                  backgroundColor: step.done ? theme.successSubtle : step.active ? theme.primarySubtle : "transparent",
                }}
              >
                {step.done ? <Check size={10} /> : <Clock size={10} />}
                {step.timeKey ? t(step.timeKey) : `${step.minutes} ${t("care.plan.min")}`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DietSlide({ theme }: { theme: any }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-2">
      {dietCodes.map((d) => (
        <div
          key={d.code}
          className="flex items-center gap-3 px-4 py-3"
          style={{ backgroundColor: theme.primarySubtle, border: `1px solid ${theme.primarySubtle}`, borderRadius: theme.radiusLg }}
        >
          <div
            className="w-9 h-9 flex items-center justify-center shrink-0"
            style={{ backgroundColor: theme.primarySubtle, borderRadius: theme.radiusMd }}
          >
            <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.micro, fontWeight: WEIGHT.bold, color: theme.primary, fontSize: "13px", letterSpacing: "0.5px" }}>{d.code}</span>
          </div>
          <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.subtitle, color: theme.textHeading }}>{t(d.labelKey)}</span>
        </div>
      ))}
    </div>
  );
}

function AllergySlide() {
  const { theme } = useTheme();
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-2">
      {allergies.map((a) => (
        <div
          key={a.nameKey}
          className="flex items-center gap-4 px-4 py-3"
          style={{ backgroundColor: theme.errorSubtle, border: `1px solid ${theme.errorSubtle}`, borderRadius: theme.radiusLg }}
        >
          <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ backgroundColor: theme.errorSubtle, borderRadius: theme.radiusMd }}>
            <AlertTriangle size={18} style={{ color: theme.error }} />
          </div>
          <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.body, color: theme.error }}>{t(a.nameKey)}</span>
        </div>
      ))}
    </div>
  );
}

function LabResultsSlide({ theme }: { theme: any }) {
  const { t } = useLocale();
  const [pdfModal, setPdfModal] = useState<{ url: string; title: string } | null>(null);

  const getStatusColor = (status?: string) => {
    if (status === "low" || status === "high") return theme.error;
    if (status === "normal") return theme.success;
    return theme.primary;
  };

  const getStatusBg = (status?: string) => {
    if (status === "low" || status === "high") return theme.errorSubtle;
    if (status === "normal") return theme.successSubtle;
    return theme.primarySubtle;
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {labResults.map((lab, i) => (
            <div 
              className="flex flex-col gap-2 px-4 py-3 cursor-pointer transition-all hover:brightness-105 active:scale-[0.98]"
              style={{ backgroundColor: theme.primarySubtle, border: `1px solid ${theme.borderSubtle}`, borderRadius: theme.radiusLg }}
              onClick={() => setPdfModal({ url: `${lab.pdfUrl}?h=${theme.id}`, title: t(lab.labelKey) })}
              data-nav="true"
            >
              <div className="flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: "#fff" }}>
                    <FlaskConical size={16} style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.bodyEmphasis, fontWeight: WEIGHT.bold, color: theme.textHeading }}>{t(lab.labelKey)}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span style={{ fontFamily: theme.fontFamily, fontSize: "12px", fontWeight: 700, color: getStatusColor(lab.status) }}>
                        {lab.value}
                      </span>
                      <span style={{ fontSize: "10px", color: theme.textDisabled }}>•</span>
                      <span style={{ fontFamily: theme.fontFamily, fontSize: "11px", fontWeight: 500, color: theme.textMuted }}>{lab.date}</span>
                    </div>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded-md" style={{ backgroundColor: getStatusBg(lab.status) }}>
                  <span style={{ fontFamily: theme.fontFamily, fontSize: "10px", fontWeight: 800, color: getStatusColor(lab.status), letterSpacing: "0.5px" }}>
                    {lab.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              <div 
                className="mt-1 flex items-center gap-1.5 self-start px-3 py-1.5 pointer-events-none" 
                style={{ borderRadius: theme.radiusMd, backgroundColor: theme.surface, border: `1px solid ${theme.borderSubtle}` }}
              >
                <FileText size={12} style={{ color: theme.primary }} />
                <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.micro, fontWeight: WEIGHT.bold, color: theme.primary }}>{t("care.imaging.viewReport")}</span>
              </div>
            </div>
        ))}
      </div>
      {pdfModal && <PdfViewerModal url={pdfModal.url} title={pdfModal.title} onClose={() => setPdfModal(null)} />}
    </>
  );
}

/* ─── In-App PDF Viewer Modal ─── */
function PdfViewerModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const { theme } = useTheme();
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", animation: "babyCamFadeIn 0.25s ease-out" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ backgroundColor: theme.surface, borderBottom: `1px solid ${theme.borderSubtle}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: theme.primarySubtle }}>
            <FileText size={18} style={{ color: theme.primary }} />
          </div>
          <div>
            <p style={{ fontFamily: theme.fontFamily, fontSize: "15px", fontWeight: WEIGHT.bold, color: theme.textHeading }}>{title}</p>
            <p style={{ fontFamily: theme.fontFamily, fontSize: "12px", color: theme.textMuted }}>Detailed Medical Report</p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          data-nav="true"
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
          style={{ backgroundColor: theme.surfaceAlt }}
        >
          <X size={18} style={{ color: theme.textMuted }} />
        </button>
      </div>
      {/* PDF iframe */}
      <div className="flex-1 min-h-0">
        <iframe
          src={url}
          title={title}
          className="w-full h-full border-0"
          allow="fullscreen"
        />
      </div>
    </div>,
    document.body
  );
}

function ImagingSlide({ theme }: { theme: any }) {
  const { t } = useLocale();
  const [pdfModal, setPdfModal] = useState<{ url: string; title: string } | null>(null);

  return (
    <>
      <div className="flex flex-col gap-3">
        {imagingResults.map((img, i) => (
            <div 
              className="flex flex-col gap-2 px-4 py-3 cursor-pointer transition-all hover:brightness-105 active:scale-[0.98]"
              style={{ backgroundColor: theme.primarySubtle, border: `1px solid ${theme.borderSubtle}`, borderRadius: theme.radiusLg }}
              onClick={() => setPdfModal({ url: `${img.pdfUrl}?h=${theme.id}`, title: t(img.labelKey) })}
              data-nav="true"
            >
              <div className="flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: "#fff" }}>
                    <ImageIcon size={16} style={{ color: theme.primary }} />
                  </div>
                  <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.bodyEmphasis, fontWeight: WEIGHT.bold, color: theme.textHeading }}>{t(img.labelKey)}</span>
                </div>
                <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.caption, color: theme.textMuted }}>{img.date}</span>
              </div>
              <p style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.caption, color: theme.textHeading, paddingLeft: 40 }}>{t(img.summaryKey)}</p>
              <div 
                className="mt-1 flex items-center gap-1.5 self-start px-3 py-1.5 pointer-events-none" 
                style={{ borderRadius: theme.radiusMd, backgroundColor: theme.surface, border: `1px solid ${theme.borderSubtle}` }}
              >
                <FileText size={12} style={{ color: theme.primary }} />
                <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.micro, fontWeight: WEIGHT.bold, color: theme.primary }}>{t("care.imaging.viewReport")}</span>
              </div>
            </div>
        ))}
      </div>
      {pdfModal && <PdfViewerModal url={pdfModal.url} title={pdfModal.title} onClose={() => setPdfModal(null)} />}
    </>
  );
}

function BabyCameraSlide() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const [fullscreen, setFullscreen] = useState(false);
  
  const isDallah = theme.id === "dallah";
  const isCareMed = theme.id === "caremed";
  const cameraImage = isDallah ? imgDallahBabyCam : isCareMed ? imgCareMedBabyCam : imgBabyCam;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* 16:9 Camera Feed */}
      <div
        className="relative w-full cursor-pointer overflow-hidden group"
        style={{ 
          aspectRatio: "1 / 1.1",
          backgroundColor: "#000", 
          boxShadow: SHADOW.xl, 
          borderRadius: theme.radiusLg 
        }}
        onClick={() => setFullscreen(true)}
      >
        <img
          src={cameraImage}
          alt="Baby Camera Feed"
          className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Image Overlays — LIVE badge + expand only */}
        <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none">
          {/* Top: LIVE badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md self-start" style={{ backgroundColor: "rgba(239,68,68,0.9)" }}>
            <Circle size={7} fill="#fff" style={{ color: "#fff", animation: "pulse 1.5s infinite" }} />
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase" }}>{t("care.baby.live")}</span>
          </div>
          {/* Bottom-right: expand icon */}
          <div className="flex items-center justify-end">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
              <Maximize2 size={13} style={{ color: "#fff" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Info below the feed */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-3">
          {/* Baby icon avatar */}
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: theme.primarySubtle }}>
            <Baby size={18} style={{ color: theme.primary }} />
          </div>
          <div>
            <p style={{ fontFamily: theme.fontFamily, fontSize: "15px", fontWeight: WEIGHT.bold, color: theme.textHeading, lineHeight: 1.2 }}>Baby Saleh</p>
            <p style={{ fontFamily: theme.fontFamily, fontSize: "12px", color: theme.textMuted, marginTop: "2px" }}>Nursery · Crib 3A</p>
          </div>
        </div>

        {/* Connected badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: theme.primarySubtle }}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.success, boxShadow: `0 0 6px ${theme.success}` }} />
          <span style={{ fontFamily: theme.fontFamily, fontSize: "11px", fontWeight: 700, color: theme.primary }}>{t("care.baby.connected")}</span>
        </div>
      </div>

      {/* Fullscreen Baby Camera Overlay */}
      {fullscreen && createPortal(
        <BabyCameraFullscreen onClose={() => setFullscreen(false)} cameraImage={cameraImage} />,
        document.body
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ─── Fullscreen Baby Camera Overlay ─── */
function BabyCameraFullscreen({ onClose, cameraImage }: { onClose: () => void, cameraImage: any }) {
  const { theme } = useTheme();
  const { t } = useLocale();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer"
      style={{
        backgroundColor: "#000",
        animation: "babyCamFadeIn 0.3s ease-out",
      }}
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={cameraImage}
          alt="Baby Camera Feed — Full Screen"
          className="w-full h-full object-contain"
        />

        {/* Top bar overlay */}
        <div 
          className="absolute top-0 left-0 right-0 px-8 py-6 flex items-start justify-between z-10 pointer-events-none"
          style={{ background: "linear-gradient(rgba(0,0,0,0.6) 0%, transparent 100%)" }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full" style={{ backgroundColor: "rgba(239,68,68,0.9)" }}>
              <Circle size={10} fill="#fff" style={{ color: "#fff", animation: "pulse 1.5s infinite" }} />
              <span style={{ fontSize: "14px", fontWeight: 800, color: "#fff", letterSpacing: "1px" }}>{t("care.baby.live")}</span>
            </div>
            <div>
              <p style={{ fontFamily: theme.fontFamily, fontSize: "28px", fontWeight: WEIGHT.bold, color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>Baby Saleh</p>
              <p style={{ fontFamily: theme.fontFamily, fontSize: "18px", color: "rgba(255,255,255,0.7)", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>Nursery · Crib 3A</p>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-8 py-3 rounded-full z-10" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <Video size={18} style={{ color: "#fff" }} />
          <span style={{ fontFamily: theme.fontFamily, fontSize: "16px", fontWeight: WEIGHT.medium, color: "#fff" }}>
            {t("care.baby.tapToExit")}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes babyCamFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ─── Per-slide icon ─── */
function SlideIcon({ slideKey }: { slideKey: string }) {
  const { theme } = useTheme();
  const iconProps = { size: 16, strokeWidth: 2 };
  const color = theme.primary;
  switch (slideKey) {
    case "team": return <Users {...iconProps} style={{ color }} />;
    case "plan": return <ClipboardList {...iconProps} style={{ color }} />;
    case "dietAllergy": return <Apple {...iconProps} style={{ color }} />;
    case "labs": return <FlaskConical {...iconProps} style={{ color }} />;
    case "imaging": return <ImageIcon {...iconProps} style={{ color }} />;
    case "baby": return <Baby {...iconProps} style={{ color }} />;
    case "discharge": return <LogOut {...iconProps} style={{ color }} />;
    default: return <Heart {...iconProps} style={{ color }} />;
  }
}

/* ─── CareMe Heart SVG from Figma ─── */
function HeartIcon() {
  return (
    <div className="relative shrink-0 size-[20px]">
      <svg className="block size-full" fill="none" viewBox="0 0 20 20">
        <g><path d={svgPaths.p2f84f400} fill="#B23453" stroke="#B23453" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" /></g>
      </svg>
    </div>
  );
}

/* ─── Admission / Discharge Date Strip ─── */
function DateStrip() {
  const { theme } = useTheme();
  const { t } = useLocale();
  return (
    <div
      className="flex items-center shrink-0 mx-4 mb-3"
      style={{
        borderRadius: theme.radiusMd,
        backgroundColor: theme.primarySubtle,
        border: `1px solid ${theme.primarySubtle}`,
        padding: "8px 12px",
      }}
    >
      {/* Admission */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: "28px",
            height: "28px",
            borderRadius: theme.radiusMd,
            backgroundColor: theme.primarySubtle,
          }}
        >
          <CalendarDays size={14} style={{ color: theme.primary }} />
        </div>
        <div className="min-w-0">
          <p style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.micro, color: theme.textMuted }}>
            {t("care.admitted")}
          </p>
          <p style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.label, color: theme.textHeading }}>
            {t("date.5mar2026")}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: "1px", height: "28px", backgroundColor: theme.primarySubtle, margin: "0 10px", flexShrink: 0 }} />

      {/* Discharge */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: "28px",
            height: "28px",
            borderRadius: theme.radiusMd,
            backgroundColor: theme.primarySubtle,
          }}
        >
          <CalendarDays size={14} style={{ color: theme.primary }} />
        </div>
        <div className="min-w-0">
          <p style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.micro, color: theme.textMuted }}>
            {t("care.discharge")}
          </p>
          <p style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.label, color: theme.textHeading }}>
            {t("date.12mar2026")}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export function CareMe({ onExpand }: { onExpand?: () => void }) {
  const { theme } = useTheme();
  const { t, isRTL, dir } = useLocale();
  const [activeIndex, setActiveIndex] = useState(1); // Start at index 1 because of clones
  const [isBlurred, setIsBlurred] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [paused, setPaused] = useState(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extended slides for circular carousel: [Last, S0, S1, S2, S3, S4, S5, S6, First]
  const extendedSlides = useMemo(() => [
    slides[slides.length - 1],
    ...slides,
    slides[0]
  ], []);

  const goTo = useCallback(
    (idx: number) => {
      setActiveIndex(idx);
    },
    []
  );

  /* Auto-rotate every 6 seconds */
  useEffect(() => {
    if (paused || isPinned) return;
    autoTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => prev + 1);
    }, 6000);
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [paused, isPinned]);

  /* Pause on user interaction, resume after 15s */
  const pauseAutoRotate = useCallback(() => {
    setPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setPaused(false), 15000);
  }, []);

  const handleManualNav = useCallback(
    (idx: number) => {
      goTo(idx);
      pauseAutoRotate();
    },
    [goTo, pauseAutoRotate]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    // If clicking a button or something with data-nav, don't start dragging
    const target = e.target as HTMLElement;
    if (target.closest('[data-nav="true"]')) return;

    touchStartX.current = e.clientX;
    touchDeltaX.current = 0;
    setDragOffset(0);
    setIsDragging(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - touchStartX.current;
    touchDeltaX.current = delta;
    setDragOffset(delta);
    pauseAutoRotate();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    
    const threshold = 80; 
    if (touchDeltaX.current < -threshold) {
      handleManualNav(activeIndex + 1);
    } else if (touchDeltaX.current > threshold) {
      handleManualNav(activeIndex - 1);
    }
    setDragOffset(0);
    touchDeltaX.current = 0;
  };

  // Teleportation for circular wrap-around
  const handleTransitionEnd = () => {
    if (activeIndex === 0) {
      setIsSnapping(true);
      setActiveIndex(slides.length);
      setTimeout(() => setIsSnapping(false), 50);
    } else if (activeIndex === extendedSlides.length - 1) {
      setIsSnapping(true);
      setActiveIndex(1);
      setTimeout(() => setIsSnapping(false), 50);
    }
  };

  const activeSlide = extendedSlides[activeIndex];
  const realIndex = activeIndex === 0 ? slides.length - 1 : activeIndex === extendedSlides.length - 1 ? 0 : activeIndex - 1;

  const renderSlideContentItem = (key: string) => {
    switch (key) {
      case "team": return <CareTeamSlide theme={theme} />;
      case "plan": return <TimelineSlide items={carePlan} theme={theme} />;
      case "dietAllergy": return (
        <div className="flex flex-col gap-3">
          <DietSlide theme={theme} />
          <SlideSectionHeading
            icon={<AlertTriangle size={16} strokeWidth={2} style={{ color: theme.primary }} />}
            label={t("care.allergies")}
            theme={theme}
          />
          <AllergySlide />
        </div>
      );
      case "labs": return <LabResultsSlide theme={theme} />;
      case "imaging": return <ImagingSlide theme={theme} />;
      case "baby": return <BabyCameraSlide />;
      case "discharge": return <TimelineSlide items={dischargePlan} theme={theme} completedLabel="2 of 6 Completed" />;
      default: return null;
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden flex-1 min-h-0 relative select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        backgroundColor: theme.surface,
        borderRadius: theme.radiusCard,
        boxShadow: SHADOW.md,
        border: theme.cardBorder,
        touchAction: "pan-y",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between shrink-0" style={{ padding: "22px 22px 12px 22px" }}>
        <div className="flex items-center gap-2">
          <HeartIcon />
          <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.sectionTitle, color: theme.textHeading }}>CareMe</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            data-nav="true"
            onClick={() => setIsBlurred(prev => !prev)}
            className="p-1.5 cursor-pointer active:bg-black/10 transition-colors"
            style={{ borderRadius: theme.radiusMd, outline: 'none' }}
            aria-label="Toggle privacy blur"
          >
            {isBlurred ? <EyeOff size={15} style={{ color: theme.primary }} /> : <Eye size={15} style={{ color: theme.primary }} />}
          </button>
          <button
            data-nav="true"
            onClick={() => setIsPinned(prev => !prev)}
            className="p-1.5 cursor-pointer active:bg-black/10 transition-colors"
            style={{ 
              borderRadius: theme.radiusMd, 
              outline: 'none',
              backgroundColor: isPinned ? "rgba(0,0,0,0.05)" : "transparent"
            }}
            aria-label={isPinned ? "Unpin slider" : "Pin slider"}
          >
            <Pin 
              size={15} 
              style={{ 
                color: isPinned ? theme.accent : theme.primary,
                fill: isPinned ? theme.accent : 'none',
                transform: isPinned ? 'rotate(45deg)' : 'none',
                transition: 'all 0.2s ease'
              }} 
            />
          </button>
          {onExpand && (
            <button
              data-nav="true"
              onClick={onExpand}
              className="p-1.5 cursor-pointer active:bg-black/10 transition-colors"
              style={{ borderRadius: theme.radiusMd, outline: 'none' }}
              aria-label="Expand CareMe"
            >
              <Maximize2 size={15} style={{ color: theme.primary }} />
            </button>
          )}
          <button
            data-nav="true"
            onClick={() => handleManualNav(activeIndex - 1)}
            className="p-1.5 cursor-pointer active:bg-black/10 transition-colors"
            style={{ borderRadius: theme.radiusMd, outline: 'none' }}
            aria-label="Previous slide"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={isRTL ? { transform: "scaleX(-1)" } : undefined}>
              <path d="M10 12L6 8L10 4" stroke="#73848C" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
            </svg>
          </button>
          <button
            data-nav="true"
            onClick={() => handleManualNav(activeIndex + 1)}
            className="p-1.5 cursor-pointer active:bg-black/10 transition-colors"
            style={{ borderRadius: theme.radiusMd, outline: 'none' }}
            aria-label="Next slide"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={isRTL ? { transform: "scaleX(-1)" } : undefined}>
              <path d="M6 12L10 8L6 4" stroke={theme.primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
            </svg>
          </button>
        </div>
      </div>

      {/* Admission / Discharge — fixed across all slides */}
      <DateStrip />

      {/* Slide Title */}
      <div className="flex items-center gap-2 shrink-0" style={{ padding: "0 22px" }}>
        <SlideIcon slideKey={activeSlide.key} />
        <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.subtitle, color: theme.primary }}>{t(activeSlide.titleKey)}</span>
        <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.caption, color: theme.textMuted, marginLeft: "auto" }}>
          {realIndex + 1} / {slides.length}
        </span>
      </div>

      {/* Slide Content */}
      <div 
        className="flex-1 min-h-0 overflow-hidden relative"
        dir="ltr"
        style={{
          filter: isBlurred ? "blur(12px)" : "none",
          transition: "filter 0.3s ease",
        }}
      >
        <div
          className="flex h-full"
          onTransitionEnd={handleTransitionEnd}
          dir="ltr"
          style={{
            width: `${extendedSlides.length * 100}%`,
            transition: (isDragging || isSnapping) ? "none" : "transform 0.5s cubic-bezier(0.2, 1, 0.2, 1)",
            transform: `translateX(calc(-${(activeIndex * 100) / extendedSlides.length}% + ${dragOffset}px))`,
          }}
        >
          {extendedSlides.map((slide, i) => (
            <div
              key={`${slide.key}-${i}`}
              className="h-full overflow-y-auto careme-scroll shrink-0"
              dir={dir}
              style={{
                width: `${100 / extendedSlides.length}%`,
                padding: "12px 22px",
                pointerEvents: isBlurred ? "none" : "auto",
              }}
            >
              {renderSlideContentItem(slide.key)}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2 py-3 shrink-0">
        {slides.map((s, i) => (
          <button
            key={s.key}
            data-nav="true"
            onClick={() => handleManualNav(i + 1)}
            className="rounded-full transition-all duration-300 cursor-pointer"
            style={{
              width: i === realIndex ? "20px" : "6px",
              height: "6px",
              backgroundColor: i === realIndex ? theme.primary : "rgba(0,0,0,0.08)",
            }}
            aria-label={`Go to ${t(s.titleKey)}`}
          />
        ))}
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .careme-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .careme-scroll::-webkit-scrollbar-track {
          background: transparent;
          margin: 4px 0;
        }
        .careme-scroll::-webkit-scrollbar-thumb {
          background: var(--hbs-primary-subtle);
          border-radius: 100px;
        }
        .careme-scroll::-webkit-scrollbar-thumb:active {
          background: var(--hbs-primary);
          opacity: 0.35;
        }
        .careme-scroll {
          scrollbar-width: thin;
          scrollbar-color: var(--hbs-primary-subtle) transparent;
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * CareMeExpanded — Full-screen overlay showing all 6 slides as columns
 * ═══════════════════════════════════════════════════════════════════════════ */

function ExpandedSlideIcon({ slideKey, size = 20 }: { slideKey: string; size?: number }) {
  const iconProps = { size, strokeWidth: 2 };
  switch (slideKey) {
    case "team": return <Users {...iconProps} />;
    case "plan": return <ClipboardList {...iconProps} />;
    case "dietAllergy": return <Apple {...iconProps} />;
    case "labs": return <FlaskConical {...iconProps} />;
    case "imaging": return <ImageIcon {...iconProps} />;
    case "baby": return <Baby {...iconProps} />;
    case "discharge": return <LogOut {...iconProps} />;
    default: return <Heart {...iconProps} />;
  }
}

function renderExpandedSlideContent(key: string, theme: any, t: (k: string) => string) {
  switch (key) {
    case "team": return <CareTeamSlide theme={theme} />;
    case "plan": return <TimelineSlide items={carePlan} theme={theme} />;
    case "dietAllergy": return (
      <div className="flex flex-col gap-3">
        <DietSlide theme={theme} />
        <SlideSectionHeading
          icon={<AlertTriangle size={16} strokeWidth={2} style={{ color: theme.primary }} />}
          label={t("care.allergies")}
          theme={theme}
        />
        <AllergySlide />
      </div>
    );
    case "labs": return <LabResultsSlide theme={theme} />;
    case "imaging": return <ImagingSlide theme={theme} />;
    case "baby": return <BabyCameraSlide />;
    case "discharge": return <TimelineSlide items={dischargePlan} theme={theme} completedLabel="2 of 6 Completed" />;
    default: return null;
  }
}

export function CareMeExpanded({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const primary = theme.primary;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{
        background: `linear-gradient(160deg, ${primary} 0%, ${theme.primaryDark} 40%, #0a1628 100%)`,
        animation: "caremeExpandIn 0.25s ease-out",
      }}
    >
      {/* Subtle background texture */}
      <img
        src={theme.heroImageUrl}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        style={{ opacity: 0.06, mixBlendMode: "luminosity" }}
      />

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-10 pt-8 pb-4 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: theme.radiusLg,
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <X size={24} style={{ color: "#fff" }} />
          </button>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{
                width: "52px",
                height: "52px",
                borderRadius: theme.radiusLg,
                backgroundColor: "rgba(255,255,255,0.12)",
              }}
            >
              <Heart size={26} fill="#fff" style={{ color: "#fff" }} />
            </div>
            <div>
              <h2 style={{
                fontFamily: theme.fontFamily,
                ...TEXT_STYLE.display,
                fontSize: "32px",
                color: "#FFFFFF",
                lineHeight: "36px",
              }}>
                CareMe
              </h2>
              <p style={{
                fontFamily: theme.fontFamily,
                ...TEXT_STYLE.caption,
                color: "rgba(255,255,255,0.6)",
                marginTop: "2px",
              }}>
                {t("care.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vertically centered content area */}
      <div className="flex-1 flex flex-col justify-center relative z-10 min-h-0">
        {/* Full-width info bar: MRN · Room · Extension · Admitted · Discharge */}
        <div className="shrink-0 grid gap-4 px-10 pb-6" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
          {/* MRN — col 1 */}
          <div
            className="flex items-center gap-3"
            style={{
              borderRadius: theme.radiusLg,
              backgroundColor: theme.surface,
              border: `1px solid ${theme.borderDefault}`,
              padding: "16px 16px",
              boxShadow: SHADOW.sm,
            }}
          >
            <div
              className="w-9 h-9 flex items-center justify-center shrink-0"
              style={{ backgroundColor: theme.primarySubtle, color: theme.primary, borderRadius: theme.radiusMd }}
            >
              <Hash size={18} />
            </div>
            <div>
              <p style={{ fontFamily: theme.fontFamily, fontSize: "11px", fontWeight: WEIGHT.semibold, color: theme.textMuted, letterSpacing: "0.5px", lineHeight: "14px" }}>{t("care.mrn")}</p>
              <p style={{ fontFamily: theme.fontFamily, fontSize: "16px", fontWeight: WEIGHT.bold, color: theme.textHeading, lineHeight: "22px" }}>00–284619</p>
            </div>
          </div>
          {/* Room — col 2 */}
          <div
            className="flex items-center gap-3"
            style={{
              borderRadius: theme.radiusLg,
              backgroundColor: theme.surface,
              border: `1px solid ${theme.borderDefault}`,
              padding: "16px 16px",
              boxShadow: SHADOW.sm,
            }}
          >
            <div
              className="w-9 h-9 flex items-center justify-center shrink-0"
              style={{ backgroundColor: theme.primarySubtle, color: theme.primary, borderRadius: theme.radiusMd }}
            >
              <DoorOpen size={18} />
            </div>
            <div>
              <p style={{ fontFamily: theme.fontFamily, fontSize: "11px", fontWeight: WEIGHT.semibold, color: theme.textMuted, letterSpacing: "0.5px", lineHeight: "14px" }}>{t("care.room")}</p>
              <p style={{ fontFamily: theme.fontFamily, fontSize: "16px", fontWeight: WEIGHT.bold, color: theme.textHeading, lineHeight: "22px" }}>412</p>
            </div>
          </div>
          {/* Extension — col 3 */}
          <div
            className="flex items-center gap-3"
            style={{
              borderRadius: theme.radiusLg,
              backgroundColor: theme.surface,
              border: `1px solid ${theme.borderDefault}`,
              padding: "16px 16px",
              boxShadow: SHADOW.sm,
            }}
          >
            <div
              className="w-9 h-9 flex items-center justify-center shrink-0"
              style={{ backgroundColor: theme.primarySubtle, color: theme.primary, borderRadius: theme.radiusMd }}
            >
              <Phone size={18} />
            </div>
            <div>
              <p style={{ fontFamily: theme.fontFamily, fontSize: "11px", fontWeight: WEIGHT.semibold, color: theme.textMuted, letterSpacing: "0.5px", lineHeight: "14px" }}>{t("care.extension")}</p>
              <p style={{ fontFamily: theme.fontFamily, fontSize: "16px", fontWeight: WEIGHT.bold, color: theme.textHeading, lineHeight: "22px" }}>4217</p>
            </div>
          </div>
          {/* Admitted — col 4 */}
          <div
            className="flex items-center gap-3"
            style={{
              borderRadius: theme.radiusLg,
              backgroundColor: theme.surface,
              border: `1px solid ${theme.borderDefault}`,
              padding: "16px 16px",
              boxShadow: SHADOW.sm,
            }}
          >
            <div
              className="w-9 h-9 flex items-center justify-center shrink-0"
              style={{ backgroundColor: theme.primarySubtle, color: theme.primary, borderRadius: theme.radiusMd }}
            >
              <CalendarDays size={18} />
            </div>
            <div>
              <p style={{ fontFamily: theme.fontFamily, fontSize: "11px", fontWeight: WEIGHT.semibold, color: theme.textMuted, letterSpacing: "0.5px", lineHeight: "14px" }}>{t("care.admitted")}</p>
              <p style={{ fontFamily: theme.fontFamily, fontSize: "16px", fontWeight: WEIGHT.bold, color: theme.textHeading, lineHeight: "22px" }}>{t("date.5mar2026")}</p>
            </div>
          </div>
          {/* Discharge — col 5 */}
          <div
            className="flex items-center gap-3"
            style={{
              borderRadius: theme.radiusLg,
              backgroundColor: theme.surface,
              border: `1px solid ${theme.borderDefault}`,
              padding: "16px 16px",
              boxShadow: SHADOW.sm,
            }}
          >
            <div
              className="w-9 h-9 flex items-center justify-center shrink-0"
              style={{ backgroundColor: theme.primarySubtle, color: theme.primary, borderRadius: theme.radiusMd }}
            >
              <CalendarDays size={18} />
            </div>
            <div>
              <p style={{ fontFamily: theme.fontFamily, fontSize: "11px", fontWeight: WEIGHT.semibold, color: theme.textMuted, letterSpacing: "0.5px", lineHeight: "14px" }}>{t("care.discharge")}</p>
              <p style={{ fontFamily: theme.fontFamily, fontSize: "16px", fontWeight: WEIGHT.bold, color: theme.textHeading, lineHeight: "22px" }}>{t("date.12mar2026")}</p>
            </div>
          </div>
        </div>

        {/* Horizontal Scrolling Columns — 5 visible at once */}
        <div className="flex gap-4 px-10 pb-8 overflow-x-auto careme-scroll h-full no-scrollbar" style={{ height: "65%" }}>
          {slides.map((slide) => (
            <div
              key={slide.key}
              className="flex flex-col h-full min-h-0 overflow-hidden shrink-0"
              style={{
                width: "calc(20% - 13px)",
                backgroundColor: theme.surface,
                borderRadius: theme.radiusXl,
                boxShadow: SHADOW.xl,
                animation: "caremeExpandIn 0.3s ease-out both",
              }}
            >
              {/* Column header */}
              <div className="shrink-0 flex items-center gap-2.5 px-5 pt-4 pb-2.5">
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: theme.radiusMd,
                    backgroundColor: theme.primarySubtle,
                    color: theme.primary,
                  }}
                >
                  <ExpandedSlideIcon slideKey={slide.key} size={16} />
                </div>
                <span className="truncate" style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.subtitle, color: theme.textHeading }}>
                  {t(slide.titleKey)}
                </span>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: theme.borderSubtle, margin: "0 16px" }} />

              {/* Column content */}
              <div className="flex-1 min-h-0 overflow-y-auto careme-scroll" style={{ padding: "12px 14px" }}>
                {renderExpandedSlideContent(slide.key, theme, t)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollbar + animation styles */}
      <style>{`
        @keyframes caremeExpandIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .careme-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .careme-scroll::-webkit-scrollbar-track {
          background: transparent;
          margin: 4px 0;
        }
        .careme-scroll::-webkit-scrollbar-thumb {
          background: var(--hbs-primary-subtle);
          border-radius: 100px;
        }
        .careme-scroll::-webkit-scrollbar-thumb:active {
          background: var(--hbs-primary);
          opacity: 0.35;
        }
        .careme-scroll {
          scrollbar-width: thin;
          scrollbar-color: var(--hbs-primary-subtle) transparent;
        }
      `}</style>
    </div>
  );
}