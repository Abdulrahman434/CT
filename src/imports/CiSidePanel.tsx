import svgPaths from "./svg-vkxqhyc7og";
import imgFrame1000004914 from "figma:asset/b51acb5e2ec4a2c930572c53103b020b12e76ee2.png";
import imgFrame1410128055 from "figma:asset/cbc2945cb46a30e6e77e7c487cbbdc266e1f1f00.png";
import imgFrame1000004915 from "figma:asset/ddf863ede0545631d224e1fef0adc017dce15ed1.png";
import imgFrame1000004916 from "figma:asset/691f8a9ee00a445795f764f9d4b89c06c45afabe.png";

function Frame() {
  return (
    <div className="relative rounded-[43px] shrink-0 size-[35px]">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[43px] size-full" src={imgFrame1000004914} />
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-[246px]">
      <Frame />
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[18px] text-center text-white w-[183px]">UPCOMING PRAYER</p>
    </div>
  );
}

function Frame20() {
  return (
    <div className="content-stretch flex font-['Inter:Bold',sans-serif] font-bold items-center justify-center leading-[normal] not-italic relative shrink-0 text-[26px] text-center text-white w-[241px]">
      <p className="basis-0 grow min-h-px min-w-px relative shrink-0">Maghrib:</p>
      <p className="basis-0 grow min-h-px min-w-px relative shrink-0">18:46</p>
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[15px] items-start justify-center relative shrink-0 w-[266px]">
      <Frame21 />
      <Frame20 />
    </div>
  );
}

function Component() {
  return (
    <div className="h-[27px] relative shrink-0 w-[99px]" data-name="00:12:04">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold inset-0 leading-[normal] not-italic text-[22px] text-center text-nowrap text-white">00:12:04</p>
    </div>
  );
}

function Rectangle() {
  return (
    <div className="h-[31px] relative shrink-0 w-[34px]">
      <div className="absolute bg-white border border-[#d9d9d9] border-solid inset-0" />
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex gap-[15px] items-center relative shrink-0 w-full">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[22px] text-center text-nowrap text-white" dir="auto">{`Notify me? `}</p>
      <Rectangle />
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start justify-center relative shrink-0">
      <Component />
      <Frame5 />
    </div>
  );
}

function Frame40() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0">
      <Frame6 />
      <Frame8 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex h-[137px] items-center justify-center relative rounded-[10px] shrink-0 w-[537px]">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[10px]">
        <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-[10px] size-full" src={imgFrame1410128055} />
        <div className="absolute bg-[rgba(0,0,0,0.25)] inset-0 rounded-[10px]" />
      </div>
      <Frame40 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex gap-[15px] items-center relative shrink-0 w-[100px]">
      <div className="relative shrink-0 size-[28px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
          <circle cx="14" cy="14" fill="url(#paint0_radial_1_647)" id="Ellipse 1354" r="13.5" stroke="var(--stroke-0, #D59F02)" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(14 14) rotate(90) scale(14)" gradientUnits="userSpaceOnUse" id="paint0_radial_1_647" r="1">
              <stop stopColor="#FAD800" />
              <stop offset="1" stopColor="#FFC70D" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[39px] not-italic relative shrink-0 text-[18px] text-nowrap text-white">Sunny</p>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[39px] not-italic relative shrink-0 text-[18px] text-white w-[80px]">Riyadh</p>
      <Frame10 />
      <p className="font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[39px] not-italic relative shrink-0 text-[14px] text-right text-white w-[27px]">32ْ</p>
    </div>
  );
}

function Cloud() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="cloud">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="cloud">
          <mask height="28" id="mask0_1_639" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="28" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="28" id="Bounding box" width="28" />
          </mask>
          <g mask="url(#mask0_1_639)">
            <path d={svgPaths.p1cf1d770} fill="url(#paint0_linear_1_639)" id="cloud_2" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_639" x1="14" x2="14" y1="4.66667" y2="23.3333">
            <stop stopColor="white" />
            <stop offset="1" stopColor="#FEFEFE" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex gap-[15px] items-center relative shrink-0 w-[100px]">
      <Cloud />
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[39px] not-italic relative shrink-0 text-[18px] text-nowrap text-white">Cloudy</p>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[39px] not-italic relative shrink-0 text-[18px] text-white w-[80px]">Jeddah</p>
      <Frame14 />
      <p className="font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[39px] not-italic relative shrink-0 text-[14px] text-right text-white w-[25px]">32ْ</p>
    </div>
  );
}

function Cloud1() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="cloud">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="cloud">
          <mask height="28" id="mask0_1_634" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="28" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="28" id="Bounding box" width="28" />
          </mask>
          <g mask="url(#mask0_1_634)">
            <path d={svgPaths.p1cf1d770} fill="url(#paint0_linear_1_634)" id="cloud_2" />
            <circle cx="6" cy="8" fill="url(#paint1_radial_1_634)" id="Ellipse 1354" r="5" stroke="var(--stroke-0, #D59F02)" />
          </g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_634" x1="14" x2="14" y1="4.66667" y2="23.3333">
            <stop stopColor="white" />
            <stop offset="1" stopColor="#FEFEFE" />
          </linearGradient>
          <radialGradient cx="0" cy="0" gradientTransform="translate(6 8) rotate(90) scale(5.5)" gradientUnits="userSpaceOnUse" id="paint1_radial_1_634" r="1">
            <stop stopColor="#FAD800" />
            <stop offset="1" stopColor="#FFC70D" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex gap-[15px] items-center relative shrink-0 w-[100px]">
      <Cloud1 />
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[39px] not-italic relative shrink-0 text-[18px] text-nowrap text-white">Partially Cloud</p>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[39px] not-italic relative shrink-0 text-[18px] text-white w-[80px]">Abha</p>
      <Frame15 />
      <p className="font-['Inter:Semi_Bold','Noto_Sans_Arabic:SemiBold',sans-serif] font-semibold leading-[39px] not-italic relative shrink-0 text-[14px] text-right text-white w-[28px]">22ْ</p>
    </div>
  );
}

function Frame38() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] items-start relative shrink-0 w-full">
      <p className="font-['Inter:Medium',sans-serif] font-medium h-[40px] leading-[39px] not-italic relative shrink-0 text-[24px] text-white w-full">Today’s Weather</p>
      <Frame11 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 463 1">
            <line id="Line 121" stroke="var(--stroke-0, #D2D2D2)" x2="463" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Frame12 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 463 1">
            <line id="Line 121" stroke="var(--stroke-0, #D2D2D2)" x2="463" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <Frame13 />
    </div>
  );
}

function Frame39() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <Frame38 />
      <p className="[text-underline-position:from-font] absolute decoration-solid font-['Inter:Medium',sans-serif] font-medium leading-[39px] left-[411px] not-italic text-[14px] text-nowrap text-white top-0 underline">View all</p>
    </div>
  );
}

function Frame23() {
  return (
    <div className="backdrop-blur-[56.4px] backdrop-filter bg-[#16274d] content-stretch flex flex-col items-start px-[37px] py-[20px] relative rounded-[10px] shrink-0 w-[537px]">
      <Frame39 />
    </div>
  );
}

function IsolationMode() {
  return (
    <div className="h-[27px] relative shrink-0 w-[21px]" data-name="Isolation_Mode">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 27">
        <g clipPath="url(#clip0_1_653)" id="Isolation_Mode">
          <path d={svgPaths.p16eb1520} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.pa107200} fill="var(--fill-0, white)" id="Vector_2" />
          <path d={svgPaths.p389edf40} fill="var(--fill-0, #16274D)" id="Vector_3" />
          <path d={svgPaths.p3743fa00} fill="var(--fill-0, white)" id="Vector_4" />
          <path d={svgPaths.p2aa86480} fill="var(--fill-0, #16274D)" id="Vector_5" />
          <path d={svgPaths.p1bb19200} fill="var(--fill-0, white)" id="Vector_6" />
          <path d={svgPaths.p32a44380} fill="var(--fill-0, #16274D)" id="Vector_7" />
          <path d={svgPaths.p378f7c80} fill="var(--fill-0, #4EBEE3)" id="Vector_8" />
          <path d={svgPaths.p27b1300} fill="var(--fill-0, #16274D)" id="Vector_9" />
          <path d={svgPaths.p24acc500} fill="var(--fill-0, #16274D)" id="Vector_10" />
          <path d={svgPaths.p1f7caf80} fill="var(--fill-0, #16274D)" id="Vector_11" />
          <path d={svgPaths.pf255080} fill="var(--fill-0, #16274D)" id="Vector_12" />
          <path d={svgPaths.p271e3e00} fill="var(--fill-0, #16274D)" id="Vector_13" />
          <path d={svgPaths.p27bd9e00} fill="var(--fill-0, #16274D)" id="Vector_14" />
          <path d={svgPaths.p27c3e980} fill="var(--fill-0, white)" id="Vector_15" />
          <path d={svgPaths.pe0301f0} fill="var(--fill-0, white)" id="Vector_16" />
          <path d={svgPaths.p2546e300} fill="var(--fill-0, white)" id="Vector_17" />
          <path d={svgPaths.p34a52920} fill="var(--fill-0, #16274D)" id="Vector_18" />
        </g>
        <defs>
          <clipPath id="clip0_1_653">
            <rect fill="white" height="27" width="21" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center relative rounded-[43px] shrink-0 size-[35px]">
      <IsolationMode />
    </div>
  );
}

function Frame17() {
  return (
    <div className="content-stretch flex gap-[7px] items-start relative shrink-0 w-[458px]">
      <Frame1 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[39px] not-italic relative shrink-0 text-[16px] text-white w-[170px]" dir="auto">
        Test Alert: 1
      </p>
      <p className="font-['Inter:Light',sans-serif] font-light leading-[39px] not-italic relative shrink-0 text-[16px] text-right text-white w-[239px]" dir="auto">
        03:12 am
      </p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="relative rounded-[43px] shrink-0 size-[35px]">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[43px] size-full" src={imgFrame1000004915} />
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex gap-[7px] items-start relative shrink-0 w-full">
      <Frame2 />
      <p className="font-['Inter:Regular',sans-serif] font-normal h-[35px] leading-[39px] not-italic relative shrink-0 text-[16px] text-white w-[170px]" dir="auto">
        New Messages: 3
      </p>
      <p className="font-['Inter:Light',sans-serif] font-light leading-[39px] not-italic relative shrink-0 text-[16px] text-right text-white w-[239px]" dir="auto">
        09:47am
      </p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="relative rounded-[43px] shrink-0 size-[35px]">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[43px] size-full" src={imgFrame1000004914} />
    </div>
  );
}

function Frame19() {
  return (
    <div className="content-stretch flex gap-[7px] items-start relative shrink-0 w-full">
      <Frame3 />
      <p className="font-['Inter:Regular',sans-serif] font-normal h-[35px] leading-[39px] not-italic relative shrink-0 text-[16px] text-white w-[170px]" dir="auto">
        Asr Prayer Time
      </p>
      <p className="font-['Inter:Light',sans-serif] font-light leading-[39px] not-italic relative shrink-0 text-[16px] text-right text-white w-[239px]" dir="auto">
        15:21 am
      </p>
    </div>
  );
}

function Frame4() {
  return (
    <div className="relative rounded-[43px] shrink-0 size-[35px]">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[43px] size-full" src={imgFrame1000004916} />
    </div>
  );
}

function Frame24() {
  return (
    <div className="content-stretch flex gap-[7px] items-start relative shrink-0 w-full">
      <Frame4 />
      <p className="font-['Inter:Regular',sans-serif] font-normal h-[35px] leading-[39px] not-italic relative shrink-0 text-[16px] text-white w-[170px]" dir="auto">
        Files Downloaded: 1
      </p>
      <p className="font-['Inter:Light',sans-serif] font-light leading-[39px] not-italic relative shrink-0 text-[16px] text-right text-white w-[239px]" dir="auto">
        15:21 am
      </p>
    </div>
  );
}

function Frame25() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start justify-center relative shrink-0 w-[458px]">
      <Frame17 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-0.5px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 458 1">
            <line id="Line 121" stroke="var(--stroke-0, #D2D2D2)" strokeWidth="0.5" x2="458" y1="0.25" y2="0.25" />
          </svg>
        </div>
      </div>
      <Frame18 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-0.5px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 458 1">
            <line id="Line 121" stroke="var(--stroke-0, #D2D2D2)" strokeWidth="0.5" x2="458" y1="0.25" y2="0.25" />
          </svg>
        </div>
      </div>
      <Frame19 />
      <div className="h-0 relative shrink-0 w-full">
        <div className="absolute inset-[-0.5px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 458 1">
            <line id="Line 121" stroke="var(--stroke-0, #D2D2D2)" strokeWidth="0.5" x2="458" y1="0.25" y2="0.25" />
          </svg>
        </div>
      </div>
      <Frame24 />
    </div>
  );
}

function Frame16() {
  return (
    <div className="backdrop-blur-[56.4px] backdrop-filter bg-[rgba(0,0,0,0.5)] h-[302px] relative rounded-[10px] shrink-0 w-full">
      <div className="size-full">
        <div className="content-stretch flex flex-col gap-[20px] items-start pb-[20px] pt-[10px] px-[37px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium h-[34px] leading-[39px] not-italic relative shrink-0 text-[20px] text-white w-full">Notification</p>
          <Frame25 />
          <p className="[text-underline-position:from-font] absolute decoration-solid font-['Inter:Medium',sans-serif] font-medium leading-[39px] left-[467px] not-italic text-[14px] text-nowrap text-white top-px underline">View all</p>
        </div>
      </div>
    </div>
  );
}

function Frame37() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[537px]">
      <Frame16 />
    </div>
  );
}

function Stethoscope() {
  return (
    <div className="relative shrink-0 size-[47px]" data-name="stethoscope">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47 47">
        <g id="stethoscope">
          <mask height="47" id="mask0_1_649" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="47" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="47" id="Bounding box" width="47" />
          </mask>
          <g mask="url(#mask0_1_649)">
            <path d={svgPaths.pe78d000} fill="var(--fill-0, white)" id="stethoscope_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame27() {
  return (
    <div className="[grid-area:1_/_1] backdrop-blur-[8.45px] backdrop-filter bg-[#df4354] content-stretch flex flex-col gap-[8px] h-[98px] items-center justify-center px-[40px] py-[8px] relative rounded-[10px] shrink-0 w-[202px]">
      <Stethoscope />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-nowrap text-white">
        <p className="leading-[normal]">(Admin Only)</p>
      </div>
    </div>
  );
}

function ModeNight() {
  return (
    <div className="relative shrink-0 size-[47px]" data-name="mode_night">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47 47">
        <g id="mode_night">
          <mask height="47" id="mask0_1_620" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="47" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="47" id="Bounding box" width="47" />
          </mask>
          <g mask="url(#mask0_1_620)">
            <path d={svgPaths.p120a80} fill="var(--fill-0, #1C1B1F)" id="mode_night_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame26() {
  return (
    <div className="[grid-area:1_/_3] backdrop-blur-[8.45px] backdrop-filter bg-[rgba(255,255,255,0.5)] content-stretch flex flex-col gap-[8px] items-center justify-center px-0 py-[8px] relative rounded-[10px] shrink-0 size-[98px]">
      <ModeNight />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center text-nowrap">
        <p className="leading-[normal]">Dark Mode</p>
      </div>
    </div>
  );
}

function Contrast() {
  return (
    <div className="relative shrink-0 size-[47px]" data-name="contrast">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47 47">
        <g id="contrast">
          <mask height="47" id="mask0_1_643" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="47" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="47" id="Bounding box" width="47" />
          </mask>
          <g mask="url(#mask0_1_643)">
            <path d={svgPaths.pe20ee80} fill="var(--fill-0, #1C1B1F)" id="contrast_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame36() {
  return (
    <div className="[grid-area:1_/_4] backdrop-blur-[8.45px] backdrop-filter bg-[rgba(255,255,255,0.5)] content-stretch flex flex-col gap-[8px] items-center justify-center px-[40px] py-[8px] relative rounded-[10px] shrink-0 size-[98px]">
      <Contrast />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center text-nowrap">
        <p className="leading-[normal]" dir="auto">
          Night Light
        </p>
      </div>
    </div>
  );
}

function NetworkWifi() {
  return (
    <div className="relative shrink-0 size-[47px]" data-name="network_wifi">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47 47">
        <g id="network_wifi">
          <mask height="47" id="mask0_1_616" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="47" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="47" id="Bounding box" width="47" />
          </mask>
          <g mask="url(#mask0_1_616)">
            <path d={svgPaths.p3e004880} fill="var(--fill-0, white)" id="network_wifi_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame34() {
  return (
    <div className="[grid-area:1_/_5] backdrop-blur-[8.45px] backdrop-filter bg-[#16274d] content-stretch flex flex-col gap-[8px] items-center justify-center px-[40px] py-[8px] relative rounded-[10px] shrink-0 size-[98px]">
      <NetworkWifi />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-nowrap text-white">
        <p className="leading-[normal]">Wi-Fi</p>
      </div>
    </div>
  );
}

function Language() {
  return (
    <div className="relative shrink-0 size-[47px]" data-name="language">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47 47">
        <g id="language">
          <mask height="47" id="mask0_1_608" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="47" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="47" id="Bounding box" width="47" />
          </mask>
          <g mask="url(#mask0_1_608)">
            <path d={svgPaths.p298d1a40} fill="var(--fill-0, #DF4354)" id="language_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame28() {
  return (
    <div className="[grid-area:2_/_1] backdrop-blur-[8.45px] backdrop-filter bg-white content-stretch flex flex-col gap-[8px] h-[98px] items-center justify-center px-[40px] py-[8px] relative rounded-[10px] shrink-0 w-[202px]">
      <Language />
      <div className="flex flex-col font-['Inter:Regular','Noto_Sans_Arabic:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center text-nowrap">
        <p className="leading-[normal]" dir="auto">
          اللغة العربية
        </p>
      </div>
    </div>
  );
}

function Bluetooth() {
  return (
    <div className="relative shrink-0 size-[47px]" data-name="bluetooth">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47 47">
        <g id="bluetooth">
          <mask height="47" id="mask0_1_604" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="47" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="47" id="Bounding box" width="47" />
          </mask>
          <g mask="url(#mask0_1_604)">
            <path d={svgPaths.p6500600} fill="var(--fill-0, #1C1B1F)" id="bluetooth_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame9() {
  return (
    <div className="[grid-area:2_/_3] backdrop-blur-[8.45px] backdrop-filter bg-[rgba(255,255,255,0.5)] content-stretch flex flex-col gap-[8px] items-center justify-center px-[40px] py-[8px] relative rounded-[10px] shrink-0 size-[98px]">
      <Bluetooth />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center text-nowrap">
        <p className="leading-[normal]">Bluetooth</p>
      </div>
    </div>
  );
}

function Cast() {
  return (
    <div className="relative shrink-0 size-[47px]" data-name="cast">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47 47">
        <g id="cast">
          <mask height="47" id="mask0_1_600" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="47" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="47" id="Bounding box" width="47" />
          </mask>
          <g mask="url(#mask0_1_600)">
            <path d={svgPaths.p12429100} fill="var(--fill-0, #1C1B1F)" id="cast_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame29() {
  return (
    <div className="[grid-area:2_/_4] backdrop-blur-[8.45px] backdrop-filter bg-[rgba(255,255,255,0.5)] content-stretch flex flex-col gap-[8px] items-center justify-center px-[40px] py-[8px] relative rounded-[10px] shrink-0 size-[98px]">
      <Cast />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center text-nowrap">
        <p className="leading-[normal]">Casting</p>
      </div>
    </div>
  );
}

function NotificationsOff() {
  return (
    <div className="relative shrink-0 size-[47px]" data-name="notifications_off">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47 47">
        <g id="notifications_off">
          <mask height="47" id="mask0_1_630" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="47" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="47" id="Bounding box" width="47" />
          </mask>
          <g mask="url(#mask0_1_630)">
            <path d={svgPaths.p2e445880} fill="var(--fill-0, white)" id="notifications_off_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame35() {
  return (
    <div className="[grid-area:2_/_5] backdrop-blur-[8.45px] backdrop-filter bg-[#16274d] content-stretch flex flex-col gap-[8px] items-center justify-center px-[40px] py-[8px] relative rounded-[10px] shrink-0 size-[98px]">
      <NotificationsOff />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-center text-nowrap text-white">
        <p className="leading-[normal]">Don’t Disturb</p>
      </div>
    </div>
  );
}

function RoundaboutRight() {
  return (
    <div className="relative shrink-0 size-[47px]" data-name="roundabout_right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47 47">
        <g id="roundabout_right">
          <mask height="47" id="mask0_1_612" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="47" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="47" id="Bounding box" width="47" />
          </mask>
          <g mask="url(#mask0_1_612)">
            <path d={svgPaths.p2d7f080} fill="var(--fill-0, #C776C6)" id="roundabout_right_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame22() {
  return (
    <div className="[grid-area:3_/_1] backdrop-blur-[8.45px] backdrop-filter bg-white content-stretch flex flex-col gap-[8px] items-center justify-center px-[40px] py-[8px] relative rounded-[10px] shrink-0 size-[98px]">
      <RoundaboutRight />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center text-nowrap">
        <p className="leading-[normal]">Tablet Guide</p>
      </div>
    </div>
  );
}

function RssFeed() {
  return (
    <div className="relative shrink-0 size-[47px]" data-name="rss_feed">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47 47">
        <g id="rss_feed">
          <mask height="47" id="mask0_1_596" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="47" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="47" id="Bounding box" width="47" />
          </mask>
          <g mask="url(#mask0_1_596)">
            <path d={svgPaths.p13483370} fill="var(--fill-0, #C776C6)" id="rss_feed_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame33() {
  return (
    <div className="[grid-area:3_/_2] backdrop-blur-[8.45px] backdrop-filter bg-white content-stretch flex flex-col gap-[8px] items-center justify-center px-[40px] py-[8px] relative rounded-[10px] shrink-0 size-[98px]">
      <RssFeed />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center text-nowrap">
        <p className="leading-[normal]">RSS Feed</p>
      </div>
    </div>
  );
}

function CustomTypography() {
  return (
    <div className="relative shrink-0 size-[47px]" data-name="custom_typography">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47 47">
        <g id="custom_typography">
          <mask height="47" id="mask0_1_679" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="47" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="47" id="Bounding box" width="47" />
          </mask>
          <g mask="url(#mask0_1_679)">
            <path d={svgPaths.p1c15380} fill="var(--fill-0, #1C1B1F)" id="custom_typography_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame31() {
  return (
    <div className="[grid-area:3_/_3] backdrop-blur-[8.45px] backdrop-filter bg-[rgba(255,255,255,0.5)] content-stretch flex flex-col gap-[8px] items-center justify-center px-[40px] py-[8px] relative rounded-[10px] shrink-0 size-[98px]">
      <CustomTypography />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center text-nowrap">
        <p className="leading-[normal]">Font Size</p>
      </div>
    </div>
  );
}

function BrightnessMedium() {
  return (
    <div className="relative shrink-0 size-[47px]" data-name="brightness_medium">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47 47">
        <g id="brightness_medium">
          <mask height="47" id="mask0_1_624" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="47" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="47" id="Bounding box" width="47" />
          </mask>
          <g mask="url(#mask0_1_624)">
            <path d={svgPaths.p2ecc5b00} fill="var(--fill-0, #1C1B1F)" id="brightness_medium_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame30() {
  return (
    <div className="[grid-area:3_/_4] backdrop-blur-[8.45px] backdrop-filter bg-[rgba(255,255,255,0.5)] content-stretch flex flex-col gap-[8px] items-center justify-center px-[40px] py-[8px] relative rounded-[10px] shrink-0 size-[98px]">
      <BrightnessMedium />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-black text-center text-nowrap">
        <p className="leading-[normal]">Brightness</p>
      </div>
    </div>
  );
}

function CleaningServices() {
  return (
    <div className="relative shrink-0 size-[29px]" data-name="cleaning_services">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 29 29">
        <g id="cleaning_services">
          <mask height="29" id="mask0_1_673" maskUnits="userSpaceOnUse" style={{ maskType: "alpha" }} width="29" x="0" y="0">
            <rect fill="var(--fill-0, #D9D9D9)" height="29" id="Bounding box" width="29" />
          </mask>
          <g mask="url(#mask0_1_673)">
            <path d={svgPaths.p15ea3f00} fill="var(--fill-0, #E74040)" id="cleaning_services_2" />
          </g>
        </g>
      </svg>
    </div>
  );
}

function Frame32() {
  return (
    <div className="[grid-area:3_/_5] backdrop-blur-[8.45px] backdrop-filter bg-[rgba(255,255,255,0.5)] content-stretch flex flex-col gap-[8px] items-center justify-center px-[40px] py-[8px] relative rounded-[10px] shrink-0 size-[98px]">
      <CleaningServices />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#e74040] text-[12px] text-center text-nowrap">
        <p className="leading-[normal]">Clear Data</p>
      </div>
    </div>
  );
}

function Frame41() {
  return (
    <div className="gap-[12px] grid grid-cols-[repeat(5,_minmax(0px,_1fr))] grid-rows-[repeat(3,_minmax(0px,_1fr))] h-[314px] relative shrink-0 w-[538px]">
      <Frame27 />
      <Frame26 />
      <Frame36 />
      <Frame34 />
      <Frame28 />
      <Frame9 />
      <Frame29 />
      <Frame35 />
      <Frame22 />
      <Frame33 />
      <Frame31 />
      <Frame30 />
      <Frame32 />
    </div>
  );
}

function Frame42() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0">
      <Frame7 />
      <Frame23 />
      <Frame37 />
      <Frame41 />
    </div>
  );
}

export default function CiSidePanel() {
  return (
    <div className="backdrop-blur-[28.3px] backdrop-filter bg-[rgba(255,255,255,0.2)] relative size-full" data-name="(CI) Side Panel">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col items-center px-[37px] py-[20px] relative size-full">
          <Frame42 />
        </div>
      </div>
    </div>
  );
}