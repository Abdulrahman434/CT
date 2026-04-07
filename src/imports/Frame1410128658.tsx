import svgPaths from "./svg-chdiyse32e";

function Group() {
  return (
    <div className="absolute inset-[9.99%_7.78%_0.78%_7.78%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.2679 21.416">
        <g id="Group">
          <g id="Vector" />
          <path d={svgPaths.p1b1c4400} fill="var(--fill-0, #255997)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function MingcuteAlertFill() {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]" data-name="mingcute:alert-fill">
      <Group />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-center relative shrink-0 w-full">
      <MingcuteAlertFill />
      <p className="flex-[1_0_0] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[30px] min-h-px min-w-px not-italic relative text-[#171717] text-[18px]" dir="auto">{`Reported Pain `}</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[14px] whitespace-nowrap">
        <p className="leading-none">Pain Score : 5</p>
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start justify-center min-h-px min-w-px relative">
      <Frame3 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[9.99%_7.78%_0.78%_7.78%]" data-name="Group">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.2679 21.416">
        <g id="Group">
          <g id="Vector" />
          <path d={svgPaths.p1b1c4400} fill="var(--fill-0, #FFC107)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function MingcuteAlertFill1() {
  return (
    <div className="overflow-clip relative shrink-0 size-[24px]" data-name="mingcute:alert-fill">
      <Group1 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-[rgba(255,193,7,0.1)] relative rounded-[12px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border-[#ffc107] border-l-4 border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[15px] py-[12px] relative w-full">
          <Frame4 />
          <MingcuteAlertFill1 />
        </div>
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative size-full">
      <Frame1 />
      <Frame2 />
    </div>
  );
}