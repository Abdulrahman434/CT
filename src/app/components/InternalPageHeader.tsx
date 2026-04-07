import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTheme, TYPE_SCALE, WEIGHT, TEXT_STYLE } from "./ThemeContext";
import { useLocale } from "./i18n";

interface InternalPageHeaderProps {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
}

export function InternalPageHeader({ title, icon, onClose }: InternalPageHeaderProps) {
  const { theme } = useTheme();
  const { isRTL, fontFamily } = useLocale();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  return (
    <div className="shrink-0 flex items-center gap-5 px-12 pt-10 pb-6 relative z-10">
      <button
        onClick={onClose}
        className="flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "12px",
          backgroundColor: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <BackArrow size={24} style={{ color: "#fff" }} />
      </button>
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "12px",
            backgroundColor: "rgba(255,255,255,0.12)",
            color: "#fff",
          }}
        >
          {icon}
        </div>
        <div>
          <h2
            style={{
              fontFamily: fontFamily,
              ...TEXT_STYLE.display,
              fontSize: "32px",
              color: "#FFFFFF",
              lineHeight: "36px",
            }}
          >
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
}