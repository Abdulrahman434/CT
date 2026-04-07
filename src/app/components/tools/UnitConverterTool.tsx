import { useState, useCallback } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import { ArrowLeft, ArrowLeftRight } from "lucide-react";

type ConversionCategory = "temperature" | "weight" | "length";

interface ConversionUnit {
  name: string;
  symbol: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
}

const conversions: Record<ConversionCategory, { units: ConversionUnit[]; icon: string }> = {
  temperature: {
    icon: "🌡️",
    units: [
      {
        name: "Celsius",
        symbol: "°C",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        name: "Fahrenheit",
        symbol: "°F",
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
      },
      {
        name: "Kelvin",
        symbol: "K",
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
    ],
  },
  weight: {
    icon: "⚖️",
    units: [
      {
        name: "Kilogram",
        symbol: "kg",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        name: "Pound",
        symbol: "lb",
        toBase: (v) => v * 0.453592,
        fromBase: (v) => v / 0.453592,
      },
      {
        name: "Ounce",
        symbol: "oz",
        toBase: (v) => v * 0.0283495,
        fromBase: (v) => v / 0.0283495,
      },
      {
        name: "Gram",
        symbol: "g",
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
    ],
  },
  length: {
    icon: "📏",
    units: [
      {
        name: "Meter",
        symbol: "m",
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        name: "Kilometer",
        symbol: "km",
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      {
        name: "Centimeter",
        symbol: "cm",
        toBase: (v) => v / 100,
        fromBase: (v) => v * 100,
      },
      {
        name: "Mile",
        symbol: "mi",
        toBase: (v) => v * 1609.34,
        fromBase: (v) => v / 1609.34,
      },
      {
        name: "Foot",
        symbol: "ft",
        toBase: (v) => v * 0.3048,
        fromBase: (v) => v / 0.3048,
      },
      {
        name: "Inch",
        symbol: "in",
        toBase: (v) => v * 0.0254,
        fromBase: (v) => v / 0.0254,
      },
    ],
  },
};

export function UnitConverterTool({ onClose, onBackToTools }: { onClose: () => void; onBackToTools: () => void }) {
  const { theme } = useTheme();
  const { fontFamily } = useLocale();
  const [category, setCategory] = useState<ConversionCategory>("temperature");
  const [fromUnit, setFromUnit] = useState(0);
  const [toUnit, setToUnit] = useState(1);
  const [fromValue, setFromValue] = useState("0");

  const currentUnits = conversions[category].units;

  const convertValue = useCallback(() => {
    const inputValue = parseFloat(fromValue) || 0;
    const baseValue = currentUnits[fromUnit].toBase(inputValue);
    const result = currentUnits[toUnit].fromBase(baseValue);
    return result.toFixed(2);
  }, [fromValue, fromUnit, toUnit, currentUnits]);

  const handleSwapUnits = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }, [fromUnit, toUnit]);

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
            Unit Converter
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

      {/* Converter Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-16 py-12">
        {/* Category Selector */}
        <div className="flex gap-4 mb-12">
          {(Object.keys(conversions) as ConversionCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setFromUnit(0);
                setToUnit(1);
                setFromValue("0");
              }}
              className="cursor-pointer transition-all"
              style={{
                padding: "16px 32px",
                backgroundColor: category === cat ? theme.primary : theme.surface,
                borderRadius: theme.radiusMd,
                border: category === cat ? "none" : theme.cardBorder,
                outline: "none",
                boxShadow: category === cat ? SHADOW.md : "none",
              }}
            >
              <div className="flex items-center gap-3">
                <span style={{ fontSize: "32px" }}>{conversions[cat].icon}</span>
                <span
                  style={{
                    fontFamily: fontFamily,
                    fontSize: TYPE_SCALE.md,
                    fontWeight: WEIGHT.bold,
                    color: category === cat ? theme.textInverse : theme.textHeading,
                  }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Conversion Interface */}
        <div
          className="flex flex-col gap-6"
          style={{
            width: "800px",
            backgroundColor: theme.surface,
            borderRadius: theme.radiusCard,
            border: theme.cardBorder,
            boxShadow: SHADOW.xl,
            padding: "48px",
          }}
        >
          {/* From Input */}
          <div>
            <label
              className="block mb-2"
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.sm,
                fontWeight: WEIGHT.semibold,
                color: theme.textMuted,
              }}
            >
              From
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                value={fromValue}
                onChange={(e) => setFromValue(e.target.value)}
                className="flex-1"
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.xl,
                  fontWeight: WEIGHT.bold,
                  color: theme.textHeading,
                  backgroundColor: theme.background,
                  borderRadius: theme.radiusMd,
                  border: theme.cardBorder,
                  padding: "20px",
                  outline: "none",
                }}
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(parseInt(e.target.value))}
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.md,
                  fontWeight: WEIGHT.semibold,
                  color: theme.textHeading,
                  backgroundColor: theme.background,
                  borderRadius: theme.radiusMd,
                  border: theme.cardBorder,
                  padding: "20px",
                  outline: "none",
                  minWidth: "180px",
                }}
              >
                {currentUnits.map((unit, index) => (
                  <option key={index} value={index}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwapUnits}
              className="cursor-pointer active:scale-95 transition-transform"
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: theme.primarySubtle,
                borderRadius: "50%",
                border: "none",
                outline: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowLeftRight size={28} color={theme.primary} />
            </button>
          </div>

          {/* To Output */}
          <div>
            <label
              className="block mb-2"
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.sm,
                fontWeight: WEIGHT.semibold,
                color: theme.textMuted,
              }}
            >
              To
            </label>
            <div className="flex gap-4">
              <div
                className="flex-1 flex items-center"
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.xl,
                  fontWeight: WEIGHT.bold,
                  color: theme.primary,
                  backgroundColor: theme.background,
                  borderRadius: theme.radiusMd,
                  border: theme.cardBorder,
                  padding: "20px",
                }}
              >
                {convertValue()}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(parseInt(e.target.value))}
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.md,
                  fontWeight: WEIGHT.semibold,
                  color: theme.textHeading,
                  backgroundColor: theme.background,
                  borderRadius: theme.radiusMd,
                  border: theme.cardBorder,
                  padding: "20px",
                  outline: "none",
                  minWidth: "180px",
                }}
              >
                {currentUnits.map((unit, index) => (
                  <option key={index} value={index}>
                    {unit.name} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Summary */}
          <div
            className="text-center pt-4"
            style={{
              borderTop: theme.cardBorder,
            }}
          >
            <p
              style={{
                fontFamily: fontFamily,
                fontSize: TYPE_SCALE.md,
                color: theme.textMuted,
              }}
            >
              {fromValue} {currentUnits[fromUnit].symbol} ={" "}
              <span style={{ color: theme.primary, fontWeight: WEIGHT.bold }}>
                {convertValue()} {currentUnits[toUnit].symbol}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
