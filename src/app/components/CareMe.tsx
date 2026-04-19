import { useTheme, TYPE_SCALE, WEIGHT, SHADOW, primaryRgba, TEXT_STYLE, SPACE } from "./ThemeContext";
import { useLocale } from "./i18n";
import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Heart,
  Users,
  ClipboardList,
  Apple,
  AlertTriangle,
  Baby,
  LogOut,
  LogIn,
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
  Shield,
  Venus,
  Mars,
  Utensils,
  Eye,
  EyeOff,
  Pin,
  PinOff,
  FlaskConical,
  Image as ImageIcon,
  FileText,
  CreditCard,
  Receipt,
  Wallet,
  IdCard,
  User,
  ShieldCheck,
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
  { labelKey: "care.plan.labTests", time: "Done", timeKey: "care.plan.done", done: true },
  { labelKey: "care.plan.scansImaging", time: "Done", timeKey: "care.plan.done", done: true },
  { labelKey: "care.plan.medicationPrep", time: "Done", timeKey: "care.plan.done", done: true },
  { labelKey: "care.plan.laborMonitoring", minutes: 45, done: false, active: true },
  { labelKey: "care.plan.delivery", minutes: 120, done: false },
  { labelKey: "care.plan.recoveryObservation", minutes: 60, done: false },
  { labelKey: "care.plan.motherBabyCheck", minutes: 30, done: false },
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
  { labelKey: "care.discharge.finalCheck", time: "Done", timeKey: "care.plan.done", done: true },
  { labelKey: "care.discharge.medicationPrep", time: "Done", timeKey: "care.plan.done", done: true },
  { labelKey: "care.discharge.education", minutes: 45, done: false, active: true },
  { labelKey: "care.discharge.homeCare", minutes: 20, done: false },
  { labelKey: "care.discharge.followup", minutes: 15, done: false },
  { labelKey: "care.discharge.billing", minutes: 30, done: false },
  { labelKey: "care.discharge.docsReady", minutes: 25, done: false },
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
  { key: "profile", title: "Patient Profile", titleKey: "care.profile.title", icon: IdCard },
  { key: "overview", title: "Care Overview", titleKey: "care.overview.title", icon: Activity },
  { key: "plan", title: "My Care Plan", titleKey: "care.plan.title", icon: ClipboardList },
  { key: "billing", title: "Financial Summary", titleKey: "care.billing.title", icon: CreditCard },
  { key: "labs", title: "Lab Results", titleKey: "care.labs.title", icon: FlaskConical },
  { key: "imaging", title: "Scans & Imaging", titleKey: "care.imaging.title", icon: ImageIcon },
  { key: "baby", title: "Baby Camera", titleKey: "care.baby.title", icon: Baby },
  { key: "discharge", title: "Discharge Plan", titleKey: "care.discharge.title", icon: LogOut },
];

const billingItems = [
  { id: 1, labelKey: "bill.item.room", amount: 1200, unit: "SAR", category: "accommodation", qty: 2 },
  { id: 2, labelKey: "bill.item.delivery", amount: 15000, unit: "SAR", category: "clinical", qty: 1 },
  { id: 3, labelKey: "bill.item.labs", amount: 1250, unit: "SAR", category: "clinical", qty: 1 },
  { id: 4, labelKey: "bill.item.pharmacy", amount: 840, unit: "SAR", category: "supplies", qty: 1 },
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
/* ─── Helper for Inner Containers ─── */
function SectionContainer({ children, theme, isExpanded, padding, bg, className = "" }: any) {
  return (
    <div 
      className={className}
      style={{
        backgroundColor: bg || "rgba(0,0,0,0.026)",
        borderRadius: theme.radiusLg,
        border: "1px solid rgba(0,0,0,0.04)",
        padding: padding || (isExpanded ? "20px" : "14px"),
        width: "100%"
      }}
    >
      {children}
    </div>
  );
}

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
function SlideSectionHeading({ icon, label, theme, extra }: { icon: React.ComponentType<any>; label: string; theme: any; extra?: React.ReactNode }) {
  const Icon = icon;
  return (
    <div className="flex items-center justify-between py-2 mb-1 border-b" style={{ borderColor: theme.borderSubtle }}>
      <div className="flex items-center gap-2">
        <Icon size={16} strokeWidth={2.5} style={{ color: theme.primary }} />
        <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.label, fontWeight: WEIGHT.bold, color: theme.primary, letterSpacing: "0.2px" }}>
          {label}
        </span>
      </div>
      {extra}
    </div>
  );
}

/* ─── Patient Profile Slide (Identity Hub) ─── */
function GendersIcon({ size = 14, style }: { size?: number, style?: any }) {
  const color = style?.color || "currentColor";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute top-[-2px] left-[-2px]">
        <Venus size={size - 2} style={{ color }} strokeWidth={2.5} />
      </div>
      <div className="absolute bottom-[-1px] right-[-1px]">
        <Mars size={size - 2} style={{ color }} strokeWidth={2.5} />
      </div>
    </div>
  );
}

function PatientProfileSlide({ theme, isExpanded = false }: { theme: any, isExpanded?: boolean }) {
  const { t, localizeNumber } = useLocale();

    const infoRow = (icon: React.ComponentType<any>, label: string, val: string, customColor?: string) => {
    const Icon = icon;
    const baseColor = customColor || theme.primary;
    const bgColor = customColor ? `${customColor}15` : theme.primarySubtle;
    const labelSize = isExpanded ? "16px" : "13px";
    const valueSize = isExpanded ? "16px" : "13.5px";
    
    return (
      <div className="flex items-start gap-4">
        <div 
          className="flex items-center justify-center shrink-0" 
          style={{ 
            width: isExpanded ? "40px" : "36px", 
            height: isExpanded ? "40px" : "36px", 
            borderRadius: theme.radiusFull,
            backgroundColor: bgColor 
          }}
        >
           <Icon size={isExpanded ? 18 : 14} style={{ color: baseColor }} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col min-w-0" style={{ gap: "0px" }}>
          <p style={{ fontFamily: theme.fontFamily, fontSize: labelSize, color: theme.textMuted, lineHeight: "1.2" }}>{label}</p>
          <p style={{ 
            fontFamily: theme.fontFamily, 
            fontSize: valueSize, 
            fontWeight: WEIGHT.bold, 
            color: theme.textHeading, 
            lineHeight: "1.2",
            marginTop: "2px"
          }}>{val}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Module 1: Stay Timeline */}
      <SectionContainer theme={theme} isExpanded={isExpanded} padding={isExpanded ? "16px 20px" : "12px 14px"}>
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-x-6">
                {infoRow(LogIn, t("care.admitted"), t("date.5mar2026"), "#EF4444")}
                {infoRow(LogOut, t("care.discharge"), t("date.12mar2026"), "#22C55E")}
            </div>
        </div>
      </SectionContainer>

      {/* Module 2: Identity & Clinical Grid */}
      <SectionContainer theme={theme} isExpanded={isExpanded}>
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: theme.primary }}>
                  <User size={18} style={{ color: "#fff" }} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col pt-0.5">
                  <p style={{ fontFamily: theme.fontFamily, fontSize: isExpanded ? "16px" : "13px", color: theme.textMuted, lineHeight: "1.2" }}>{t("care.fullName")}</p>
                  <p style={{ fontFamily: theme.fontFamily, fontSize: isExpanded ? "18px" : "15.5px", fontWeight: WEIGHT.bold, color: theme.textHeading, lineHeight: "1.4", marginTop: "2px" }}>{t("care.patientName")}</p>
              </div>
          </div>
          
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {infoRow(Hash, t("greeting.mrn"), <span dir="ltr">00–284619</span>)}
              {infoRow(Shield, t("care.insurance"), t("care.insurance.tawuniya"))}
              {infoRow(CalendarDays, t("care.age"), t("care.ageUnits", localizeNumber(33)))}
              {infoRow(GendersIcon, t("care.gender"), t("care.gender.female"))}
              {infoRow(Clock, t("care.dob"), t("care.birthDateVal"))}
              {infoRow(DoorOpen, t("care.room") + " / " + t("care.bed"), "412 / A")}
          </div>
        </div>
      </SectionContainer>

      {/* Module 3: Emergency Contact */}
      <SectionContainer theme={theme} isExpanded={isExpanded} bg="rgba(239, 68, 68, 0.03)" className="mt-auto">
        <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" 
                  style={{ backgroundColor: "#EF4444" }}
                >
                    <User size={16} style={{ color: "#fff" }} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col pt-0.5">
                    <p style={{ fontFamily: theme.fontFamily, fontSize: isExpanded ? "16px" : "13px", color: theme.textMuted, lineHeight: "1.2" }}>{t("care.emergencyContact")}</p>
                    <p style={{ fontFamily: theme.fontFamily, fontSize: isExpanded ? "16px" : "14.5px", fontWeight: WEIGHT.bold, color: theme.textHeading, lineHeight: "1.4", marginTop: "2px" }}>{t("care.emergencyName").split(' (')[0]}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {infoRow(Phone, t("care.mobile"), <span dir="ltr">050 123 4567</span>, "#EF4444")}
                {infoRow(Heart, t("care.relative"), t("care.emergencyName").split('(')[1]?.replace(')', '') || "Mother", "#EF4444")}
            </div>
        </div>
      </SectionContainer>
    </div>
  );
}

/* ─── Care Overview Slide (Clinical Status) ─── */
function CareOverviewSlide({ theme, isExpanded = false }: { theme: any, isExpanded?: boolean }) {
  const { t } = useLocale();
  const allergies = ["Penicillin", "Latex", "Shellfish"];
  const dietCodes = ["NAS", "DM"];
  const labelSize = isExpanded ? "16px" : "13px";

  return (
    <div className="flex flex-col gap-4">
      {/* Module 1: Care Team */}
      <SectionContainer theme={theme} isExpanded={isExpanded}>
        <div className="flex flex-col gap-6">
          {careTeam.map((m, i) => (
            <div key={m.nameKey + i} className="flex items-center gap-4">
              <div 
                className="overflow-hidden shrink-0 border border-white shadow-sm"
                style={{
                  width: isExpanded ? "52px" : "40px",
                  height: isExpanded ? "52px" : "40px",
                  borderRadius: theme.radiusFull
                }}
              >
                 <img src={m.img} alt={t(m.nameKey)} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                 <p style={{ fontFamily: theme.fontFamily, fontSize: labelSize, color: theme.textMuted, lineHeight: 1.2 }}>{t(m.roleKey)}</p>
                 <p style={{ 
                   fontFamily: theme.fontFamily, 
                   ...(isExpanded ? { fontSize: "18px" } : { fontSize: "15.5px" }), 
                   fontWeight: WEIGHT.bold, 
                   color: theme.textHeading,
                   marginTop: "2px"
                 }}>{t(m.nameKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* Module 3: Clinical Nutrition, Allergies & Pain */}
      <SectionContainer theme={theme} isExpanded={isExpanded}>
        <div className="flex flex-col gap-7">
            {/* Diet Codes */}
            <div className="flex items-start gap-4">
                <div 
                  className="flex items-center justify-center shrink-0" 
                  style={{ 
                    width: isExpanded ? "40px" : "36px", 
                    height: isExpanded ? "40px" : "36px", 
                    borderRadius: theme.radiusFull,
                    backgroundColor: theme.primarySubtle 
                  }}
                >
                    <Utensils size={isExpanded ? 18 : 14} style={{ color: theme.primary }} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-2">
                    <p style={{ fontFamily: theme.fontFamily, fontSize: labelSize, color: theme.textMuted }}>{t("care.diet.title")}</p>
                    <div className="flex flex-wrap gap-2.5">
                        {dietCodes.map(d => (
                          <span key={d} className="px-3 py-1.5 rounded-md border font-bold" style={{ 
                            fontSize: isExpanded ? "15px" : "13px",
                            backgroundColor: theme.primarySubtle, 
                            borderColor: `${theme.primary}35`, 
                            color: theme.primary 
                          }}>{d}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Allergies - Full Width Row */}
            <div className="flex items-start gap-4">
                <div 
                  className="flex items-center justify-center shrink-0" 
                  style={{ 
                    width: isExpanded ? "40px" : "36px", 
                    height: isExpanded ? "40px" : "36px", 
                    borderRadius: theme.radiusFull,
                    backgroundColor: "#EF444415" 
                  }}
                >
                    <AlertTriangle size={isExpanded ? 18 : 14} style={{ color: "#EF4444" }} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-2">
                    <p style={{ fontFamily: theme.fontFamily, fontSize: labelSize, color: "#EF4444", fontWeight: WEIGHT.bold }}>{t("care.allergies")}</p>
                    <div className="flex flex-wrap gap-2">
                        {allergies.map(a => (
                          <span key={a} className="px-3 py-1 rounded-md font-bold" style={{
                            fontSize: isExpanded ? "15px" : "13px",
                            backgroundColor: "#EF444415",
                            border: "1px solid #EF444440",
                            color: "#EF4444"
                          }}>{a}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pain Score */}
            <div className="flex items-start gap-4">
                <div 
                  className="flex items-center justify-center shrink-0" 
                  style={{ 
                    width: isExpanded ? "40px" : "36px", 
                    height: isExpanded ? "40px" : "36px", 
                    borderRadius: theme.radiusFull,
                    backgroundColor: theme.primarySubtle 
                  }}
                >
                    <Activity size={isExpanded ? 18 : 14} style={{ color: theme.primary }} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col gap-2.5 flex-1">
                    <div className="flex justify-between items-end">
                        <span style={{ fontFamily: theme.fontFamily, fontSize: labelSize, color: theme.textMuted }}>{t("care.pain.score")}</span>
                        <span style={{ 
                          fontFamily: theme.fontFamily, 
                          fontSize: isExpanded ? "26px" : "18px", 
                          color: theme.warning, 
                          fontWeight: 900, 
                          lineHeight: 1 
                        }}>5 / 10</span>
                    </div>
                    <div className="relative h-2.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: theme.primarySubtle }}>
                        <div 
                          className="h-full rounded-full transition-transform duration-500" 
                          style={{ 
                            width: '50%', 
                            background: `linear-gradient(90deg, #4ADE80 0%, #FACC15 50%, #EF4444 100%)`,
                            backgroundSize: '200% 100%'
                          }}
                        />
                    </div>
                </div>
            </div>
        </div>
      </SectionContainer>

      {/* Module 4: Safety Alerts */}
      <SectionContainer theme={theme} isExpanded={isExpanded} bg="#EF444408" className="mt-auto">
          <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div 
                  className="flex items-center justify-center shrink-0" 
                  style={{ 
                    width: isExpanded ? "40px" : "36px", 
                    height: isExpanded ? "40px" : "36px", 
                    borderRadius: theme.radiusLg,
                    backgroundColor: "#EF444420" 
                  }}
                >
                    <AlertTriangle size={isExpanded ? 18 : 14} style={{ color: "#EF4444" }} />
                </div>
                <div className="flex flex-col">
                    <p style={{ fontFamily: theme.fontFamily, fontSize: labelSize, color: "#EF4444", fontWeight: WEIGHT.bold }}>{t("care.fallRisk")}: {t("care.fallRisk.high")}</p>
                    <p style={{ fontFamily: theme.fontFamily, fontSize: isExpanded ? "15px" : "12px", color: "#EF4444", lineHeight: "1.4", fontStyle: 'italic', opacity: 0.85 }}>
                        "{t("care.assistance.bed")}"
                    </p>
                </div>
              </div>
          </div>
      </SectionContainer>
    </div>
  );
}

/* ─── Slide Renders ─── */

function CareTeamSlide({ theme }: { theme: any }) {
  return <PatientProfileSlide theme={theme} />;
}

function TimelineSlide({
  items,
  theme,
  completedLabel,
  isExpanded = false,
}: {
  items: typeof carePlan;
  theme: any;
  completedLabel?: string;
  isExpanded?: boolean;
}) {
  const { t } = useLocale();
  const labelSize = isExpanded ? "16px" : "13px";
  const valueSize = isExpanded ? "16px" : "15.5px";

  return (
    <SectionContainer theme={theme} isExpanded={isExpanded} padding={isExpanded ? "24px" : "16px"}>
      <div className="flex flex-col gap-0">
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
              {/* Timeline icon — container background masks the connector line behind it */}
              <div
                className="shrink-0 flex items-center justify-center relative z-[1]"
                style={{ width: "24px", height: "24px", backgroundColor: theme.surface, borderRadius: theme.radiusFull }}
              >
                {step.done ? (
                  <CheckCircle2 size={isExpanded ? 22 : 18} style={{ color: theme.success }} />
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
                className="flex-1 flex items-center justify-between px-3"
                style={{
                  borderRadius: theme.radiusLg,
                  backgroundColor: step.active ? `${theme.primarySubtle}` : "transparent",
                  border: step.active ? `1px solid ${theme.primarySubtle}` : "1px solid transparent",
                  paddingTop: isExpanded ? "20px" : "18px",
                  paddingBottom: isExpanded ? "20px" : "18px",
                }}
              >
                <span style={{
                  fontFamily: theme.fontFamily,
                  fontSize: valueSize,
                  fontWeight: step.active ? WEIGHT.semibold : WEIGHT.normal,
                  color: step.active ? theme.primary : step.done ? theme.textMuted : theme.textHeading,
                  textDecoration: "none",
                }}>
                  {t(step.labelKey)}
                </span>
                <span
                  className="flex items-center gap-1 shrink-0 ml-2 px-2 py-0.5"
                  style={{
                    borderRadius: theme.radiusSm,
                    fontSize: labelSize,
                    fontWeight: WEIGHT.bold,
                    color: step.done ? theme.success : step.active ? theme.primary : theme.textMuted,
                    backgroundColor: step.done ? theme.successSubtle : step.active ? theme.primarySubtle : "transparent",
                  }}
                >
                  {step.done ? <Check size={isExpanded ? 12 : 10} /> : <Clock size={isExpanded ? 12 : 10} />}
                  {step.timeKey ? t(step.timeKey) : `${step.minutes} ${t("care.plan.min")}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </SectionContainer>
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
            <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.micro, fontWeight: WEIGHT.bold, color: theme.primary, fontSize: "14px", letterSpacing: "0.5px" }}>{d.code}</span>
          </div>
          <span style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.subtitle, color: theme.textHeading, fontSize: "16px" }}>{t(d.labelKey)}</span>
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

function LabResultsSlide({ theme, isExpanded = false }: { theme: any, isExpanded?: boolean }) {
  const { t } = useLocale();
  const [pdfModal, setPdfModal] = useState<{ url: string; title: string } | null>(null);

  const valueSize = isExpanded ? "16px" : "15.5px";
  const labelSize = isExpanded ? "16px" : "13.5px";

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
      <div className="flex flex-col gap-4">
        {labResults.map((lab, i) => (
            <SectionContainer key={lab.labelKey + i} theme={theme} isExpanded={isExpanded}>
              <div 
                className="flex flex-col gap-2 cursor-pointer"
                onClick={() => setPdfModal({ url: `${lab.pdfUrl}?h=${theme.id}`, title: t(lab.labelKey) })}
                data-nav="true"
              >
                <div className="flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex items-center justify-center shrink-0" 
                      style={{ 
                        backgroundColor: theme.primarySubtle,
                        width: isExpanded ? "40px" : "36px",
                        height: isExpanded ? "40px" : "36px",
                        borderRadius: theme.radiusFull
                      }}
                    >
                      <FlaskConical size={isExpanded ? 18 : 16} style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <span style={{ 
                        fontFamily: theme.fontFamily, 
                        fontSize: valueSize,
                        fontWeight: WEIGHT.bold, 
                        color: theme.textHeading 
                      }}>{t(lab.labelKey)}</span>
                      <div className="flex items-center gap-1.5 mt-[2px]">
                        <span style={{ fontFamily: theme.fontFamily, fontSize: labelSize, fontWeight: 700, color: getStatusColor(lab.status) }}>
                          {lab.value}
                        </span>
                        <span style={{ fontSize: "10px", color: theme.textDisabled }}>•</span>
                        <span style={{ fontFamily: theme.fontFamily, fontSize: isExpanded ? "14px" : "12px", fontWeight: 500, color: theme.textMuted }}>{lab.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 rounded-md shrink-0" style={{ backgroundColor: getStatusBg(lab.status) }}>
                    <span style={{ fontFamily: theme.fontFamily, fontSize: isExpanded ? "14px" : "12px", fontWeight: 800, color: getStatusColor(lab.status), letterSpacing: "0.5px" }}>
                      {lab.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div 
                  className="mt-2.5 flex items-center justify-center gap-2 self-start px-4 py-2 pointer-events-none border transition-transform" 
                  style={{ borderRadius: theme.radiusLg, backgroundColor: theme.surface, borderColor: `${theme.primary}40` }}
                >
                  <FileText size={isExpanded ? 16 : 14} style={{ color: theme.primary }} />
                  <span style={{ fontFamily: theme.fontFamily, fontSize: isExpanded ? "15.5px" : "13px", fontWeight: WEIGHT.bold, color: theme.primary }}>{t("care.imaging.viewReport")}</span>
                </div>
              </div>
            </SectionContainer>
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
          className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
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

function ImagingSlide({ theme, isExpanded = false }: { theme: any, isExpanded?: boolean }) {
  const { t } = useLocale();
  const [pdfModal, setPdfModal] = useState<{ url: string; title: string } | null>(null);

  const valueSize = isExpanded ? "16px" : "15.5px";
  const labelSize = isExpanded ? "16px" : "13.5px";

  return (
    <>
      <div className="flex flex-col gap-4">
        {imagingResults.map((img, i) => (
            <SectionContainer key={img.labelKey + i} theme={theme} isExpanded={isExpanded}>
              <div 
                className="flex flex-col gap-2 cursor-pointer"
                onClick={() => setPdfModal({ url: `${img.pdfUrl}?h=${theme.id}`, title: t(img.labelKey) })}
                data-nav="true"
              >
                <div className="flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-3">
                    <div 
                      className="flex items-center justify-center shrink-0" 
                      style={{ 
                        backgroundColor: theme.primarySubtle,
                        width: isExpanded ? "40px" : "36px",
                        height: isExpanded ? "40px" : "36px",
                        borderRadius: theme.radiusFull
                      }}
                    >
                      <ImageIcon size={isExpanded ? 18 : 16} style={{ color: theme.primary }} />
                    </div>
                    <span style={{ 
                      fontFamily: theme.fontFamily, 
                      fontSize: valueSize,
                      fontWeight: WEIGHT.bold, 
                      color: theme.textHeading 
                    }}>{t(img.labelKey)}</span>
                  </div>
                  <span style={{ fontFamily: theme.fontFamily, fontSize: isExpanded ? "14px" : "12px", color: theme.textMuted }}>{img.date}</span>
                </div>
                <p style={{ 
                  fontFamily: theme.fontFamily, 
                  fontSize: labelSize, 
                  color: theme.textHeading, 
                  paddingLeft: isExpanded ? 52 : 44,
                  lineHeight: "1.4"
                }}>{t(img.summaryKey)}</p>
                <div 
                  className="mt-2.5 flex items-center justify-center gap-2 self-start px-4 py-2 pointer-events-none border transition-transform" 
                  style={{ borderRadius: theme.radiusLg, backgroundColor: theme.surface, borderColor: `${theme.primary}40` }}
                >
                  <FileText size={isExpanded ? 16 : 14} style={{ color: theme.primary }} />
                  <span style={{ fontFamily: theme.fontFamily, fontSize: isExpanded ? "15.5px" : "13px", fontWeight: WEIGHT.bold, color: theme.primary }}>{t("care.imaging.viewReport")}</span>
                </div>
              </div>
            </SectionContainer>
        ))}
      </div>
      {pdfModal && <PdfViewerModal url={pdfModal.url} title={pdfModal.title} onClose={() => setPdfModal(null)} />}
    </>
  );
}

function BabyCameraSlide({ isExpanded = false }: { isExpanded?: boolean }) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const [fullscreen, setFullscreen] = useState(false);
  
  const isDallah = theme.id === "dallah";
  const isCareMed = theme.id === "caremed";
  const cameraImage = isDallah ? imgDallahBabyCam : isCareMed ? imgCareMedBabyCam : imgBabyCam;

  const titleSize = isExpanded ? "21px" : "16px";
  const subSize = isExpanded ? "16px" : "13px";

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* 1:1 Camera Feed */}
      <div
        className="relative w-full cursor-pointer overflow-hidden group"
        style={{ 
          aspectRatio: "1 / 1",
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
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#fff", letterSpacing: "0.5px", textTransform: "uppercase" }}>{t("care.baby.live")}</span>
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
      <SectionContainer theme={theme} isExpanded={isExpanded}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Baby icon avatar */}
            <div 
              className="rounded-full flex items-center justify-center shrink-0" 
              style={{ 
                backgroundColor: theme.primarySubtle,
                width: isExpanded ? "40px" : "36px",
                height: isExpanded ? "40px" : "36px"
              }}
            >
              <Baby size={isExpanded ? 20 : 18} style={{ color: theme.primary }} />
            </div>
            <div>
              <p style={{ 
                fontFamily: theme.fontFamily, 
                fontSize: titleSize, 
                fontWeight: WEIGHT.bold, 
                color: theme.textHeading, 
                lineHeight: 1.2 
              }}>Baby Saleh</p>
              <p style={{ 
                fontFamily: theme.fontFamily, 
                fontSize: subSize, 
                color: theme.textMuted, 
                marginTop: "2px" 
              }}>Nursery · Crib 3A</p>
            </div>
          </div>

          {/* Connected badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: theme.primarySubtle }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.success, boxShadow: `0 0 6px ${theme.success}` }} />
            <span style={{ fontFamily: theme.fontFamily, fontSize: isExpanded ? "14px" : "12px", fontWeight: 700, color: theme.primary }}>{t("care.baby.connected")}</span>
          </div>
        </div>
      </SectionContainer>

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

function FinanceSlide({ theme, isExpanded = false }: { theme: any, isExpanded?: boolean }) {
  const { t } = useLocale();
  const [showPdf, setShowPdf] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const valueSize = isExpanded ? "16px" : "14px";
  const labelSize = isExpanded ? "16px" : "13px";

  const Row = ({ label, value, qty, isTotal = false, isHighlight = false, color }: any) => (
    <div className="flex items-center justify-between py-2" style={{ borderColor: theme.borderSubtle }}>
      <div className="flex flex-col" style={{ gap: "2px" }}>
        <span style={{ 
          fontFamily: theme.fontFamily, 
          fontSize: labelSize, 
          color: isTotal ? theme.textHeading : theme.textMuted,
          fontWeight: isTotal ? WEIGHT.bold : WEIGHT.medium,
          lineHeight: 1.2
        }}>{label}</span>
        {qty !== undefined && (
          <span style={{ fontSize: "11px", color: theme.textDisabled, fontWeight: 700 }}>
            {t("bill.item.qty")} × {qty}
          </span>
        )}
      </div>
      <span style={{ 
        fontFamily: theme.fontFamily, 
        fontSize: isTotal ? (isExpanded ? "24px" : "18px") : valueSize, 
        color: color || theme.textHeading,
        fontWeight: isTotal || isHighlight ? WEIGHT.bold : WEIGHT.bold 
      }}>{value}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Module 1: Itemized breakdown */}
      <SectionContainer theme={theme} isExpanded={isExpanded}>
        <div className="flex flex-col gap-0">
          {billingItems.map((item, i) => (
            <Row key={item.id} label={t(item.labelKey)} value={`${(item.amount * item.qty).toLocaleString()} ${t("care.currency")}`} qty={item.qty} />
          ))}
          <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.06)", margin: "8px 0" }} />
          <Row label={t("care.billing.subtotal")} value={`19,490 ${t("care.currency")}`} />
          <Row label={t("care.billing.vat")} value={`2,923.5 ${t("care.currency")}`} />
          <Row label={t("care.billing.totalInclVat")} value={`22,413.5 ${t("care.currency")}`} />
          <Row label={t("care.billing.insuranceCredit").replace("Deduction", "").trim()} value={`- 18,515.5 ${t("care.currency")}`} color={theme.success} isHighlight />
          
          <div className="mt-6 pt-2 border-t border-dashed" style={{ borderColor: theme.borderSubtle }}>
            <button
              data-nav="true"
              onClick={() => setShowPdf(true)}
              className="flex items-center justify-center gap-2 w-full py-3 border transition-transform hover:scale-[1.01] active:scale-98"
              style={{ borderRadius: theme.radiusLg, borderColor: `${theme.primary}40`, backgroundColor: theme.surface, cursor: 'pointer' }}
            >
              <FileText size={18} style={{ color: theme.primary }} />
              <span style={{ fontFamily: theme.fontFamily, fontSize: isExpanded ? "15.5px" : "13.5px", fontWeight: WEIGHT.bold, color: theme.primary }}>
                {t("care.billing.viewDetailedInvoice")}
              </span>
            </button>
          </div>
        </div>
      </SectionContainer>

      {/* Module 2: Unified Payment Summary */}
      <SectionContainer theme={theme} isExpanded={isExpanded}>
        <div className="flex flex-col gap-5">
           <div className="flex items-center justify-between px-1">
              <span style={{ fontFamily: theme.fontFamily, fontSize: isExpanded ? "16px" : "13.5px", color: theme.textMuted, fontWeight: WEIGHT.bold }}>{t("care.billing.patientPayable")}</span>
              <span style={{ fontFamily: theme.fontFamily, fontSize: isExpanded ? "26px" : "20px", color: theme.primary, fontWeight: 900 }}>3,898 <span style={{ fontSize: "0.6em" }}>{t("care.currency")}</span></span>
           </div>
           
           <button
             data-nav="true"
             onClick={() => setShowPayment(true)}
             className="flex items-center justify-center gap-2 w-full py-4 shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.96]"
             style={{ backgroundColor: theme.primary, cursor: 'pointer', borderRadius: theme.radiusLg }}
           >
             <CreditCard size={18} style={{ color: "#fff" }} />
             <span style={{ fontFamily: theme.fontFamily, fontSize: isExpanded ? "17px" : "15px", fontWeight: WEIGHT.bold, color: "#fff" }}>
               {t("care.billing.payNow")}
             </span>
           </button>
        </div>
      </SectionContainer>

      {showPdf && <HospitalInvoiceOverlay theme={theme} onClose={() => setShowPdf(false)} />}
      {showPayment && <PaymentPortal theme={theme} onClose={() => setShowPayment(false)} amount="3,898" />}
    </div>
  );
}
function HospitalInvoiceOverlay({ theme, onClose }: { theme: any, onClose: () => void }) {
  const { t } = useLocale();
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-10" style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div 
        className="w-full max-w-4xl bg-white shadow-2xl relative flex flex-col overflow-hidden" 
        style={{ borderRadius: theme.radiusXl, height: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Invoice Header */}
        <div className="p-10 border-b flex justify-between items-start" style={{ borderColor: theme.borderSubtle }}>
          <div className="flex flex-col gap-6">
            <img src={theme.logoUrl} alt="Hospital Logo" className="h-16 object-contain self-start" />
            <div>
              <h1 style={{ fontFamily: theme.fontFamily, fontSize: "28px", fontWeight: WEIGHT.extrabold, color: theme.textHeading }}>
                {t("care.billing.invoiceTitle")}
              </h1>
              <p style={{ fontFamily: theme.fontFamily, fontSize: "14px", color: theme.textMuted }}>#{Math.floor(Math.random() * 900000 + 100000)} · {t("date.5mar2026")}</p>
            </div>
          </div>
          <div className="text-right flex flex-col gap-2">
            <button 
              onClick={onClose} 
              className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors self-end"
            >
              <X size={20} />
            </button>
            <div className="mt-8">
              <p style={{ fontFamily: theme.fontFamily, fontSize: "14px", fontWeight: 700, color: theme.textHeading }}>{theme.hospitalName}</p>
              <p style={{ fontFamily: theme.fontFamily, fontSize: "12px", color: theme.textMuted }}>Riyadh, Saudi Arabia</p>
              <p style={{ fontFamily: theme.fontFamily, fontSize: "12px", color: theme.textMuted }}>VAT ID: 300000000000003</p>
            </div>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="flex-1 overflow-y-auto p-10">
          <table className="w-full text-left" style={{ fontFamily: theme.fontFamily }}>
            <thead className="border-b-2 border-slate-900">
              <tr>
                <th className="py-4 text-sm font-bold uppercase tracking-wider">Item Description</th>
                <th className="py-4 text-sm font-bold uppercase tracking-wider text-center">Qty</th>
                <th className="py-4 text-sm font-bold uppercase tracking-wider text-right">Price</th>
                <th className="py-4 text-sm font-bold uppercase tracking-wider text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {billingItems.map(item => (
                <tr key={item.id}>
                  <td className="py-6 font-semibold text-slate-800">{t(item.labelKey)}</td>
                  <td className="py-6 text-center text-slate-600 font-medium">{item.qty}</td>
                  <td className="py-6 text-right text-slate-600">{item.amount.toLocaleString()} SAR</td>
                  <td className="py-6 text-right font-bold text-slate-900">{(item.amount * item.qty).toLocaleString()} SAR</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div className="mt-12 flex justify-end">
            <div className="w-72 flex flex-col gap-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold">19,490.00 SAR</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>VAT (15%)</span>
                <span className="font-semibold">2,923.50 SAR</span>
              </div>
              <div className="flex justify-between py-4 border-y border-slate-100" style={{ color: theme.success }}>
                <span className="font-bold">Insurance Credit</span>
                <span className="font-bold">- 18,515.50 SAR</span>
              </div>
              <div className="flex justify-between items-baseline pt-2" style={{ color: theme.primary }}>
                <span className="text-lg font-bold">Total Due</span>
                <span className="text-3xl font-extrabold tracking-tight">3,898.00 SAR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Footer */}
        <div className="p-10 bg-slate-50 border-t flex items-center">
            <div className="flex items-center gap-4 text-slate-400">
              <ShieldCheck size={40} strokeWidth={1} />
              <p className="max-w-xs text-xs leading-relaxed">
                This is an official clinical document generated by the {theme.hospitalName} Health Cloud. Verifiable via secure portal.
              </p>
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function PaymentPortal({ theme, onClose, amount }: { theme: any, onClose: () => void, amount: string }) {
  const { t } = useLocale();
  const [step, setStep] = useState<'methods' | 'processing' | 'success'>('methods');

  const handlePay = () => {
    setStep('processing');
    setTimeout(() => setStep('success'), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6" style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }} onClick={onClose}>
      <div 
        className="w-full max-w-md bg-white shadow-3xl overflow-hidden" 
        style={{ borderRadius: theme.radiusXl }}
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'methods' && (
          <div className="p-8 flex flex-col gap-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 style={{ fontFamily: theme.fontFamily, fontSize: "24px", fontWeight: WEIGHT.bold, color: theme.textHeading }}>Secure Payment</h2>
                <p style={{ fontFamily: theme.fontFamily, fontSize: "14px", color: theme.textMuted }}>Direct settlement for {theme.hospitalName}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="bg-slate-50 p-6 flex flex-col items-center border border-slate-100" style={{ borderRadius: "12px" }}>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Payable Now</span>
              <span className="text-4xl font-black tracking-tight" style={{ color: theme.primary }}>{amount} <span className="text-lg">{t("care.currency")}</span></span>
            </div>

            <div className="flex flex-col gap-4">
               <div className="flex items-center gap-4 my-2">
                 <div className="h-px bg-slate-100 flex-1" />
                 <span className="text-xs font-bold text-slate-300">SECURE CARD PAYMENT</span>
                 <div className="h-px bg-slate-100 flex-1" />
               </div>

               <div className="flex flex-col gap-3">
                 <div className="p-3 border border-slate-200 bg-white" style={{ borderRadius: theme.radiusLg }}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Name on Card</p>
                    <input 
                      type="text"
                      placeholder="J. SMITH"
                      className="w-full text-slate-900 font-medium outline-none bg-transparent placeholder:text-slate-200"
                    />
                 </div>
                 <div className="p-3 border border-slate-200 bg-white rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Card Number</p>
                    <div className="flex items-center justify-between">
                      <input 
                        type="text"
                        inputMode="numeric"
                        placeholder="0000 0000 0000 0000"
                        className="w-full text-slate-900 font-medium outline-none bg-transparent placeholder:text-slate-200"
                      />
                      <CreditCard size={18} className="text-slate-300" />
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <div className="flex-1 p-3 border border-slate-200 bg-white" style={{ borderRadius: theme.radiusLg }}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Expiry</p>
                      <input 
                        type="text"
                        inputMode="numeric"
                        placeholder="MM / YY"
                        className="w-full text-slate-900 font-medium outline-none bg-transparent placeholder:text-slate-200"
                      />
                    </div>
                    <div className="flex-1 p-3 border border-slate-200 bg-white" style={{ borderRadius: theme.radiusLg }}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">CVC</p>
                      <input 
                        type="password"
                        inputMode="numeric"
                        maxLength={3}
                        placeholder="•••"
                        className="w-full text-slate-900 font-medium outline-none bg-transparent placeholder:text-slate-200"
                      />
                    </div>
                 </div>
               </div>

               <button 
                onClick={handlePay}
                className="w-full py-4 shadow-xl transition-transform hover:brightness-110 active:scale-95 mt-2"
                style={{ backgroundColor: theme.primary, borderRadius: theme.radiusLg }}
               >
                 <span className="text-white font-bold text-lg">Pay Securely</span>
               </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="p-20 flex flex-col items-center justify-center gap-8 text-center h-[520px]">
             <div className="w-20 h-20 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" style={{ borderTopColor: theme.primary }} />
             <div>
               <h3 style={{ fontFamily: theme.fontFamily, fontSize: "20px", fontWeight: WEIGHT.bold }}>Finalizing Payment</h3>
               <p style={{ fontFamily: theme.fontFamily, fontSize: "14px", color: theme.textMuted }}>Securing your transaction...</p>
             </div>
          </div>
        )}

        {step === 'success' && (
          <div className="p-16 flex flex-col items-center justify-center gap-10 text-center h-[520px]">
             <div 
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-inner" 
              style={{ backgroundColor: theme.successSubtle, color: theme.success }}
             >
                <ShieldCheck size={48} />
             </div>
             <div>
               <h3 style={{ fontFamily: theme.fontFamily, fontSize: "24px", fontWeight: WEIGHT.bold }}>Settlement Successful</h3>
               <p style={{ fontFamily: theme.fontFamily, fontSize: "16px", color: theme.textMuted }}>Your invoice has been updated. A receipt will be sent to your registered email.</p>
             </div>
             <button 
              onClick={onClose}
              className="px-12 py-4 rounded-xl font-bold transition-transform hover:scale-105"
              style={{ backgroundColor: theme.surfaceAlt, color: theme.textHeading }}
             >
               Return to Hub
             </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

function SlideIcon({ slideKey }: { slideKey: string }) {
  const { theme } = useTheme();
  const iconProps = { size: 16, strokeWidth: 2 };
  const color = theme.primary;
  switch (slideKey) {
    case "profile": return <IdCard {...iconProps} style={{ color }} />;
    case "overview": return <Activity {...iconProps} style={{ color }} />;
    case "plan": return <ClipboardList {...iconProps} style={{ color }} />;
    case "labs": return <FlaskConical {...iconProps} style={{ color }} />;
    case "billing": return <Wallet {...iconProps} style={{ color }} />;
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
        <div className="min-w-0" style={{ gap: "0px" }}>
          <p style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.micro, color: theme.textMuted, lineHeight: "1" }}>
            {t("care.admitted")}
          </p>
          <p style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.label, color: theme.textHeading, lineHeight: "1.2", marginTop: "1px" }}>
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
        <div className="min-w-0" style={{ gap: "0px" }}>
          <p style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.micro, color: theme.textMuted, lineHeight: "1" }}>
            {t("care.discharge")}
          </p>
          <p style={{ fontFamily: theme.fontFamily, ...TEXT_STYLE.label, color: theme.textHeading, lineHeight: "1.2", marginTop: "1px" }}>
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
  // Navigation lock prevents rapid clicks from stacking out-of-bounds indices
  const isNavigating = useRef(false);
  const navLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extended slides for circular carousel: [Last, S0, S1, S2, S3, S4, S5, S6, First]
  const extendedSlides = useMemo(() => [
    slides[slides.length - 1],
    ...slides,
    slides[0]
  ], []);

  const goTo = useCallback(
    (idx: number) => {
      // Hard clamp: never allow out-of-bounds index
      const clamped = Math.max(0, Math.min(idx, extendedSlides.length - 1));
      setActiveIndex(clamped);
    },
    [extendedSlides.length]
  );

  /* Reset scroll to top when slide changes */
  useEffect(() => {
    const el = document.querySelector(`.careme-slide-${activeIndex}`);
    if (el) el.scrollTop = 0;
  }, [activeIndex]);

  /* Auto-rotate every 6 seconds */
  useEffect(() => {
    if (paused || isPinned) return;
    autoTimerRef.current = setInterval(() => {
      // Use functional update + clamp to avoid stale closure issues
      setActiveIndex((prev) => {
        const next = prev + 1;
        return Math.max(0, Math.min(next, extendedSlides.length - 1));
      });
    }, 6000);
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [paused, isPinned, extendedSlides.length]);

  /* Cleanup nav lock timer on unmount */
  useEffect(() => {
    return () => {
      if (navLockTimer.current) clearTimeout(navLockTimer.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  /* Pause on user interaction, resume after 15s */
  const pauseAutoRotate = useCallback(() => {
    setPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setPaused(false), 15000);
  }, []);

  const handleManualNav = useCallback(
    (idx: number) => {
      // Block navigation if a transition is already in progress
      if (isNavigating.current) return;
      isNavigating.current = true;
      // Safety release in case transitionend never fires (e.g. no CSS transition)
      if (navLockTimer.current) clearTimeout(navLockTimer.current);
      navLockTimer.current = setTimeout(() => {
        isNavigating.current = false;
      }, 600);
      goTo(idx);
      pauseAutoRotate();
    },
    [goTo, pauseAutoRotate]
  );

  /* ─── Touch-based swipe (more reliable than pointer events with nested scrollables) ─── */
  const touchStartY = useRef(0);
  const swipeLocked = useRef<"none" | "horizontal" | "vertical">("none");

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-nav="true"]')) return;

    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchDeltaX.current = 0;
    swipeLocked.current = "none";
    setDragOffset(0);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;

    // Determine swipe direction on first significant movement
    if (swipeLocked.current === "none") {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        swipeLocked.current = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
      }
    }

    // If vertical — let the browser scroll natively, bail out
    if (swipeLocked.current === "vertical") {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    // If horizontal — take over
    if (swipeLocked.current === "horizontal") {
      e.preventDefault(); // prevent vertical scroll while swiping horizontally
      touchDeltaX.current = dx;
      setDragOffset(dx);
      pauseAutoRotate();
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 40;
    if (touchDeltaX.current < -threshold) {
      handleManualNav(activeIndex + 1);
    } else if (touchDeltaX.current > threshold) {
      handleManualNav(activeIndex - 1);
    }
    setDragOffset(0);
    touchDeltaX.current = 0;
    swipeLocked.current = "none";
  };

  // Teleportation for circular wrap-around
  const handleTransitionEnd = () => {
    // Unlock navigation so the next click can proceed
    isNavigating.current = false;
    if (navLockTimer.current) clearTimeout(navLockTimer.current);

    if (activeIndex <= 0) {
      // Wrapped past the start — teleport to the real last slide
      setIsSnapping(true);
      setActiveIndex(slides.length);
      setTimeout(() => setIsSnapping(false), 50);
    } else if (activeIndex >= extendedSlides.length - 1) {
      // Wrapped past the end — teleport to the real first slide
      setIsSnapping(true);
      setActiveIndex(1);
      setTimeout(() => setIsSnapping(false), 50);
    }
  };

  const activeSlide = extendedSlides[activeIndex] || slides[0];
  const realIndex = 
    activeIndex <= 0 ? slides.length - 1 : 
    activeIndex >= extendedSlides.length - 1 ? 0 : 
    activeIndex - 1;

  const renderSlideContentItem = (key: string) => {
    switch (key) {
      case "profile": return <PatientProfileSlide theme={theme} />;
      case "overview": return <CareOverviewSlide theme={theme} />;
      case "plan": return <TimelineSlide items={carePlan} theme={theme} />;
      case "labs": return <LabResultsSlide theme={theme} />;
      case "imaging": return <ImagingSlide theme={theme} />;
      case "billing": return <FinanceSlide theme={theme} />;
      case "baby": return <BabyCameraSlide />;
      case "discharge": return <TimelineSlide items={dischargePlan} theme={theme} completedLabel="2 of 6 Completed" />;
      default: return null;
    }
  };

  return (
    <div 
      dir="ltr"
      className="flex flex-col overflow-hidden relative select-none flex-1 min-h-0"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        backgroundColor: theme.surface,
        borderRadius: theme.radiusCard,
        boxShadow: SHADOW.md,
        border: theme.cardBorder,
        touchAction: "pan-y",
      }}
    >
      {/* Header */}
      <div dir={dir} className="flex items-center justify-between shrink-0" style={{ padding: "22px 22px 12px 22px" }}>
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

      {/* Admission / Discharge — now moved into Patient Profile content for better flow */}
      <div style={{ height: "4px" }} />

      {/* Slide Title */}
      <div dir={dir} className="flex items-center gap-2 shrink-0" style={{ padding: "0 22px" }}>
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
              className={`h-full overflow-y-auto careme-scroll shrink-0 careme-slide-${i}`}
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
            className="rounded-full transition-transform duration-300 cursor-pointer"
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
          background: ${theme.primary}4D; /* 30% opacity */
          border-radius: 100px;
        }
        .careme-scroll::-webkit-scrollbar-thumb:active {
          background: ${theme.primary};
          opacity: 0.35;
        }
        .careme-scroll {
          scrollbar-width: thin;
          scrollbar-color: ${theme.primary}4D transparent;
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
    case "profile": return <IdCard {...iconProps} />;
    case "overview": return <Activity {...iconProps} />;
    case "plan": return <ClipboardList {...iconProps} />;
    case "labs": return <FlaskConical {...iconProps} />;
    case "imaging": return <ImageIcon {...iconProps} />;
    case "baby": return <Baby {...iconProps} />;
    case "billing": return <Wallet {...iconProps} />;
    case "discharge": return <LogOut {...iconProps} />;
    default: return <Heart {...iconProps} />;
  }
}

function renderExpandedSlideContent(key: string, theme: any, t: (k: string) => string) {
  switch (key) {
    case "profile": return <PatientProfileSlide theme={theme} isExpanded />;
    case "overview": return <CareOverviewSlide theme={theme} isExpanded />;
    case "plan": return <TimelineSlide items={carePlan} theme={theme} isExpanded />;
    case "labs": return <LabResultsSlide theme={theme} isExpanded />;
    case "imaging": return <ImagingSlide theme={theme} isExpanded />;
    case "billing": return <FinanceSlide theme={theme} isExpanded />;
    case "baby": return <BabyCameraSlide isExpanded />;
    case "discharge": return <TimelineSlide items={dischargePlan} theme={theme} completedLabel="2 of 6 Completed" isExpanded />;
    default: return null;
  }
}

export function CareMeExpanded({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const { t, isRTL } = useLocale();
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
      <div className={`shrink-0 flex items-center justify-between pt-8 pb-4 relative z-10 ${isRTL ? "pr-[172px] pl-10" : "pl-[172px] pr-10"}`}>
        <div className="flex items-center gap-4 relative">
          <button
            onClick={onClose}
            className="flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer absolute"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: theme.radiusLg,
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.15)",
              [isRTL ? "right" : "left"]: "-112px"
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
      <div className="flex-1 flex flex-col justify-center relative z-10 min-h-0 pt-4">
        {/* Horizontal Scrolling Columns — 4 visible at once */}
        <div className={`flex-1 flex gap-4 pb-12 overflow-x-auto no-scrollbar ${isRTL ? "pr-[172px] pl-10" : "pl-[172px] pr-10"}`}>
          {slides.map((slide) => (
            <div
              key={slide.key}
              className="flex flex-col shrink-0"
              style={{
                width: "calc(25% - 12px)",
                height: "710px",
                gap: "14px",
                animation: "caremeExpandIn 0.3s ease-out both",
                alignSelf: "center"
              }}
            >
              {/* Header Box Overlay - Separate rounded box */}
              <div 
                className="shrink-0 flex items-center gap-4"
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: theme.radiusLg,
                  padding: "16px 20px",
                  boxShadow: SHADOW.md,
                }}
              >
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: theme.radiusMd,
                    backgroundColor: theme.primarySubtle,
                    color: theme.primary,
                  }}
                >
                  <ExpandedSlideIcon slideKey={slide.key} size={22} />
                </div>
                <span className="truncate" style={{ 
                  fontFamily: theme.fontFamily, 
                  fontSize: "18px",
                  fontWeight: WEIGHT.bold,
                  color: theme.textHeading,
                  letterSpacing: "0.2px"
                }}>
                  {t(slide.titleKey)}
                </span>
              </div>

              {/* Content Card below */}
              <div
                className="flex flex-col min-h-0 overflow-hidden"
                style={{
                  flex: "1 1 0", minWidth: 0,
                  backgroundColor: theme.surface,
                  borderRadius: theme.radiusXl,
                  boxShadow: SHADOW.xl,
                }}
              >
                {/* Column content */}
                <div className="flex-1 min-h-0 overflow-y-auto careme-scroll" style={{ padding: "20px 12px 22px 12px" }}>
                  {renderExpandedSlideContent(slide.key, theme, t)}
                </div>
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
          background: ${theme.primary}4D;
          border-radius: 100px;
        }
        .careme-scroll::-webkit-scrollbar-thumb:active {
          background: ${theme.primary};
          opacity: 0.35;
        }
        .careme-scroll {
          scrollbar-width: thin;
          scrollbar-color: ${theme.primary}4D transparent;
        }
      `}</style>
    </div>
  );
}