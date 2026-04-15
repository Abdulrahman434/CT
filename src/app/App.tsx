import { useEffect, useState, useCallback, useRef } from "react";
import { ThemeProvider, useTheme, TYPE_SCALE, WEIGHT, SHADOW, SPACE } from "./components/ThemeContext";
import { useLocale } from "./components/i18n";
import { TopBar } from "./components/TopBar";
import { NewsTicker } from "./components/NewsTicker";
import { PatientGreeting } from "./components/PatientGreeting";
import { ServicesGrid, ShortcutsColumn, HubGridCompact, ServiceCardsRow } from "./components/ServicesGrid";
import { CareMe, CareMeExpanded } from "./components/CareMe";
import { IdleScreen } from "./components/IdleScreen";
import { RippleStyles } from "./components/useRipple";
import { AppLauncher } from "./components/AppLauncher";
import { SurveyModal } from "./components/SurveyModal";
import { AboutUs } from "./components/AboutUs";
import { SettingsPanel } from "./components/SettingsPanel";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { AppTour } from "./components/AppTour";
import { CallScreen } from "./components/CallScreen";
import { AutoCarousel } from "./components/AutoCarousel";
import fakeehSymbol from "../assets/7b9b440667ca2ce8678111ec37e1fb104ae88026.png";
import caremedicalicon from "../assets/caremedicalicon.png";
import { HospitalConfigurator } from "./components/HospitalConfigurator";
import { TasbihScreenSaver } from "./components/TasbihScreenSaver";
import { FoodOrdering } from "./components/FoodOrdering";
import { OrderProvider } from "./components/OrderStore";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { PasswordGate } from "./components/PasswordGate";
import { HospitalBroadcast, SAMPLE_BROADCAST } from "./components/HospitalBroadcast";
import type { BroadcastNotification } from "./components/HospitalBroadcast";
import { MemoryGame } from "./components/games/MemoryGame";
import { TicTacToeGame } from "./components/games/TicTacToeGame";
import { JigsawPuzzleGame } from "./components/games/JigsawPuzzleGame";
import { ColorMatchGame } from "./components/games/ColorMatchGame";
import { PatternMemoryGame } from "./components/games/PatternMemoryGame";
import { EmojiMatchGame } from "./components/games/EmojiMatchGame";
import { CalculatorTool } from "./components/tools/CalculatorTool";
import { NotesTool } from "./components/tools/NotesTool";
import { RemindersTool } from "./components/tools/RemindersTool";
import { StopwatchTool } from "./components/tools/StopwatchTool";
import { UnitConverterTool } from "./components/tools/UnitConverterTool";
import { BreathingTool } from "./components/tools/BreathingTool";
import { WhiteboardTool } from "./components/tools/WhiteboardTool";

const DESIGN_W = 1920;
const DESIGN_H = 1080;

function useScreenScale() {
  const getScale = useCallback(() => {
    const sx = window.innerWidth / DESIGN_W;
    const sy = window.innerHeight / DESIGN_H;
    return Math.min(sx, sy);
  }, []);

  const [scale, setScale] = useState(getScale);

  useEffect(() => {
    const onResize = () => setScale(getScale());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [getScale]);

  return scale;
}

function BedsideScreen() {
  const { patientAdmitted, setPatientAdmitted, theme, darkMode, switchConfig } = useTheme();
  const { isFullAccess, lockedHospitalId } = useAuth();
  const { t, isRTL, dir, fontFamily } = useLocale();
  const scale = useScreenScale();
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  /* ── Auto-switch hospital config based on login password ── */
  const hasAppliedConfig = useRef(false);
  useEffect(() => {
    if (lockedHospitalId && !hasAppliedConfig.current) {
      switchConfig(lockedHospitalId);
      hasAppliedConfig.current = true;
    }
  }, [lockedHospitalId, switchConfig]);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showTasbih, setShowTasbih] = useState(false);
  const [tourDismissed, setTourDismissed] = useState(() => {
    try {
      return localStorage.getItem("hbs-tour-seen") === "1";
    } catch {
      return false;
    }
  });
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [showCareMe, setShowCareMe] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [showFoodOrder, setShowFoodOrder] = useState(false);
  const [layoutVersion, setLayoutVersion] = useState<1 | 2 | 3>(1);
  const [activeBroadcast, setActiveBroadcast] = useState<BroadcastNotification | null>(null);
  const [acknowledgedBroadcasts, setAcknowledgedBroadcasts] = useState<BroadcastNotification[]>([]);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleBroadcastAcknowledge = useCallback((id: string) => {
    setActiveBroadcast((prev) => {
      if (prev && prev.id === id) {
        const acknowledged = {
          ...prev,
          acknowledgedAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        };
        // Schedule outside state updater
        setTimeout(() => {
          setAcknowledgedBroadcasts((list) => [acknowledged, ...list]);
        }, 0);
      }
      return null;
    });
  }, []);

  const handleMaghribTap = useCallback(() => {
    setActiveBroadcast({
      ...SAMPLE_BROADCAST,
      id: "broadcast-" + Date.now(),
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    });
  }, []);

  const handleNotificationClick = useCallback((notif: any) => {
    // Map textKey to realistic broadcast content
    const contentMap: Record<string, { title: { en: string, ar: string }, body: { en: string, ar: string }, priority: "info" | "warning" | "urgent" }> = {
      "notif.mriReady": {
        title: { en: "MRI Study Complete", ar: "اكتملت دراسة الرنين المغناطيسي" },
        body: { 
          en: "Your Abdominal MRI study is now ready for review. Your attending physician has been notified and will discuss the results with you during the next ward round.",
          ar: "دراسة الرنين المغناطيسي للبطن جاهزة الآن للمراجعة. تم إبلاغ طبيبك المعالج وسيناقش النتائج معك خلال جولة القسم القادمة."
        },
        priority: "info"
      },
      "notif.labsReady": {
        title: { en: "Laboratory Results", ar: "نتائج المختبر" },
        body: { 
          en: "Your latest laboratory results are now available. You can review the detailed breakdown and clinical status in the 'Care Me' module under Lab Results.",
          ar: "أنتائج المختبر الأخيرة متاحة الآن. يمكنك مراجعة التفاصيل والحالة السريرية في قسم 'رعاية المريض' (Care Me) تحت نتائج المختبر."
        },
        priority: "info"
      },
      "notif.surveyRequest": {
        title: { en: "We Value Your Feedback", ar: "نحن نقدر رأيك" },
        body: { 
          en: "How are we doing? Please take a moment to share your experience with us through our quick patient survey. Your feedback helps us improve our care.",
          ar: "كيف كانت خدمتنا؟ يرجى تخصيص لحظة لمشاركة تجربتك معنا من خلال استبيان المريض السريع. ملاحظاتك تساعدنا على تحسين رعايتنا."
        },
        priority: "info"
      },
      "notif.hygieneScheduled": {
        title: { en: "Maintenance Alert", ar: "تنبيه الصيانة والنظافة" },
        body: { 
          en: "A routine hospital hygiene check is scheduled for your room shortly. This should take approximately 10 minutes. Thank you.",
          ar: "من المقرر إجراء فحص دوري لنظافة المستشفى في غرفتك قريباً. سيستغرق ذلك حوالي 10 دقائق. شكراً لكم."
        },
        priority: "warning"
      },
      "notif.doctorVisit": {
        title: { en: "Doctor Update", ar: "تحديث من الطبيب" },
        body: { 
          en: "Dr. Al-Ghamdi has reviewed your latest vitals and will visit your bedside during the afternoon rounds.",
          ar: "قام الدكتور الغامدي بمراجعة علاماتك الحيوية الأخيرة وسيقوم بزيارتك خلال جولات بعد الظهر."
        },
        priority: "info"
      }
    };

    const details = contentMap[notif.textKey] || {
      title: { en: "Hospital Notification", ar: "إشعار من المستشفى" },
      body: { en: "You have a new update from the medical staff.", ar: "لديك تحديث جديد من الطاقم الطبي." },
      priority: "info"
    };

    setActiveBroadcast({
      id: "notif-popup-" + notif.id,
      title: details.title,
      body: details.body,
      priority: details.priority,
      timestamp: notif.time,
    });
    setShowNotifications(false); // Close panel to focus on broadcast
  }, []);

  const handleOpenCategory = (categoryKey: string) => {
    if (categoryKey === "About Us") {
      setShowAboutUs(true);
    } else if (categoryKey === "Call") {
      setShowCall(true);
    } else if (categoryKey === "Order Food") {
      setShowFoodOrder(true);
    } else if (categoryKey === "Housekeeping") {
      window.open("https://demo.hospitalopsai.com/patient/?mrd_id=3344&room=342", "_blank", "noopener,noreferrer");
    } else {
      setOpenCategory(categoryKey);
    }
  };

  // Auto-show tour on first visit once patient is admitted
  useEffect(() => {
    if (patientAdmitted && !tourDismissed && !showTour) {
      // Small delay so the main UI renders first
      const timer = setTimeout(() => setShowTour(true), 600);
      return () => clearTimeout(timer);
    }
  }, [patientAdmitted, tourDismissed]);

  const handleCloseTour = useCallback(() => {
    setShowTour(false);
    setTourDismissed(true);
    try {
      localStorage.setItem("hbs-tour-seen", "1");
    } catch { }
  }, []);

  const handleFullscreenTap = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  // ── Keyboard Navigation ──
  useEffect(() => {
    const anyOverlayOpen =
      openCategory || showSurvey || showAboutUs || showSettings ||
      showNotifications || showTour || showTasbih || showConfigurator ||
      showCareMe || showCall || showFoodOrder || activeBroadcast ||
      activeGame || activeTool;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape closes the topmost overlay
      if (e.key === "Escape") {
        if (activeTool) { setActiveTool(null); return; }
        if (activeGame) { setActiveGame(null); return; }
        if (activeBroadcast) { setActiveBroadcast(null); return; }
        if (showFoodOrder) { setShowFoodOrder(false); return; }
        if (showCall) { setShowCall(false); return; }
        if (showCareMe) { setShowCareMe(false); return; }
        if (showConfigurator) { setShowConfigurator(false); return; }
        if (showTasbih) { setShowTasbih(false); return; }
        if (showTour) { setShowTour(false); setTourDismissed(true); return; }
        if (showNotifications) { setShowNotifications(false); return; }
        if (showSettings) { setShowSettings(false); return; }
        if (showAboutUs) { setShowAboutUs(false); return; }
        if (showSurvey) { setShowSurvey(false); return; }
        if (openCategory) { setOpenCategory(null); return; }
        return;
      }

      // Only handle arrows/enter when no overlay is open
      if (anyOverlayOpen) return;

      const arrows = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
      const isArrow = arrows.includes(e.key);
      const isEnter = e.key === "Enter" || e.key === " ";
      if (!isArrow && !isEnter) return;

      e.preventDefault();

      // Find all visible nav buttons
      const allBtns = Array.from(
        document.querySelectorAll<HTMLElement>('[data-nav="true"]')
      ).filter((el) => el.offsetParent !== null);

      if (allBtns.length === 0) return;

      const focused = document.activeElement as HTMLElement;
      const currentIdx = allBtns.indexOf(focused);

      // Enter/Space: click focused element
      if (isEnter) {
        if (currentIdx >= 0) allBtns[currentIdx].click();
        return;
      }

      // If nothing focused yet, focus first button
      if (currentIdx < 0) {
        allBtns[0].focus();
        return;
      }

      // Spatial navigation: find the closest button in the arrow direction
      const cur = allBtns[currentIdx].getBoundingClientRect();
      const cx = cur.left + cur.width / 2;
      const cy = cur.top + cur.height / 2;

      // Check if the layout is RTL
      const rootDir = document.querySelector("[dir]")?.getAttribute("dir");
      const isRtl = rootDir === "rtl";

      let dir = e.key as string;
      // Swap left/right for RTL
      if (isRtl) {
        if (dir === "ArrowLeft") dir = "ArrowRight";
        else if (dir === "ArrowRight") dir = "ArrowLeft";
      }

      let best: HTMLElement | null = null;
      let bestDist = Infinity;

      for (let i = 0; i < allBtns.length; i++) {
        if (i === currentIdx) continue;
        const r = allBtns[i].getBoundingClientRect();
        const nx = r.left + r.width / 2;
        const ny = r.top + r.height / 2;
        const dx = nx - cx;
        const dy = ny - cy;

        // Filter by direction
        let valid = false;
        if (dir === "ArrowUp" && dy < -5) valid = true;
        if (dir === "ArrowDown" && dy > 5) valid = true;
        if (dir === "ArrowLeft" && dx < -5) valid = true;
        if (dir === "ArrowRight" && dx > 5) valid = true;
        if (!valid) continue;

        // Distance with bias toward staying on-axis
        let dist: number;
        if (dir === "ArrowUp" || dir === "ArrowDown") {
          dist = Math.abs(dy) + Math.abs(dx) * 2;
        } else {
          dist = Math.abs(dx) + Math.abs(dy) * 2;
        }

        if (dist < bestDist) {
          bestDist = dist;
          best = allBtns[i];
        }
      }

      if (best) best.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openCategory, showSurvey, showAboutUs, showSettings,
      showNotifications, showTour, showTasbih, showConfigurator,
      showCareMe, showCall, showFoodOrder, activeBroadcast,
      activeGame, activeTool]);

  return (
    <div
      className="w-screen h-screen overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      <div
        dir={dir}
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          background: theme.gradientCanvas,
          fontFamily: fontFamily,
        }}
        className="flex flex-col overflow-hidden relative shrink-0"
      >
        {/* Decorative hospital background photo — subtle texture */}
        <AutoCarousel
          images={theme.heroImageUrls}
          opacity={darkMode ? 0.03 : 0.08}
          objectPosition={theme.heroCropPosition}
          style={{ zIndex: 0 }}
        />
        {/* Decorative hospital symbol watermarks */}
        <img
          src={theme.id === "caremed" ? caremedicalicon : fakeehSymbol}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute"
          style={{
            width: "680px",
            height: "680px",
            right: "-120px",
            bottom: "-160px",
            opacity: darkMode ? 0.015 : 0.03,
            transform: "rotate(-15deg)",
            zIndex: 0,
          }}
        />
        <img
          src={theme.id === "caremed" ? caremedicalicon : fakeehSymbol}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute"
          style={{
            width: "420px",
            height: "420px",
            left: "-80px",
            top: "-60px",
            opacity: darkMode ? 0.012 : 0.025,
            transform: "rotate(160deg)",
            zIndex: 0,
          }}
        />

        {/* System Header */}
        <TopBar
          onFajrTap={() => setLayoutVersion((v) => (v === 3 ? 1 : 3))}
          onDhuhrTap={isFullAccess ? () => setShowConfigurator(true) : undefined}
          onIshaTap={() => setShowTasbih(true)}
          onWeatherTap={() => setLayoutVersion((v) => (v === 1 ? 2 : 1))}
          onSettingsTap={() => setShowSettings(true)}
          onBellTap={() => setShowNotifications(true)}
          onMaghribTap={handleMaghribTap}
        />

        {/* News Ticker */}
        <NewsTicker />

        {/* Main Content — 32px gap below ticker */}
        <div className="flex-1 flex gap-[40px] px-8 pt-8 pb-6 min-h-0" style={{ position: "relative", zIndex: 1 }}>
          {patientAdmitted ? (
            layoutVersion === 3 ? (
              /* ─── V3 Layout: HubCards left, Greeting+CareMe center, Shortcuts right ─── */
              <div className="flex-1 flex gap-[40px] min-w-0 min-h-0">
                {/* Left — 2×4 Hub Grid */}
                <div className="flex flex-col shrink-0 min-h-0" style={{ width: "400px" }}>
                  <HubGridCompact onOpenCategory={handleOpenCategory} />
                </div>

                {/* Center — Greeting + CareMe side by side, Services below */}
                <div className="flex-1 flex flex-col gap-5 min-w-0 min-h-0">
                  {/* Top: Greeting + CareMe horizontally */}
                  <div className="flex-1 flex gap-5 min-h-0">
                    <div className="flex-1 min-w-0 min-h-0 flex flex-col">
                      <PatientGreeting onOpenAboutUs={() => setShowAboutUs(true)} onOpenTour={() => setShowTour(true)} fillImage />
                    </div>
                    <div className="flex-1 min-w-0 min-h-0 flex flex-col">
                      <CareMe onExpand={() => setShowCareMe(true)} />
                    </div>
                  </div>
                  {/* Bottom: Service cards row */}
                  <ServiceCardsRow onOpenCategory={handleOpenCategory} />
                </div>

                {/* Right — Shortcuts */}
                <div className="flex flex-col shrink-0 min-h-0" style={{ width: "280px" }}>
                  <ShortcutsColumn onOpenSurvey={() => setShowSurvey(true)} />
                </div>
              </div>
            ) : layoutVersion === 1 ? (
              <>
                {/* Left Column — PatientGreeting + CareMe */}
                <div className="flex flex-col gap-5 shrink-0 min-h-0" style={{ width: "400px" }}>
                  <PatientGreeting onOpenAboutUs={() => setShowAboutUs(true)} onOpenTour={() => setShowTour(true)} />
                  <CareMe onExpand={() => setShowCareMe(true)} />
                </div>

                {/* Center + Right Column */}
                <div className="flex-1 flex gap-[40px] min-w-0 min-h-0">
                  {/* Center — Engagement Grid */}
                  <div className="flex-1 min-w-0 flex flex-col gap-5 min-h-0">
                    <ServicesGrid onOpenCategory={handleOpenCategory} />
                  </div>

                  {/* Right — Shortcuts */}
                  <div className="flex flex-col shrink-0 min-h-0" style={{ width: "280px" }}>
                    <ShortcutsColumn onOpenSurvey={() => setShowSurvey(true)} />
                  </div>
                </div>
              </>
            ) : (
              /* ─── V2 Layout: Shortcuts in container ─── */
              <>
                {/* Left Column — PatientGreeting + CareMe */}
                <div className="flex flex-col gap-5 shrink-0 min-h-0" style={{ width: "400px" }}>
                  <PatientGreeting onOpenAboutUs={() => setShowAboutUs(true)} onOpenTour={() => setShowTour(true)} />
                  <CareMe onExpand={() => setShowCareMe(true)} />
                </div>

                <div className="flex-1 flex gap-[40px] min-w-0 min-h-0">
                  {/* Center — Hub grid with shortcuts at bottom */}
                  <div className="flex-1 min-w-0 flex flex-col gap-5 min-h-0">
                    <ServicesGrid onOpenCategory={handleOpenCategory} swapped />
                  </div>

                  {/* Right — Services stacked vertically */}
                  <div className="flex flex-col shrink-0 min-h-0" style={{ width: "280px" }}>
                    <ShortcutsColumn contained onOpenSurvey={() => setShowSurvey(true)} swapped />
                  </div>
                </div>
              </>
            )
          ) : (
            <>
              {/* Left Column — Awaiting */}
              <div className="flex flex-col gap-5 shrink-0 min-h-0" style={{ width: "400px" }}>
                <div
                  className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundColor: theme.background,
                    borderRadius: theme.radiusCard,
                    boxShadow: SHADOW.md,
                    border: theme.cardBorder,
                  }}
                >
                  <div className="relative z-10 text-center px-8">
                    <div
                      className="mx-auto mb-5 flex items-center justify-center rounded-2xl"
                      style={{ width: SPACE[8] + SPACE[1], height: SPACE[8] + SPACE[1], backgroundColor: theme.primarySubtle }}
                    >
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{
                          border: `2px solid ${theme.primarySubtle}`,
                          borderTopColor: theme.primary,
                          animation: "spin 2s linear infinite",
                        }}
                      />
                    </div>
                    <p style={{ fontFamily: fontFamily, color: theme.textHeading, fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.semibold, lineHeight: 1.3 }}>
                      {t("idle.awaiting")}
                    </p>
                    <p className="mt-2" style={{ fontFamily: fontFamily, color: theme.textMuted, fontSize: TYPE_SCALE.base, lineHeight: 1.5 }}>
                      {t("idle.awaitingDesc")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-5 min-h-0">
                <IdleScreen />
              </div>
            </>
          )}
        </div>

        {/* App Launcher Overlay */}
        {openCategory && (
          <AppLauncher
            categoryKey={openCategory}
            onClose={() => setOpenCategory(null)}
            onLaunchGame={(gameId) => {
              setActiveGame(gameId);
              setOpenCategory(null);
            }}
            onLaunchTool={(toolId) => {
              setActiveTool(toolId);
              setOpenCategory(null);
            }}
          />
        )}

        {/* About Us Modal — inside scaled container for consistent sizing */}
        {showAboutUs && (
          <AboutUs onClose={() => setShowAboutUs(false)} />
        )}

        {/* Settings Panel — slide-in from right */}
        {showSettings && (
          <SettingsPanel
            onClose={() => setShowSettings(false)}
            onFullscreenTap={handleFullscreenTap}
            isFullscreen={isFullscreen}
          />
        )}

        {/* Notifications Panel — slide-in from right */}
        {showNotifications && (
          <NotificationsPanel 
            onClose={() => setShowNotifications(false)} 
            acknowledgedBroadcasts={acknowledgedBroadcasts} 
            onNotificationClick={handleNotificationClick}
          />
        )}

        {/* Application Tour Modal */}
        {showTour && (
          <AppTour onClose={handleCloseTour} />
        )}

        {/* Hospital Configurator */}
        {showConfigurator && (
          <HospitalConfigurator onClose={() => setShowConfigurator(false)} />
        )}

        {/* CareMe Expanded Overlay */}
        {showCareMe && (
          <CareMeExpanded onClose={() => setShowCareMe(false)} />
        )}

        {/* Call Screen Overlay */}
        {showCall && (
          <CallScreen onClose={() => setShowCall(false)} />
        )}

        {/* Food Ordering Overlay */}
        {showFoodOrder && (
          <FoodOrdering onClose={() => setShowFoodOrder(false)} />
        )}

        {/* Tasbih Screen Saver */}
        {showTasbih && (
          <TasbihScreenSaver onClose={() => setShowTasbih(false)} />
        )}

        {/* Hospital Broadcast Overlay */}
        {activeBroadcast && (
          <HospitalBroadcast
            notification={activeBroadcast}
            onAcknowledge={handleBroadcastAcknowledge}
          />
        )}

        {/* Games */}
        {activeGame === "memory" && <MemoryGame onClose={() => setActiveGame(null)} onBackToGames={() => { setActiveGame(null); setOpenCategory("Games"); }} />}
        {activeGame === "tictactoe" && <TicTacToeGame onClose={() => setActiveGame(null)} onBackToGames={() => { setActiveGame(null); setOpenCategory("Games"); }} />}
        {activeGame === "puzzle" && <JigsawPuzzleGame onClose={() => setActiveGame(null)} onBackToGames={() => { setActiveGame(null); setOpenCategory("Games"); }} />}
        {activeGame === "colormatch" && <ColorMatchGame onClose={() => setActiveGame(null)} onBackToGames={() => { setActiveGame(null); setOpenCategory("Games"); }} />}
        {activeGame === "patternmemory" && <PatternMemoryGame onClose={() => setActiveGame(null)} onBackToGames={() => { setActiveGame(null); setOpenCategory("Games"); }} />}
        {activeGame === "emojimatch" && <EmojiMatchGame onClose={() => setActiveGame(null)} onBackToGames={() => { setActiveGame(null); setOpenCategory("Games"); }} />}

        {/* Tools */}
        {activeTool === "calculator" && <CalculatorTool onClose={() => setActiveTool(null)} onBackToTools={() => { setActiveTool(null); setOpenCategory("Tools"); }} />}
        {activeTool === "notes" && <NotesTool onClose={() => setActiveTool(null)} onBackToTools={() => { setActiveTool(null); setOpenCategory("Tools"); }} />}
        {activeTool === "reminders" && <RemindersTool onClose={() => setActiveTool(null)} onBackToTools={() => { setActiveTool(null); setOpenCategory("Tools"); }} />}
        {activeTool === "stopwatch" && <StopwatchTool onClose={() => setActiveTool(null)} onBackToTools={() => { setActiveTool(null); setOpenCategory("Tools"); }} />}
        {activeTool === "unitconverter" && <UnitConverterTool onClose={() => setActiveTool(null)} onBackToTools={() => { setActiveTool(null); setOpenCategory("Tools"); }} />}
        {activeTool === "breathing" && <BreathingTool onClose={() => setActiveTool(null)} onBackToTools={() => { setActiveTool(null); setOpenCategory("Tools"); }} />}
        {activeTool === "whiteboard" && <WhiteboardTool onClose={() => setActiveTool(null)} onBackToTools={() => { setActiveTool(null); setOpenCategory("Tools"); }} />}
      </div>

      {/* Survey Modal */}
      {showSurvey && (
        <SurveyModal onClose={() => setShowSurvey(false)} />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes castPulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--hbs-primary-subtle); }
          50% { box-shadow: 0 0 0 6px transparent; }
        }
        [data-nav="true"]:focus {
          outline: 5px solid #008BAE !important;
          outline-offset: 4px !important;
          box-shadow: 0 0 20px rgba(0, 139, 174, 0.6) !important;
          transform: scale(1.02) !important;
          z-index: 50 !important;
          border-color: transparent !important;
        }
      `}</style>
      <RippleStyles />
    </div>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <PasswordGate />;
  }

  return (
    <ThemeProvider>
      <OrderProvider>
        <BedsideScreen />
      </OrderProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
