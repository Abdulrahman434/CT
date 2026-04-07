import imgFrame1410128055 from "../assets/cbc2945cb46a30e6e77e7c487cbbdc266e1f1f00.png";
import imgFrame1000004914 from "../assets/b51acb5e2ec4a2c930572c53103b020b12e76ee2.png";

function Frame() {
  return (
    <div className="relative rounded-[43px] shrink-0 size-[35px]">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[43px] size-full" src={imgFrame1000004914} />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-[246px]">
      <Frame />
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[18px] text-center text-white w-[183px]">UPCOMING PRAYER</p>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex font-['Inter:Bold',sans-serif] font-bold items-center justify-center leading-[normal] not-italic relative shrink-0 text-[26px] text-center text-white w-[241px]">
      <p className="flex-[1_0_0] min-h-px min-w-px relative">Maghrib:</p>
      <p className="flex-[1_0_0] min-h-px min-w-px relative">18:46</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[15px] items-start justify-center relative shrink-0 w-[266px]">
      <Frame6 />
      <Frame5 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex gap-[15px] items-center relative shrink-0 w-full">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[22px] text-center text-white whitespace-nowrap">{`Alarm me? `}</p>
      <button className="block cursor-pointer h-[31px] relative shrink-0 w-[34px]">
        <div className="absolute bg-white border border-[#d9d9d9] border-solid inset-0" />
      </button>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start justify-center relative shrink-0">
      <div className="h-[27px] relative shrink-0 w-[99px]" data-name="00:12:04">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold inset-0 leading-[normal] not-italic text-[22px] text-center text-white whitespace-nowrap">00:12:04</p>
      </div>
      <Frame1 />
    </div>
  );
}

export default function Frame3() {
  return (
    <div className="content-stretch flex gap-[24px] items-center justify-center relative rounded-[10px] size-full">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[10px]">
        <img alt="" className="absolute max-w-none object-cover rounded-[10px] size-full" src={imgFrame1410128055} />
        <div className="absolute bg-[rgba(0,0,0,0.25)] inset-0 rounded-[10px]" />
      </div>
      <Frame2 />
      <Frame4 />
    </div>
  );
}