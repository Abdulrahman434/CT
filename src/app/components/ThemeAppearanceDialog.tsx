import { useState, useRef, useEffect, CSSProperties } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Upload,
  RotateCcw,
  Building2,
  Palette,
  Type,
  Trash2
} from "lucide-react";
import {
  useTheme,
  type Layout2Theme,
  type Layout2TileGroups,
  type TileGroupStyle,
  type TileIconColor,
  DEFAULT_LAYOUT2_THEME,
  DEFAULT_TILE_GROUPS,
} from "./ThemeContext";

// Adds "#" when the user types a bare hex value.
const ensureHex = (val: string) => (val.startsWith("#") ? val : "#" + val);

/**
 * One configuration card for a single Layout 2 tile group (Left Sidebar / Main
 * Right / Bottom Action). Matches the panel's existing card design language —
 * slate card, uppercase labels, mono hex inputs, rounded swatches. Background
 * defaults to the live theme primary when unset so the group stays in sync with
 * Layout 1 until the admin picks an explicit colour.
 */
function TileGroupCard({
  title,
  badge,
  group,
  primary,
  onChange,
}: {
  title: string;
  badge: string;
  group: TileGroupStyle;
  primary: string;
  onChange: (patch: Partial<TileGroupStyle>) => void;
}) {
  const bgInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const bgValue = group.bg || primary;
  const iconCustom = group.iconCustom || "#ffffff";

  const ICON_OPTIONS: { key: TileIconColor; label: string }[] = [
    { key: "primary", label: "Primary" },
    { key: "secondary", label: "Secondary" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-3.5">
      {/* Card header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">{title}</span>
        <span className="text-[10px] bg-slate-200/80 text-slate-500 px-2 py-0.5 rounded-full font-medium">{badge}</span>
      </div>

      {/* Background color */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
          BACKGROUND COLOR
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            ref={bgInputRef}
            value={bgValue}
            onChange={(e) => onChange({ bg: e.target.value })}
            className="hidden"
          />
          <button
            onClick={() => bgInputRef.current?.click()}
            className="size-9 rounded-lg border border-slate-200 shadow-xs cursor-pointer active:scale-95 transition-transform shrink-0"
            style={{ backgroundColor: bgValue }}
          />
          <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            <span className="text-slate-400 mr-1 text-sm">#</span>
            <input
              type="text"
              value={bgValue.replace("#", "")}
              onChange={(e) => onChange({ bg: ensureHex(e.target.value) })}
              className="bg-transparent text-slate-700 font-mono text-sm focus:outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Opacity */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">OPACITY</label>
          <span className="text-[11px] font-bold text-slate-600">{group.opacity}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={group.opacity}
          onChange={(e) => onChange({ opacity: parseInt(e.target.value, 10) })}
          className="w-full cursor-pointer"
          style={{ accentColor: bgValue }}
        />
      </div>

      {/* Scale */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">SCALE</label>
          <span className="text-[11px] font-bold text-slate-600">{group.scale.toFixed(2)}×</span>
        </div>
        <input
          type="range"
          min={0.8}
          max={1.2}
          step={0.01}
          value={group.scale}
          onChange={(e) => onChange({ scale: parseFloat(e.target.value) })}
          className="w-full cursor-pointer"
          style={{ accentColor: bgValue }}
        />
      </div>

      {/* Icon color */}
      <div>
        <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
          ICON COLOR
        </label>
        <div className="flex gap-1.5">
          {ICON_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onChange({ iconColor: opt.key })}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                group.iconColor === opt.key
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {group.iconColor === "custom" && (
          <div className="flex items-center gap-2 mt-2.5">
            <input
              type="color"
              ref={iconInputRef}
              value={iconCustom}
              onChange={(e) => onChange({ iconCustom: e.target.value })}
              className="hidden"
            />
            <button
              onClick={() => iconInputRef.current?.click()}
              className="size-9 rounded-lg border border-slate-200 shadow-xs cursor-pointer active:scale-95 transition-transform shrink-0"
              style={{ backgroundColor: iconCustom }}
            />
            <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5">
              <span className="text-slate-400 mr-1 text-sm">#</span>
              <input
                type="text"
                value={iconCustom.replace("#", "")}
                onChange={(e) => onChange({ iconCustom: ensureHex(e.target.value) })}
                className="bg-transparent text-slate-700 font-mono text-sm focus:outline-none w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const FONT_OPTIONS = [
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Mulish", value: "'Mulish', sans-serif" },
  { label: "Outfit", value: "'Outfit', sans-serif" },
  { label: "Almarai", value: "'Almarai', sans-serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" }
];

export function ThemeAppearanceDialog({ onClose }: { onClose: () => void }) {
  const { layout2Theme, saveLayout2Theme, theme, allConfigs, activeConfigId, saveConfig } = useTheme();
  const tileGroups = layout2Theme.tileGroups ?? DEFAULT_TILE_GROUPS;

  // Background image opacity is stored on the active hospital config
  // (theme.heroOpacity, percent 0–100, default 40) so it applies live to the
  // Layout 2 background photo and persists with that hospital after refresh.
  const heroOpacity = theme.heroOpacity;
  const setHeroOpacity = (value: number) => {
    const clamped = Math.max(0, Math.min(100, Number.isNaN(value) ? 0 : value));
    const activeConfig = allConfigs.find((c) => c.id === activeConfigId);
    if (activeConfig) saveConfig({ ...activeConfig, heroOpacity: clamped });
  };
  
  // Local toggle states for sections
  const [sections, setSections] = useState({
    clientLogo: true,
    customColors: false,
    pageBg: true,
    tileBg: true,
    typography: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageBgColorInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset to default
  const handleReset = () => {
    saveLayout2Theme(DEFAULT_LAYOUT2_THEME);
  };

  // Color changes
  const updateField = (key: keyof Layout2Theme, value: string) => {
    saveLayout2Theme({
      ...layout2Theme,
      [key]: value,
      presetName: "custom" // Switch preset selector to custom
    });
  };

  // Per-tile-group changes — patches only the targeted group, leaving the other
  // two untouched (and independent from the brand presets above).
  const updateTileGroup = (groupKey: keyof Layout2TileGroups, patch: Partial<TileGroupStyle>) => {
    saveLayout2Theme({
      ...layout2Theme,
      tileGroups: {
        ...tileGroups,
        [groupKey]: { ...tileGroups[groupKey], ...patch },
      },
    });
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateField("clientLogo", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateField("clientLogo", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Helper to ensure color string is valid hex (adds '#' if missing)
  const formatHexInput = (val: string) => {
    if (!val.startsWith("#")) {
      return "#" + val;
    }
    return val;
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-xs select-none">
      <div 
        className="relative bg-white rounded-[24px] shadow-2xl w-[400px] max-h-[85vh] overflow-hidden flex flex-col font-sans border border-slate-100"
        style={{ animation: "configuratorDialogIn 0.2s ease-out" }}
      >
        
        {/* Header Section — follows the active hospital's brand colour */}
        <div className="flex items-center justify-between px-6 py-4 text-white shrink-0" style={{ backgroundColor: theme.primary }}>
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-semibold tracking-wide">Theme & Appearance</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="size-[18px]" />
            </button>
          </div>
        </div>

        {/* Scrollable Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[calc(85vh-60px)] custom-scrollbar">
          
          {/* Section: Client Brand Logo */}
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection("clientLogo")}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm">
                <Building2 className="size-4.5 text-slate-500" />
                <span>Client Brand Logo</span>
              </div>
              {sections.clientLogo ? <ChevronUp className="size-4.5 text-slate-400" /> : <ChevronDown className="size-4.5 text-slate-400" />}
            </button>
            
            {sections.clientLogo && (
              <div className="p-4 border-t border-slate-100 bg-white">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                {layout2Theme.clientLogo ? (
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <img 
                      src={layout2Theme.clientLogo} 
                      alt="Uploaded Logo" 
                      className="max-h-10 max-w-[180px] object-contain rounded" 
                    />
                    <button 
                      onClick={removeLogo}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Remove logo"
                    >
                      <Trash2 className="size-4.5" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-slate-50/50"
                  >
                    <Upload className="size-8 text-sky-400" />
                    <span className="text-sm font-semibold text-slate-700">Upload client logo</span>
                    <span className="text-xs text-slate-400">PNG, SVG, or JPG</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Brand Colors */}
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection("customColors")}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm">
                <Palette className="size-4.5 text-slate-500" />
                <span>Brand Colors</span>
              </div>
              {sections.customColors ? <ChevronUp className="size-4.5 text-slate-400" /> : <ChevronRight className="size-4.5 text-slate-400" />}
            </button>

            {sections.customColors && (
              <div className="p-4 border-t border-slate-100 bg-white space-y-4">

                {/* Primary / Accent reflect the chosen hospital's live theme — they
                    follow Layout 1 automatically and update on hospital switch. */}
                {/* Primary Brand Color (from hospital) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                    PRIMARY BRAND COLOR
                  </label>
                  <div className="flex items-center gap-2">
                    <div
                      className="size-9 rounded-lg border border-slate-200 shadow-xs shrink-0"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                      <span className="text-slate-400 mr-1 text-sm">#</span>
                      <span className="text-slate-700 font-mono text-sm">{theme.primary.replace("#", "")}</span>
                    </div>
                  </div>
                </div>

                {/* Accent Brand Color (from hospital) */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                    ACCENT BRAND COLOR
                  </label>
                  <div className="flex items-center gap-2">
                    <div
                      className="size-9 rounded-lg border border-slate-200 shadow-xs shrink-0"
                      style={{ backgroundColor: theme.accent }}
                    />
                    <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                      <span className="text-slate-400 mr-1 text-sm">#</span>
                      <span className="text-slate-700 font-mono text-sm">{theme.accent.replace("#", "")}</span>
                    </div>
                  </div>
                </div>

                <span className="block text-[11px] text-slate-400 font-normal leading-normal">
                  Inherited from the active hospital. Layout 2 always matches the selected hospital's brand colours.
                </span>

              </div>
            )}
          </div>

          {/* Section: Page Background */}
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection("pageBg")}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm">
                <Palette className="size-4.5 text-slate-500" />
                <span>Page Background</span>
              </div>
              {sections.pageBg ? <ChevronUp className="size-4.5 text-slate-400" /> : <ChevronDown className="size-4.5 text-slate-400" />}
            </button>
            
            {sections.pageBg && (
              <div className="p-4 border-t border-slate-100 bg-white space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  BACKGROUND COLOR
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    ref={pageBgColorInputRef}
                    value={layout2Theme.pageBg || "#ffffff"} 
                    onChange={(e) => updateField("pageBg", e.target.value)}
                    className="hidden" 
                  />
                  <button 
                    onClick={() => pageBgColorInputRef.current?.click()}
                    className="size-9 rounded-lg border border-slate-200 shadow-xs cursor-pointer active:scale-95 transition-transform"
                    style={{ backgroundColor: layout2Theme.pageBg || "#ffffff" }}
                  />
                  <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                    <span className="text-slate-400 mr-1 text-sm">#</span>
                    <input 
                      type="text" 
                      value={(layout2Theme.pageBg || "#ffffff").replace("#", "")}
                      onChange={(e) => updateField("pageBg", formatHexInput(e.target.value))}
                      className="bg-transparent text-slate-700 font-mono text-sm focus:outline-none w-full"
                    />
                  </div>
                </div>
                <span className="block text-[11px] text-slate-400 font-normal leading-normal">
                  The area behind all tiles. Overridden by a background image if set.
                </span>

                {/* Background Image Opacity — drives the active hospital's
                    background photo (theme.heroOpacity); live + persisted. */}
                <div className="pt-1">
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                    BACKGROUND IMAGE OPACITY
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={heroOpacity}
                      onChange={(e) => setHeroOpacity(parseInt(e.target.value, 10))}
                      className="flex-1 cursor-pointer"
                      style={{ accentColor: theme.primary }}
                    />
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 w-[72px]">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={heroOpacity}
                        onChange={(e) => setHeroOpacity(parseInt(e.target.value, 10))}
                        className="bg-transparent text-slate-700 font-mono text-sm focus:outline-none w-full text-right"
                      />
                      <span className="text-slate-400 ml-1 text-sm">%</span>
                    </div>
                  </div>
                  <span className="block text-[11px] text-slate-400 font-normal leading-normal mt-2">
                    Controls the transparency of the background image
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section: Tile Backgrounds */}
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection("tileBg")}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm">
                <Palette className="size-4.5 text-slate-500" />
                <span>Tile Backgrounds</span>
              </div>
              {sections.tileBg ? <ChevronUp className="size-4.5 text-slate-400" /> : <ChevronDown className="size-4.5 text-slate-400" />}
            </button>
            
            {sections.tileBg && (
              <div className="p-4 border-t border-slate-100 bg-white space-y-4">

                {/* One independent card per Layout 2 tile group. Each patches only
                    its own group via updateTileGroup, so changing one never
                    affects the others. */}
                <TileGroupCard
                  title="Left Sidebar Tiles"
                  badge="8 tiles"
                  group={tileGroups.left}
                  primary={theme.primary}
                  onChange={(patch) => updateTileGroup("left", patch)}
                />
                <TileGroupCard
                  title="Main Right Tiles"
                  badge="6 tiles"
                  group={tileGroups.main}
                  primary={theme.primary}
                  onChange={(patch) => updateTileGroup("main", patch)}
                />
                <TileGroupCard
                  title="Bottom Action Tiles"
                  badge="4 tiles"
                  group={tileGroups.bottom}
                  primary={theme.primary}
                  onChange={(patch) => updateTileGroup("bottom", patch)}
                />

              </div>
            )}
          </div>

          {/* Section: Typography */}
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
            <button 
              onClick={() => toggleSection("typography")}
              className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm">
                <Type className="size-4.5 text-slate-500" />
                <span>Typography</span>
              </div>
              {sections.typography ? <ChevronUp className="size-4.5 text-slate-400" /> : <ChevronDown className="size-4.5 text-slate-400" />}
            </button>
            
            {sections.typography && (
              <div className="p-4 border-t border-slate-100 bg-white space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  FONT FAMILY
                </label>
                <div className="relative">
                  <select 
                    value={layout2Theme.typography || "'Inter', sans-serif"}
                    onChange={(e) => updateField("typography", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-700 font-medium focus:outline-none cursor-pointer appearance-none"
                  >
                    {FONT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
      
      {/* Dialogue Animations/Styles Injection */}
      <style>{`
        @keyframes configuratorDialogIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
