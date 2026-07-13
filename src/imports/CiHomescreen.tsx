import { Settings } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { NewsTicker } from "../app/components/NewsTicker";
import { TopBar } from "../app/components/TopBar";
import {
  useTheme,
  DEFAULT_TILE_GROUPS,
  type TileGroupStyle,
  type ThemeConfig,
} from "../app/components/ThemeContext";
import svgPaths from "./svg-jt2c43b1ae";

/**
 * Resolves one tile group's appearance settings into the CSS custom properties
 * the tile classes (.ci-tile-small / -large / -accent) read. Defaults fall back
 * to the active hospital theme so an unconfigured group stays in sync with
 * Layout 1. `kind` differs because small tiles colour their icons via
 * --primary-color, while large tiles colour theirs via --fill-0 / --ci-tile-icon.
 */
function tileGroupVars(
  g: TileGroupStyle,
  theme: ThemeConfig,
  kind: "small" | "large",
): CSSProperties {
  const icon =
    g.iconColor === "primary"
      ? theme.primary
      : g.iconColor === "secondary"
        ? theme.accent
        : g.iconCustom || "#ffffff";

  const vars: Record<string, string> = {
    "--ci-tile-bg-opacity": String(g.opacity),
    "--ci-tile-scale": String(g.scale),
  };

  if (kind === "small") {
    // Background base is always explicit so it stays independent of the
    // --primary-color override we use below to recolour the icons + label.
    vars["--ci-tile-bg"] = g.bg || theme.primary;
    vars["--primary-color"] = icon;
  } else {
    // Only force a background when the admin picked one — otherwise large tiles
    // keep their primary colour and the accent (CareMe) tile keeps its accent.
    if (g.bg) vars["--ci-tile-bg"] = g.bg;
    vars["--ci-tile-icon"] = icon;
    vars["--fill-0"] = icon;
  }

  return vars as CSSProperties;
}

interface CiHomescreenProps {
  onOpenSettings: () => void;
  onOpenCategory: (categoryKey: string) => void;
  onOpenSurvey: () => void;
  onLaunchTool: (toolId: string) => void;
  onOpenAboutUs: () => void;
  onShowCareMeExpanded: () => void;
  onShowIptv: () => void;
  onShowFoodOrder: () => void;
  onShowCall: () => void;
  onOpenNotifications?: () => void;
  unreadCount?: number;
  onDhuhrTap?: () => void;
}

function SimpleLineIconsUserFemale() {
  return (
    <div className="relative shrink-0 size-[34px]" data-name="simple-line-icons:user-female">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34 34">
        <g clipPath="url(#clip0_1_363)" id="simple-line-icons:user-female">
          <path d={svgPaths.p3f3c46e0} fill="var(--fill-0, white)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_363">
            <rect fill="white" height="34" width="34" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame25() {
  return (
    <div 
      className="content-stretch flex items-center p-[12px] relative rounded-[29px] shrink-0 size-[58px]"
      style={{ backgroundColor: "var(--primary-color)" }}
    >
      <div aria-hidden="true" className="absolute border-2 border-[rgba(255,255,255,0.3)] border-solid inset-0 pointer-events-none rounded-[29px]" />
      <SimpleLineIconsUserFemale />
    </div>
  );
}

function Frame38() {
  return (
    <div className="content-stretch flex flex-col gap-[7px] items-start leading-[0] relative shrink-0 text-white w-[365px]">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[26px] justify-center not-italic relative shrink-0 text-[24px] w-full">
        <p className="leading-[30px]" dir="auto">
          <span>{`Sara Saleh `}</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal not-italic text-[#f8f8f8]">| MRN: 14789521</span>
        </p>
      </div>
      <div className="flex flex-col font-['Inter:Italic',sans-serif] font-normal h-[16px] italic justify-center relative shrink-0 text-[15px] w-[464px]">
        <p className="leading-[30px]" dir="auto">
          Welcome to CareInn Hospital. We wish you a speedy recovery!
        </p>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="h-[52.277px] relative shrink-0 w-[104.458px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 105 53">
        <g id="Group 1">
          <path d={svgPaths.p343d2680} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p2011a6f0} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p1e958a70} fill="var(--fill-0, white)" id="Vector_3" />
          <path d={svgPaths.p1c12bb00} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.p95b0500} fill="var(--fill-0, white)" id="Vector_5" />
          <path d={svgPaths.p3df98f00} fill="var(--fill-0, white)" id="Vector_6" />
          <path d={svgPaths.p1fe00200} fill="var(--fill-0, white)" id="Vector_7" />
          <path d={svgPaths.p370d9280} fill="var(--fill-0, white)" id="Vector_8" />
          <path d={svgPaths.p1816e400} fill="var(--fill-0, white)" id="Vector_9" />
          <path d={svgPaths.p1703c400} fill="var(--fill-0, white)" id="Vector_10" />
          <path d={svgPaths.p394578f2} fill="var(--fill-0, white)" id="Vector_11" />
          <path d={svgPaths.p470400} fill="var(--fill-0, white)" id="Vector_12" />
          <path d={svgPaths.pfad76c0} fill="var(--fill-0, white)" id="Vector_13" />
          <path d={svgPaths.p2cb97200} fill="var(--fill-0, white)" id="Vector_14" />
          <path d={svgPaths.p34097f00} fill="var(--fill-0, white)" id="Vector_15" />
          <path d={svgPaths.p17bf6a00} fill="var(--fill-0, white)" id="Vector_16" />
          <path d={svgPaths.p32667500} fill="var(--fill-0, white)" id="Vector_17" />
          <path d={svgPaths.p1f24a680} fill="var(--fill-0, white)" id="Vector_18" />
        </g>
      </svg>
    </div>
  );
}

function Frame26() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center justify-center not-italic relative shrink-0 text-right text-white w-[206px] pr-[28px]">
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[30px] relative shrink-0 text-[24px] w-full">8:40 AM</p>
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[18px] w-full">
        <p className="leading-none" dir="auto">
          MON | 15 Oct 2025
        </p>
      </div>
    </div>
  );
}

function Frame39({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-[360px] gap-[28px]">
      <Frame26 />
      <button
        type="button"
        data-settings-button="true"
        aria-label="Open settings"
        onClick={onOpenSettings}
        className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-white/15 text-white shadow-lg shadow-black/20 transition hover:bg-white/25 cursor-pointer hover:opacity-80 active:scale-95"
      >
        <Settings size={24} />
      </button>
    </div>
  );
}

function Frame50({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-[1808px]">
      <Frame38 />
      <Frame37 onOpenSettings={onOpenSettings} />
    </div>
  );
}

function Frame37({ onOpenSettings }: { onOpenSettings: () => void }) {
  const [brandLogo, setBrandLogo] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      try {
        const val = localStorage.getItem('careinn-brand-logo');
        setBrandLogo(val && val !== 'null' && val !== '' ? val : null);
      } catch { setBrandLogo(null); }
    };
    check();
    window.addEventListener('storage', check);
    window.addEventListener('brandLogoChanged', check);
    return () => {
      window.removeEventListener('storage', check);
      window.removeEventListener('brandLogoChanged', check);
    };
  }, []);

  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-[1017px]">
      {brandLogo ? (
        <div className="h-[52.277px] relative shrink-0 flex items-center">
          <img
            src={brandLogo}
            alt="Brand logo"
            className="h-full max-w-[200px] object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
      ) : (
        <Group1 />
      )}
      <Frame39 onOpenSettings={onOpenSettings} />
    </div>
  );
}

function Frame28({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <div 
      className="absolute content-stretch flex gap-[20px] h-[98px] items-center left-0 overflow-clip pb-0 pt-[6px] px-[24px] top-0 w-[1920px]"
      style={{ backgroundColor: "var(--primary-color)" }}
    >
      <Frame25 />
      <div className="absolute flex h-[118px] items-center justify-center left-0 top-0 w-0" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg]">
          <div className="h-0 relative w-[118px]">
            <div className="absolute inset-[-6px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 118 6">
                <line id="Line 130" stroke="var(--accent-color)" strokeLinecap="round" strokeWidth="6" x1="3" x2="115" y1="3" y2="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <Frame50 onOpenSettings={onOpenSettings} />
    </div>
  );
}

function StadiaController() {
  return (
    <div className="h-[57.75px] relative shrink-0 w-[70px]" data-name="stadia_controller">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70 58">
        <g id="stadia_controller">
          <mask height="58" id="mask0_1_350" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="70" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="57.75" id="Bounding box" width="70" />
          </mask>
          <g mask="url(#mask0_1_350)">
            <path d={svgPaths.p3aa9a5c0} fill="var(--primary-color)" id="stadia_controller_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-[105px]">
      <StadiaController />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[21px] text-center w-[min-content]" style={{ color: "var(--primary-color)" }}>Games</p>
    </div>
  );
}

function Frame9() {
  return (
    <div data-games-button="true" data-tile="true" className="ci-tile-small content-stretch flex h-[144px] items-center justify-center p-[20px] relative rounded-[10px] shrink-0 w-[170px] cursor-pointer active:scale-95 transition-all">
      <Frame6 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex flex-col gap-[21px] items-center relative shrink-0 w-[105px]">
      <div className="h-[37px] relative shrink-0 w-[50px]" data-name="tag">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 37">
          <path d={svgPaths.p1bcbb280} fill="var(--primary-color)" id="tag" />
        </svg>
      </div>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[21px] text-center w-[min-content]" style={{ color: "var(--primary-color)" }}>Social</p>
    </div>
  );
}

function Frame30() {
  return (
    <div data-social-button="true" data-tile="true" className="ci-tile-small content-stretch flex h-[144px] items-center justify-center p-[20px] relative rounded-[10px] shrink-0 w-[170px] cursor-pointer active:scale-95 transition-all">
      <Frame7 />
    </div>
  );
}

function AutoReadPlay() {
  return (
    <div className="h-[57.75px] relative shrink-0 w-[70px]" data-name="auto_read_play">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70 58">
        <g id="auto_read_play">
          <mask height="58" id="mask0_1_357" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="70" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="57.75" id="Bounding box" width="70" />
          </mask>
          <g mask="url(#mask0_1_357)">
            <path d={svgPaths.p10f72cc0} fill="var(--primary-color)" id="auto_read_play_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-[105px]">
      <AutoReadPlay />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[21px] text-center w-[min-content]" style={{ color: "var(--primary-color)" }}>Media</p>
    </div>
  );
}

function Frame32() {
  return (
    <div data-media-button="true" data-tile="true" className="ci-tile-small content-stretch flex h-[144px] items-center justify-center p-[20px] relative rounded-[10px] shrink-0 w-[170px] cursor-pointer active:scale-95 transition-all">
      <Frame8 />
    </div>
  );
}

function ToolsSvgrepoCom() {
  return (
    <div className="relative shrink-0 size-[56px]" data-name="tools_svgrepo.com">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 56 56">
        <g clipPath="url(#clip0_1_324)" id="tools_svgrepo.com">
          <path d={svgPaths.p3d1f4240} fill="var(--primary-color)" id="Vector" />
          <path d={svgPaths.p2605c800} fill="var(--primary-color)" id="Vector_2" />
          <path d={svgPaths.p23b674f2} fill="var(--primary-color)" id="Vector_3" />
          <g id="Vector_4"></g>
        </g>
        <defs>
          <clipPath id="clip0_1_324">
            <rect fill="white" height="56" width="56" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-[105px]">
      <ToolsSvgrepoCom />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[21px] text-center w-[min-content]" style={{ color: "var(--primary-color)" }}>Tools</p>
    </div>
  );
}

function Frame33() {
  return (
    <div data-tools-button="true" data-tile="true" className="ci-tile-small content-stretch flex h-[144px] items-center justify-center p-[20px] relative rounded-[10px] shrink-0 w-[170px] cursor-pointer active:scale-95 transition-all">
      <Frame10 />
    </div>
  );
}

function Frame46() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-end relative shrink-0">
      <Frame9 />
      <Frame30 />
      <Frame32 />
      <Frame33 />
    </div>
  );
}

function AutoStories() {
  return (
    <div className="h-[57.75px] relative shrink-0 w-[70px]" data-name="auto_stories">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70 58">
        <g id="auto_stories">
          <mask height="58" id="mask0_1_312" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="70" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="57.75" id="Bounding box" width="70" />
          </mask>
          <g mask="url(#mask0_1_312)">
            <path d={svgPaths.p3c2f6700} fill="var(--primary-color)" id="auto_stories_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-[105px]">
      <AutoStories />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[21px] text-center w-[min-content]" style={{ color: "var(--primary-color)" }}>Reading</p>
    </div>
  );
}

function Frame29() {
  return (
    <div data-reading-button="true" data-tile="true" className="ci-tile-small content-stretch flex h-[144px] items-center justify-center p-[20px] relative rounded-[10px] shrink-0 w-[170px] cursor-pointer active:scale-95 transition-all">
      <Frame11 />
    </div>
  );
}

function GooglehangoutsmeetSvgrepoCom() {
  return (
    <div className="h-[54px] relative shrink-0 w-[53px]" data-name="googlehangoutsmeet-svgrepo-com 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 53 54">
        <g clipPath="url(#clip0_1_309)" id="googlehangoutsmeet-svgrepo-com 1">
          <path d={svgPaths.p2c1d600} fill="var(--primary-color)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_309">
            <rect fill="white" height="54" width="53" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-[105px]">
      <GooglehangoutsmeetSvgrepoCom />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[21px] text-center w-[min-content]" style={{ color: "var(--primary-color)" }}>Meeting</p>
    </div>
  );
}

function Frame31() {
  return (
    <div data-meeting-button="true" data-tile="true" className="ci-tile-small content-stretch flex h-[144px] items-center justify-center p-[20px] relative rounded-[10px] shrink-0 w-[170px] cursor-pointer active:scale-95 transition-all">
      <Frame12 />
    </div>
  );
}

function Frame13() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-center min-h-px min-w-px relative shrink-0">
      <div className="h-[46.507px] relative shrink-0 w-[48.83px]" data-name="captive_portal">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 49 47">
          <path d={svgPaths.p33d70d00} fill="var(--primary-color)" id="captive_portal" />
        </svg>
      </div>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[21px] text-center w-[min-content]" style={{ color: "var(--primary-color)" }}>Internet</p>
    </div>
  );
}

function Frame35() {
  return (
    <div data-internet-button="true" data-tile="true" className="ci-tile-small content-stretch flex h-[144px] items-center justify-center px-[8px] py-[20px] relative rounded-[10px] shrink-0 w-[170px] cursor-pointer active:scale-95 transition-all">
      <Frame13 />
    </div>
  );
}

function ChatInfo() {
  return (
    <div className="h-[57.75px] relative shrink-0 w-[70px]" data-name="chat_info">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70 58">
        <g id="chat_info">
          <mask height="58" id="mask0_1_300" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="70" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="57.75" id="Bounding box" width="70" />
          </mask>
          <g mask="url(#mask0_1_300)">
            <path d={svgPaths.p29b4e800} fill="var(--primary-color)" id="chat_info_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame14() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-center min-h-px min-w-px relative shrink-0">
      <ChatInfo />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[21px] text-center w-[min-content]" style={{ color: "var(--primary-color)" }}>About Us</p>
    </div>
  );
}

function Frame34() {
  return (
    <div data-aboutus-button="true" data-tile="true" className="ci-tile-small content-stretch flex h-[144px] items-center justify-center px-0 py-[20px] relative rounded-[10px] shrink-0 w-[170px] cursor-pointer active:scale-95 transition-all">
      <Frame14 />
    </div>
  );
}

function Frame47() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0">
      <Frame29 />
      <Frame31 />
      <Frame35 />
      <Frame34 />
    </div>
  );
}

function Frame48({ style }: { style?: CSSProperties }) {
  return (
    <div data-tile-group="left-small" style={style} className="absolute bottom-[30.24px] content-stretch flex gap-[8px] items-center left-[30px]">
      <Frame46 />
      <Frame47 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[12.39%_12.81%_0_0]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="Group">
          <path d={svgPaths.p25561e00} fill="var(--primary-color)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-[12.39%_12.81%_0_0]" data-name="Group">
      <Group />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute inset-[26.55%_26.55%_47.69%_47.69%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Group">
          <path d={svgPaths.p20224400} fill="var(--primary-color)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents inset-[26.55%_26.55%_47.69%_47.69%]" data-name="Group">
      <Group3 />
    </div>
  );
}

// Group5 to 8 also updated
function Group5() {
  return (
    <div className="absolute inset-[13.2%_13.2%_47.69%_47.69%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Group">
          <path d={svgPaths.p42a7e80} fill="var(--primary-color)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents inset-[13.2%_13.2%_47.69%_47.69%]" data-name="Group">
      <Group5 />
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute inset-[0_0_47.69%_47.69%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Group">
          <path d={svgPaths.p1ab95e00} fill="var(--primary-color)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute contents inset-[0_0_47.69%_47.69%]" data-name="Group">
      <Group7 />
    </div>
  );
}

function TelephonePhoneSvgrepoCom() {
  return (
    <div className="overflow-clip relative shrink-0 size-[45px]" data-name="telephone-phone_svgrepo.com">
      <Group2 />
      <Group4 />
      <Group6 />
      <Group8 />
    </div>
  );
}

function Frame15() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-center min-h-px min-w-px relative shrink-0">
      <TelephonePhoneSvgrepoCom />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[21px] text-center w-[min-content]" style={{ color: "var(--primary-color)" }}>Call</p>
    </div>
  );
}

function Frame36() {
  return (
    <div data-call-button="true" data-tile="true" className="ci-tile-small content-stretch flex h-[140px] items-center justify-center px-0 py-[20px] relative rounded-[10px] shrink-0 w-[158px] cursor-pointer active:scale-95 transition-all">
      <Frame15 />
    </div>
  );
}

function Frame54() {
  return (
    <div className="relative shrink-0 size-[45px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 45 45">
        <g id="Frame 1410128765">
          <path clipRule="evenodd" d={svgPaths.p1d47bc00} fill="var(--primary-color)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame16() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-center min-h-px min-w-px relative shrink-0">
      <Frame54 />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[21px] text-center w-[min-content]">Consultation</p>
    </div>
  );
}

function Frame49() {
  return (
    <div data-consultation-button="true" data-tile="true" className="ci-tile-small content-stretch flex h-[140px] items-center justify-center px-0 py-[20px] relative rounded-[10px] shrink-0 w-[158px] cursor-pointer active:scale-95 transition-all">
      <Frame16 />
    </div>
  );
}

function StreamlinePlumpHorizontalSliderSquareSolid() {
  return (
    <div className="relative shrink-0 size-[45px]" data-name="streamline-plump:horizontal-slider-square-solid">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 45 45">
        <g id="streamline-plump:horizontal-slider-square-solid">
          <path clipRule="evenodd" d={svgPaths.p2f36a500} fill="var(--primary-color)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame17() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-center min-h-px min-w-px relative shrink-0">
      <StreamlinePlumpHorizontalSliderSquareSolid />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[21px] text-center w-[min-content]" dir="auto" style={{ color: "var(--primary-color)" }}>
        Room Control
      </p>
    </div>
  );
}

function Frame52() {
  return (
    <div data-roomcontrol-button="true" data-tile="true" className="ci-tile-small content-stretch flex h-[140px] items-center justify-center px-0 py-[20px] relative rounded-[10px] shrink-0 w-[158px] cursor-pointer active:scale-95 transition-all">
      <Frame17 />
    </div>
  );
}

function NounChromecast() {
  return (
    <div className="h-[46px] relative shrink-0 w-[50px]" data-name="noun-chromecast-5203173 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 46">
        <g id="noun-chromecast-5203173 1">
          <path d={svgPaths.p32de3b00} fill="var(--primary-color)" id="Vector" />
          <path d={svgPaths.p36f33780} fill="var(--primary-color)" id="Vector_2" />
          <path d={svgPaths.p1980b300} fill="var(--primary-color)" id="Vector_3" />
          <path d={svgPaths.p2413e380} fill="var(--primary-color)" id="Vector_4" />
        </g>
      </svg>
    </div>
  );
}

function Frame18() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-center min-h-px min-w-px relative shrink-0">
      <NounChromecast />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[21px] text-center w-[min-content]" dir="auto" style={{ color: "var(--primary-color)" }}>
        Casting
      </p>
    </div>
  );
}

function Frame51() {
  return (
    <div data-casting-button="true" data-tile="true" className="ci-tile-small content-stretch flex h-[140px] items-center justify-center px-0 py-[20px] relative rounded-[10px] shrink-0 w-[158px] cursor-pointer active:scale-95 transition-all">
      <Frame18 />
    </div>
  );
}

function Frame53({ style }: { style?: CSSProperties }) {
  return (
    <div data-tile-group="bottom" style={style} className="absolute bottom-[29px] content-stretch flex gap-[4px] items-center left-[calc(50%-37px)] translate-x-[-50%]">
      <Frame36 />
      <Frame49 />
      <Frame52 />
      <Frame51 />
    </div>
  );
}

function TvScreenPlayMovieHomeSvgrepoCom() {
  return (
    <div className="relative shrink-0 size-[75px]" data-name="tv-screen-play-movie-home-svgrepo-com 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 75 75">
        <g id="tv-screen-play-movie-home-svgrepo-com 1">
          <path d={svgPaths.p16434c00} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame19() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-center min-h-px min-w-px relative shrink-0">
      <TvScreenPlayMovieHomeSvgrepoCom />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[20px] text-center text-white w-[min-content]">Live TV</p>
    </div>
  );
}

function Frame41() {
  return (
    <div data-livetv-button="true" data-tile="true" className="ci-tile-large content-stretch flex items-center justify-center px-0 py-[20px] relative rounded-[10px] shrink-0 size-[200px] cursor-pointer active:scale-95 transition-all">
      <Frame19 />
    </div>
  );
}

function Group9() {
  return (
    <div className="absolute inset-[19.93%_0]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 75 46">
        <g id="Group">
          <path clipRule="evenodd" d={svgPaths.p28d18e80} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function FoodDishSvgrepoCom() {
  return (
    <div className="overflow-clip relative shrink-0 size-[75px]" data-name="food-dish-svgrepo-com 1">
      <Group9 />
    </div>
  );
}

function Frame20() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-center min-h-px min-w-px relative shrink-0">
      <FoodDishSvgrepoCom />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[20px] text-center text-white w-[min-content]">Food Order</p>
    </div>
  );
}

function Frame40() {
  return (
    <div data-foodorder-button="true" data-tile="true" className="ci-tile-large content-stretch flex items-center justify-center px-0 py-[20px] relative rounded-[10px] shrink-0 size-[200px] cursor-pointer active:scale-95 transition-all">
      <Frame20 />
    </div>
  );
}

function Frame21() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-center min-h-px min-w-px relative shrink-0">
      <div className="h-[68px] relative shrink-0 w-[50px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 68">
          <path clipRule="evenodd" d={svgPaths.p11a71a80} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
        </svg>
      </div>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.1] min-w-full not-italic relative shrink-0 text-[20px] text-center text-white w-[min-content]">Room Service</p>
    </div>
  );
}

function Frame55() {
  return (
    <div data-roomservice-button="true" data-tile="true" className="ci-tile-large content-stretch flex items-center justify-center px-0 py-[20px] relative rounded-[10px] shrink-0 size-[200px] cursor-pointer active:scale-95 transition-all">
      <Frame21 />
    </div>
  );
}

function Frame43() {
  return (
    <div data-tile-group="right-large" className="content-stretch flex gap-[8px] items-center justify-end relative shrink-0 w-full">
      <Frame41 />
      <Frame40 />
      <Frame55 />
    </div>
  );
}

function Book() {
  return (
    <div className="absolute left-[0.2px] size-[75px] top-[0.97px]" data-name="book_2">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 75 75">
        <g id="book_2">
          <mask height="75" id="mask0_1_316" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="75" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="75" id="Bounding box" width="75" />
          </mask>
          <g mask="url(#mask0_1_316)">
            <path d={svgPaths.p90c3c00} fill="var(--fill-0, white)" id="book_2_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function FeedbackSvgrepoCom1() {
  return (
    <div className="overflow-clip relative shrink-0 size-[74px]" data-name="feedback-svgrepo-com 2">
      <Book />
    </div>
  );
}

function Frame22() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow h-[108px] items-center min-h-px min-w-px relative shrink-0">
      <FeedbackSvgrepoCom1 />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[20px] text-center text-white w-[min-content]" dir="auto">
        Eductaion
      </p>
    </div>
  );
}

function Frame56() {
  return (
    <div data-education-button="true" data-tile="true" className="ci-tile-large content-stretch flex items-center justify-center px-0 py-[20px] relative rounded-[10px] shrink-0 size-[200px] cursor-pointer active:scale-95 transition-all">
      <Frame22 />
    </div>
  );
}

function FeedbackSvgrepoCom() {
  return (
    <div className="relative shrink-0 size-[75px]" data-name="feedback-svgrepo-com 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 75 75">
        <g id="feedback-svgrepo-com 1">
          <path d={svgPaths.p109b3100} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame23() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-center min-h-px min-w-px relative shrink-0">
      <FeedbackSvgrepoCom />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] min-w-full not-italic relative shrink-0 text-[20px] text-center text-white w-[min-content]">Feedback</p>
    </div>
  );
}

function Frame42() {
  return (
    <div data-feedback-button="true" data-tile="true" className="ci-tile-large content-stretch flex items-center justify-center px-0 py-[20px] relative rounded-[10px] shrink-0 size-[200px] cursor-pointer active:scale-95 transition-all">
      <Frame23 />
    </div>
  );
}

function Frame24() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-center min-h-px min-w-px relative shrink-0">
      <div className="h-[68px] relative shrink-0 w-[65px]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 65 68">
          <path clipRule="evenodd" d={svgPaths.p35e3aa00} fill="var(--fill-0, white)" fillRule="evenodd" id="Vector" />
        </svg>
      </div>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.1] min-w-full not-italic relative shrink-0 text-[20px] text-center text-white w-[min-content]">CareMe</p>
    </div>
  );
}

function Frame57() {
  return (
    <div data-careme-button="true" data-tile="true" className="ci-tile-accent content-stretch flex items-center justify-center px-0 py-[20px] relative rounded-[10px] shrink-0 size-[200px] cursor-pointer active:scale-95 transition-all">
      <Frame24 />
    </div>
  );
}

function Frame44() {
  return (
    <div data-tile-group="right-medium" className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Frame56 />
      <Frame42 />
      <Frame57 />
    </div>
  );
}

function Frame45({ style }: { style?: CSSProperties }) {
  return (
    <div data-tile-group="main-right" style={style} className="absolute bottom-[30px] content-stretch flex flex-col gap-[8px] items-end right-[30px]">
      {/* Patient name / info — left-aligned, directly above the Live TV / Food Order / Room Service row */}
      <div className="flex flex-col gap-[4px] items-start text-left w-full pl-[2px] pb-[4px]">
        <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold not-italic text-[24px] leading-[30px]" dir="auto" style={{ color: "var(--primary-color)" }}>
          <span>{`Sara Saleh `}</span>
          <span className="font-['Inter:Regular',sans-serif] font-normal" style={{ color: "var(--primary-dark)" }}>| MRN: 14789521</span>
        </p>
        <p className="font-['Inter:Italic',sans-serif] font-normal italic text-[15px] leading-[18px]" dir="auto" style={{ color: "var(--primary-color)", opacity: 0.7 }}>
          Welcome to CareInn Hospital. We wish you a speedy recovery!
        </p>
      </div>
      <Frame43 />
      <Frame44 />
    </div>
  );
}

function Group11() {
  const [hasCustomBackground, setHasCustomBackground] = useState(false);
  const [brandLogo, setBrandLogo] = useState<string | null>(null);

  useEffect(() => {
    const checkBackground = () => {
      const val = localStorage.getItem('careinn-bg-image');
      setHasCustomBackground(val !== null && val !== '' && val !== 'null' && val !== 'undefined');
    };
    const checkLogo = () => {
      try {
        const val = localStorage.getItem('careinn-brand-logo');
        setBrandLogo(val && val !== 'null' && val !== '' ? val : null);
      } catch { setBrandLogo(null); }
    };

    checkBackground();
    checkLogo();

    const checkAll = () => { checkBackground(); checkLogo(); };
    window.addEventListener('storage', checkAll);
    window.addEventListener('backgroundChanged', checkBackground);
    window.addEventListener('brandLogoChanged', checkLogo);

    return () => {
      window.removeEventListener('storage', checkAll);
      window.removeEventListener('backgroundChanged', checkBackground);
      window.removeEventListener('brandLogoChanged', checkLogo);
    };
  }, []);

  // Don't render the logo if custom background is active
  if (hasCustomBackground) {
    return null;
  }

  // Show custom brand logo instead of CareInn SVG if set
  if (brandLogo) {
    return (
      <div className="absolute left-[761px] top-[433px] w-[395.243px] h-[197.705px] flex items-center justify-center">
        <img
          src={brandLogo}
          alt="Brand logo"
          className="max-w-full max-h-full object-contain"
          style={{ opacity: 0.15 }}
        />
      </div>
    );
  }

  return (
    <div className="absolute h-[197.705px] left-[761px] top-[433px] w-[395.243px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 396 198">
        <g id="Group 1000005196">
          <path d={svgPaths.p621ed00} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p15cf8900} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p197ad200} fill="var(--primary-color)" id="Vector_3" />
          <path d={svgPaths.p3b434de0} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.p2b8cf500} fill="var(--primary-color)" id="Vector_5" />
          <path d={svgPaths.p34714280} fill="var(--fill-0, white)" id="Vector_6" />
          <path d={svgPaths.p2363e971} fill="var(--primary-color)" id="Vector_7" />
          <path d={svgPaths.p3376ab00} fill="var(--accent-color)" id="Vector_8" />
          <path d={svgPaths.p3ad25500} fill="var(--primary-color)" id="Vector_9" />
          <path d={svgPaths.p3c8b43c0} fill="var(--primary-color)" id="Vector_10" />
          <path d={svgPaths.pc311bf0} fill="var(--primary-color)" id="Vector_11" />
          <path d={svgPaths.p2436fc00} fill="var(--accent-color)" id="Vector_12" />
          <path d={svgPaths.p47fcff0} fill="var(--accent-color)" id="Vector_13" />
          <path d={svgPaths.p128cb080} fill="var(--accent-color)" id="Vector_14" />
          <path d={svgPaths.p9c7fe00} fill="var(--accent-color)" id="Vector_15" />
          <path d={svgPaths.p33373e00} fill="var(--primary-color)" id="Vector_16" />
          <path d={svgPaths.p3807a400} fill="var(--primary-color)" id="Vector_17" />
          <path d={svgPaths.p2cd79ac0} fill="var(--primary-color)" id="Vector_18" />
          <path d={svgPaths.p15c147b0} fill="var(--primary-color)" id="Vector_19" />
          <path d={svgPaths.p10ace100} fill="var(--primary-color)" id="Vector_20" />
          <path d={svgPaths.p2e5e6a00} fill="var(--primary-color)" id="Vector_21" />
          <path d={svgPaths.p3e777700} fill="var(--fill-0, white)" id="Vector_22" />
          <path d={svgPaths.p1f4edcd0} fill="var(--fill-0, white)" id="Vector_23" />
          <path d={svgPaths.pe43ca00} fill="var(--fill-0, white)" id="Vector_24" />
          <path d={svgPaths.p1abdde00} fill="var(--primary-color)" id="Vector_25" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold gap-[10px] items-center justify-center leading-[16px] not-italic p-[10px] relative shrink-0 text-center text-nowrap w-[72px]" style={{ color: "var(--primary-color)" }}>
      <p className="relative shrink-0 text-[20px]">Fajr</p>
      <p className="relative shrink-0 text-[16px]">4:32 AM</p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold gap-[10px] items-center justify-center leading-[16px] not-italic p-[10px] relative shrink-0 text-center text-nowrap w-[72px]" style={{ color: "var(--accent-color)" }}>
      <p className="relative shrink-0 text-[20px]">Dhuhr</p>
      <p className="relative shrink-0 text-[16px]">12:32 PM</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold gap-[10px] items-center justify-center leading-[16px] not-italic p-[10px] relative shrink-0 text-center text-nowrap w-[72px]" style={{ color: "var(--primary-color)" }}>
      <p className="relative shrink-0 text-[20px]">Asr</p>
      <p className="relative shrink-0 text-[16px]">3:44 PM</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold gap-[10px] items-center justify-center leading-[16px] not-italic p-[10px] relative shrink-0 text-center text-nowrap w-[72px]" style={{ color: "var(--primary-color)" }}>
      <p className="relative shrink-0 text-[20px]">Maghrib</p>
      <p className="relative shrink-0 text-[16px]">7:08 PM</p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold gap-[10px] items-center justify-center leading-[16px] not-italic p-[10px] relative shrink-0 text-center text-nowrap w-[72px]" style={{ color: "var(--primary-color)" }}>
      <p className="relative shrink-0 text-[20px]">Isha</p>
      <p className="relative shrink-0 text-[16px]">8:38 PM</p>
    </div>
  );
}

function Frame5() {
  return (
    <div data-prayer-row className="absolute content-stretch flex gap-[24px] items-start left-[calc(50%-43px)] p-[10px] top-[181px] translate-x-[-50%]">
      <Frame />
      <Frame1 />
      <Frame2 />
      <Frame3 />
      <Frame4 />
    </div>
  );
}

export default function CiHomescreen({
  onOpenSettings,
  onOpenCategory,
  onOpenSurvey,
  onLaunchTool,
  onOpenAboutUs,
  onShowCareMeExpanded,
  onShowIptv,
  onShowFoodOrder,
  onShowCall,
  onOpenNotifications,
  unreadCount,
  onDhuhrTap,
}: CiHomescreenProps) {
  const { layout2Theme, theme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Per-tile-group appearance (Layout 2 only). Unset groups fall back to the
  // active hospital theme via tileGroupVars(), so they stay in sync with Layout 1.
  const tileGroups = layout2Theme.tileGroups ?? DEFAULT_TILE_GROUPS;
  const leftTileVars = tileGroupVars(tileGroups.left, theme, "small");
  const bottomTileVars = tileGroupVars(tileGroups.bottom, theme, "small");
  const mainTileVars = tileGroupVars(tileGroups.main, theme, "large");

  useEffect(() => {
    if (!containerRef.current) return;

    const listeners: Array<[string, () => void]> = [
      ["[data-games-button]", () => onOpenCategory("Games")],
      ["[data-reading-button]", () => onOpenCategory("Reading")],
      ["[data-social-button]", () => onOpenCategory("Social")],
      ["[data-meeting-button]", () => onOpenCategory("Meeting")],
      ["[data-media-button]", () => onOpenCategory("Media")],
      ["[data-internet-button]", () => onOpenCategory("Internet")],
      ["[data-tools-button]", () => onOpenCategory("Tools")],
      ["[data-aboutus-button]", () => onOpenAboutUs()],
      ["[data-livetv-button]", () => onShowIptv()],
      ["[data-foodorder-button]", () => onShowFoodOrder()],
      ["[data-roomservice-button]", () => onOpenCategory("Housekeeping")],
      ["[data-education-button]", () => onOpenCategory("Education")],
      ["[data-feedback-button]", () => onOpenSurvey()],
      ["[data-careme-button]", () => onShowCareMeExpanded()],
      ["[data-call-button]", () => onShowCall()],
      ["[data-consultation-button]", () => onOpenCategory("Consultation")],
      ["[data-roomcontrol-button]", () => onLaunchTool("roomcontrol")],
      ["[data-casting-button]", () => onLaunchTool("mirror")],
    ];

    const cleanups = listeners.map(([selector, handler]) => {
      const element = containerRef.current?.querySelector<HTMLElement>(selector);
      if (element) {
        element.style.cursor = "pointer";
        element.addEventListener("click", handler);
      }
      return () => {
        if (element) element.removeEventListener("click", handler);
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [
    onOpenSettings,
    onOpenCategory,
    onOpenSurvey,
    onLaunchTool,
    onOpenAboutUs,
    onShowCareMeExpanded,
    onShowIptv,
    onShowFoodOrder,
    onShowCall,
  ]);

  return (
    <div className="bg-transparent relative size-full" data-name="(CI) homescreen" ref={containerRef}>
      <style>{`
        /* Tile colours are driven by region-scoped CSS vars set per tile group
           (see tileGroupVars). Each group: --ci-tile-bg (background base),
           --ci-tile-bg-opacity (0–100), --ci-tile-scale, and the icon colour
           (--primary-color for small tiles, --ci-tile-icon/--fill-0 for large).
           Fallbacks reproduce the original look so untouched tiles are unchanged. */
        .ci-tile-small {
          background-color: color-mix(in srgb, var(--ci-tile-bg, var(--primary-color)) calc(var(--ci-tile-bg-opacity, 10) * 1%), transparent) !important;
          color: var(--primary-color) !important;
        }
        .ci-tile-small:hover {
          background-color: color-mix(in srgb, var(--ci-tile-bg, var(--primary-color)) min(100%, calc((var(--ci-tile-bg-opacity, 10) + 10) * 1%)), transparent) !important;
        }
        .ci-tile-large {
          background-color: color-mix(in srgb, var(--ci-tile-bg, var(--primary-color)) calc(var(--ci-tile-bg-opacity, 100) * 1%), transparent) !important;
        }
        .ci-tile-large:hover {
          background-color: color-mix(in srgb, black 12%, var(--ci-tile-bg, var(--primary-color))) !important;
        }
        .ci-tile-accent {
          background-color: color-mix(in srgb, var(--ci-tile-bg, var(--accent-color)) calc(var(--ci-tile-bg-opacity, 100) * 1%), transparent) !important;
        }
        .ci-tile-accent:hover {
          background-color: color-mix(in srgb, black 12%, var(--ci-tile-bg, var(--accent-color))) !important;
        }
        /* Per-group scale (skipped while pressed so the active:scale-95 tap stays) */
        .ci-tile-small:not(:active),
        .ci-tile-large:not(:active),
        .ci-tile-accent:not(:active) {
          scale: var(--ci-tile-scale, 1);
        }
        /* Large/accent tile labels follow the group icon colour (icons use --fill-0) */
        [data-tile-group="main-right"] .ci-tile-large p,
        [data-tile-group="main-right"] .ci-tile-accent p {
          color: var(--ci-tile-icon, #ffffff) !important;
        }
      `}</style>
      {/* Header — Layout 1's TopBar (logo left, prayers centered, right cluster:
          time/date, weather, language, notifications, settings). Theme-driven,
          so logo + brand colors follow the active hospital. */}
      <div className="absolute left-0 right-0 top-0 z-20">
        <TopBar 
          onSettingsTap={onOpenSettings} 
          onBellTap={onOpenNotifications} 
          unreadCount={unreadCount} 
          onDhuhrTap={onDhuhrTap}
          logoUrl={layout2Theme.clientLogo || undefined}
        />
      </div>
      <div className="absolute left-0 right-0 top-[104px] z-10">
        <NewsTicker />
      </div>
      <Frame48 style={leftTileVars} />
      <Frame53 style={bottomTileVars} />
      <Frame45 style={mainTileVars} />
      {/* Large centered CareInn watermark logo removed — branding now comes from
          Layout 1's hospital config (logo in TopBar + hospital background photo) */}
      {/* Standalone prayer row removed — prayers now live in the TopBar header */}
    </div>
  );
}