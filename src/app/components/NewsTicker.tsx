import { useEffect, useRef, useState } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW, TEXT_STYLE, SPACE } from "./ThemeContext";
import { useLocale } from "./i18n";
import separatorIcon from "../../imports/Asset_2_white.svg";

export function NewsTicker() {
  const { theme } = useTheme();
  const { t, isRTL, fontFamily } = useLocale();
  const [offset, setOffset] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);

  const newsItems = theme.id === "dallah"
    ? [
        `🏆  ${t("news.dallah.1")}`,
        `🌍  ${t("news.dallah.2")}`,
        `🔬  ${t("news.dallah.3")}`,
      ]
    : theme.id === "dsfh"
    ? [
        `🏆  ${t("news.dsfh.jeddah.2")}`,
        `🌍  ${t("news.dsfh.jeddah.1")}`,
        `🧠  ${t("news.dsfh.jeddah.5")}`,
        `🚀  ${t("news.dsfh.jeddah.4")}`,
        `🏗️  ${t("news.dsfh.jeddah.3")}`,
        `🇩🇪  ${t("news.dsfh.1")}`,
        `⭐  ${t("news.dsfh.2")}`,
        `🏆  ${t("news.dsfh.3")}`,
      ]
    : [
        `🏆  ${t("news.wifi")}`,
        `🌍  ${t("news.carePlans")}`,
        `🔬  ${t("news.menu")}`,
      ];

  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();
    // For RTL: scroll left-to-right (positive direction)
    // For LTR: scroll right-to-left (negative direction)
    const direction = isRTL ? 1 : -1;

    const animate = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;
      setOffset((prev) => {
        const textWidth = textRef.current?.scrollWidth ?? 4000;
        const half = textWidth / 2;
        const next = prev + delta * 0.03 * direction;
        if (isRTL) {
          return next > half ? next - half : next;
        } else {
          return next < -half ? next + half : next;
        }
      });
      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [isRTL]);

  const separator = "        ·        ";
  const tickerText = newsItems.join(separator);

  /* Build ticker content with SVG separators */
  const renderTickerContent = () => {
    const elements: React.ReactNode[] = [];
    newsItems.forEach((item, i) => {
      elements.push(<span key={`item-${i}`}>{item}</span>);
      elements.push(
        <img
          key={`sep-${i}`}
          src={separatorIcon}
          alt=""
          style={{
            width: "14px",
            height: "14px",
            display: "inline-block",
            verticalAlign: "middle",
            margin: "0 24px",
            opacity: 0.5,
          }}
        />
      );
    });
    return elements;
  };

  return (
    <div
      className="w-full overflow-hidden flex items-center justify-center shrink-0"
      style={{
        height: SPACE[5],
        background: theme.primary,
        boxShadow: SHADOW.md,
      }}
    >
      <div
        className="relative overflow-hidden h-full flex items-center w-full"
      >
        <div
          ref={textRef}
          className="absolute whitespace-nowrap will-change-transform flex items-center"
          style={{
            transform: `translateX(${offset}px)`,
            fontFamily: fontFamily,
            color: theme.textInverse,
            ...TEXT_STYLE.body,
          }}
        >
          {renderTickerContent()}{renderTickerContent()}
        </div>
      </div>
    </div>
  );
}