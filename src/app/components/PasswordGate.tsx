import { useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Eye, EyeOff, Play, X } from "lucide-react";
import careinnLogo from "../../assets/careinn-logo.png";
import luxuryRoomBg from "../../assets/luxury-patient-room.png";

/* ═══════════════════════════════════════════════════════════════════════════
 * PASSWORD GATE — Redesigned immersive login screen
 * Frosted-glass login card centered on a full-page luxury hospital room image
 * ═══════════════════════════════════════════════════════════════════════════ */

const SKY = "#6CC4E0";

export function PasswordGate() {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    const valid = await login(password);
    if (!valid) {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
      setTimeout(() => setError(false), 3000);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Mulish', 'Inter', sans-serif",
        overflow: "hidden",
        transition: "opacity 0.5s ease",
        opacity: success ? 0 : 1,
        background: "#0A0F1D", // Deep fallback background
      }}
    >
      {/* ─── Immersive background layer with Ken Burns animation ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          animation: "kenburns 24s ease-in-out infinite alternate",
          willChange: "transform",
        }}
      >
        <img
          src={luxuryRoomBg}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>

      {/* ─── Dark Overlay ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background: "rgba(0, 0, 0, 0.5)",
          pointerEvents: "none",
        }}
      />

      {/* ─── Centered Content Area ─── */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        {/* ─── White/Frosted Glass Login Card ─── */}
        <div
          style={{
            width: "420px",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.3)",
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: shaking ? "shakeForm 0.5s ease-in-out" : "fadeSlideUp 0.6s ease-out both",
          }}
        >
          {/* CareInn logo */}
          <img
            src={careinnLogo}
            alt="CareInn"
            style={{
              height: "100px",
              width: "auto",
              objectFit: "contain",
              marginBottom: "16px",
            }}
          />

          {/* Title group */}
          <h1
            style={{
              color: "#FFFFFF",
              fontSize: "30px",
              fontWeight: 800,
              margin: "0 0 4px",
              letterSpacing: "-0.5px",
              textAlign: "center",
            }}
          >
            CareInn15
          </h1>
          
          <p
            style={{
              color: "rgba(255, 255, 255, 0.75)",
              fontSize: "14px",
              fontWeight: 600,
              margin: "0 0 32px",
              textAlign: "center",
            }}
          >
            Interactive Patient Care Solution
          </p>

          {/* Form wrapper */}
          <div style={{ width: "100%" }}>
            {/* Welcome text */}
            <p
              style={{
                color: SKY,
                fontSize: "18px",
                fontWeight: 700,
                margin: "0 0 6px",
                textAlign: "center",
              }}
            >
              Welcome!
            </p>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "14px",
                fontWeight: 400,
                margin: "0 0 24px",
                textAlign: "center",
              }}
            >
              Please enter your access code to continue.
            </p>

            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              {/* Password field */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "6px",
                    letterSpacing: "0.3px",
                  }}
                >
                  Password
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: `1.5px solid ${error ? "#EF4444" : isFocused ? SKY : "rgba(255, 255, 255, 0.25)"}`,
                    borderRadius: "10px",
                    background: error ? "rgba(239, 68, 68, 0.15)" : "rgba(255, 255, 255, 0.08)",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
                    boxShadow: error ? "0 0 0 3px rgba(239, 68, 68, 0.25)" : isFocused ? `0 0 0 3px ${SKY}40` : "none",
                  }}
                >
                  <input
                    ref={inputRef}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(false);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Enter your password"
                    autoComplete="off"
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#FFFFFF",
                      fontSize: "15px",
                      fontWeight: 500,
                      padding: "14px 16px",
                      fontFamily: "inherit",
                      letterSpacing: showPassword ? "0px" : "2px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "0 14px 0 6px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color="rgba(255, 255, 255, 0.6)" />
                    ) : (
                      <Eye size={18} color="rgba(255, 255, 255, 0.6)" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              <div style={{ minHeight: "22px", marginBottom: "8px" }}>
                {error && (
                  <p
                    style={{
                      color: "#EF4444",
                      fontSize: "13px",
                      fontWeight: 500,
                      margin: 0,
                      textAlign: "center",
                      animation: "fadeIn 0.3s ease",
                    }}
                  >
                    Invalid access code. Please try again.
                  </p>
                )}
              </div>

              {/* Sign in button */}
              <button
                type="submit"
                style={{
                  width: "100%",
                  height: "48px",
                  border: "none",
                  borderRadius: "10px",
                  background: `linear-gradient(135deg, ${SKY} 0%, #5BB8D6 100%)`,
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.5px",
                  transition: "transform 0.15s ease, box-shadow 0.2s ease",
                  boxShadow: "0 2px 12px rgba(108, 196, 224, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(108, 196, 224, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(108, 196, 224, 0.3)";
                }}
              >
                Sign in
              </button>
            </form>

            {/* ─── Welcome Slideshow Button ─── */}
            <button
              type="button"
              onClick={() => setShowSlideshow(true)}
              style={{
                width: "100%",
                height: "44px",
                marginTop: "14px",
                border: `1.5px solid ${SKY}`,
                borderRadius: "10px",
                background: "transparent",
                color: SKY,
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${SKY}1A`;
                e.currentTarget.style.borderColor = "#5BB8D6";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = SKY;
                e.currentTarget.style.color = SKY;
              }}
            >
              <Play size={16} />
              Welcome Slideshow
            </button>
          </div>
        </div>
      </div>

      {/* ─── Bottom Copyright Text ─── */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: 0,
          right: 0,
          textAlign: "center",
          color: "rgba(255, 255, 255, 0.4)",
          fontSize: "13px",
          fontWeight: 400,
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        Hospital Bedside Companion by CareInn &copy; {new Date().getFullYear()}
      </div>

      {/* ─── Welcome Slideshow Overlay ─── */}
      {showSlideshow && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            background: "#000",
            animation: "slideshowIn 0.35s ease-out both",
          }}
        >
          <button
            onClick={() => setShowSlideshow(false)}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              zIndex: 100001,
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "none",
              background: "rgba(255, 255, 255, 0.12)",
              color: "#FFF",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s ease",
              backdropFilter: "blur(8px)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)"; }}
            title="Close Slideshow"
          >
            <X size={22} />
          </button>
          <iframe
            src="/CareInn%20Welcome%20Slideshow.html"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            allow="fullscreen"
            title="CareInn Welcome Slideshow"
          />
        </div>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shakeForm {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-5px); }
          60% { transform: translateX(3px); }
          75% { transform: translateX(-2px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideshowIn {
          from { opacity: 0; transform: scale(1.03); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes kenburns {
          0%   { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.12) translate(-1.5%, -0.8%); }
        }
      `}</style>
    </div>
  );
}
