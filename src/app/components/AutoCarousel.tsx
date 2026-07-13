import { useState, useEffect } from "react";
import { ApiImage } from "./ApiImage";

/**
 * AutoCarousel — fills its nearest `position: relative` parent completely.
 * Parent MUST have `position: relative` (or absolute/fixed) and defined dimensions.
 *
 * If only 1 image is provided, renders it statically with no animation.
 */
export function AutoCarousel({
  images,
  opacity = 1,
  objectPosition = "50% 15%",
  objectFit = "cover",
  intervalSeconds = 5,
  style = {},
  onImageClick,
}: {
  images: string[];
  opacity?: number;
  objectPosition?: string;
  objectFit?: "cover" | "contain";
  intervalSeconds?: number;
  /** Extra inline styles on the container (e.g. zIndex) */
  style?: React.CSSProperties;
  onImageClick?: (url: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const validImages = images?.filter(Boolean) ?? [];

  useEffect(() => {
    if (validImages.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % validImages.length);
    }, intervalSeconds * 1000);
    return () => clearInterval(interval);
  }, [validImages.length, intervalSeconds]);

  if (validImages.length === 0) return null;

  // Single image — no animation, just a plain fill
  if (validImages.length === 1) {
    return (
      <ApiImage
        src={validImages[0]}
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit,
          objectPosition,
          opacity,
          pointerEvents: onImageClick ? "auto" : "none",
          cursor: onImageClick ? "pointer" : "default",
          ...style,
        }}
        onClick={onImageClick ? () => onImageClick(validImages[0]) : undefined}
      />
    );
  }

  // Multiple images — cross-fade carousel
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: onImageClick ? "auto" : "none",
        cursor: onImageClick ? "pointer" : "default",
        ...style,
      }}
      onClick={onImageClick ? () => onImageClick(validImages[index]) : undefined}
    >
      {validImages.map((img, i) => (
        <ApiImage
          key={i}
          src={img}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit,
            objectPosition,
            opacity: i === index ? opacity : 0,
            transition: "opacity 1s ease-in-out",
          }}
        />
      ))}
    </div>
  );
}
