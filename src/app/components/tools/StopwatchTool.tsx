import { useState, useCallback, useEffect, useRef } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import { ArrowLeft, Play, Pause, RotateCcw, Timer } from "lucide-react";

export function StopwatchTool({ onClose, onBackToTools }: { onClose: () => void; onBackToTools: () => void }) {
  const { theme } = useTheme();
  const { fontFamily } = useLocale();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleStartPause = useCallback(() => {
    setIsRunning(!isRunning);
  }, [isRunning]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  }, []);

  const handleLap = useCallback(() => {
    if (isRunning) {
      setLaps([time, ...laps]);
    }
  }, [isRunning, time, laps]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    return {
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
      milliseconds: ms.toString().padStart(2, "0"),
    };
  };

  const currentTime = formatTime(time);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{
        backgroundColor: theme.background,
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
            onClick={onBackToTools}
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
          <h1
            style={{
              fontFamily: fontFamily,
              fontSize: TYPE_SCALE.xl,
              fontWeight: WEIGHT.bold,
              color: theme.textHeading,
            }}
          >
            Stopwatch
          </h1>
        </div>
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
          <span style={{ fontSize: "24px", color: theme.textHeading }}>×</span>
        </button>
      </div>

      {/* Stopwatch Content */}
      <div className="flex-1 flex gap-8 px-16 py-12">
        {/* Timer Display */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div
            className="relative flex items-center justify-center mb-12"
            style={{
              width: "480px",
              height: "480px",
              backgroundColor: theme.surface,
              borderRadius: "50%",
              border: theme.cardBorder,
              boxShadow: SHADOW.xl,
            }}
          >
            {/* Outer Ring Animation */}
            {isRunning && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: `4px solid ${theme.primary}`,
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
            )}

            {/* Time Display */}
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-2">
                <span
                  style={{
                    fontFamily: fontFamily,
                    fontSize: "96px",
                    fontWeight: WEIGHT.bold,
                    color: theme.textHeading,
                    lineHeight: 1,
                  }}
                >
                  {currentTime.minutes}
                </span>
                <span
                  style={{
                    fontFamily: fontFamily,
                    fontSize: "64px",
                    fontWeight: WEIGHT.bold,
                    color: theme.textMuted,
                    lineHeight: 1,
                  }}
                >
                  :
                </span>
                <span
                  style={{
                    fontFamily: fontFamily,
                    fontSize: "96px",
                    fontWeight: WEIGHT.bold,
                    color: theme.textHeading,
                    lineHeight: 1,
                  }}
                >
                  {currentTime.seconds}
                </span>
                <span
                  style={{
                    fontFamily: fontFamily,
                    fontSize: "48px",
                    fontWeight: WEIGHT.semibold,
                    color: theme.textMuted,
                    lineHeight: 1,
                  }}
                >
                  .{currentTime.milliseconds}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={handleReset}
              disabled={time === 0}
              className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              style={{
                width: "88px",
                height: "88px",
                backgroundColor: theme.surfaceElevated,
                borderRadius: "50%",
                border: "none",
                outline: "none",
                boxShadow: SHADOW.md,
                opacity: time === 0 ? 0.5 : 1,
              }}
            >
              <RotateCcw size={32} color={theme.textMuted} />
            </button>

            <button
              onClick={handleStartPause}
              className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              style={{
                width: "120px",
                height: "120px",
                backgroundColor: isRunning ? "#D10044" : theme.primary,
                borderRadius: "50%",
                border: "none",
                outline: "none",
                boxShadow: SHADOW.xl,
              }}
            >
              {isRunning ? <Pause size={48} color="#fff" /> : <Play size={48} color={theme.textInverse} />}
            </button>

            <button
              onClick={handleLap}
              disabled={!isRunning}
              className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              style={{
                width: "88px",
                height: "88px",
                backgroundColor: theme.surfaceElevated,
                borderRadius: "50%",
                border: "none",
                outline: "none",
                boxShadow: SHADOW.md,
                opacity: !isRunning ? 0.5 : 1,
              }}
            >
              <Timer size={32} color={theme.textMuted} />
            </button>
          </div>

          <p
            className="mt-6"
            style={{
              fontFamily: fontFamily,
              fontSize: TYPE_SCALE.base,
              color: theme.textMuted,
            }}
          >
            {isRunning ? "Tap timer icon to record lap" : "Tap play to start"}
          </p>
        </div>

        {/* Laps List */}
        <div
          className="flex flex-col"
          style={{
            width: "400px",
            backgroundColor: theme.surface,
            borderRadius: theme.radiusCard,
            border: theme.cardBorder,
            boxShadow: SHADOW.md,
          }}
        >
          <div
            className="px-6 py-4"
            style={{
              borderBottom: theme.cardBorder,
            }}
          >
            <h3
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.md,
                fontWeight: WEIGHT.bold,
                color: theme.textHeading,
              }}
            >
              Laps
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {laps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Timer size={48} color={theme.textMuted} strokeWidth={1.5} />
                <p
                  className="mt-4"
                  style={{
                    fontFamily: fontFamily,
                    fontSize: TYPE_SCALE.base,
                    color: theme.textMuted,
                  }}
                >
                  No laps recorded
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {laps.map((lapTime, index) => {
                  const lapFormatted = formatTime(lapTime);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-3"
                      style={{
                        backgroundColor: theme.background,
                        borderRadius: theme.radiusMd,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: fontFamily,
                          fontSize: TYPE_SCALE.base,
                          fontWeight: WEIGHT.semibold,
                          color: theme.textMuted,
                        }}
                      >
                        Lap {laps.length - index}
                      </span>
                      <span
                        style={{
                          fontFamily: fontFamily,
                          fontSize: TYPE_SCALE.md,
                          fontWeight: WEIGHT.bold,
                          color: theme.textHeading,
                        }}
                      >
                        {lapFormatted.minutes}:{lapFormatted.seconds}.{lapFormatted.milliseconds}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
