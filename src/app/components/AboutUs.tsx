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
import dallahDna from "../../assets/dallah-dna.png";
import dallahAwardsAr from "../../assets/dallah-awards-ar.png";
import dallahAwardsEn from "../../assets/dallah-awards-en.png";
import dallahAccredsAr from "../../assets/dallah-accreds-ar.png";
import dallahAccredsEn from "../../assets/dallah-accreds-en.png";

interface AboutSection {
  id: string;
  title: string;
  titleKey: string;
  content?: string;
  image?: string;
  video?: string; // YouTube video ID
}

const dallahPatientRightsEn = `• Receive a copy of the Patient and Family Bill of Rights and Responsibilities from the Reception, Admission Office, or Nursing Staff. If, for any reason, you cannot understand it, please contact the Customer Service Officer for help on Dallah Hospital- Namar Telephone 011/ 8275555, extension 1717, 1710 ، Dallah Hospital - Alnakheel telephone 011/299-5555, extension 3399, 4841, and 5735
• Receive comprehensive care given without discrimination by competent personnel who respect your personal values and beliefs as per hospital rules and regulations and Saudi laws.
• Expect emergency procedure to be carried out according to the medical priority of the case and without unnecessary delay.
• Have appropriate assessment and management of pain.
• Participate in decisions involving your health care.
• Be provided with information upon discharge, of your continuing health care requirements and how to meet them.
• Receive written general consent when you come for treatment for the first time.
• Sign the necessary informed consent after giving all necessary information explained as interpreted prior to any surgery or invasive procedure, blood or blood components transfusion or anesthesia or procedural sedation or high risk procedures and treatments.
• The Unique needs of dying patient will be recognized, respected and addressed in the care process without contradicting with the hospital rules and regulations and Saudi laws.
• Know the identity of your physician, nurses and other health care giver.
• You can seek a second opinion without fear to compromise the service provided to you. (As per the hospital financial rules and regulations) and Customer Services on extension Dallah Hospital- Namar 1717, 1710 ، Dallah Hospital - Alnakheel extension 3399, 4841, will initiate the second opinion procedure as per hospital rules and regulations.
• Receive complete and current information from your treating doctor "once final diagnosis is defined" regarding the diagnosis and the medical condition, consent, planned care and treatment, the outcome of care, any anticipated outcomes of care and treatment, changes in your health status, potential benefits and drawbacks of proposed treatment, likelihood of successful treatment, possible problems related to recovery and possible results of non-treatment in terms that you can understand (Interpreter is available, if needed).
• Refuse / discontinue the treatment to the extent permitted by law and to be informed about the potential consequences and responsibilities related to such decisions and you will be asked to sign a form prepared for that purpose. You will be informed about the available care and treatment alternatives.
• Receive upon your request an appropriate explanation of the cost of your treatment.
• Voice complaint regarding your care through the Customer Service Office, Ext. Dallah Hospital- Namar 1717, 1710 ، Dallah Hospital - Alnakheel 4844, 3399, or through the Suggestion Boxes. The result of the investigation will be relayed to you by Complaint unit as soon as possible on extension Dallah Hospital- Namar 1717، Dallah Hospital - Alnakheel 5533.
• Know, upon your request, other available sources of care for your condition and other alternative treatment inside or outside the hospital.
• Protect your privacy while receiving services.
• Have your medical record confidentially protected from loss or misuse and read only by individuals involved in your care or by individuals authorized by law or third-party contractual agreement.
• Be provided with safe environment surrounding your care within the framework established by the hospital.
• Be provided with a safety mechanism for your valuables from loss or theft, when needed.
• Be protected from physical, verbal and psychological assault.
• Be informed on how to seek assistance when you have any concerns about your condition.
• We do support your decision if you decide to donate organ or tissue although we don't provide this service in Dallah Hospital. For more information, you can call the Saudi Center for Organ and Tissue Transplantation on Toll Free 800-124-5500 and land line 011/ 445-1100.`;

const dallahPatientRightsAr = `سيقوم مكتب الاستقبال أو طاقم التمريض بتقديم نسخة مكتوبة من وثيقة حقوق وواجبات المرضى لكل مراجع. وفي حال كانت لديكم أي استفسارات بشأن الوثيقة، يرجى الاتصال بقسم خدمة العملاء: دلّه النخيل 2995555/011 التحويلات 5735 / 4841 / 3399 | دلّه نمار 8275555 / 011 التحويلات 1717 /1710.

تلتزم دلّه الصحية بضمان الحقوق التالية لجميع المرضى:

• الحصول على رعاية طبية بواسطة أطباء مؤهلين دون أي تمييز ومع ضمان مراعاة المعتقدات والقيم الشخصية بما لا يتعارض مع لوائح المستشفى والأنظمة المعمول بها في المملكة العربية السعودية.
• الحصول على خدمات الرعاية العاجلة في الحالات الطارئة دون تأخير بحسب الأولويات التي يحددها الطبيب.
• تقييم وعلاج وتخفيف الألم بالطرق العلاجية المتعارف عليها.
• المشاركة في اتخاذ القرارات المتعلقة بالخطة العلاجية بعد مناقشتها مع الطبيب المعالج.
• عند الخروج من المستشفى، تقديم إرشادات الخروج والتي تشمل الخطة العلاجية والإرشادات الطبية التي توضح مراحل العلاج خارج المستشفى.
• توقيع إقرار مكتوب للموافقة العامة على العلاج بالمستشفى في أول زيارة.
• طلب موافقة كتابية مسبقة قبل إجراء أي عمليات جراحية أو جراحات مناظير أو عملية نقل للدم أو مكوناته أو تخدير أو عمليات تستلزم استخدام أدوية مهدئة أو مسكنة أو إجراءات تنطوي على مخاطر خاصة أو أية إجراءات أخرى تتطلب ذلك.
• التعامل بشكل إنساني وأخلاقي واحترام الاحتياجات الاستثنائية للمرضى على فراش الموت وفقاً لما تسمح به إمكانيات المستشفى وبما لا يتعارض مع اللوائح التنظيمية للمستشفى والأنظمة السارية في المملكة العربية السعودية.
• تعريف المرضى بهوية وتخصص الطبيب وطاقم التمريض وجميع المشاركين في العلاج.
• طلب مشورة طبية ثانية للحالة المرضية دون أي تأثير على مستوى الخدمة مع الأخذ بالاعتبار قواعد وأسعار الخدمات في المستشفى، وذلك من خلال الاتصال بخدمة العملاء على التحويلات: دلّه النخيل 5735 / 4841 / 3399 | دلّه نمار 1717 /1710.
• الحصول على معلومات من الطبيب المعالج بشأن الحالة المرضية بمجرد تشخيصها، وكذلك خطة العلاج المقترحة، واحتمالات النجاح، وأي تغيرات قد تطرأ على الحالة الصحية وسبب هذه التغيرات، والعلاجات البديلة المتوفرة، والمشاكل المتوقعة أثناء العلاج، والنتائج المتوقعة في حالة رفض العلاج. كما يحق للمرضى الحصول على مترجم في حال شكلت اللغة عائقاً يحول دون فهم تفاصيل العلاج.
• يحق للمرضى رفض أو إيقاف العلاج بما لا يتعارض مع الأنظمة المعمول بها، وسيتم إعلامهم بالتبعات الصحية والمسؤوليات المترتبة على هذا القرار وطلب توقيع إقرار خطي معد لهذا الغرض.
• مناقشة تكاليف العلاج مع الأشخاص المعنيين.
• يمكن للمرضى تقديم شكوى متعلقة بأي تقصير في الرعاية الطبية من خلال مكتب خدمات العملاء، تحويلة رقم (النخيل: 4841 / 3399، نمار: 1717 /1710). يمكن وضع الشكوى في صندوق الشكاوى، وسيتم إبلاغ المريض بنتيجة التحقيق عن طريق وحدة الشكاوى؛ تحويلة النخيل: 5533، نمار: 1717.
• طلب معرفة الأماكن الأخرى التي توفر العلاج المطلوب للحالة المرضية والبدائل المتاحة داخل وخارج المستشفى.
• الحفاظ على أعلى درجات الخصوصية أثناء تلقي الخدمة الطبية.
• الحفاظ على سرية معلومات المرضى، بما في ذلك الملف الطبي وحمايته من الضياع وسوء الاستعمال مع ضمان توفيره فقط للأشخاص المعنيين بالعلاج أو الجهات الرسمية المصرح لها بذلك أو الجهة المتعاقدة مع المستشفى لأغراض العلاج في حال تم طلب ذلك وفقاً للعقد الموقع.
• توفير بيئة آمنة من الأخطار أثناء العلاج.
• الحفاظ على المقتنيات الشخصية من السرقة والضياع وفقاً لأنظمة المستشفى.
• حماية المرضى من أي اعتداء جسدي أو نفسي أو لفظي.
• يحق للمرضى طلب المساعدة ومعرفة جميع التفاصيل المتعلقة بالحالة المرضية.
• في حال قرر المرضى التبرع بالأعضاء، يقدم المستشفى الدعم في مجال التواصل مع الجهة المسؤولة عن نقل الأعضاء باعتبار أن هذه الخدمة غير متوفرة. للمزيد من المعلومات، يرجى الاتصال بالمركز السعودي لنقل الأعضاء عبر رقم الهاتف المجاني: 8001245500 / 0114451100.`;

const dallahAccreditationsText = ``; // Replaced by images

const getSections = (themeId: string, isRTL: boolean): AboutSection[] => [
  {
    id: "hospital",
    title: themeId === "dallah" ? "About Dallah" : "Our Hospital",
    titleKey: themeId === "dallah" ? "about.aboutDallah" : "about.ourHospital",
    video: themeId === "caremed" ? "HW7Od_8C3_I" : themeId === "dallah" ? "JPgxKaOQf3s" : "4VXy7_qn608",
  },
  {
    id: "dna",
    title: themeId === "caremed" ? "CareMed InBrief" : themeId === "dallah" ? "Dallah DNA" : "Fakeeh Care DNA",
    titleKey: themeId === "caremed" ? "about.caremedInBrief" : themeId === "dallah" ? "about.dallahDna" : "about.dna",
    image: themeId === "dallah" ? dallahDna : themeId === "caremed" ? (isRTL ? careMedInBriefAr : careMedInBriefEn) : dnaImg,
  },
  {
    id: "numbers",
    title: themeId === "caremed" ? "CareMed In Numbers" : themeId === "dallah" ? "Accreditations" : "Fakeeh In Numbers",
    titleKey: themeId === "dallah" ? "about.accreditations" : "about.numbers",
    image: themeId === "dallah" ? (isRTL ? dallahAccredsAr : dallahAccredsEn) : themeId === "caremed" ? (isRTL ? numbersAr : numbersEn) : numbersImg,
    content: themeId === "dallah" ? undefined : undefined,
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
    title: themeId === "dallah" ? "Awards" : "Accreditations",
    titleKey: themeId === "dallah" ? "about.awards" : "about.accreditations",
    image: themeId === "dallah" ? (isRTL ? dallahAwardsAr : dallahAwardsEn) : themeId === "caremed" ? accredsImg : accreditationsImg,
  },
  {
    id: "digital",
    title: themeId === "dallah" ? "Patient Rights" : "Digital Services",
    titleKey: themeId === "dallah" ? "about.patientRights" : "about.digital",
    content: themeId === "dallah" ? (isRTL ? dallahPatientRightsAr : dallahPatientRightsEn) : `Connected Care at Your Fingertips

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
          <a
            href={theme.hospitalWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-3xl overflow-hidden flex items-center justify-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              padding: "20px 28px",
              height: "140px",
              display: "flex",
              textDecoration: "none",
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
          </a>

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
                  fontSize: TYPE_SCALE["2xl"],
                  fontWeight: WEIGHT.bold,
                  color: theme.primary,
                  marginBottom: "24px",
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
                  className="w-full h-full object-contain"
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
                  lineHeight: 1.8,
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