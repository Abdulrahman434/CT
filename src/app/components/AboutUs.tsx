import { useState } from "react";
import { Info, FileText, Play, Film } from "lucide-react";
import { useTheme, TYPE_SCALE, WEIGHT } from "./ThemeContext";
import { useLocale } from "./i18n";
import { InternalPageHeader } from "./InternalPageHeader";
import logoImg from "../../assets/496960c397c9050764df477822163c6970cb738d.png";
import dnaImg from "../../assets/7d25bcb72cca7f6efa0a0c3b850e8605d6d73401.png";
import numbersImg from "../../assets/f59e36074e912058a9f8c7099b196139f6e61a09.png";
import accreditationsImg from "../../assets/cdfa0dd6c88e1a32f4db54520c3e02d140955b11.png";
import careMedInBriefEn from "../../assets/InbreifCareMed.png";
import careMedInBriefAr from "../../assets/InbreifCareMedAr.png";
import numbersEn from "../../assets/NumbersEn.png";
import numbersAr from "../../assets/NumbersAr.png";
import accredsImg from "../../assets/accreds.jpeg";

interface AboutSection {
  id: string;
  title: string;
  titleKey: string;
  content?: string;
  image?: string;
  video?: string; // YouTube video ID
}

const getSections = (themeId: string, isRTL: boolean): AboutSection[] => [
  {
    id: "hospital",
    title: "Our Hospital",
    titleKey: "about.ourHospital",
    video: themeId === "caremed" ? "HW7Od_8C3_I" : "4VXy7_qn608",
  },
  {
    id: "dna",
    title: themeId === "caremed" ? "CareMed InBrief" : "Fakeeh Care DNA",
    titleKey: themeId === "caremed" ? "about.caremedInBrief" : "about.dna",
    image: themeId === "caremed" ? (isRTL ? careMedInBriefAr : careMedInBriefEn) : dnaImg,
  },
  {
    id: "numbers",
    title: themeId === "caremed" ? "CareMed In Numbers" : "Fakeeh In Numbers",
    titleKey: "about.numbers",
    image: themeId === "caremed" ? (isRTL ? numbersAr : numbersEn) : numbersImg,
  },
  {
    id: "services",
    title: "Services",
    titleKey: "about.services",
    content: `Comprehensive Medical & Surgical Services

Emergency & Critical Care
• 24/7 Emergency Department
• Intensive Care Units (ICU/NICU/PICU)
• Advanced Life Support

Specialty Centers
• Cardiac Care & Interventional Cardiology
• Oncology & Cancer Treatment
• Orthopedics & Joint Replacement
• Neurology & Neurosurgery
• Women's Health & Maternity
• Pediatrics & Neonatology

Diagnostic Services
• Advanced Imaging (MRI, CT, PET-CT)
• Laboratory Medicine
• Interventional Radiology

Support Services
• Pharmacy Services
• Rehabilitation & Physical Therapy
• Nutrition & Dietary Counseling
• Home Healthcare`,
  },
  {
    id: "accreditations",
    title: "Accreditations",
    titleKey: "about.accreditations",
    image: themeId === "caremed" ? accredsImg : accreditationsImg,
  },
  {
    id: "digital",
    title: "Digital Services",
    titleKey: "about.digital",
    content: `Connected Care at Your Fingertips

Patient Portal
• View lab results & medical records
• Schedule appointments online
• Communicate with your care team
• Access educational resources

Mobile Health App
• Track medications & vital signs
• Receive appointment reminders
• Virtual consultations (telemedicine)
• Health & wellness content

In-Room Technology
• Bedside entertainment system
• Digital meal ordering
• Real-time care team communication
• Educational videos & resources

Smart Hospital Features
• Electronic Health Records (EHR)
• AI-assisted diagnostics
• Robotic surgery capabilities
• Advanced patient monitoring systems`,
  },
];

export function AboutUs({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const { t, isRTL } = useLocale();
  const sections = getSections(theme.id, isRTL);
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [videoPlaying, setVideoPlaying] = useState(false);

  const currentSection = sections.find((s) => s.id === activeSection) || sections[0];

  // Reset video playing state when switching sections
  const handleSectionChange = (id: string) => {
    setActiveSection(id);
    setVideoPlaying(false);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{
        background: `linear-gradient(160deg, ${theme.primary} 0%, ${theme.primaryDark} 40%, #0a1628 100%)`,
        animation: "aboutUsIn 0.2s ease-out",
      }}
    >
      {/* Hospital background image */}
      <img
        src={theme.heroImageUrl}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        style={{ opacity: 0.08, mixBlendMode: "luminosity", userSelect: "none" }}
      />
      <style>{`
        @keyframes aboutUsIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes contentFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .about-tabs-sidebar::-webkit-scrollbar {
          display: none;
        }
        .about-tabs-sidebar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .about-content-wrapper {
          animation: contentFadeIn 0.3s ease-out;
        }
        .about-content-wrapper::-webkit-scrollbar {
          width: 4px;
        }
        .about-content-wrapper::-webkit-scrollbar-track {
          background: transparent;
          margin: 4px 0;
        }
        .about-content-wrapper::-webkit-scrollbar-thumb {
          background: var(--hbs-primary-subtle);
          border-radius: 100px;
        }
        .about-content-wrapper::-webkit-scrollbar-thumb:active {
          background: var(--hbs-primary);
          opacity: 0.35;
        }
        .about-content-wrapper {
          scrollbar-width: thin;
          scrollbar-color: var(--hbs-primary-subtle) transparent;
        }
        .about-scrollable-content::-webkit-scrollbar {
          width: 4px;
        }
        .about-scrollable-content::-webkit-scrollbar-track {
          background: transparent;
          margin: 4px 0;
        }
        .about-scrollable-content::-webkit-scrollbar-thumb {
          background: var(--hbs-primary-subtle);
          border-radius: 100px;
        }
        .about-scrollable-content::-webkit-scrollbar-thumb:active {
          background: var(--hbs-primary);
          opacity: 0.35;
        }
        .about-scrollable-content {
          scrollbar-width: thin;
          scrollbar-color: var(--hbs-primary-subtle) transparent;
        }
      `}</style>

      {/* Header */}
      <InternalPageHeader
        title={t("about.title")}
        icon={<Info size={26} strokeWidth={2} />}
        onClose={onClose}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex gap-8 px-16 pb-10 min-h-0 relative z-10">
        {/* Left Sidebar — Vertical Tabs */}
        <div
          className="shrink-0 flex flex-col gap-6"
          style={{
            width: "280px",
          }}
        >
          {/* Hospital Logo */}
          <div 
            className="rounded-3xl overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              padding: "20px 28px",
              height: "140px",
            }}
          >
            <img
              src={theme.logoUrl}
              alt={theme.hospitalName}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          {/* Tabs Container */}
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto about-tabs-sidebar">
            {sections.map((section) => {
              const isActive = section.id === activeSection;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                  style={{
                    backgroundColor: isActive
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.08)",
                    border: "2px solid transparent",
                    borderColor: isActive ? "rgba(255,255,255,0.35)" : "transparent",
                    textAlign: isRTL ? "right" : "left",
                  }}
                >
                  <div
                    className="shrink-0 flex items-center justify-center"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
                      color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    <FileText size={22} />
                  </div>
                  <span
                    className="flex-1"
                    style={{
                      fontFamily: theme.fontFamily,
                      fontSize: TYPE_SCALE.md,
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.8)",
                      lineHeight: "20px",
                    }}
                  >
                    {t(section.titleKey, theme.hospitalShortName)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Content Area */}
        <div
          className="flex-1 rounded-3xl overflow-hidden relative"
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          <div key={currentSection.id} className="h-full flex flex-col px-12 py-6 about-content-wrapper">
            {/* Section Title - Only show for text-based sections */}
            {currentSection.content && (
              <h3
                style={{
                  fontFamily: theme.fontFamily,
                  fontSize: TYPE_SCALE["3xl"],
                  fontWeight: WEIGHT.bold,
                  color: theme.primary,
                  marginBottom: "20px",
                  letterSpacing: "-0.5px",
                  flexShrink: 0,
                }}
              >
                {t(currentSection.titleKey, theme.hospitalShortName)}
              </h3>
            )}

            {/* Section Image (if exists) */}
            {currentSection.image && (
              <div className="flex-1 rounded-2xl overflow-hidden flex items-center justify-center">
                <img
                  src={currentSection.image}
                  alt={currentSection.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}

            {/* Section Video (if exists) */}
            {currentSection.video && (
              <div className="flex-1 rounded-2xl overflow-hidden relative" style={{ backgroundColor: "#0a0a14" }}>
                {!videoPlaying ? (
                  /* Thumbnail with play button */
                  <button
                    onClick={() => setVideoPlaying(true)}
                    className="absolute inset-0 w-full h-full cursor-pointer group"
                    style={{ border: "none", padding: 0, background: "none" }}
                    aria-label="Play video"
                  >
                    <img
                      src={theme.heroImageUrl}
                      alt={currentSection.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ filter: "brightness(0.7)" }}
                    />
                    {/* Dark gradient overlay */}
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(transparent 40%, rgba(0,0,0,0.5) 100%)" }}
                    />
                    {/* Play button */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div
                        className="flex items-center justify-center rounded-full transition-transform group-hover:scale-110 group-active:scale-95"
                        style={{
                          width: "80px",
                          height: "80px",
                          backgroundColor: theme.primary,
                          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                        }}
                      >
                        <Play size={36} fill="#fff" style={{ color: "#fff", marginLeft: "4px" }} />
                      </div>
                      <span
                        style={{
                          fontFamily: theme.fontFamily,
                          fontSize: TYPE_SCALE.lg,
                          fontWeight: WEIGHT.semibold,
                          color: "#fff",
                          textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                        }}
                      >
                        {t("about.watchVideo")}
                      </span>
                    </div>
                    {/* Film icon badge */}
                    <div
                      className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full"
                      style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                    >
                      <Film size={14} style={{ color: "#fff" }} />
                      <span style={{ fontFamily: theme.fontFamily, fontSize: "12px", fontWeight: WEIGHT.semibold, color: "#fff" }}>
                        {t("about.video")}
                      </span>
                    </div>
                  </button>
                ) : (
                  /* YouTube embed */
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${currentSection.video}?autoplay=1&rel=0`}
                    title={currentSection.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            )}

            {/* Section Content */}
            {currentSection.content && (
              <div
                className="flex-1 overflow-y-auto about-scrollable-content"
                style={{
                  fontFamily: theme.fontFamily,
                  fontSize: TYPE_SCALE.md,
                  fontWeight: WEIGHT.medium,
                  color: "#1B2A32",
                  lineHeight: "26px",
                  whiteSpace: "pre-line",
                }}
              >
                {currentSection.content}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}