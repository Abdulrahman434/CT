import { useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Eye, EyeOff, Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import careinnLogo from "../../assets/careinn-logo.png";
import heroImage from "../../assets/careinn-hero.jpg";

/* ═══════════════════════════════════════════════════════════════════════════
 * PASSWORD GATE — Clean split-layout login screen
 * Brand colors from CareInn logo:
 *   Navy:     #1B2A5B
 *   Sky Blue: #6CC4E0 / #5BC0DE
 * ═══════════════════════════════════════════════════════════════════════════ */

const NAVY = "#1B2A5B";
const SKY  = "#6CC4E0";

export function PasswordGate() {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const slides = [
    { title: "Smart Room Controls", desc: "Adjust lights, blinds, and temperature right from your bed.", emoji: "🏠", bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { title: "Entertainment Hub", desc: "Stream TV, movies, music, and games during your stay.", emoji: "🎬", bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { title: "Meal Ordering", desc: "Browse menus and order meals delivered to your room.", emoji: "🍽️", bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { title: "Patient Education", desc: "Access health resources and educational materials.", emoji: "📚", bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { title: "Your Care Team", desc: "Connect with nurses and doctors at the touch of a button.", emoji: "👨‍⚕️", bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    if (!showSlideshow) return;
    const t = setInterval(() => setSlideIndex(i => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [showSlideshow, slides.length]);

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
        background: "#FFFFFF",
        fontFamily: "'Mulish', 'Inter', sans-serif",
        overflow: "hidden",
        transition: "opacity 0.5s ease",
        opacity: success ? 0 : 1,
      }}
    >
      {/* ─── Left Panel: Hero Image (text & decorations baked into image) ─── */}
      <div
        style={{
          width: "45%",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <img
          src={heroImage}
          alt="Healthcare Redefined"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "left bottom",
          }}
        />
      </div>

      {/* ─── Right Panel: Login Form ─── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Top-right: small CareInn logo */}
        <div
          style={{
            position: "absolute",
            top: "28px",
            right: "36px",
          }}
        >
          <img
            src={careinnLogo}
            alt="CareInn"
            style={{ height: "180px", width: "auto", objectFit: "contain" }}
          />
        </div>

        {/* Form area centered vertically */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 80px",
            maxWidth: "560px",
          }}
        >
          {/* Title group */}
          <h1
            style={{
              color: NAVY,
              fontSize: "32px",
              fontWeight: 800,
              margin: "0 0 4px",
              letterSpacing: "-0.5px",
            }}
          >
            CareInn15
          </h1>
          <p
            style={{
              color: "#4A5568",
              fontSize: "16px",
              fontWeight: 600,
              margin: "0 0 36px",
            }}
          >
            Interactive Patient Care Solution
          </p>

          {/* Card container */}
          <div
            style={{
              borderLeft: `3px solid ${SKY}`,
              padding: "32px 0 32px 28px",
              animation: shaking ? "shakeForm 0.5s ease-in-out" : "fadeSlideUp 0.6s ease-out both",
            }}
          >
            {/* Welcome text */}
            <p
              style={{
                color: SKY,
                fontSize: "18px",
                fontWeight: 700,
                margin: "0 0 6px",
              }}
            >
              Welcome!
            </p>
            <p
              style={{
                color: "#718096",
                fontSize: "14px",
                fontWeight: 400,
                margin: "0 0 28px",
              }}
            >
              Please enter your access code to continue.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Password field */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#4A5568",
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
                    border: `1.5px solid ${error ? "#EF4444" : "#E2E8F0"}`,
                    borderRadius: "10px",
                    background: error ? "rgba(239,68,68,0.03)" : "#F8FAFC",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
                    boxShadow: error ? "0 0 0 3px rgba(239,68,68,0.08)" : "none",
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
                    placeholder="Enter your password"
                    autoComplete="off"
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: NAVY,
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
                      <EyeOff size={18} color="#A0AEC0" />
                    ) : (
                      <Eye size={18} color="#A0AEC0" />
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
                  boxShadow: "0 2px 12px rgba(108,196,224,0.3)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget).style.transform = "translateY(-1px)";
                  (e.currentTarget).style.boxShadow = "0 4px 20px rgba(108,196,224,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget).style.transform = "translateY(0)";
                  (e.currentTarget).style.boxShadow = "0 2px 12px rgba(108,196,224,0.3)";
                }}
              >
                Sign in
              </button>
            </form>

              {/* Welcome Slideshow button */}
              <button
                type="button"
                onClick={() => { setShowSlideshow(true); setSlideIndex(0); }}
                style={{
                  width: "100%",
                  height: "48px",
                  border: `1.5px solid ${SKY}`,
                  borderRadius: "10px",
                  background: "transparent",
                  color: SKY,
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.3px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "12px",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                <Play size={16} fill={SKY} />
                Welcome Slideshow
              </button>
          </div>
        </div>

        {/* Bottom text */}
        <div
          style={{
            padding: "20px 80px",
            color: "#CBD5E0",
            fontSize: "13px",
            fontWeight: 400,
            margin: 0,
            maxWidth: "560px",
            textAlign: "left",
          }}
        >
          Hospital Bedside Companion by CareInn &copy; {new Date().getFullYear()}
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
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

        @keyframes slideFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* ═══ WELCOME SLIDESHOW OVERLAY ═══ */}
      {showSlideshow && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 100000,
            background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.3s ease",
          }}
          onClick={() => setShowSlideshow(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setShowSlideshow(false)}
            style={{
              position: "absolute", top: 24, right: 24,
              width: 48, height: 48, borderRadius: 12,
              background: "rgba(255,255,255,0.1)", border: "none",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={22} />
          </button>

          {/* Slide card */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "70%", maxWidth: 800, borderRadius: 24,
              background: slides[slideIndex].bg,
              padding: "80px 60px",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              textAlign: "center", color: "#fff",
              position: "relative", overflow: "hidden",
              animation: "slideFadeIn 0.4s ease",
              boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
            }}
            key={slideIndex}
          >
            <div style={{ fontSize: 72, marginBottom: 24 }}>{slides[slideIndex].emoji}</div>
            <h2 style={{
              fontSize: 36, fontWeight: 800, margin: "0 0 16px",
              letterSpacing: "-0.5px", textShadow: "0 2px 12px rgba(0,0,0,0.2)",
            }}>
              {slides[slideIndex].title}
            </h2>
            <p style={{
              fontSize: 18, fontWeight: 400, opacity: 0.9,
              maxWidth: 500, lineHeight: 1.6,
            }}>
              {slides[slideIndex].desc}
            </p>

            {/* Dot indicators */}
            <div style={{ display: "flex", gap: 10, marginTop: 40 }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIndex(i)}
                  style={{
                    width: i === slideIndex ? 32 : 10, height: 10,
                    borderRadius: 5, border: "none", cursor: "pointer",
                    background: i === slideIndex ? "#fff" : "rgba(255,255,255,0.4)",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Nav arrows */}
          <button
            onClick={e => { e.stopPropagation(); setSlideIndex(i => (i - 1 + slides.length) % slides.length); }}
            style={{
              position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)",
              width: 56, height: 56, borderRadius: 16,
              background: "rgba(255,255,255,0.1)", border: "none",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setSlideIndex(i => (i + 1) % slides.length); }}
            style={{
              position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)",
              width: 56, height: 56, borderRadius: 16,
              background: "rgba(255,255,255,0.1)", border: "none",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </div>
  );
}
