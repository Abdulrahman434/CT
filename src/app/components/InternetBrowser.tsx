import React, { useState, useEffect } from "react";
import { ApiImage } from "./ApiImage";
import { ArrowLeft, RefreshCw, X, Globe, Shield, ExternalLink, Info } from "lucide-react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW, TEXT_STYLE, SPACE } from "./ThemeContext";
import { useLocale } from "./i18n";
import edgeLogo from "../../assets/edge_logo.png";

interface InternetBrowserProps {
  initialUrl: string;
  onClose: () => void;
}

export function InternetBrowser({ initialUrl, onClose }: InternetBrowserProps) {
  const { theme } = useTheme();
  const { t, dir, isRTL } = useLocale();

  const [url, setUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-format URL if needed
  useEffect(() => {
    let formattedUrl = initialUrl;
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    setUrl(formattedUrl);
  }, [initialUrl]);

  const [showFallback, setShowFallback] = useState(false);

  // Known sites that block embedding via X-Frame-Options
  const blockedDomains = [
    "bbc.com", "cnn.com", "edition.cnn.com", "bing.com",
    "okaz.com.sa", "saudigazette.com.sa", "instagram.com",
    "facebook.com", "twitter.com", "x.com", "linkedin.com",
    "stctv.com"
  ];
  const isHardcodedBlocked = blockedDomains.some(domain => url.toLowerCase().includes(domain));

  // Global Watchdog: If a site takes too long (likely blocked), show the fallback
  useEffect(() => {
    setShowFallback(false);
    if (isHardcodedBlocked) {
      setShowFallback(true);
      return;
    }

    const timer = setTimeout(() => {
      if (isLoading) {
        setShowFallback(true);
      }
    }, 2500); // 2.5 seconds timeout

    return () => clearTimeout(timer);
  }, [url, isHardcodedBlocked, isLoading]);

  const handleOpenExternal = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="absolute inset-0 z-[100] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      style={{ backgroundColor: theme.background }}
      dir={dir}
    >
      {/* Browser Toolbar */}
      <div
        className="shrink-0 flex items-center justify-between px-8"
        style={{
          height: "80px",
          backgroundColor: theme.surface,
          borderBottom: theme.cardBorder,
          boxShadow: SHADOW.md
        }}
      >
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform group"
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: theme.primary,
              borderRadius: theme.radiusMd,
              border: "none",
              boxShadow: SHADOW.sm
            }}
          >
            <ArrowLeft size={28} color="#fff" className={isRTL ? 'rotate-180' : ''} />
          </button>

          <div
            className="flex items-center gap-3 px-4 py-2 flex-1 max-w-2xl"
            style={{
              backgroundColor: theme.background,
              borderRadius: theme.radiusLg,
              border: `1px solid ${theme.primarySubtle}`
            }}
          >
            <ApiImage src={edgeLogo} alt="Browser" style={{ width: 24, height: 24 }} />
            <span
              className="text-sm font-medium truncate"
              style={{ color: theme.textMuted }}
            >
              {url}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFallback(true)}
            className="flex items-center justify-center gap-2 px-4 h-[48px] cursor-pointer active:scale-95 transition-all"
            style={{
              backgroundColor: theme.errorSubtle,
              borderRadius: theme.radiusMd,
              border: `1px solid ${theme.errorSubtle}`,
              color: theme.error
            }}
          >
            <Shield size={18} />
            <span className="text-sm font-bold">{t("browser.connectionHelp") || "Connection Help"}</span>
          </button>

          {!showFallback && (
            <button
              onClick={() => { setIsLoading(true); setShowFallback(false); const currentUrl = url; setUrl(''); setTimeout(() => setUrl(currentUrl), 10); }}
              className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: theme.surfaceElevated,
                borderRadius: theme.radiusMd,
                border: "none"
              }}
            >
              <RefreshCw size={20} color={theme.textHeading} className={isLoading ? 'animate-spin' : ''} />
            </button>
          )}

          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: theme.surfaceElevated,
              borderRadius: theme.radiusMd,
              border: "none"
            }}
          >
            <X size={24} color={theme.textHeading} />
          </button>
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: theme.background }}>
        {showFallback ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: theme.background }}>
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: theme.errorSubtle }}>
              <Shield size={48} color={theme.error} />
            </div>
            <h3 className="mb-2" style={{ ...TEXT_STYLE.sectionTitle, color: theme.textHeading }}>
              {t("browser.connectionTrouble") || "Connection Trouble?"}
            </h3>
            <p className="max-w-md mb-8 leading-relaxed" style={{ ...TEXT_STYLE.body, color: theme.textMuted }}>
              {t("browser.blockedDesc") || "This website might be blocked or taking too long to load inside the app. For the best experience, please open it in a full window."}
            </p>
            <button
              onClick={handleOpenExternal}
              className="px-10 py-4 font-bold shadow-lg transition-all active:scale-95 flex items-center gap-3"
              style={{ 
                backgroundColor: theme.primary, 
                color: theme.textInverse, 
                borderRadius: theme.radiusMd,
                border: 'none'
              }}
            >
              <ExternalLink size={20} />
              {t("browser.openExternal") || "Open in External Browser"}
            </button>
            <button
              onClick={() => setShowFallback(false)}
              className="mt-4 font-bold hover:underline"
              style={{ color: theme.primary, backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              {t("browser.waitLonger") || "Try waiting a bit longer"}
            </button>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-sm" style={{ backgroundColor: theme.overlay }}>
                <div className="w-16 h-16 border-4 rounded-full animate-spin mb-4" style={{ borderTopColor: theme.primary, borderColor: theme.primarySubtle }} />
                <p className="font-bold animate-pulse" style={{ color: theme.textHeading }}>
                  {t("general.loading") || "Loading content..."}
                </p>
              </div>
            )}

            <iframe
              key={url}
              src={url}
              className="w-full h-full border-none"
              onLoad={() => setIsLoading(false)}
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              title="Internet Browser Content"
            />
          </>
        )}
      </div>

      {/* Security Footer Notice */}
      <div className="shrink-0 px-8 py-2 flex items-center justify-center gap-2" style={{ backgroundColor: theme.surface, fontSize: '12px', color: theme.textMuted }}>
        <Globe size={12} />
        <span>{t("browser.securityNotice") || "You are browsing within the secure CareInn environment. External links are monitored."}</span>
      </div>
    </div>
  );
}
