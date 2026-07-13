import React, { useState } from "react";
import { AppIconPlaceholder } from "./AppIconPlaceholder";

interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  // Optional — enables styled placeholder instead of broken icon
  appName?: string;
  appType?: "apk" | "url";
  placeholderSize?: number;
  placeholderRadius?: number;
}

export function ImageWithFallback({
  src,
  alt,
  style,
  className,
  appName,
  appType = "url",
  placeholderSize = 64,
  placeholderRadius = 16,
  ...rest
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    if (appName) {
      // Styled placeholder with first letter + type badge
      return (
        <AppIconPlaceholder
          name={appName}
          type={appType}
          size={placeholderSize}
          borderRadius={placeholderRadius}
        />
      );
    }
    // Generic fallback (no app name provided)
    return (
      <div
        className={`inline-flex items-center justify-center bg-gray-100 ${className ?? ""}`}
        style={style}
      >
        <span style={{ opacity: 0.3, fontSize: "24px" }}>
          📦
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
