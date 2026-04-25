import { useState, useEffect, useRef } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import { ArrowLeft, Camera, RefreshCw } from "lucide-react";

export function MirrorTool({
  onClose,
  onBackToTools,
}: {
  onClose: () => void;
  onBackToTools: () => void;
}) {
  const { theme } = useTheme();
  const { fontFamily } = useLocale();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false,
        });
        
        currentStream = mediaStream;
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please ensure permissions are granted.");
      }
    }

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{
        backgroundColor: "#000", // Black background for a professional look
      }}
    >
      {/* Header - Transparent overlay style */}
      <div
        className="shrink-0 flex items-center justify-between px-8"
        style={{
          height: "88px",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)",
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToTools}
            className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            style={{
              width: "56px",
              height: "56px",
              backgroundColor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              borderRadius: theme.radiusMd,
              border: "1px solid rgba(255,255,255,0.2)",
              outline: "none",
            }}
          >
            <ArrowLeft size={24} color="#fff" />
          </button>
          <h1
            style={{
              fontFamily: fontFamily,
              fontSize: TYPE_SCALE.xl,
              fontWeight: WEIGHT.bold,
              color: "#fff",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            Mirror
          </h1>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          style={{
            width: "56px",
            height: "56px",
            backgroundColor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(12px)",
            borderRadius: theme.radiusMd,
            border: "1px solid rgba(255,255,255,0.2)",
            outline: "none",
          }}
        >
          <span style={{ fontSize: "24px", color: "#fff" }}>×</span>
        </button>
      </div>

      {/* Camera Feed */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center gap-4 p-8 text-center" style={{ maxWidth: "400px" }}>
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
              <Camera size={40} color="#FF4D4D" />
            </div>
            <p style={{ color: "#fff", fontSize: TYPE_SCALE.md, fontWeight: WEIGHT.medium }}>
              {error}
            </p>
            <button
               onClick={() => window.location.reload()}
               className="mt-2 px-6 py-3 rounded-full flex items-center gap-2"
               style={{ backgroundColor: theme.primary, color: "#fff", border: "none" }}
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)", // Mirror effect!
            }}
          />
        )}
        
        {/* Mirror Frame / Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            boxShadow: "inset 0 0 150px rgba(0,0,0,0.5)",
            border: "20px solid rgba(255,255,255,0.05)"
          }} 
        />
        
        {!error && (
            <div 
                className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full"
                style={{
                    backgroundColor: "rgba(0,0,0,0.5)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "14px",
                    fontWeight: 500,
                    letterSpacing: "0.5px"
                }}
            >
                LIVE VIEW
            </div>
        )}
      </div>
    </div>
  );
}
