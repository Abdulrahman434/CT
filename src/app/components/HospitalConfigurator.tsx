import { useState, useRef, useCallback } from "react";
import {
  X,
  Plus,
  Check,
  Trash2,
  ChevronLeft,
  Image,
  Palette,
  Type,
  Building2,
  Info,
  Edit2,
  Upload,
  RotateCcw,
  Crosshair,
} from "lucide-react";
import { useTheme, type HospitalCoreConfig, DSFH_CORE, BUILTIN_PRESETS, autoDarken, autoLighten } from "./ThemeContext";
import { useAuth } from "./AuthContext";
import { TokenGallery } from "./TokenGallery";

/* ═══════════════════════════════════════════════════════════════
 * Hospital Configurator — triggered from TopBar (Dhuhr prayer tap)
 * Allows adding, editing, switching, and deleting hospital configs.
 * ═══════════════════════════════════════════════════════════════ */

const EMPTY_CONFIG: HospitalCoreConfig = {
  id: "",
  hospitalName: "",
  hospitalShortName: "",
  hospitalWebsiteUrl: "",
  fontFamily: "'Inter', sans-serif",
  fontFamilyAr: "'Almarai', sans-serif",
  logoUrl: "",
  heroImageUrl: "",
  primary: "#2563EB",
  primaryDark: "",
  primaryLight: "",
  accent: "#DC2626",
  accentDark: "",
  accentLight: "",
};

function generateId(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 20) || `hospital-${Date.now()}`
  );
}

/** Read file as base64 data URL */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ── Color Swatch Input ── */
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1.5">
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#95A3AD",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="shrink-0 cursor-pointer active:scale-90 transition-transform"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: value,
            border: "2px solid rgba(0,0,0,0.08)",
          }}
        />
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          style={{
            height: "36px",
            borderRadius: "10px",
            border: "1.5px solid rgba(0,0,0,0.08)",
            padding: "0 12px",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "monospace",
            color: "#1B2A32",
            backgroundColor: "rgba(0,0,0,0.02)",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}

/* ── Text Input Field ── */
function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#95A3AD",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          height: "40px",
          borderRadius: "10px",
          border: "1.5px solid rgba(0,0,0,0.08)",
          padding: "0 14px",
          fontSize: "14px",
          fontWeight: 500,
          color: "#1B2A32",
          backgroundColor: "rgba(0,0,0,0.02)",
          outline: "none",
        }}
      />
      {hint && (
        <span style={{ fontSize: "11px", fontWeight: 500, color: "#C0CAD0", lineHeight: "16px" }}>
          {hint}
        </span>
      )}
    </div>
  );
}

/* ── Image Upload Field ── */
function ImageUploadField({
  label,
  value,
  onChange,
  hint,
  previewHeight,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint: string;
  previewHeight: string;
}) {
  const { theme: t } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const safeValue = value || "";
  const [urlMode, setUrlMode] = useState(safeValue.startsWith("http"));

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const dataUrl = await readFileAsDataUrl(file);
      onChange(dataUrl);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#95A3AD",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {label}
        </span>
        <button
          onClick={() => setUrlMode((v) => !v)}
          className="cursor-pointer"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: t.primary,
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          {urlMode ? "Upload file instead" : "Paste URL instead"}
        </button>
      </div>

      {urlMode ? (
        <input
          type="text"
          value={safeValue.startsWith("data:") ? "" : safeValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.png"
          style={{
            height: "40px",
            borderRadius: "10px",
            border: "1.5px solid rgba(0,0,0,0.08)",
            padding: "0 14px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#1B2A32",
            backgroundColor: "rgba(0,0,0,0.02)",
            outline: "none",
          }}
        />
      ) : (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="sr-only"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-transform"
            style={{
              height: "44px",
              borderRadius: "10px",
              border: `1.5px dashed ${t.primary}`,
              backgroundColor: t.primarySubtle,
              color: t.primary,
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <Upload size={16} />
            Choose Image
          </button>
        </>
      )}

      <span style={{ fontSize: "11px", fontWeight: 500, color: "#C0CAD0", lineHeight: "16px" }}>
        {hint}
      </span>

      {/* Preview */}
      {value && (
        <div
          className="flex items-center justify-center overflow-hidden"
          style={{
            height: previewHeight,
            borderRadius: "10px",
            backgroundColor: "rgba(0,0,0,0.03)",
            padding: previewHeight === "60px" ? "8px" : "0",
          }}
        >
          <img
            src={value}
            alt="Preview"
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: previewHeight === "60px" ? "contain" : "cover",
              width: previewHeight === "60px" ? "auto" : "100%",
              height: "100%",
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ── Hero Crop Focal Point Picker ── */
function HeroCropPicker({
  imageUrl,
  cropPosition,
  onChange,
}: {
  imageUrl: string;
  cropPosition: string;
  onChange: (pos: string) => void;
}) {
  const { theme: t } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  // Parse "50% 15%" → { x: 50, y: 15 }
  const parsed = cropPosition.match(/([\d.]+)%\s+([\d.]+)%/);
  const focalX = parsed ? parseFloat(parsed[1]) : 50;
  const focalY = parsed ? parseFloat(parsed[2]) : 50;

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
      onChange(`${Math.round(x)}% ${Math.round(y)}%`);
    },
    [onChange]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updateFromPointer(e.clientX, e.clientY);
    },
    [updateFromPointer]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      updateFromPointer(e.clientX, e.clientY);
    },
    [dragging, updateFromPointer]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  if (!imageUrl) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Crosshair size={13} style={{ color: t.primary }} />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#95A3AD",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Greeting Card Crop
          </span>
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            fontFamily: "monospace",
            color: t.textMuted,
          }}
        >
          {Math.round(focalX)}% {Math.round(focalY)}%
        </span>
      </div>

      <span style={{ fontSize: "11px", fontWeight: 500, color: "#C0CAD0", lineHeight: "16px" }}>
        Click or drag on the image to set the focal point for the greeting card crop
      </span>

      {/* Focal point picker — full image view */}
      <div
        ref={containerRef}
        className="relative overflow-hidden select-none"
        style={{
          borderRadius: "12px",
          border: `2px solid ${dragging ? t.primary : "rgba(0,0,0,0.08)"}`,
          cursor: "crosshair",
          transition: "border-color 0.15s",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <img
          src={imageUrl}
          alt="Crop source"
          draggable={false}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "200px",
            objectFit: "cover",
            display: "block",
            pointerEvents: "none",
          }}
        />
        {/* Focal point marker */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${focalX}%`,
            top: `${focalY}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Outer ring */}
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              border: `2.5px solid #fff`,
              boxShadow: `0 0 0 1.5px ${t.primary}, 0 2px 8px rgba(0,0,0,0.3)`,
              backgroundColor: `${t.primary}33`,
            }}
          />
          {/* Center dot */}
          <div
            className="absolute"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#fff",
              boxShadow: `0 0 0 1px ${t.primary}`,
            }}
          />
        </div>

        {/* Crosshair lines */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${focalX}%`,
            top: 0,
            bottom: 0,
            width: "1px",
            backgroundColor: `${t.primary}40`,
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: `${focalY}%`,
            left: 0,
            right: 0,
            height: "1px",
            backgroundColor: `${t.primary}40`,
          }}
        />
      </div>

      {/* Live crop preview — simulates the greeting card */}
      <div className="flex flex-col gap-1">
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: t.textDisabled,
            textTransform: "uppercase",
            letterSpacing: "0.3px",
          }}
        >
          Greeting card preview
        </span>
        <div
          className="overflow-hidden"
          style={{
            height: "52px",
            borderRadius: "8px",
            backgroundColor: "rgba(0,0,0,0.03)",
          }}
        >
          <img
            src={imageUrl}
            alt="Crop preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `${focalX}% ${focalY}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Config Card (list view) ── */
function ConfigCard({
  config,
  isActive,
  isBuiltIn,
  onSwitch,
  onEdit,
  onDelete,
}: {
  config: HospitalCoreConfig;
  isActive: boolean;
  isBuiltIn: boolean;
  onSwitch: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { theme: t } = useTheme();
  return (
    <div
      className="flex items-center gap-3 transition-transform"
      style={{
        padding: "14px 16px",
        borderRadius: "16px",
        backgroundColor: isActive ? t.primarySubtle : "rgba(0,0,0,0.02)",
        border: isActive ? `1.5px solid ${t.borderActive}` : "1.5px solid transparent",
      }}
    >
      {/* Color preview */}
      <div className="shrink-0 flex items-center gap-1">
        <div
          style={{
            width: "20px",
            height: "32px",
            borderRadius: "6px 0 0 6px",
            backgroundColor: config.primary,
          }}
        />
        <div style={{ width: "12px", height: "32px", backgroundColor: config.primaryDark || autoDarken(config.primary) }} />
        <div
          style={{
            width: "12px",
            height: "32px",
            borderRadius: "0 6px 6px 0",
            backgroundColor: config.accent,
          }}
        />
      </div>
      {/* Info */}
      <button
        onClick={onSwitch}
        className="flex-1 text-left cursor-pointer min-w-0"
        style={{ border: "none", background: "none", padding: 0 }}
      >
        <span
          className="block truncate"
          style={{
            fontFamily: t.fontFamily,
            fontSize: "14px",
            fontWeight: 700,
            color: isActive ? t.primary : t.textHeading,
          }}
        >
          {config.hospitalName || "Untitled"}
        </span>
        <span
          className="block"
          style={{
            fontFamily: t.fontFamily,
            fontSize: "11px",
            fontWeight: 500,
            color: isActive ? t.primary : t.textMuted,
            marginTop: "1px",
          }}
        >
          {isActive ? "Active" : config.hospitalShortName}
          {isBuiltIn ? " (Built-in)" : ""}
        </span>
      </button>
      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1.5">
        {isActive && (
          <div
            className="flex items-center justify-center"
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              backgroundColor: t.primary,
            }}
          >
            <Check size={14} style={{ color: "#fff" }} strokeWidth={3} />
          </div>
        )}
        <button
          onClick={onEdit}
          className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "rgba(0,0,0,0.04)",
            border: "none",
          }}
        >
          <Edit2 size={14} style={{ color: t.textMuted }} />
        </button>
        {!isBuiltIn && (
          <button
            onClick={onDelete}
            className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: t.accentSubtle,
              border: "none",
            }}
          >
            <Trash2 size={14} style={{ color: t.accent }} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══ MAIN EXPORT ═══ */
export function HospitalConfigurator({ onClose }: { onClose: () => void }) {
  const { theme: t, allConfigs, activeConfigId, switchConfig, saveConfig, deleteConfig } =
    useTheme();
  const { isFullAccess, lockedHospitalId } = useAuth();

  const [view, setView] = useState<"list" | "edit">("list");
  const [editingConfig, setEditingConfig] = useState<HospitalCoreConfig | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showAdvancedColors, setShowAdvancedColors] = useState(false);
  const [showTokenGallery, setShowTokenGallery] = useState(false);

  const startEdit = (config: HospitalCoreConfig, creating: boolean) => {
    setEditingConfig({ ...config });
    setIsNew(creating);
    setShowAdvancedColors(false);
    setView("edit");
  };

  const updateField = <K extends keyof HospitalCoreConfig>(key: K, value: HospitalCoreConfig[K]) => {
    if (!editingConfig) return;
    setEditingConfig({ ...editingConfig, [key]: value });
  };

  const handlePrimaryChange = (hex: string) => {
    if (!editingConfig) return;
    setEditingConfig({
      ...editingConfig,
      primary: hex,
      // Auto-derive unless user has manually set them (shown via advanced)
      ...(!showAdvancedColors
        ? { primaryDark: autoDarken(hex), primaryLight: autoLighten(hex) }
        : {}),
    });
  };

  const handleAccentChange = (hex: string) => {
    if (!editingConfig) return;
    setEditingConfig({
      ...editingConfig,
      accent: hex,
      ...(!showAdvancedColors
        ? { accentDark: autoDarken(hex), accentLight: autoLighten(hex) }
        : {}),
    });
  };

  const handleSave = () => {
    if (!editingConfig) return;

    // Generate ID only for truly new configs that have no ID yet
    const id = editingConfig.id || generateId(editingConfig.hospitalName);

    // Auto-fill dark/light if left empty
    const finalConfig: HospitalCoreConfig = {
      ...editingConfig,
      id,
      primaryDark: editingConfig.primaryDark || autoDarken(editingConfig.primary),
      primaryLight: editingConfig.primaryLight || autoLighten(editingConfig.primary),
      accentDark: editingConfig.accentDark || autoDarken(editingConfig.accent),
      accentLight: editingConfig.accentLight || autoLighten(editingConfig.accent),
    };

    saveConfig(finalConfig);
    setView("list");
    setEditingConfig(null);
  };

  const handleResetDsfh = () => {
    // Remove any saved DSFH overrides → revert to built-in
    deleteConfig("dsfh"); // this is a no-op in current code for "dsfh"
    // Force clear from localStorage manually
    try {
      const raw = localStorage.getItem("hospital-configs");
      if (raw) {
        const configs = JSON.parse(raw) as HospitalCoreConfig[];
        const filtered = configs.filter((c) => c.id !== "dsfh");
        localStorage.setItem("hospital-configs", JSON.stringify(filtered));
        // Reload the page to reset state
        window.location.reload();
      }
    } catch {
      /* ignore */
    }
  };

  const isDsfhModified = allConfigs[0]?.id === "dsfh" && allConfigs[0] !== DSFH_CORE &&
    JSON.stringify({ ...allConfigs[0], logoUrl: "", heroImageUrl: "" }) !== JSON.stringify({ ...DSFH_CORE, logoUrl: "", heroImageUrl: "" });

  return (
    <div
      className="absolute inset-0 z-[70] flex items-center justify-center"
      style={{ animation: "configuratorFadeIn 0.15s ease-out" }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: t.overlay }}
        onClick={onClose}
      />
      <div
        className="relative flex flex-col"
        style={{
          width: "520px",
          maxHeight: "85vh",
          borderRadius: "24px",
          backgroundColor: t.panelBg,
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          boxShadow:
            "0 16px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.5)",
          animation: "configuratorDialogIn 0.2s ease-out",
          overflow: "hidden",
        }}
      >
        {view === "list" ? (
          /* ─── LIST VIEW ─── */
          <>
            {/* Header */}
            <div
              className="flex items-center justify-between shrink-0"
              style={{ padding: "24px 24px 0 24px" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    backgroundColor: t.primarySubtle,
                  }}
                >
                  <Building2 size={22} style={{ color: t.primary }} />
                </div>
                <div>
                  <span
                    style={{
                      fontFamily: t.fontFamily,
                      fontSize: "20px",
                      fontWeight: 700,
                      color: t.textHeading,
                      display: "block",
                    }}
                  >
                    Hospital Configs
                  </span>
                  <span
                    style={{
                      fontFamily: t.fontFamily,
                      fontSize: "12px",
                      fontWeight: 500,
                      color: t.textMuted,
                    }}
                  >
                    Switch or create hospital branding
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(0,0,0,0.05)",
                  border: "none",
                }}
              >
                <X size={20} style={{ color: t.textMuted }} />
              </button>
            </div>

            {/* Config List */}
            <div
              className="flex-1 overflow-y-auto flex flex-col gap-2"
              style={{ padding: "20px 24px", scrollbarWidth: "none" }}
            >
              {Object.values(allConfigs)
                .filter(c => isFullAccess || c.id === lockedHospitalId)
                .map((config) => (
                  <ConfigCard
                    key={config.id}
                    config={config}
                    isActive={config.id === activeConfigId}
                    isBuiltIn={BUILTIN_PRESETS.some((p) => p.id === config.id)}
                    onSwitch={() => switchConfig(config.id)}
                    onEdit={() => startEdit(config, false)}
                    onDelete={() => deleteConfig(config.id)}
                  />
                ))}
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-2" style={{ padding: "16px 24px 24px 24px" }}>
              {/* Reset DSFH if modified */}
              {isDsfhModified && (
                <button
                  onClick={handleResetDsfh}
                  className="flex items-center justify-center gap-2 w-full cursor-pointer active:scale-[0.97] transition-transform"
                  style={{
                    height: "44px",
                    borderRadius: "12px",
                    backgroundColor: "rgba(0,0,0,0.04)",
                    border: "none",
                  }}
                >
                  <RotateCcw size={16} style={{ color: t.textMuted }} />
                  <span
                    style={{
                      fontFamily: t.fontFamily,
                      fontSize: "13px",
                      fontWeight: 600,
                      color: t.textMuted,
                    }}
                  >
                    Reset DSFH to Original
                  </span>
                </button>
              )}
              {isFullAccess && (
                <button
                  onClick={() => startEdit({ ...EMPTY_CONFIG, id: "" }, true)}
                  className="flex items-center justify-center gap-2 w-full cursor-pointer active:scale-[0.97] transition-transform"
                  style={{
                    height: "52px",
                    borderRadius: "14px",
                    backgroundColor: t.primary,
                    border: "none",
                    boxShadow: `0 4px 16px ${t.primarySubtle}`,
                  }}
                >
                  <Plus size={20} style={{ color: t.textInverse }} />
                  <span
                    style={{
                      fontFamily: t.fontFamily,
                      fontSize: "15px",
                      fontWeight: 700,
                      color: t.textInverse,
                    }}
                  >
                    New Hospital Config
                  </span>
                </button>
              )}
              <button
                onClick={() => setShowTokenGallery(true)}
                className="flex items-center justify-center gap-2 w-full cursor-pointer active:scale-[0.97] transition-transform"
                style={{
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: t.primarySubtle,
                  border: "none",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                <span
                  style={{
                    fontFamily: t.fontFamily,
                    fontSize: "13px",
                    fontWeight: 600,
                    color: t.primary,
                  }}
                >
                  Token Gallery
                </span>
              </button>
            </div>
          </>
        ) : (
          /* ─── EDIT VIEW ─── */
          <>
            {/* Header */}
            <div
              className="flex items-center gap-3 shrink-0"
              style={{ padding: "24px 24px 0 24px" }}
            >
              <button
                onClick={() => {
                  setView("list");
                  setEditingConfig(null);
                }}
                className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(0,0,0,0.05)",
                  border: "none",
                }}
              >
                <ChevronLeft size={20} style={{ color: t.textMuted }} />
              </button>
              <span
                style={{
                  fontFamily: t.fontFamily,
                  fontSize: "18px",
                  fontWeight: 700,
                  color: t.textHeading,
                }}
              >
                {isNew ? "New Config" : `Edit: ${editingConfig?.hospitalShortName || "Config"}`}
              </span>
            </div>

            {/* Form */}
            {editingConfig && (
              <div
                className="flex-1 overflow-y-auto flex flex-col gap-5"
                style={{ padding: "20px 24px", scrollbarWidth: "none" }}
              >
                {/* ── Identity ── */}
                <SectionHeader icon={<Building2 size={15} />} label="Identity" />
                <TextField
                  label="Hospital Name"
                  value={editingConfig.hospitalName}
                  onChange={(v) => updateField("hospitalName", v)}
                  placeholder="e.g. King Fahd Medical City"
                />
                <TextField
                  label="Short Name / Code"
                  value={editingConfig.hospitalShortName}
                  onChange={(v) => updateField("hospitalShortName", v)}
                  placeholder="e.g. KFMC"
                />

                {/* ── Typography ── */}
                <SectionHeader icon={<Type size={15} />} label="Typography" />
                <TextField
                  label="Latin Font Family"
                  value={editingConfig.fontFamily}
                  onChange={(v) => updateField("fontFamily", v)}
                  placeholder="'Inter', sans-serif"
                  hint="Must be imported in /src/styles/fonts.css"
                />
                <TextField
                  label="Arabic Font Family"
                  value={editingConfig.fontFamilyAr}
                  onChange={(v) => updateField("fontFamilyAr", v)}
                  placeholder="'Almarai', sans-serif"
                  hint="Must be imported in /src/styles/fonts.css"
                />

                {/* ── Assets ── */}
                <SectionHeader icon={<Image size={15} />} label="Assets" />
                <ImageUploadField
                  label="Hospital Logo"
                  value={editingConfig.logoUrl}
                  onChange={(v) => updateField("logoUrl", v)}
                  hint="Recommended: 360 × 190 px, PNG with transparent background"
                  previewHeight="60px"
                />
                
                <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.06)", margin: "8px 0" }} />

                <ImageUploadField
                  label="Hospital Background (Hero Image)"
                  value={editingConfig.heroImageUrl}
                  onChange={(v) => updateField("heroImageUrl", v)}
                  hint="Main wallpaper. Recommended: 1920 × 600 px, landscape exterior photo"
                  previewHeight="120px"
                />
                
                <HeroCropPicker
                  imageUrl={editingConfig.heroImageUrl}
                  cropPosition={editingConfig.heroCropPosition || "50% 15%"}
                  onChange={(pos) => updateField("heroCropPosition", pos)}
                />

                <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.06)", margin: "8px 0" }} />

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#95A3AD",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Greeting Card Slideshow Images
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 500, color: "#C0CAD0", lineHeight: "16px" }}>
                    These appear ONLY in the Patient Greeting card auto-carousel.
                  </span>
                  {(editingConfig.heroImageUrls || []).map((url, i, arr) => (
                    <div key={i} className="flex flex-col gap-2 relative" style={{ padding: "12px", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "12px" }}>
                      <ImageUploadField
                        label={`Slide Image ${i + 1}`}
                        value={url}
                        onChange={(v) => {
                          const newUrls = [...arr];
                          newUrls[i] = v;
                          updateField("heroImageUrls", newUrls);
                        }}
                        hint=""
                        previewHeight="80px"
                      />
                      <button
                        onClick={() => {
                          const newUrls = arr.filter((_, index) => index !== i);
                          updateField("heroImageUrls", newUrls);
                        }}
                        className="absolute top-3 right-3 cursor-pointer p-1.5 flex items-center justify-center transition-transform active:scale-95 z-20"
                        style={{
                          background: t.accentSubtle,
                          color: t.accent,
                          borderRadius: "6px",
                          border: "none",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const currentUrls = editingConfig.heroImageUrls || [];
                      updateField("heroImageUrls", [...currentUrls, ""]);
                    }}
                    className="flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                    style={{
                      height: "40px",
                      borderRadius: "10px",
                      border: `1.5px dashed ${t.primary}`,
                      backgroundColor: "transparent",
                      color: t.primary,
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    <Plus size={16} />
                    Add Slideshow Image
                  </button>

                  <div style={{ marginTop: "8px" }}>
                    <div className="flex flex-col gap-1.5">
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#95A3AD",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Slideshow Timer (Seconds)
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={editingConfig.slideshowInterval || 5}
                        onChange={(e) => updateField("slideshowInterval", parseInt(e.target.value) || 5)}
                        style={{
                          height: "40px",
                          borderRadius: "10px",
                          border: "1.5px solid rgba(0,0,0,0.08)",
                          padding: "0 14px",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#1B2A32",
                          backgroundColor: "rgba(0,0,0,0.02)",
                          outline: "none",
                        }}
                      />
                      <span style={{ fontSize: "11px", fontWeight: 500, color: "#C0CAD0", lineHeight: "16px" }}>
                        Time between slide transitions. Default is 5 seconds.
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Brand Colors ── */}
                <SectionHeader icon={<Palette size={15} />} label="Brand Colors" />
                <div className="flex gap-4">
                  <div className="flex-1">
                    <ColorField
                      label="Primary Color"
                      value={editingConfig.primary}
                      onChange={handlePrimaryChange}
                    />
                  </div>
                  <div className="flex-1">
                    <ColorField
                      label="Accent Color"
                      value={editingConfig.accent}
                      onChange={handleAccentChange}
                    />
                  </div>
                </div>

                {/* Auto-derived colors hint */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Info size={12} style={{ color: t.textDisabled }} />
                    <span style={{ fontSize: "11px", fontWeight: 500, color: t.textDisabled }}>
                      Dark & light variants are auto-generated
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAdvancedColors((v) => !v)}
                    className="cursor-pointer"
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: t.primary,
                      background: "none",
                      border: "none",
                      padding: 0,
                    }}
                  >
                    {showAdvancedColors ? "Hide advanced" : "Customize variants"}
                  </button>
                </div>

                {showAdvancedColors && (
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <ColorField
                          label="Primary Dark"
                          value={editingConfig.primaryDark || autoDarken(editingConfig.primary)}
                          onChange={(v) => updateField("primaryDark", v)}
                        />
                      </div>
                      <div className="flex-1">
                        <ColorField
                          label="Primary Light"
                          value={editingConfig.primaryLight || autoLighten(editingConfig.primary)}
                          onChange={(v) => updateField("primaryLight", v)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <ColorField
                          label="Accent Dark"
                          value={editingConfig.accentDark || autoDarken(editingConfig.accent)}
                          onChange={(v) => updateField("accentDark", v)}
                        />
                      </div>
                      <div className="flex-1">
                        <ColorField
                          label="Accent Light"
                          value={editingConfig.accentLight || autoLighten(editingConfig.accent)}
                          onChange={(v) => updateField("accentLight", v)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Live Preview ── */}
                <SectionHeader icon={<Info size={15} />} label="Live Preview" />
                <div
                  className="flex flex-col gap-2"
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="flex gap-2">
                    <div
                      className="flex-1 flex items-center justify-center"
                      style={{
                        height: "36px",
                        borderRadius: "10px",
                        backgroundColor: editingConfig.primary,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: editingConfig.fontFamily,
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        Primary
                      </span>
                    </div>
                    <div
                      className="flex-1 flex items-center justify-center"
                      style={{
                        height: "36px",
                        borderRadius: "10px",
                        backgroundColor: editingConfig.accent,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: editingConfig.fontFamily,
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        Accent
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div
                      style={{
                        flex: 1,
                        height: "20px",
                        borderRadius: "6px",
                        backgroundColor: editingConfig.primaryDark || autoDarken(editingConfig.primary),
                      }}
                    />
                    <div
                      style={{
                        flex: 2,
                        height: "20px",
                        borderRadius: "6px",
                        backgroundColor: editingConfig.primary,
                      }}
                    />
                    <div
                      style={{
                        flex: 2,
                        height: "20px",
                        borderRadius: "6px",
                        backgroundColor: editingConfig.primaryLight || autoLighten(editingConfig.primary),
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: editingConfig.fontFamily,
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#1B2A32",
                    }}
                  >
                    {editingConfig.hospitalName || "Hospital Name"}
                  </span>
                  <span
                    style={{
                      fontFamily: editingConfig.fontFamilyAr,
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#1B2A32",
                      direction: "rtl",
                    }}
                  >
                    مستشفى عينة
                  </span>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div style={{ padding: "16px 24px 24px 24px" }}>
              <button
                onClick={handleSave}
                disabled={!editingConfig?.hospitalName}
                className="flex items-center justify-center gap-2 w-full cursor-pointer active:scale-[0.97] transition-transform"
                style={{
                  height: "52px",
                  borderRadius: "14px",
                  backgroundColor: editingConfig?.hospitalName
                    ? t.primary
                    : t.textDisabled,
                  border: "none",
                  opacity: editingConfig?.hospitalName ? 1 : 0.5,
                }}
              >
                <Check size={20} style={{ color: t.textInverse }} />
                <span
                  style={{
                    fontFamily: t.fontFamily,
                    fontSize: "15px",
                    fontWeight: 700,
                    color: t.textInverse,
                  }}
                >
                  {isNew ? "Save & Activate" : "Save Changes"}
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes configuratorFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes configuratorDialogIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Token Gallery overlay */}
      {showTokenGallery && (
        <TokenGallery onClose={() => setShowTokenGallery(false)} />
      )}
    </div>
  );
}

/* ─ Section Header helper ── */
function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  const { theme: t } = useTheme();
  return (
    <div className="flex items-center gap-2 mt-2">
      <span style={{ color: t.textMuted }}>{icon}</span>
      <span
        style={{
          fontFamily: t.fontFamily,
          fontSize: "13px",
          fontWeight: 700,
          color: t.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </span>
    </div>
  );
}