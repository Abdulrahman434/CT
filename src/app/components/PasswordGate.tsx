import { useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Eye, EyeOff, X } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
 * PASSWORD GATE — Redesigned immersive login screen
 * Frosted-glass login card centered on a full-page luxury hospital room image
 * ═══════════════════════════════════════════════════════════════════════════ */

const SKY = "#6CC4E0";
const NAVY = "#1B2F5B";

export function PasswordGate() {
  const { login, loginAsGuest } = useAuth();
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

  const handleGuest = () => {
    loginAsGuest();
    setSuccess(true);
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
          src="/assets/bg/careinnbak.jpg"
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>

      {/* ─── Light Overlay — keeps the room image airy and visible ─── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background: "rgba(0, 0, 0, 0.25)",
          pointerEvents: "none",
        }}
      />

      {/* ─── Content Area ───
       * The card is centered via `margin: auto` on the child rather than
       * `alignItems: center`, so that when the viewport is too short the top of
       * the card stays reachable instead of being clipped by the scroll box.
       * Asymmetric padding (bottom > top) biases the centered card slightly
       * upward — optically centered, and it reserves bottom margin so the
       * Sign in / Continue as Guest buttons stay clear of the soft keyboard.
       * vh units keep the bias proportional across screen sizes. */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "5vh 24px 7.5vh",
          overflowY: "auto",
        }}
      >
        {/* ─── White/Frosted Glass Login Card ─── */}
        <div
          style={{
            width: "420px",
            flexShrink: 0,
            margin: "auto",
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            // Navy-tinted ambient shadow (calmer than pure black) + a soft
            // white top highlight so the glass edge reads crisp on any wallpaper.
            boxShadow:
              "0 24px 60px rgba(15, 30, 55, 0.20), 0 2px 8px rgba(15, 30, 55, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.40)",
            padding: "48px 36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            animation: shaking ? "shakeForm 0.5s ease-in-out" : "fadeSlideUp 0.6s ease-out both",
          }}
        >
          {/* Title group */}
          <h1
            style={{
              color: NAVY,
              fontSize: "30px",
              fontWeight: 800,
              margin: "0 0 12px",
              letterSpacing: "-0.5px",
              textAlign: "center",
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.35)",
            }}
          >
            Welcome!
          </h1>
          
          <p
            style={{
              color: "rgba(255, 255, 255, 0.85)",
              fontSize: "14px",
              fontWeight: 600,
              margin: "0 0 44px",
              textAlign: "center",
            }}
          >
            Please enter your access code to continue.
          </p>

          {/* Form wrapper */}
          <div style={{ width: "100%" }}>
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              {/* Password field */}
              <div style={{ marginBottom: "28px" }}>
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
                    className="pg-password-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(false);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Enter MRN, Access Code"
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
                  {/* Single password visibility toggle — Eye = hidden, EyeOff = visible */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide access code" : "Show access code"}
                    aria-pressed={showPassword}
                    title={showPassword ? "Hide access code" : "Show access code"}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      flexShrink: 0,
                      width: "44px",
                      height: "44px",
                      marginRight: "4px",
                      padding: 0,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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
              <div style={{ minHeight: "22px", marginBottom: "14px" }}>
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

              {/* Secondary action — outline treatment, same width/alignment as
                  the primary CTA but no fill, lighter weight, no shadow. */}
              <button
                type="button"
                onClick={handleGuest}
                style={{
                  width: "100%",
                  height: "48px",
                  marginTop: "16px",
                  borderRadius: "10px",
                  background: "transparent",
                  border: "1.5px solid rgba(255, 255, 255, 0.5)",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.3px",
                  transition: "background 0.2s ease, border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.14)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)";
                }}
              >
                Continue as Guest
              </button>
            </form>
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
        /* Suppress Edge/Chromium's native password reveal + clear buttons —
           we render our own single eye toggle, and the built-ins duplicate it. */
        .pg-password-input::-ms-reveal,
        .pg-password-input::-ms-clear {
          display: none;
        }

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
