import { useState, useEffect, useCallback } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "./ThemeContext";
import { useLocale } from "./i18n";
import { Tv, ArrowLeft, RefreshCw, AlertCircle, Square } from "lucide-react";
import { useIptvChannels, iptv, isAndroidApp, useAndroidEvent, IptvChannel, _setIptvPlayingId } from "../utils/androidBridge";
import { ApiImage } from "./ApiImage";

export function IptvChannels({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const { t, fontFamily, locale } = useLocale();
  const { channels, loading, error, reload } = useIptvChannels();
  const [playingId, setPlayingId] = useState<number | null>(null);

  // Sync playingId with native events. The playChannelList path emits
  // `index` + `total`; the legacy playIptv path emits only `url` + `channel`.
  useAndroidEvent<{ url: string; channel: string; index?: number; total?: number }>(
    'iptv-playing',
    (d) => {
      let id: number | null = null;
      if (typeof d.index === 'number' && channels[d.index]) {
        id = channels[d.index].id;
      } else {
        const ch = channels.find(c => c.url === d.url);
        id = ch?.id ?? null;
      }
      setPlayingId(id);
      _setIptvPlayingId(id);
    }
  );

  useAndroidEvent('iptv-stopped', () => {
    setPlayingId(null);
    _setIptvPlayingId(null);
  });


  const handlePlayList = (startIndex: number) => {
    const channel = channels[startIndex];
    if (!channel) return;
    if (playingId === channel.id) {
      iptv.stop();
    } else {
      iptv.playList(channels, startIndex);
    }
  };

  const isAndroid = isAndroidApp();

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{
        backgroundColor: theme.background,
        animation: "appLauncherIn 0.2s ease-out",
      }}
    >
      {/* Header */}
      <div
        className="shrink-0 flex items-center justify-between px-8"
        style={{
          height: "88px",
          backgroundColor: theme.surface,
          borderBottom: theme.cardBorder,
          boxShadow: SHADOW.lg,
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: theme.surfaceElevated,
              borderRadius: theme.radiusMd,
              border: "none",
              outline: "none",
            }}
          >
            <ArrowLeft size={24} color={theme.textHeading} />
          </button>
          <div className="flex items-center gap-3">
            <Tv size={28} color={theme.primary} strokeWidth={2.5} />
            <h1
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.xl,
                fontWeight: WEIGHT.bold,
                color: theme.textHeading,
              }}
            >
              {t("hub.media")} - {locale === "ar" ? "البث المباشر" : "Live TV"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {playingId !== null && (
            <button
              onClick={() => iptv.stop()}
              className="flex items-center gap-2 px-6 py-3 cursor-pointer active:scale-95 transition-transform"
              style={{
                backgroundColor: "#ef4444",
                borderRadius: theme.radiusMd,
                border: "none",
                outline: "none",
              }}
            >
              <Square size={20} color="#fff" fill="#fff" />
              <span
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.base,
                  fontWeight: WEIGHT.semibold,
                  color: "#fff",
                }}
              >
                {t("tv.stop") || (locale === "ar" ? "إيقاف البث" : "Stop TV")}
              </span>
            </button>
          )}

          <button
            onClick={reload}
            disabled={loading}
            className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform disabled:opacity-50"
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: theme.surfaceElevated,
              borderRadius: theme.radiusMd,
              border: "none",
              outline: "none",
            }}
          >
            <RefreshCw size={24} color={theme.textHeading} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-16 py-12 scroll-smooth">
        {!isAndroid && (
          <div 
            className="mb-10 p-6 flex items-center gap-4"
            style={{ 
              backgroundColor: theme.primarySubtle, 
              borderRadius: theme.radiusLg,
              border: `1px solid ${theme.primary}30`
            }}
          >
            <AlertCircle size={28} color={theme.primary} />
            <span style={{ 
              fontFamily: fontFamily, 
              fontSize: TYPE_SCALE.lg, 
              fontWeight: WEIGHT.medium, 
              color: theme.primary 
            }}>
              {t("tv.onlyOnKiosk") || "TV is only available on the kiosk"}
            </span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle size={64} color="#ef4444" opacity={0.5} />
            <p style={{ 
              fontFamily: fontFamily, 
              fontSize: TYPE_SCALE.xl, 
              fontWeight: WEIGHT.semibold, 
              color: "#ef4444" 
            }}>
              {error}
            </p>
            <button
              onClick={reload}
              className="mt-4 px-8 py-3"
              style={{
                backgroundColor: theme.primary,
                color: theme.textInverse,
                borderRadius: theme.radiusMd,
                fontWeight: WEIGHT.bold
              }}
            >
              {locale === "ar" ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        )}

        {loading && channels.length === 0 && (
          <div className="grid gap-8" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div 
                key={i} 
                className="animate-pulse"
                style={{ 
                  height: "220px", 
                  backgroundColor: theme.surfaceElevated, 
                  borderRadius: theme.radiusCard 
                }}
              />
            ))}
          </div>
        )}

        {!loading && channels.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Tv size={64} color={theme.textMuted} opacity={0.5} />
            <p style={{ 
              fontFamily: fontFamily, 
              fontSize: TYPE_SCALE.xl, 
              fontWeight: WEIGHT.semibold, 
              color: theme.textMuted 
            }}>
              {t("tv.noChannels") || "No channels available"}
            </p>
          </div>
        )}

        <div 
          className="grid gap-8" 
          style={{ 
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            opacity: isAndroid ? 1 : 0.4,
            pointerEvents: isAndroid ? "auto" : "none"
          }}
        >
          {channels.map((channel, i) => {
            const isPlaying = playingId === channel.id;
            return (
              <button
                key={channel.id}
                onClick={() => handlePlayList(i)}
                className="group relative flex flex-col items-center p-6 transition-all duration-300 active:scale-95"
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: theme.radiusCard,
                  border: isPlaying ? `4px solid ${theme.primary}` : theme.cardBorder,
                  boxShadow: isPlaying ? SHADOW.xl : SHADOW.md,
                  outline: "none",
                }}
              >
                {/* Logo Container */}
                <div 
                  className="w-full aspect-video rounded-xl mb-4 overflow-hidden flex items-center justify-center p-4"
                  style={{ backgroundColor: "#f8fafc" }}
                >
                  {channel.logo ? (
                    <ApiImage 
                      src={channel.logo} 
                      alt={channel.name} 
                      className="max-w-full max-h-full object-contain"
                      fallback={
                        <div className="flex items-center justify-center">
                          <Tv size={48} color={theme.textMuted} strokeWidth={1} />
                        </div>
                      }
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center rounded-lg"
                      style={{ backgroundColor: theme.surfaceElevated }}
                    >
                      <Tv size={64} color={theme.textMuted} strokeWidth={1} />
                    </div>
                  )}
                </div>

                {/* Channel Name */}
                <span
                  style={{
                    fontFamily: fontFamily,
                    fontSize: TYPE_SCALE.lg,
                    fontWeight: WEIGHT.bold,
                    color: theme.textHeading,
                    textAlign: "center"
                  }}
                >
                  {locale === "ar" ? channel.nameAr : channel.name}
                </span>

                {/* Playing Indicator */}
                {isPlaying && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-green-500 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes appLauncherIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
