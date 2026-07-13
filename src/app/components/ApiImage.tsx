import { useState, useEffect, ImgHTMLAttributes } from "react";
import { proxyImageUrl } from "../lib/imageProxy";

interface ApiImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  fallback?: React.ReactNode;  // shown while loading or on error
  showFallbackWhileLoading?: boolean;
}

export function ApiImage({
  src,
  fallback,
  showFallbackWhileLoading = false,
  alt = "",
  ...rest
}: ApiImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(
    // Immediate: if already safe URL use it, else wait for proxy
    src && (src.startsWith("data:") || src.startsWith("/") || 
    src.startsWith("https://") || src.startsWith("blob:"))
      ? src
      : null
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;
    setError(false);

    // Already safe — set directly
    if (src.startsWith("data:") || src.startsWith("/") ||
        src.startsWith("https://") || src.startsWith("blob:")) {
      setResolvedSrc(src);
      return;
    }

    // http:// or unknown — proxy it
    let cancelled = false;
    proxyImageUrl(src).then(proxied => {
      if (!cancelled) setResolvedSrc(proxied);
    });
    return () => { cancelled = true; };
  }, [src]);

  if (error || (!resolvedSrc && showFallbackWhileLoading)) {
    return fallback ? <>{fallback}</> : null;
  }

  if (!resolvedSrc) {
    // Still proxying — show nothing or fallback
    return showFallbackWhileLoading && fallback
      ? <>{fallback}</>
      : null;
  }

  return (
    <img
      {...rest}
      src={resolvedSrc}
      alt={alt}
      onError={() => setError(true)}
    />
  );
}
