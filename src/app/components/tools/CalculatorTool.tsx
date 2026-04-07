import { useState, useCallback } from "react";
import { useTheme, TYPE_SCALE, WEIGHT, SHADOW } from "../ThemeContext";
import { useLocale } from "../i18n";
import { ArrowLeft, Delete } from "lucide-react";

export function CalculatorTool({ onClose, onBackToTools }: { onClose: () => void; onBackToTools: () => void }) {
  const { theme } = useTheme();
  const { fontFamily } = useLocale();
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleNumber = useCallback(
    (num: string) => {
      if (waitingForOperand) {
        setDisplay(String(num));
        setWaitingForOperand(false);
      } else {
        setDisplay(display === "0" ? String(num) : display + num);
      }
    },
    [display, waitingForOperand]
  );

  const handleDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const handleOperation = useCallback(
    (nextOperation: string) => {
      const inputValue = parseFloat(display);

      if (previousValue === null) {
        setPreviousValue(inputValue);
      } else if (operation) {
        const currentValue = previousValue || 0;
        let newValue = currentValue;

        switch (operation) {
          case "+":
            newValue = currentValue + inputValue;
            break;
          case "-":
            newValue = currentValue - inputValue;
            break;
          case "×":
            newValue = currentValue * inputValue;
            break;
          case "÷":
            newValue = currentValue / inputValue;
            break;
          case "%":
            newValue = currentValue % inputValue;
            break;
        }

        setDisplay(String(newValue));
        setPreviousValue(newValue);
      }

      setWaitingForOperand(true);
      setOperation(nextOperation);
    },
    [display, previousValue, operation]
  );

  const handleEquals = useCallback(() => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const currentValue = previousValue || 0;
      let newValue = currentValue;

      switch (operation) {
        case "+":
          newValue = currentValue + inputValue;
          break;
        case "-":
          newValue = currentValue - inputValue;
          break;
        case "×":
          newValue = currentValue * inputValue;
          break;
        case "÷":
          newValue = currentValue / inputValue;
          break;
        case "%":
          newValue = currentValue % inputValue;
          break;
      }

      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  }, [display, previousValue, operation]);

  const handleClear = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, []);

  const handleBackspace = useCallback(() => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  }, [display]);

  const buttons = [
    { label: "C", action: () => handleClear(), color: "#D10044", span: 1 },
    { label: "( )", action: () => {}, color: theme.textMuted, span: 1 },
    { label: "%", action: () => handleOperation("%"), color: theme.textMuted, span: 1 },
    { label: "÷", action: () => handleOperation("÷"), color: theme.primary, span: 1 },
    
    { label: "7", action: () => handleNumber("7"), color: theme.textHeading, span: 1 },
    { label: "8", action: () => handleNumber("8"), color: theme.textHeading, span: 1 },
    { label: "9", action: () => handleNumber("9"), color: theme.textHeading, span: 1 },
    { label: "×", action: () => handleOperation("×"), color: theme.primary, span: 1 },
    
    { label: "4", action: () => handleNumber("4"), color: theme.textHeading, span: 1 },
    { label: "5", action: () => handleNumber("5"), color: theme.textHeading, span: 1 },
    { label: "6", action: () => handleNumber("6"), color: theme.textHeading, span: 1 },
    { label: "-", action: () => handleOperation("-"), color: theme.primary, span: 1 },
    
    { label: "1", action: () => handleNumber("1"), color: theme.textHeading, span: 1 },
    { label: "2", action: () => handleNumber("2"), color: theme.textHeading, span: 1 },
    { label: "3", action: () => handleNumber("3"), color: theme.textHeading, span: 1 },
    { label: "+", action: () => handleOperation("+"), color: theme.primary, span: 1 },
    
    { label: "0", action: () => handleNumber("0"), color: theme.textHeading, span: 2 },
    { label: ".", action: () => handleDecimal(), color: theme.textHeading, span: 1 },
    { label: "=", action: () => handleEquals(), color: theme.primary, span: 1 },
  ];

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
            Calculator
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

      {/* Calculator Content */}
      <div className="flex-1 flex items-center justify-center px-16 py-12">
        <div
          className="flex flex-col"
          style={{
            width: "600px",
            backgroundColor: theme.surface,
            borderRadius: theme.radiusCard,
            border: theme.cardBorder,
            boxShadow: SHADOW.xl,
            padding: "32px",
          }}
        >
          {/* Display */}
          <div
            className="mb-6 px-6 py-8 text-right"
            style={{
              backgroundColor: theme.background,
              borderRadius: theme.radiusMd,
              minHeight: "120px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            {operation && (
              <div
                style={{
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.md,
                  color: theme.textMuted,
                  marginBottom: "8px",
                }}
              >
                {previousValue} {operation}
              </div>
            )}
            <div
              style={{
                fontFamily: fontFamily,
                fontSize: "48px",
                fontWeight: WEIGHT.bold,
                color: theme.textHeading,
                wordBreak: "break-all",
              }}
            >
              {display}
            </div>
          </div>

          {/* Button Grid */}
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(4, 1fr)",
            }}
          >
            {buttons.map((btn, index) => (
              <button
                key={index}
                onClick={btn.action}
                className="cursor-pointer active:scale-95 transition-transform"
                style={{
                  gridColumn: btn.span > 1 ? `span ${btn.span}` : "auto",
                  height: "88px",
                  backgroundColor: theme.surfaceElevated,
                  borderRadius: theme.radiusMd,
                  border: "none",
                  outline: "none",
                  fontFamily: fontFamily,
                  fontSize: TYPE_SCALE.xl,
                  fontWeight: WEIGHT.semibold,
                  color: btn.color,
                  boxShadow: SHADOW.sm,
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Backspace Button */}
          <button
            onClick={handleBackspace}
            className="mt-3 cursor-pointer active:scale-95 transition-transform flex items-center justify-center gap-2"
            style={{
              height: "56px",
              backgroundColor: theme.surfaceElevated,
              borderRadius: theme.radiusMd,
              border: "none",
              outline: "none",
              fontFamily: fontFamily,
              fontSize: TYPE_SCALE.base,
              fontWeight: WEIGHT.semibold,
              color: theme.textMuted,
              boxShadow: SHADOW.sm,
            }}
          >
            <Delete size={20} />
            <span>Backspace</span>
          </button>
        </div>
      </div>
    </div>
  );
}
