import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, ArrowRight, Sun, Sunrise, Coffee, Moon,
  Check, Clock, Calendar, Utensils, Soup, ClipboardList, Bell, ChefHat,
  Star, Heart, Droplets, Flame, Snowflake,
  Baby, User, FlaskConical, ChevronDown, ChevronRight, ChevronLeft, Home,
} from "lucide-react";
import { InternalPageHeader } from "./InternalPageHeader";
import { useTheme, TYPE_SCALE, WEIGHT, TEXT_STYLE, SHADOW } from "./ThemeContext";
import { useLocale } from "./i18n";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ApiImage } from "./ApiImage";
import { useOrders } from "./OrderStore";
import { useNurseStore } from "./NurseDataStore";
import mealSvg from "../../imports/meal.svg";
import roomSvg from "../../imports/room.svg";
import dietSvg from "../../imports/diet.svg";
import allergiesSvg from "../../imports/allergies.svg";
import {
  type DietType, type MealId as MealIdData, type GroupMode as GroupModeData,
  type MenuGroup, type GroupItem,
  DIET_CONFIG, FOOD_PHOTOS,
  getMenuGroups, getKidsBreakfastGroups, MEAL_WINDOWS,
} from "./menuData";

/* ═══════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════ */

type MealId = MealIdData;
type Step = "landing" | "select-type" | "select-meal" | "kids-breakfast-type" | "build-meal" | "confirmed" | "history";
type OrderFor = "patient" | "guest";
type GroupMode = GroupModeData;
type KidsBreakfastType = "hot" | "cold" | null;

interface MealPeriod {
  id: MealId;
  label: { en: string; ar: string };
  icon: React.ComponentType<{ size?: number; color?: string }>;
  timeRange: string;
  hours: [number, number];
  orderCutoff: number;
  bgImage: string;
  color: string;
  groups: MenuGroup[];
}

type Selections = Record<string, string[]>;

/* ═══════════════════════════════════════════════════════════════════════════
 * BUILD MEAL PERIODS from menuData
 * ═══════════════════════════════════════════════════════════════════════════ */

const P = FOOD_PHOTOS;

const MEAL_ICONS: Record<MealId, React.ComponentType<{ size?: number; color?: string }>> = {
  breakfast: Sun,
  lunch:     Coffee,
  dinner:    Moon,
};

const MEAL_BG_IMAGES: Record<MealId, string> = {
  breakfast: P.breakfastBg,
  lunch:     P.lunchBg,
  dinner:    P.dinnerBg,
};

function buildMeals(diet: DietType, dayOfWeek: number, kidsBreakfastType?: KidsBreakfastType): MealPeriod[] {
  const mealIds: MealId[] = ["breakfast", "lunch", "dinner"];
  return mealIds.map((mealId) => {
    const w = MEAL_WINDOWS[mealId];
    let groups: MenuGroup[];
    if (diet === "kids" && mealId === "breakfast" && kidsBreakfastType) {
      groups = getKidsBreakfastGroups(kidsBreakfastType);
    } else {
      groups = getMenuGroups(diet, mealId, dayOfWeek);
    }
    return {
      id: mealId,
      label: w.label,
      icon: MEAL_ICONS[mealId],
      timeRange: w.timeRange,
      hours: w.hours,
      orderCutoff: w.orderCutoff,
      bgImage: MEAL_BG_IMAGES[mealId],
      color: w.color,
      groups,
    };
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
 * HELPERS
 * ═══════════════════════════════════════════════════════════════════════════ */

function isMealActive(hours: [number, number]): boolean {
  const h = new Date().getHours();
  return h >= hours[0] && h < hours[1];
}

/** Global toggle: when false, all meals are always orderable (testing mode). */
let _enforceOrderTime = typeof window !== "undefined" ? localStorage.getItem("fo_enforceTime") !== "false" : true;
function setEnforceOrderTime(v: boolean) { _enforceOrderTime = v; if (typeof window !== "undefined") localStorage.setItem("fo_enforceTime", String(v)); }
function getEnforceOrderTime() { return _enforceOrderTime; }

/** Best-practice ordering rule: orders accepted up until `orderCutoff` (today). */
function isMealOrderable(meal: MealPeriod): boolean {
  if (!_enforceOrderTime) return true;
  const now = new Date();
  const nowHours = now.getHours() + now.getMinutes() / 60;
  return nowHours < meal.orderCutoff;
}

/** Format a decimal hour (e.g. 11.5) as "11:30 AM" */
function formatHour(h: number, isRTL: boolean): string {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d.toLocaleTimeString(isRTL ? "ar-SA" : "en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function locTimeRange(tr: string, isRTL: boolean): string {
  if (!isRTL) return tr;
  return tr.replace(/AM/g, "صباحًا").replace(/PM/g, "مساءً");
}

function getInitialSelections(meal: MealPeriod): Selections {
  const sel: Selections = {};
  meal.groups.forEach((g) => {
    sel[g.id] = g.mode === "included" ? g.items.map((i) => i.id) : [];
  });
  return sel;
}

function getRequiredGroups(meal: MealPeriod) {
  return meal.groups.filter((g) => g.mode !== "included");
}

function isOrderComplete(meal: MealPeriod, selections: Selections): boolean {
  return getRequiredGroups(meal).every((g) => {
    const needed = g.mode === "choose-2" ? 2 : 1;
    return (selections[g.id] || []).length >= needed;
  });
}

function countCompleted(meal: MealPeriod, selections: Selections): number {
  return getRequiredGroups(meal).filter((g) => {
    const needed = g.mode === "choose-2" ? 2 : 1;
    return (selections[g.id] || []).length >= needed;
  }).length;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * DEMO DIET TYPES (cycle list for the demo switcher)
 * ═══════════════════════════════════════════════════════════════════════════ */

const DEMO_PATIENT = { name: "Sara Saleh", room: "Room 412" };

/* ═══════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

/* ── Resolve CSS custom properties for theme-driven colors ── */
const TEAL = "var(--fo-primary)";
const TEAL_50 = "rgba(var(--fo-primary-rgb), 0.31)";
const TEAL_25 = "rgba(var(--fo-primary-rgb), 0.15)";
const TEAL_20 = "rgba(var(--fo-primary-rgb), 0.12)";
const TEAL_15 = "rgba(var(--fo-primary-rgb), 0.09)";
const TEAL_DARK = "var(--fo-primary-dark)";
const SECONDARY = "var(--fo-secondary)";
const GREEN = "#3FC168";
const TEAL_BG_TINT = "var(--fo-bg-tint)";

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "0, 138, 171";
}

/** Lighten a hex colour towards white for tinted backgrounds */
function tintHex(hex: string, amount = 0.92): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "#F2F9FB";
  const r = Math.round(parseInt(result[1], 16) + (255 - parseInt(result[1], 16)) * amount);
  const g = Math.round(parseInt(result[2], 16) + (255 - parseInt(result[2], 16)) * amount);
  const b = Math.round(parseInt(result[3], 16) + (255 - parseInt(result[3], 16)) * amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function FoodOrdering({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();

  const { isRTL, fontFamily } = useLocale();
  const { placeOrder, updateOrder, activeOrders, pastOrders, orders, clearOpenOrders } = useOrders();

  const nurseStore = useNurseStore();

  const [step, setStep] = useState<Step>("landing");
  const [orderFor, setOrderFor] = useState<OrderFor>("patient");
  const [selectedMealId, setSelectedMealId] = useState<MealId | null>(null);
  const [selections, setSelections] = useState<Selections>({});
  const [lastOrderNumber, setLastOrderNumber] = useState("");
  const [kidsBreakfastType, setKidsBreakfastType] = useState<KidsBreakfastType>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [wasEditMode, setWasEditMode] = useState(false);
  const [showHistoryOverlay, setShowHistoryOverlay] = useState(false);
  const isEditMode = editingOrderId !== null;

  // Read diet from Care Teams Settings (NurseDataStore)
  const patientDiet = nurseStore.patientDiet as DietType | "npo";
  const isNpo = patientDiet === "npo";
  // Guest/companion always uses Regular diet menu; NPO patients can't order but guests can
  const effectiveDiet: DietType = orderFor === "guest" ? "regular" : (isNpo ? "regular" : patientDiet as DietType);
  const dayOfWeek = new Date().getDay(); // 0=Sun … 6=Sat
  const meals = useMemo(
    () => buildMeals(effectiveDiet, dayOfWeek, kidsBreakfastType),
    [effectiveDiet, dayOfWeek, kidsBreakfastType],
  );
  const isKid = (orderFor === "patient" && patientDiet === "kids") || false;
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const ForwardArrow = isRTL ? ArrowLeft : ArrowRight;
  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;

  const currentMeal = selectedMealId ? meals.find((m) => m.id === selectedMealId) ?? null : null;
  const dietCfg = DIET_CONFIG[effectiveDiet];

  // Allergies from Care Teams Settings
  const patientAllergies = nurseStore.allergies;
  const allergiesLabel = orderFor === "guest"
    ? (isRTL ? "لا يوجد" : "None")
    : patientAllergies.length > 0 ? patientAllergies.join(", ") : (isRTL ? "لا يوجد" : "None");

  // Diet label for display
  const dietDisplayLabel = orderFor === "guest"
    ? (isRTL ? "عادي" : "Regular")
    : isNpo
      ? (isRTL ? "NPO / صائم" : "NPO / Fasting")
      : loc(dietCfg.label);

  const handleSelectMeal = useCallback((mealId: MealId) => {
    setSelectedMealId(mealId);
  }, []);

  const handleToggleItem = useCallback((groupId: string, itemId: string, group: MenuGroup) => {
    if (group.mode === "included") return;
    setSelections((prev) => {
      const current = prev[groupId] || [];
      if (current.includes(itemId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== itemId) };
      }
      const maxChoices = group.mode === "choose-2" ? 2 : 1;
      const next = current.length >= maxChoices ? [...current.slice(1), itemId] : [...current, itemId];
      return { ...prev, [groupId]: next };
    });
  }, []);

  const handlePlaceOrder = useCallback(() => {
    if (!currentMeal) return;
    const selectedItems = currentMeal.groups.flatMap((g) => {
      const sel = selections[g.id] || [];
      if (g.mode === "included") return [];
      return sel.map((id) => {
        const it = g.items.find((i) => i.id === id)!;
        return { id: it.id, name: it.name, qty: 1, image: it.image || "" };
      });
    });
    const orderData = {
      items: selectedItems.map((it) => ({ id: it.id, name: it.name, quantity: it.qty, calories: 0, image: it.image })),
      totalCalories: 0,
      estimatedDelivery: isMealActive(currentMeal.hours) ? "25–35 min" : loc(currentMeal.label) + " delivery",
      mealType: loc(currentMeal.label),
      mealWindow: currentMeal.timeRange,
      comesWith: currentMeal.groups.filter((g) => g.mode === "included").flatMap((g) => g.items.map((it) => it.name)),
      orderFor,
      mealId: currentMeal.id,
      selections: { ...selections },
    };
    if (editingOrderId) {
      // Edit mode: update existing order in place
      updateOrder(editingOrderId, orderData);
      const existing = orders.find((o) => o.id === editingOrderId);
      setLastOrderNumber(existing?.orderNumber || "");
      setWasEditMode(true);
      setEditingOrderId(null);
    } else {
      setWasEditMode(false);
      // New order
      const placed = placeOrder(orderData);
      setLastOrderNumber(placed.orderNumber);
    }
    setStep("confirmed");
  }, [currentMeal, selections, isRTL, placeOrder, updateOrder, editingOrderId, orders, orderFor]);

  const stepIndex: 1 | 2 | 3 | 4 =
    step === "select-type" ? 1 :
    step === "select-meal" ? 2 :
    step === "kids-breakfast-type" ? 2 :
    step === "build-meal"  ? 3 :
    step === "confirmed"   ? 4 : 1;

  const canContinue =
    step === "select-type" ? (isNpo && orderFor === "patient" ? false : true) :
    step === "select-meal" ? selectedMealId !== null :
    step === "kids-breakfast-type" ? kidsBreakfastType !== null :
    step === "build-meal"  ? (currentMeal ? isOrderComplete(currentMeal, selections) : false) :
    false;

  const handleContinue = useCallback(() => {
    if (step === "select-type") {
      // NPO blocking: if patient is NPO and ordering for patient, don't proceed
      if (isNpo && orderFor === "patient") return;
      setStep("select-meal");
    } else if (step === "select-meal" && selectedMealId) {
      // Kids breakfast needs type selection first
      if (effectiveDiet === "kids" && selectedMealId === "breakfast") {
        setKidsBreakfastType(null);
        setStep("kids-breakfast-type");
      } else {
        const m = meals.find((x) => x.id === selectedMealId)!;
        setSelections(getInitialSelections(m));
        setStep("build-meal");
      }
    } else if (step === "kids-breakfast-type" && kidsBreakfastType) {
      // After selecting hot/cold, build meals with the selected type
      const updatedMeals = buildMeals(effectiveDiet, dayOfWeek, kidsBreakfastType);
      const m = updatedMeals.find((x) => x.id === "breakfast")!;
      setSelections(getInitialSelections(m));
      setStep("build-meal");
    } else if (step === "build-meal") {
      handlePlaceOrder();
    }
  }, [step, selectedMealId, effectiveDiet, dayOfWeek, kidsBreakfastType, meals, handlePlaceOrder, isNpo, orderFor]);

  /** Enter edit mode: pre-fill the user's previous selections and jump to build-meal */
  const startEditOrder = useCallback((orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const mealId = (order.mealId || order.mealType?.toLowerCase()) as MealId;
    setEditingOrderId(orderId);
    setOrderFor(order.orderFor || "patient");
    setSelectedMealId(mealId);
    setSelections(order.selections || {});
    setStep("build-meal");
  }, [orders]);

  const handleBack = useCallback(() => {
    if (step === "landing") onClose();
    else if (step === "select-type") setStep("landing");
    else if (step === "select-meal") setStep("select-type");
    else if (step === "kids-breakfast-type") setStep("select-meal");
    else if (step === "build-meal") {
      if (isEditMode) {
        // Cancel edit — go back to history
        setEditingOrderId(null);
        setSelections({});
        setStep("history");
      } else if (effectiveDiet === "kids" && selectedMealId === "breakfast") {
        setStep("kids-breakfast-type");
      } else {
        setStep("select-meal");
      }
    }
    else if (step === "confirmed") onClose();
    else if (step === "history") setStep("landing");
  }, [step, onClose, effectiveDiet, selectedMealId, isEditMode]);

  const showPatientBar = step !== "history" && step !== "landing" && step !== "confirmed";
  const showBottomBar = step !== "landing";
  const showBackButton = true;
  const isFlow = step === "select-type" || step === "select-meal" || step === "kids-breakfast-type" || step === "build-meal" || step === "confirmed";

  /* ── Derive CSS custom property values from current theme ── */
  const foVars = {
    "--fo-primary": theme.primary,
    "--fo-primary-rgb": hexToRgb(theme.primary),
    "--fo-primary-dark": theme.primaryDark,
    "--fo-secondary": theme.accent,
    "--fo-secondary-rgb": hexToRgb(theme.accent),
    "--fo-bg-tint": tintHex(theme.primary, 0.92),
  } as React.CSSProperties;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${theme.primary} 0%, ${theme.primaryDark} 40%, #0a1628 100%)`,
        ...foVars,
      }}
    >
      {/* Hospital background image — subtle, consistent with other internal pages */}
      <ApiImage
        src={theme.heroImageUrl}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        style={{ opacity: 0.08, mixBlendMode: "luminosity", userSelect: "none" }}
      />
      <style>{`
        .fo-scroll::-webkit-scrollbar { width: 6px; }
        .fo-scroll::-webkit-scrollbar-track { background: transparent; }
        .fo-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 100px; }
        .fo-scroll { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.15) transparent; }
        .fo-scroll-strong::-webkit-scrollbar { width: 10px; }
        .fo-scroll-strong::-webkit-scrollbar-track { background: #F3F4F6; border-radius: 100px; margin: 4px 0; }
        .fo-scroll-strong::-webkit-scrollbar-thumb { background: var(--fo-primary); border-radius: 100px; border: 2px solid #F3F4F6; }
        .fo-scroll-strong::-webkit-scrollbar-thumb:hover { background: var(--fo-primary-dark); }
        .fo-scroll-strong { scrollbar-width: thin; scrollbar-color: var(--fo-primary) #F3F4F6; }
        .fo-carousel::-webkit-scrollbar { height: 0px; display: none; }
        .fo-carousel { scrollbar-width: none; -ms-overflow-style: none; cursor: grab; }
        .fo-carousel:active { cursor: grabbing; }
        @keyframes popIn { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
        .pop-in { animation: popIn 0.3s ease forwards; }
      `}</style>

      {/* ─── TOP BAR (translucent white strip) ─── */}
      <TopBar
        onBack={onClose}
        onMyOrders={() => setShowHistoryOverlay(true)}
        showMyOrders={isFlow && step !== "confirmed"}
        onDemoClear={clearOpenOrders}
        title={step === "history" ? (isRTL ? "طلباتي" : "My Orders") : (isRTL ? "طلب الوجبات" : "Meal Ordering")}
        subtitle={step === "history" ? (isRTL ? "سجل طلباتك" : "Your order history") : (isRTL ? "اختر وجبتك" : "Select your meal")}
        fontFamily={fontFamily}
        isRTL={isRTL}
        BackArrow={BackArrow}
      />

      {/* ─── PATIENT BAR (white, fixed) ─── */}
      {showPatientBar ? (
        <PatientBar
          isKid={isKid}
          orderFor={orderFor}
          dietLabel={dietDisplayLabel}
          allergiesLabel={allergiesLabel}
          name={orderFor === "guest" ? (isRTL ? "مرافق" : "Companion") : DEMO_PATIENT.name}
          mealName={currentMeal ? loc(currentMeal.label) : null}
          fontFamily={fontFamily}
          isRTL={isRTL}
        />
      ) : isFlow ? (
        /* Spacer matching patient bar height so content card aligns consistently */
        <div className="shrink-0" style={{ height: "96px" }} />
      ) : null}

      {/* ─── MAIN CONTENT (white rounded card containing stepper + body) ─── */}
      <div className="flex-1 min-h-0 px-12 pt-5 pb-3 relative flex flex-col">
        {isFlow && (
          <div className="flex-1 min-h-0 flex flex-col rounded-[30px] overflow-hidden" style={{ backgroundColor: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}>
            <Stepper current={stepIndex} fontFamily={fontFamily} isRTL={isRTL} />
            <div className="flex-1 min-h-0 overflow-hidden">
              <AnimatePresence mode="wait">
                {step === "select-type" && (
                  <OrderTypeStep key="t" orderFor={orderFor} onSelect={setOrderFor} fontFamily={fontFamily} isRTL={isRTL} isNpo={isNpo} />
                )}
                {step === "select-meal" && (
                  <ChooseMealStep key="m" meals={meals} selectedMealId={selectedMealId} onSelect={handleSelectMeal} onDeselect={() => setSelectedMealId(null)} fontFamily={fontFamily} isRTL={isRTL}
                    submittedMealIds={(() => {
                      const todayStr = new Date().toDateString();
                      const set = new Set<MealId>();
                      orders.forEach((o) => {
                        const d = o.placedAt instanceof Date ? o.placedAt : new Date(o.placedAt);
                        if (d.toDateString() === todayStr && o.orderFor === orderFor) {
                          // Prefer mealId match, fall back to label match
                          if (o.mealId && meals.some((mm) => mm.id === o.mealId)) {
                            set.add(o.mealId as MealId);
                          } else {
                            const m = meals.find((mm) => loc(mm.label) === o.mealType);
                            if (m) set.add(m.id);
                          }
                        }
                      });
                      return set;
                    })()}
                    orders={orders}
                    onEditOrder={(mealId: MealId) => {
                      const todayStr = new Date().toDateString();
                      const order = orders.find((o) => {
                        const d = o.placedAt instanceof Date ? o.placedAt : new Date(o.placedAt);
                        return d.toDateString() === todayStr &&
                          (o.mealId === mealId || loc(meals.find(m => m.id === mealId)?.label || { en: '', ar: '' }) === o.mealType);
                      });
                      if (order) startEditOrder(order.id);
                    }}
                  />
                )}
                {step === "kids-breakfast-type" && (
                  <KidsBreakfastTypeStep key="kbt" selected={kidsBreakfastType} onSelect={setKidsBreakfastType} fontFamily={fontFamily} isRTL={isRTL} />
                )}
                {step === "build-meal" && currentMeal && (
                  <BuildMealStep key="b" meal={currentMeal} selections={selections} onToggle={handleToggleItem} fontFamily={fontFamily} isRTL={isRTL} isEditMode={isEditMode} />
                )}
                {step === "confirmed" && currentMeal && (
                  <ConfirmStep key="c"
                    orderNumber={lastOrderNumber} meal={currentMeal} selections={selections}
                    orderFor={orderFor}
                    patientName={orderFor === "guest" ? (isRTL ? "مرافق" : "Companion") : DEMO_PATIENT.name}
                    room={DEMO_PATIENT.room.replace("Room ", "")}
                    dietLabel={dietDisplayLabel}
                    allergiesLabel={allergiesLabel}
                    isEditMode={wasEditMode}
                    onEdit={() => {
                      // Find the order that was just placed/updated for this meal
                      const todayStr = new Date().toDateString();
                      const thisOrder = orders.find((o) => {
                        const d = o.placedAt instanceof Date ? o.placedAt : new Date(o.placedAt);
                        return d.toDateString() === todayStr &&
                          o.mealId === currentMeal.id && o.orderFor === orderFor;
                      });
                      if (thisOrder) startEditOrder(thisOrder.id);
                    }}
                    fontFamily={fontFamily} isRTL={isRTL} />
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {step === "history" && (
          <HistoryView
            activeOrders={activeOrders}
            pastOrders={pastOrders}
            fontFamily={fontFamily}
            isRTL={isRTL}
            meals={meals}
            onEdit={startEditOrder}
          />
        )}

        {/* ─── LANDING PAGE ─── */}
        {step === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 min-h-0 flex items-center justify-center gap-10 px-8"
          >
            {/* Make a New Order */}
            <button
              onClick={() => { setStep("select-type"); setSelectedMealId(null); setOrderFor("patient"); }}
              className="flex flex-col items-center justify-center gap-8 cursor-pointer transition-transform active:scale-[0.97] hover:scale-[1.02]"
              style={{
                width: "420px", height: "380px",
                backgroundColor: "#fff", borderRadius: "30px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid rgba(0,0,0,0.06)",
                outline: "none",
              }}
            >
              <div style={{
                width: 110, height: 110, borderRadius: "50%",
                backgroundColor: TEAL_15, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Utensils size={48} style={{ color: TEAL }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily, fontSize: "26px", fontWeight: WEIGHT.bold, color: theme.textHeading }}>
                  {isRTL ? "طلب جديد" : "Make a New Order"}
                </p>
                <p style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.medium, color: theme.textMuted, marginTop: 8 }}>
                  {isRTL ? "اطلب وجبتك الآن" : "Order your meal now"}
                </p>
              </div>
            </button>

            {/* View My Orders */}
            <button
              onClick={() => setStep("history")}
              className="flex flex-col items-center justify-center gap-8 cursor-pointer transition-transform active:scale-[0.97] hover:scale-[1.02]"
              style={{
                width: "420px", height: "380px",
                backgroundColor: "#fff", borderRadius: "30px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid rgba(0,0,0,0.06)",
                outline: "none",
              }}
            >
              <div style={{
                width: 110, height: 110, borderRadius: "50%",
                backgroundColor: `rgba(var(--fo-secondary-rgb), 0.12)`, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ClipboardList size={48} style={{ color: SECONDARY }} />
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily, fontSize: "26px", fontWeight: WEIGHT.bold, color: theme.textHeading }}>
                  {isRTL ? "طلباتي" : "View My Orders"}
                </p>
                <p style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.medium, color: theme.textMuted, marginTop: 8 }}>
                  {isRTL ? "عرض وتعديل طلباتك" : "View and edit your orders"}
                </p>
              </div>
            </button>
          </motion.div>
        )}
      </div>

      {/* ─── BOTTOM NAV BAR ─── */}
      {showBottomBar && (
        <BottomBar
          step={step}
          canContinue={canContinue}
          onBack={handleBack}
          showBack={step !== "confirmed"}
          onContinue={
            step === "confirmed" ? onClose :
            step === "history" ? () => { setStep("select-type"); setSelectedMealId(null); setOrderFor("patient"); } :
            handleContinue
          }
          leftAction={
            step === "confirmed"
              ? { label: isRTL ? "طلباتي" : "View My Orders", onClick: () => setStep("history") }
              : undefined
          }
          secondaryAction={
            step === "confirmed"
              ? { label: isRTL ? "طلب جديد" : "New Order", onClick: () => { setStep("select-type"); setSelectedMealId(null); setOrderFor("patient"); } }
              : undefined
          }
          backLabel={
            step === "build-meal" && isEditMode ? (isRTL ? "إلغاء التعديل" : "Cancel Edit") :
            (isRTL ? "رجوع" : "Back")
          }
          continueLabel={
            step === "build-meal" && isEditMode ? (isRTL ? "تحديث الطلب" : "Update Order") :
            step === "build-meal" ? (isRTL ? "تأكيد الطلب" : "Place your order") :
            step === "confirmed"  ? (isRTL ? "خروج" : "Exit") :
            step === "history" ? (isRTL ? "طلب جديد" : "New Order") :
                                    (isRTL ? "متابعة" : "Continue")
          }
          fontFamily={fontFamily}
          isRTL={isRTL}
          BackArrow={BackArrow}
          ForwardArrow={ForwardArrow}
        />
      )}

      {/* ─── HISTORY OVERLAY ─── */}
      <AnimatePresence>
        {showHistoryOverlay && (
          <motion.div
            key="history-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-50 flex flex-col"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          >
            <div
              className="flex-1 flex flex-col m-8 mt-4 rounded-[28px] overflow-hidden"
              style={{ backgroundColor: "#fff", boxShadow: "0 12px 48px rgba(0,0,0,0.25)" }}
            >
              {/* Overlay header */}
              <div className="shrink-0 flex items-center justify-between px-8 py-5" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: TEAL_15,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ClipboardList size={20} style={{ color: TEAL }} />
                  </div>
                  <span style={{ fontFamily, fontSize: "20px", fontWeight: WEIGHT.bold, color: theme.textHeading }}>
                    {isRTL ? "طلباتي" : "My Orders"}
                  </span>
                </div>
                <button
                  onClick={() => setShowHistoryOverlay(false)}
                  className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    backgroundColor: "rgba(0,0,0,0.05)", border: "none", outline: "none",
                    color: theme.textMuted, fontSize: "20px",
                  }}
                >
                  ✕
                </button>
              </div>
              {/* Overlay content */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                <HistoryView
                  activeOrders={activeOrders}
                  pastOrders={pastOrders}
                  fontFamily={fontFamily}
                  isRTL={isRTL}
                  meals={meals}
                  onEdit={(orderId) => { setShowHistoryOverlay(false); startEditOrder(orderId); }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * TOP BAR
 * ═══════════════════════════════════════════════════════════════════════════ */

function TopBar({ onBack, onMyOrders, showMyOrders, onDemoClear, title, subtitle, fontFamily, isRTL, BackArrow }: {
  onBack: () => void; onMyOrders: () => void; showMyOrders?: boolean; onDemoClear: () => void;
  title: string; subtitle: string; fontFamily: string; isRTL: boolean; BackArrow: any;
}) {
  return (
    <InternalPageHeader 
      title={title}
      subtitle={subtitle}
      icon={<Utensils size={24} />}
      onClose={onBack}
      rightAction={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Demo reset button */}
          <button onClick={onDemoClear} title={isRTL ? "إعادة تعيين الطلبات" : "Reset Orders (Demo)"}
            style={{ 
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "40px", height: "40px",
              backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "10px",
              color: "#fff", border: "none", cursor: "pointer",
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
          </button>
          {showMyOrders && (
            <button onClick={onMyOrders} style={{ 
              display: "flex", alignItems: "center", gap: "8px", 
              backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "10px 16px",
              color: "#fff", fontFamily, fontWeight: 600, border: "none", cursor: "pointer"
            }}>
              <ClipboardList size={20} />
              {isRTL ? "طلباتي" : "My Orders"}
            </button>
          )}
        </div>
      }
    />
  );
}

function PatientBar({ isKid, orderFor, name, dietLabel, allergiesLabel, mealName, fontFamily, isRTL }: {
  isKid: boolean;
  orderFor: OrderFor;
  name: string;
  dietLabel: string;
  allergiesLabel: string;
  mealName: string | null;
  fontFamily: string;
  isRTL: boolean;
}) {
  const isGuest = orderFor === "guest";
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="shrink-0 mx-12 mt-[12px] flex items-center justify-center gap-[16px]"
      style={{ backgroundColor: "#fff", borderRadius: "24px", padding: "18px 22px", border: "1px solid rgba(0,0,0,0.1)" }}
    >
      {/* Avatar */}
      <div className="shrink-0" style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: isGuest ? SECONDARY : TEAL, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isGuest ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        ) : isKid ? <Baby size={24} color="#fff" strokeWidth={2.4} /> : <User size={24} color="#fff" strokeWidth={2.4} />}
      </div>

      {/* Name + Pills row */}
      <div className="flex-1 min-w-0 flex items-center justify-between">
        <span style={{ fontFamily, fontSize: "22px", fontWeight: WEIGHT.bold, color: "#212121", whiteSpace: "nowrap" }}>
          {name}
        </span>
        <div className="flex items-center gap-[14px]">
          {mealName && <Pill icon={<MealSvg />} label={isRTL ? "الوجبة:" : "Meal:"} value={mealName} fontFamily={fontFamily} />}
          <Pill icon={<RoomSvg />} label={isRTL ? "الغرفة:" : "Room:"} value={DEMO_PATIENT.room.replace("Room ", "")} fontFamily={fontFamily} />
          <Pill icon={<DietSvg />} label={isRTL ? "الحمية:" : "Diet:"} value={dietLabel} fontFamily={fontFamily} />
          <Pill icon={<AlertSvg />} label={isRTL ? "الحساسية:" : "Allergies:"} value={allergiesLabel} fontFamily={fontFamily} />
        </div>
      </div>
    </motion.div>
  );
}

function Pill({ icon, label, value, fontFamily }: { icon: React.ReactNode; label: string; value: string; fontFamily: string }) {
  return (
    <div className="flex items-center gap-[8px]" style={{ backgroundColor: "#F2F9FB", borderRadius: "10px", padding: "11px 16px" }}>
      {icon}
      <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.semibold, color: "#303030", whiteSpace: "nowrap", lineHeight: 1.2 }}>{label}</span>
      <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.semibold, color: "#303030", whiteSpace: "nowrap", lineHeight: 1.2 }}>{value}</span>
    </div>
  );
}

// Inline SVG icons matching the imported Frame
const MealSvg = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M11 2C7.13 2 4 5.13 4 9c0 2.76 1.61 5.14 4 6.25V20h6v-4.75c2.39-1.11 4-3.49 4-6.25 0-3.87-3.13-7-7-7zm-1 16v-3.06A4.99 4.99 0 0 1 6 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.4-1.69 4.4-3.94 4.94V18h-2z" fill="#FF76A2" />
  </svg>
);
const RoomSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M7 14a2 2 0 0 0 0-4 2 2 0 0 0 0 4zm12-4h-8v6h-6V6H3v13h2v-2h14v2h2v-7a2 2 0 0 0-2-2z" fill="#FE7D06" />
  </svg>
);
const DietSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="15.5" rx="9" ry="3" stroke="#3FC168" strokeWidth="1.2" fill="none" />
    <path d="M10 9c1.5 2 2 4 2 6M8 14c-1-2-0.5-4 0.5-5 1.5-1.4 4-0.5 5-3 0.4-1 0.2-2-1-2.5-1.4-0.5-3 0.4-4 2-0.4 0.7-0.5 1.4-0.4 2M18 12c0-2-1.5-3.5-3.5-3.5S11 10 11 12" stroke="#3FC168" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
const AlertSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#DF202E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════════
 * STEPPER
 * ═══════════════════════════════════════════════════════════════════════════ */

const STEP_LABELS = [
  { en: "Order For",   ar: "الطلب لـ"      },
  { en: "Choose Meal", ar: "اختر الوجبة"   },
  { en: "Place Order", ar: "تأكيد الطلب"   },
  { en: "Confirmation",ar: "التأكيد"       },
];

function Stepper({ current, fontFamily, isRTL }: { current: 1 | 2 | 3 | 4; fontFamily: string; isRTL: boolean }) {
  return (
    <div className="shrink-0 flex items-center justify-center px-[60px] pt-[18px] pb-[18px]" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="flex items-center" style={{ width: "100%", maxWidth: "1200px" }}>
        {STEP_LABELS.map((s, i) => {
          const num = i + 1;
          const isLast = num === STEP_LABELS.length;
          const done = num < current;
          const active = num === current;
          // Final step renders as filled-green-with-tick when it's the active step (nothing left to complete)
          const filledTick = done || (active && isLast);
          return (
            <React.Fragment key={i}>
              <div className="flex items-center gap-[12px] shrink-0">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: filledTick ? GREEN : "#fff",
                    borderColor: filledTick ? GREEN : active ? GREEN : "#E5E7EB",
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    border: "2.5px solid",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {filledTick
                    ? <Check size={20} color="#fff" strokeWidth={2.8} />
                    : <span style={{ fontFamily, fontSize: "17px", fontWeight: WEIGHT.bold, color: active ? GREEN : "#8C8C8C" }}>{num}</span>}
                </motion.div>
                <span style={{ fontFamily, fontSize: "18px", fontWeight: active || done ? WEIGHT.bold : WEIGHT.medium, color: active || done ? "#2B2B2B" : "#8C8C8C", whiteSpace: "nowrap" }}>
                  {isRTL ? s.ar : s.en}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div style={{ flex: 1, height: "4px", margin: "0 16px", borderRadius: "2px", backgroundColor: done ? GREEN : "rgba(118,118,118,0.15)", transition: "background-color 0.3s" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * STEP 1: ORDER FOR
 * ═══════════════════════════════════════════════════════════════════════════ */

function OrderTypeStep({ orderFor, onSelect, fontFamily, isRTL, isNpo }: {
  orderFor: OrderFor; onSelect: (v: OrderFor) => void; fontFamily: string; isRTL: boolean; isNpo?: boolean;
}) {
  const showNpoBlock = isNpo && orderFor === "patient";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
      className="h-full flex flex-col px-[40px] pt-[32px] pb-[16px] gap-[16px]">
      {/* Centered heading — matches Choose Meal placement */}
      <div className="shrink-0 text-center">
        <h2 style={{ fontFamily, fontSize: "28px", fontWeight: WEIGHT.bold, color: "#171717", letterSpacing: "0.4px", textTransform: "uppercase" }}>
          {isRTL ? "الطلب لـ" : "Order For"}
        </h2>
        <p style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.medium, color: "#565656", marginTop: "6px" }}>
          {isRTL ? "حدد من سيتم الطلب له" : "Please select who you will order for"}
        </p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-[20px]">
        <div className="flex items-center justify-center gap-[30px]">
          {(["patient", "guest"] as OrderFor[]).map((type) => {
            const selected = orderFor === type;
            return (
              <motion.button key={type} onClick={() => onSelect(type)} whileTap={{ scale: 0.97 }}
                style={{
                  width: "560px", height: "400px", borderRadius: "26px",
                  backgroundColor: selected ? (type === "patient" ? TEAL : SECONDARY) : "#fff",
                  border: selected ? "none" : "1.6px solid rgba(0,0,0,0.1)",
                  position: "relative", cursor: "pointer", outline: "none",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "36px",
                  transition: "all 0.22s ease",
                }}>
                {/* Checkmark badge */}
                <div className="absolute" style={{ top: "32px", right: "32px",
                  width: "68px", height: "68px", borderRadius: "50%",
                  backgroundColor: selected ? "#2DCC06" : "#fff",
                  border: selected ? "none" : "2px solid #DADADA",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: selected ? "0 4px 6.5px rgba(0,138,171,0.38)" : "none",
                }}>
                  {selected && <Check size={32} color="#fff" strokeWidth={2.5} />}
                </div>

                {/* Icon circle */}
                <div style={{
                  width: "120px", height: "120px", borderRadius: "60px",
                  backgroundColor: selected ? "#fff" : "#F4F4F4",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {type === "patient"
                    ? <User size={60} color={selected ? TEAL : TEAL} strokeWidth={1.8} />
                    : <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={SECONDARY} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>}
                </div>

                {/* Label */}
                <span style={{ fontFamily, fontSize: "32px", fontWeight: WEIGHT.bold, color: selected ? "#fff" : "#171717" }}>
                  {type === "patient" ? (isRTL ? "المريض" : "Patient") : (isRTL ? "المرافق" : "Companion")}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* NPO / Fasting blocking message */}
        {showNpoBlock && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-4 px-8 py-5 rounded-2xl"
            style={{ backgroundColor: "#FEF2F2", border: "1.5px solid #FECACA", maxWidth: "700px" }}
          >
            <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FEE2E2" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            </div>
            <p style={{ fontFamily, fontSize: "17px", fontWeight: 600, color: "#991B1B", lineHeight: 1.5 }}>
              {isRTL
                ? "طلب الوجبات للمريض غير متاح حالياً لأنك صائم حسب تعليمات فريق الرعاية الخاص بك."
                : "Patient meal ordering is currently unavailable because you are fasting as instructed by your care team."}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * STEP 2: CHOOSE MEAL
 * ═══════════════════════════════════════════════════════════════════════════ */

function ChooseMealStep({ meals, selectedMealId, onSelect, onDeselect, fontFamily, isRTL, submittedMealIds, orders, onEditOrder }: {
  meals: MealPeriod[]; selectedMealId: MealId | null; onSelect: (id: MealId) => void; onDeselect?: () => void; fontFamily: string; isRTL: boolean;
  submittedMealIds: Set<MealId>;
  orders?: any[];
  onEditOrder?: (mealId: MealId) => void;
}) {
  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;
  const today = new Date().toLocaleDateString(isRTL ? "ar-SA" : "en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const [blockedMeal, setBlockedMeal] = React.useState<MealPeriod | null>(null);
  const [submittedMeal, setSubmittedMeal] = React.useState<MealPeriod | null>(null);
  const [enforceTime, setEnforceTime] = React.useState(() => getEnforceOrderTime());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
      className="h-full flex flex-col px-[40px] pt-[32px] pb-[20px] gap-[16px]">
      {/* Centered heading */}
      <div className="shrink-0 text-center">
        <h2 style={{ fontFamily, fontSize: "28px", fontWeight: WEIGHT.bold, color: "#171717", letterSpacing: "0.4px", textTransform: "uppercase" }}>
          {isRTL ? "اختر وجبتك" : "Choose a Meal"}
        </h2>
        <p style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.medium, color: "#565656", marginTop: "6px" }}>
          {isRTL ? "اختر وجبة واحدة" : "Please select one meal option"}
        </p>
      </div>

      {/* Time enforcement toggle (testing) */}
      <div className="shrink-0 flex items-center justify-center gap-2">
        <span style={{ fontFamily, fontSize: "13px", fontWeight: WEIGHT.semibold, color: enforceTime ? "#16A34A" : "#9CA3AF" }}>
          {enforceTime ? (isRTL ? "تقييد الوقت مُفعّل" : "Time restriction ON") : (isRTL ? "تقييد الوقت مُعطّل" : "Time restriction OFF")}
        </span>
        <button
          onClick={() => {
            const next = !enforceTime;
            setEnforceOrderTime(next);
            setEnforceTime(next);
            // If turning ON, deselect any meal that's now non-orderable
            if (next && selectedMealId) {
              const selMeal = meals.find(m => m.id === selectedMealId);
              if (selMeal) {
                const now = new Date();
                const nowH = now.getHours() + now.getMinutes() / 60;
                if (nowH >= selMeal.orderCutoff && onDeselect) onDeselect();
              }
            }
          }}
          style={{
            width: "40px", height: "22px", borderRadius: "11px", border: "none", cursor: "pointer",
            backgroundColor: enforceTime ? "#16A34A" : "#D1D5DB",
            position: "relative", transition: "background-color 0.2s", padding: 0,
          }}
        >
          <div style={{
            width: "18px", height: "18px", borderRadius: "50%", backgroundColor: "#fff",
            position: "absolute", top: "2px",
            left: enforceTime ? "20px" : "2px",
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }} />
        </button>
      </div>

      {/* Cards row — narrower, centered with whitespace, icon-led */}
      <div className="flex-1 min-h-0 flex items-center justify-center gap-[28px]" dir={isRTL ? "rtl" : "ltr"}>
        {meals.map((meal) => {
          const submitted = submittedMealIds.has(meal.id);
          const timeOpen = isMealOrderable(meal);
          const orderable = !submitted && timeOpen;
          const selected = selectedMealId === meal.id;
          const cutoffStr = formatHour(meal.orderCutoff, isRTL);

          // Icon mapping
          const Icon = meal.id === "breakfast" ? Sun : meal.id === "lunch" ? Sunrise : Moon;
          const iconBg = meal.id === "breakfast" ? "#FEF3C7" : meal.id === "lunch" ? "#E0F2FE" : "#EDE9FE";
          const iconColor = meal.id === "breakfast" ? "#F59E0B" : meal.id === "lunch" ? TEAL : "#7C3AED";

          // Status pill config
          const statusBg = submitted ? "#E0F2FE" : orderable ? "#DCFCE7" : "#FFFBEB";
          const statusColor = submitted ? "#0369A1" : orderable ? "#16A34A" : "#D97706";
          const statusText = submitted
            ? (isRTL ? "تم الطلب" : "Already ordered")
            : orderable
              ? (isRTL ? "متاح الآن" : "Available now")
              : (isRTL ? "أُغلق الطلب" : "Ordering closed");

          const handleClick = () => {
            if (submitted) setSubmittedMeal(meal);
            else if (orderable) onSelect(meal.id);
            else setBlockedMeal(meal);
          };

          return (
            <motion.button key={meal.id}
              onClick={handleClick}
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -2 }}
              dir={isRTL ? "rtl" : "ltr"}
              style={{
                width: "390px",
                borderRadius: "24px",
                backgroundColor: "#fff",
                border: selected ? `3px solid ${TEAL}` : "1.5px solid rgba(0,0,0,0.08)",
                boxShadow: "none",
                cursor: "pointer", outline: "none",
                opacity: orderable || submitted ? 1 : 0.9,
                transition: "border 0.2s, box-shadow 0.2s, transform 0.2s",
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "36px 28px 30px",
                gap: "20px",
                position: "relative",
              }}>
              {/* Selected check */}
              {selected && (
                <div className="absolute pop-in" style={{ top: "16px", [isRTL ? "left" : "right"]: "16px", width: "36px", height: "36px", borderRadius: "50%", backgroundColor: TEAL, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${TEAL_50}` }}>
                  <Check size={20} color="#fff" strokeWidth={3} />
                </div>
              )}

              {/* Icon circle */}
              <div style={{
                width: "104px", height: "104px", borderRadius: "50%",
                backgroundColor: iconBg,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={52} color={iconColor} strokeWidth={2} />
              </div>

              {/* Meal name */}
              <span style={{ fontFamily, fontSize: "32px", fontWeight: WEIGHT.bold, color: "#171717", lineHeight: 1 }}>
                {loc(meal.label)}
              </span>

              {/* Status pill (Available / Ordering closed / Already ordered) */}
              <div className="flex items-center gap-2" style={{
                padding: "9px 18px", borderRadius: "100px",
                backgroundColor: statusBg,
              }}>
                {submitted
                  ? <Check size={15} color={statusColor} strokeWidth={3} />
                  : <div style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: statusColor }} />}
                <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.bold, color: statusColor }}>
                  {statusText}
                </span>
              </div>

              {/* Divider */}
              <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(0,0,0,0.06)", margin: "4px 0" }} />

              {/* Info rows */}
              <div className="w-full flex flex-col gap-[12px]">
                {/* Date */}
                <div className="flex items-center gap-2 justify-center">
                  <Calendar size={17} color={TEAL} />
                  <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.semibold, color: "#374151" }}>
                    {today}
                  </span>
                </div>
                {/* Delivery time */}
                <div className="flex items-center gap-2 justify-center">
                  <Clock size={17} color="#6B7280" />
                  <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.semibold, color: "#6B7280" }}>
                    {isRTL ? "التوصيل" : "Delivery"} {locTimeRange(meal.timeRange, isRTL)}
                  </span>
                </div>
                {/* Last time to order */}
                <div className="flex items-center justify-center gap-2" style={{
                  padding: "10px 14px", borderRadius: "12px",
                  backgroundColor: timeOpen ? "#FFFBEB" : "#F3F4F6",
                  border: `1px solid ${timeOpen ? "#FDE68A" : "rgba(0,0,0,0.06)"}`,
                }}>
                  <Clock size={16} color={timeOpen ? "#D97706" : "#9CA3AF"} />
                  <span style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.bold, color: timeOpen ? "#D97706" : "#9CA3AF" }}>
                    {timeOpen
                      ? (isRTL ? `آخر وقت للطلب ${cutoffStr}` : `Order by ${cutoffStr}`)
                      : (isRTL ? "انتهى وقت الطلب" : "Ordering window closed")}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Blocked meal modal */}
      <AnimatePresence>
        {blockedMeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.45)", zIndex: 50 }}
            onClick={() => setBlockedMeal(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "540px", padding: "32px 28px", backgroundColor: "#fff", borderRadius: "24px", boxShadow: "0 16px 48px rgba(0,0,0,0.25)" }}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={36} color="#D97706" />
                </div>
                <h3 style={{ fontFamily, fontSize: "24px", fontWeight: WEIGHT.bold, color: "#171717" }}>
                  {isRTL ? "أُغلق وقت الطلب" : "Ordering Closed"}
                </h3>
                <p style={{ fontFamily, fontSize: "17px", fontWeight: WEIGHT.medium, color: "#6B7280", lineHeight: 1.5 }}>
                  {isRTL
                    ? "انتهى وقت الطلب لهذه الوجبة. سيتم تحضير وجبتك الافتراضية وتوصيلها وفقاً لخطة الحمية المخصصة لك."
                    : "Ordering for this meal is now closed. Your default meal will still be prepared and delivered according to your assigned diet plan."}
                </p>
                <button onClick={() => setBlockedMeal(null)}
                  className="active:scale-95 transition-transform"
                  style={{ marginTop: "8px", height: "52px", padding: "0 36px", borderRadius: "100px", backgroundColor: TEAL, border: "none", outline: "none", cursor: "pointer" }}>
                  <span style={{ fontFamily, fontSize: "17px", fontWeight: WEIGHT.semibold, color: "#fff" }}>
                    {isRTL ? "حسناً" : "Got it"}
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Already submitted modal */}
        {submittedMeal && (() => {
          const canEdit = isMealOrderable(submittedMeal);
          return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.45)", zIndex: 50 }}
            onClick={() => setSubmittedMeal(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "540px", padding: "32px 28px", backgroundColor: "#fff", borderRadius: "24px", boxShadow: "0 16px 48px rgba(0,0,0,0.25)" }}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "#E0F2FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Check size={36} color="#0369A1" strokeWidth={2.5} />
                </div>
                <h3 style={{ fontFamily, fontSize: "24px", fontWeight: WEIGHT.bold, color: "#171717" }}>
                  {isRTL ? "تم استلام طلبك بالفعل" : "Order Already Placed"}
                </h3>
                <p style={{ fontFamily, fontSize: "17px", fontWeight: WEIGHT.medium, color: "#6B7280", lineHeight: 1.5 }}>
                  {isRTL
                    ? canEdit
                      ? `لقد قمت بطلب ${loc(submittedMeal.label)} مسبقاً اليوم. يمكنك تعديل طلبك أو مراجعة التفاصيل من "طلباتي".`
                      : `لقد قمت بطلب ${loc(submittedMeal.label)} مسبقاً اليوم. يمكنك مراجعة تفاصيل الطلب من "طلباتي".`
                    : canEdit
                      ? `You've already placed a ${loc(submittedMeal.label).toLowerCase()} order for today. You can edit your order or find details in "My Orders".`
                      : `You've already placed a ${loc(submittedMeal.label).toLowerCase()} order for today. You can find your order details in "My Orders".`}
                </p>
                <div className="flex items-center gap-3">
                  {canEdit && onEditOrder && (
                    <button onClick={() => { setSubmittedMeal(null); onEditOrder(submittedMeal.id); }}
                      className="active:scale-95 transition-transform"
                      style={{ marginTop: "8px", height: "52px", padding: "0 36px", borderRadius: "100px", backgroundColor: "#fff", border: `2px solid ${TEAL}`, outline: "none", cursor: "pointer" }}>
                      <span style={{ fontFamily, fontSize: "17px", fontWeight: WEIGHT.semibold, color: TEAL }}>
                        {isRTL ? "تعديل الطلب" : "Edit Order"}
                      </span>
                    </button>
                  )}
                  <button onClick={() => setSubmittedMeal(null)}
                    className="active:scale-95 transition-transform"
                    style={{ marginTop: "8px", height: "52px", padding: "0 36px", borderRadius: "100px", backgroundColor: TEAL, border: "none", outline: "none", cursor: "pointer" }}>
                    <span style={{ fontFamily, fontSize: "17px", fontWeight: WEIGHT.semibold, color: "#fff" }}>
                      {isRTL ? "حسناً" : "Got it"}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * STEP 2b: KIDS BREAKFAST TYPE (Hot / Cold)
 * ═══════════════════════════════════════════════════════════════════════════ */

function KidsBreakfastTypeStep({ selected, onSelect, fontFamily, isRTL }: {
  selected: KidsBreakfastType;
  onSelect: (t: KidsBreakfastType) => void;
  fontFamily: string;
  isRTL: boolean;
}) {
  const options: { id: KidsBreakfastType; icon: React.ReactNode; selectedIcon: React.ReactNode; label: { en: string; ar: string }; desc: { en: string; ar: string }; color: string }[] = [
    {
      id: "hot",
      icon: <Flame size={60} color="#EF4444" strokeWidth={1.8} />,
      selectedIcon: <Flame size={60} color="#EF4444" strokeWidth={1.8} />,
      label: { en: "Hot Breakfast", ar: "إفطار ساخن" },
      desc: { en: "Eggs, bacon, sausage, toast & more", ar: "بيض، بيكون، سجق، توست والمزيد" },
      color: "#EF4444",
    },
    {
      id: "cold",
      icon: <Snowflake size={60} color="#3B82F6" strokeWidth={1.8} />,
      selectedIcon: <Snowflake size={60} color="#3B82F6" strokeWidth={1.8} />,
      label: { en: "Cold Breakfast", ar: "إفطار بارد" },
      desc: { en: "Cold meats, dairy, cheese & more", ar: "لحوم باردة، ألبان، جبنة والمزيد" },
      color: "#3B82F6",
    },
  ];
  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
      className="h-full flex flex-col px-[40px] pt-[32px] pb-[16px] gap-[16px]"
    >
      {/* Centered heading — same as Step 1 */}
      <div className="shrink-0 text-center">
        <h2 style={{ fontFamily, fontSize: "28px", fontWeight: WEIGHT.bold, color: "#171717", letterSpacing: "0.4px", textTransform: "uppercase" }}>
          {isRTL ? "نوع الإفطار" : "Breakfast Type"}
        </h2>
        <p style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.medium, color: "#565656", marginTop: "6px" }}>
          {isRTL ? "اختر نوع إفطار طفلك" : "Choose your child's breakfast type"}
        </p>
      </div>

      {/* Cards — same dimensions & style as Patient/Companion */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-[20px]">
        <div className="flex items-center justify-center gap-[30px]">
          {options.map((opt) => {
            const isActive = selected === opt.id;
            return (
              <motion.button key={opt.id} onClick={() => onSelect(opt.id)} whileTap={{ scale: 0.97 }}
                style={{
                  width: "560px", height: "400px", borderRadius: "26px",
                  backgroundColor: isActive ? TEAL : "#fff",
                  border: isActive ? "none" : "1.6px solid rgba(0,0,0,0.1)",
                  position: "relative", cursor: "pointer", outline: "none",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "36px",
                  transition: "all 0.22s ease",
                }}>
                {/* Checkmark badge */}
                <div className="absolute" style={{ top: "32px", right: "32px",
                  width: "68px", height: "68px", borderRadius: "50%",
                  backgroundColor: isActive ? "#2DCC06" : "#fff",
                  border: isActive ? "none" : "2px solid #DADADA",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: isActive ? "0 4px 6.5px rgba(0,138,171,0.38)" : "none",
                }}>
                  {isActive && <Check size={32} color="#fff" strokeWidth={2.5} />}
                </div>

                {/* Icon circle */}
                <div style={{
                  width: "120px", height: "120px", borderRadius: "60px",
                  backgroundColor: isActive ? "#fff" : "#F4F4F4",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isActive ? opt.selectedIcon : opt.icon}
                </div>

                {/* Label */}
                <span style={{ fontFamily, fontSize: "32px", fontWeight: WEIGHT.bold, color: isActive ? "#fff" : "#171717" }}>
                  {loc(opt.label)}
                </span>

                {/* Description */}
                <span style={{ fontFamily, fontSize: "17px", fontWeight: WEIGHT.medium, color: isActive ? "rgba(255,255,255,0.75)" : "#888", textAlign: "center", maxWidth: "320px" }}>
                  {loc(opt.desc)}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * STEP 3: BUILD MEAL
 * ═══════════════════════════════════════════════════════════════════════════ */


function BuildMealStep({ meal, selections, onToggle, fontFamily, isRTL, isEditMode }: {
  meal: MealPeriod;
  selections: Selections;
  onToggle: (gid: string, itemId: string, group: MenuGroup) => void;
  fontFamily: string;
  isRTL: boolean;
  isEditMode?: boolean;
}) {
  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;
  const active = isMealActive(meal.hours);
  const requiredGroups = getRequiredGroups(meal);
  const includedGroups = meal.groups.filter((g) => g.mode === "included");
  const totalSelectedReq = requiredGroups.reduce((sum, g) => sum + (selections[g.id] || []).length, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
      className="h-full flex gap-[20px] px-[28px] pt-[16px] pb-[16px]">
      {/* LEFT: unified banner + groups container */}
      <div className="flex-1 min-w-0 flex flex-col relative" style={{
        borderRadius: "20px",
        border: "1.5px solid rgba(0,0,0,0.08)",
        backgroundColor: "#fff",
        overflow: "hidden",
      }}>
        {/* Pre-order banner — top of the same container */}
        <div className="shrink-0 flex items-center gap-2 px-5 py-3" style={{ backgroundColor: "#F2F9FB", borderBottom: `1px solid ${TEAL_20}` }}>
          <Clock size={17} color={TEAL} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.semibold, color: TEAL, lineHeight: 1.4 }}>
            {isEditMode
              ? (isRTL
                  ? `تعديل طلب ${loc(meal.label)} — التوصيل ${locTimeRange(meal.timeRange, isRTL)}`
                  : `Editing ${loc(meal.label)} order — Delivery ${locTimeRange(meal.timeRange, isRTL)}`)
              : active
                ? (isRTL ? `يُسلَّم خلال ${loc(meal.label)} (${locTimeRange(meal.timeRange, isRTL)})` : `Delivered during ${loc(meal.label)} (${locTimeRange(meal.timeRange, isRTL)})`)
                : (isRTL ? `طلب مسبق — ${loc(meal.label)} (${locTimeRange(meal.timeRange, isRTL)})` : `Pre-order — delivered ${loc(meal.label)} (${locTimeRange(meal.timeRange, isRTL)})`)}
          </span>
        </div>

        {/* Groups list */}
        <div className="flex-1 min-h-0 fo-scroll-strong overflow-y-auto flex flex-col gap-[12px] p-[14px]">
          {requiredGroups.map((g, idx) => (
            <BuildGroup key={g.id} group={g} index={idx + 1} selections={selections[g.id] || []} onToggle={(itemId) => onToggle(g.id, itemId, g)} fontFamily={fontFamily} isRTL={isRTL} />
          ))}
          <div style={{ height: "16px" }} />
        </div>
        {/* Bottom fade hint */}
        <div className="pointer-events-none absolute left-0 right-0 bottom-0" style={{ height: "32px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 100%)" }} />
      </div>

      {/* RIGHT: meal tray */}
      <div className="shrink-0 flex flex-col" style={{ width: "440px", borderRadius: "20px", backgroundColor: "#fff", border: "1.5px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {/* Header */}
        <div className="shrink-0 flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: `${TEAL_15}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChefHat size={22} color={TEAL} />
          </div>
          <span style={{ fontFamily, fontSize: "20px", fontWeight: WEIGHT.bold, color: "#171717", letterSpacing: "0.3px" }}>
            {isRTL ? "طبقي" : "Your Meal Tray"}
          </span>
          <div className="ml-auto" style={{ padding: "5px 14px", borderRadius: "100px", backgroundColor: totalSelectedReq > 0 ? "#F0FDF4" : "#F3F4F6" }}>
            <span style={{ fontFamily, fontSize: "14px", fontWeight: WEIGHT.bold, color: totalSelectedReq > 0 ? GREEN : "#6B7280" }}>
              {totalSelectedReq} {isRTL ? "عنصر" : "items"}
            </span>
          </div>
        </div>

        {/* Items list */}
        <div className="flex-1 min-h-0 fo-scroll overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {totalSelectedReq === 0 && includedGroups.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ minHeight: "180px" }}>
              <Utensils size={40} color="#D1D5DB" />
              <p style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.medium, color: "#9CA3AF" }}>
                {isRTL ? "لم يتم اختيار أي عنصر" : "No item is selected"}
              </p>
            </div>
          ) : (
            <>
              {totalSelectedReq === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ minHeight: "120px" }}>
                  <Utensils size={40} color="#D1D5DB" />
                  <p style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.medium, color: "#9CA3AF" }}>
                    {isRTL ? "لم يتم اختيار أي عنصر" : "No item is selected"}
                  </p>
                </div>
              )}
              {requiredGroups.map((g) => {
                const sel = selections[g.id] || [];
                const items = g.items.filter((i) => sel.includes(i.id));
                if (items.length === 0) return null;
                return (
                  <div key={g.id} className="flex items-start gap-3">
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                      <Check size={15} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontFamily, fontSize: "13px", fontWeight: WEIGHT.bold, color: "#6B7280", marginBottom: "3px", letterSpacing: "0.3px", textTransform: "uppercase" }}>
                        {loc(g.label)}
                      </div>
                      {items.map((it) => (
                        <p key={it.id} style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.semibold, color: "#171717", lineHeight: 1.4 }}>
                          {loc(it.name)}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Auto Included — inside scrollable area */}
              {includedGroups.length > 0 && (
                <div style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "14px 18px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Check size={18} color={GREEN} />
                    <span style={{ fontFamily, fontSize: "13px", fontWeight: WEIGHT.bold, color: "#6B7280", letterSpacing: "0.3px", textTransform: "uppercase" }}>
                      {isRTL ? "مشمول مع وجبتك" : "Included with Your Meal"}
                    </span>
                  </div>
                  {includedGroups.map((g) => (
                    <div key={g.id} style={{ marginBottom: "4px" }}>
                      <div className="flex flex-col gap-1.5">
                        {g.items.map((it) => (
                          <div key={it.id} className="flex items-center gap-2">
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: GREEN }} />
                            <span style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.medium, color: "#4B5563" }}>
                              {loc(it.name)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function BuildGroup({ group, index, selections, onToggle, fontFamily, isRTL }: {
  group: MenuGroup; index: number; selections: string[]; onToggle: (id: string) => void; fontFamily: string; isRTL: boolean;
}) {
  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;
  const max = group.mode === "choose-2" ? 2 : 1;
  const done = selections.length >= max;

  // Horizontal scroll + pagination dots + mouse drag
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [pageIdx, setPageIdx] = React.useState(0);
  const PAGE_SIZE = 5;
  const pageCount = Math.max(1, Math.ceil(group.items.length / PAGE_SIZE));
  const dragState = React.useRef({ isDown: false, startX: 0, startScroll: 0, moved: false });

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const ratio = el.scrollLeft / Math.max(el.scrollWidth - el.clientWidth, 1);
    setPageIdx(Math.round(ratio * (pageCount - 1)));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollerRef.current;
    if (!el) return;
    dragState.current = { isDown: true, startX: e.pageX, startScroll: el.scrollLeft, moved: false };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragState.current.isDown) return;
    const el = scrollerRef.current;
    if (!el) return;
    const dx = e.pageX - dragState.current.startX;
    if (Math.abs(dx) > 4) dragState.current.moved = true;
    el.scrollLeft = dragState.current.startScroll - dx;
  };
  const onMouseUp = () => { dragState.current.isDown = false; };
  const onClickCapture = (e: React.MouseEvent) => {
    if (dragState.current.moved) {
      e.stopPropagation();
      e.preventDefault();
      dragState.current.moved = false;
    }
  };

  return (
    <div style={{ padding: "16px 20px", borderRadius: "20px", border: "1.5px solid rgba(0,0,0,0.08)", backgroundColor: "#fff" }}>
      {/* Header: number circle + Item N + Choose only N */}
      <div className="flex items-center gap-3 mb-3">
        <div style={{ width: "40px", height: "40px", borderRadius: "50%",
          backgroundColor: done ? GREEN : "#E7F1F1",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {done
            ? <Check size={20} color="#fff" strokeWidth={2.5} />
            : <span style={{ fontFamily, fontSize: "18px", fontWeight: WEIGHT.bold, color: TEAL }}>{index}</span>}
        </div>
        <span style={{ fontFamily, fontSize: "20px", fontWeight: WEIGHT.bold, color: "#171717" }}>
          {loc(group.label)}
        </span>
        <span style={{ fontFamily, fontSize: "14px", fontWeight: WEIGHT.medium, color: "#9CA3AF" }}>
          {group.mode === "choose-2"
            ? (isRTL ? `اختر 2 فقط (${selections.length}/2)` : `Choose only 2 (${selections.length}/2)`)
            : (isRTL ? "اختر 1 فقط" : "Choose only 1")}
        </span>
      </div>

      {/* Horizontal scroll row of chip cards */}
      <div ref={scrollerRef} onScroll={handleScroll}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onClickCapture={onClickCapture}
        className="fo-carousel"
        style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "4px", touchAction: "pan-x", WebkitOverflowScrolling: "touch", userSelect: "none" }}>
        {group.items.map((item) => {
          const sel = selections.includes(item.id);
          return (
            <button key={item.id} onClick={() => onToggle(item.id)}
              className="flex items-center gap-2 active:scale-95 transition-transform shrink-0"
              style={{
                padding: "12px 18px",
                minWidth: "168px",
                borderRadius: "12px",
                backgroundColor: "#fff",
                border: sel ? `2px solid ${TEAL}` : "1.5px solid rgba(0,0,0,0.12)",
                boxShadow: sel ? `0 2px 8px ${TEAL_20}` : "none",
                cursor: "pointer", outline: "none",
                transition: "border 0.15s, box-shadow 0.15s",
              }}>
              <div style={{
                width: "20px", height: "20px", borderRadius: "5px",
                backgroundColor: sel ? TEAL : "#fff",
                border: sel ? "none" : "1.8px solid #D1D5DB",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {sel && <Check size={14} color="#fff" strokeWidth={3} />}
              </div>
              <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.semibold, color: sel ? TEAL : "#171717", whiteSpace: "nowrap" }}>
                {loc(item.name)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Page indicator dots — only when there's more than one page worth (clickable) */}
      {group.items.length > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button key={i}
              onClick={() => {
                const el = scrollerRef.current;
                if (!el) return;
                const target = (el.scrollWidth - el.clientWidth) * (i / Math.max(pageCount - 1, 1));
                el.scrollTo({ left: target, behavior: "smooth" });
              }}
              style={{
                width: i === pageIdx ? "26px" : "10px",
                height: "10px",
                borderRadius: "100px",
                backgroundColor: i === pageIdx ? TEAL : "#D1D5DB",
                border: "none", outline: "none", cursor: "pointer", padding: 0,
                transition: "width 0.25s, background-color 0.25s",
              }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * STEP 4: CONFIRM
 * ═══════════════════════════════════════════════════════════════════════════ */

function ConfirmStep({ orderNumber, meal, selections, orderFor, patientName, room, dietLabel, allergiesLabel, fontFamily, isRTL, isEditMode, onEdit }: {
  orderNumber: string; meal: MealPeriod; selections: Selections;
  orderFor: OrderFor; patientName: string; room: string | null; dietLabel: string; allergiesLabel: string;
  fontFamily: string; isRTL: boolean;
  isEditMode?: boolean; onEdit?: () => void;
}) {
  const canStillEdit = isMealOrderable(meal);
  const isGuest = orderFor === "guest";
  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;
  const required = getRequiredGroups(meal);
  const included = meal.groups.filter((g) => g.mode === "included");

  const selectedItems = required.flatMap((g) => {
    const sel = selections[g.id] || [];
    return g.items.filter((i) => sel.includes(i.id)).map((i) => loc(i.name));
  });
  const includedItems = included.flatMap((g) => g.items).map((i) => loc(i.name));

  const today = new Date().toLocaleDateString(isRTL ? "ar-SA" : "en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="h-full flex items-center justify-center px-[40px] py-[24px] overflow-y-auto fo-scroll">
      {/* Single seamless card */}
      <div style={{
        width: "100%", maxWidth: "1080px",
        borderRadius: "24px", backgroundColor: "#fff",
        border: "1.5px solid rgba(0,0,0,0.08)",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        overflow: "hidden",
      }}>

        {/* ── LEFT — Success message + Edit Order ── */}
        <div style={{ padding: "36px 32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "18px" }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
            style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: GREEN, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 22px ${GREEN}50` }}>
            <Check size={38} color="#fff" strokeWidth={3} />
          </motion.div>
          <div className="text-center">
            <h2 style={{ fontFamily, fontSize: "28px", fontWeight: WEIGHT.bold, color: "#171717", lineHeight: 1.2 }}>
              {isEditMode
                ? (isRTL ? "تم تحديث طلب الوجبة" : "Meal Order Updated")
                : (isRTL ? "تم تأكيد طلب الوجبة" : "Meal Order Confirmed")}
            </h2>
            <p style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.medium, color: "#6B7280", lineHeight: 1.5, marginTop: "12px", maxWidth: "360px" }}>
              {isEditMode
                ? (isRTL
                    ? `تم تحديث طلب ${loc(meal.label).toLowerCase()} بنجاح وسيتم توصيله في الوقت المحدد.`
                    : `Your ${loc(meal.label).toLowerCase()} order has been updated and will be delivered during the scheduled time.`)
                : (isRTL
                    ? `تم إرسال طلب ${loc(meal.label).toLowerCase()} إلى المطبخ وسيتم توصيله في الوقت المحدد.`
                    : `Your ${loc(meal.label).toLowerCase()} order has been sent to the kitchen and will be delivered during the scheduled time.`)}
            </p>
          </div>
          {/* Edit Order button — only if ordering window still open */}
          {canStillEdit && onEdit && (
            <button onClick={onEdit}
              className="active:scale-95 transition-transform cursor-pointer"
              style={{ marginTop: "4px", height: "44px", padding: "0 28px", borderRadius: "10px", backgroundColor: "#fff", border: `1.5px solid ${TEAL}`, outline: "none", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.semibold, color: TEAL }}>
                {isRTL ? "تعديل الطلب" : "Edit Order"}
              </span>
            </button>
          )}
        </div>

        {/* ── RIGHT — bordered details box with patient + details ── */}
        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* Bordered container */}
          <div style={{
            border: "1.5px solid rgba(0,0,0,0.1)", borderRadius: "16px",
            overflow: "hidden",
            display: "flex", flexDirection: "column",
          }}>
            {/* Patient / Guest row — flush to container edges */}
            <div className="flex items-center gap-3" style={{
              padding: "14px 20px",
              backgroundColor: isGuest ? "rgba(var(--fo-secondary-rgb), 0.08)" : TEAL_15,
            }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: isGuest ? SECONDARY : TEAL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <User size={19} color="#fff" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.bold, color: "#171717", lineHeight: 1.2 }}>
                  {isRTL ? "للـ" : "For "}{patientName}
                  {room && (
                    <span style={{ fontFamily, fontSize: "13px", fontWeight: WEIGHT.semibold, color: "#6B7280", marginLeft: "8px" }}>
                      · {isRTL ? "غرفة" : "Room"} {room}
                    </span>
                  )}
                </p>
                <p style={{ fontFamily, fontSize: "12px", fontWeight: WEIGHT.medium, color: "#6B7280", lineHeight: 1.4, marginTop: "3px" }}>
                  {isRTL ? `الحمية: ${dietLabel} · الحساسية: ${allergiesLabel}` : `Diet: ${dietLabel} · Allergies: ${allergiesLabel}`}
                </p>
              </div>
              <span style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.bold, color: isGuest ? SECONDARY : TEAL, whiteSpace: "nowrap", flexShrink: 0 }}>
                {isRTL ? "رقم الطلب:" : "Order ID:"} #{orderNumber}
              </span>
            </div>

            {/* Details area */}
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column" }}>
            {/* Delivery Time */}
            <div className="flex items-start justify-between gap-4" style={{ padding: "10px 0" }}>
              <div className="flex items-center gap-2.5 shrink-0">
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: TEAL_15, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={16} color={TEAL} />
                </div>
                <span style={{ fontFamily, fontSize: "12px", fontWeight: WEIGHT.bold, color: "#6B7280", letterSpacing: "0.5px", textTransform: "uppercase" as const }}>
                  {isRTL ? "وقت التوصيل" : "Delivery Time"}
                </span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col items-end">
                <p style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.bold, color: TEAL }}>
                  {loc(meal.label)} ({locTimeRange(meal.timeRange, isRTL)})
                </p>
                <p style={{ fontFamily, fontSize: "13px", fontWeight: WEIGHT.medium, color: "#6B7280", marginTop: "2px" }}>
                  {today}
                </p>
              </div>
            </div>

            <RowDivider />

            {/* Your Meal Items */}
            <div className="flex items-start justify-between gap-4" style={{ padding: "10px 0" }}>
              <div className="flex items-center gap-2.5 shrink-0" style={{ marginTop: "2px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: TEAL_15, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Utensils size={16} color={TEAL} />
                </div>
                <span style={{ fontFamily, fontSize: "12px", fontWeight: WEIGHT.bold, color: "#6B7280", letterSpacing: "0.5px", textTransform: "uppercase" as const }}>
                  {isRTL ? "وجباتك" : "Your Meal Items"}
                </span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col items-end">
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: "4px", textAlign: "right" as const }}>
                  {selectedItems.map((name, i) => (
                    <li key={i} style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.semibold, color: "#171717", lineHeight: 1.4 }}>{name}</li>
                  ))}
                </ul>
              </div>
            </div>

            {includedItems.length > 0 && (
              <>
                <RowDivider />
                <div className="flex items-start justify-between gap-4" style={{ padding: "10px 0" }}>
                  <div className="flex items-center gap-2.5 shrink-0" style={{ marginTop: "2px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: `${GREEN}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={16} color={GREEN} />
                    </div>
                    <span style={{ fontFamily, fontSize: "12px", fontWeight: WEIGHT.bold, color: "#6B7280", letterSpacing: "0.5px", textTransform: "uppercase" as const }}>
                      {isRTL ? "يأتي مع وجبتك" : "Comes With Your Meal"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col items-end">
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: "4px", textAlign: "right" as const }}>
                      {includedItems.map((name, i) => (
                        <li key={i} style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.semibold, color: "#171717", lineHeight: 1.4 }}>{name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RowDivider() {
  return <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.06)" }} />;
}

function ConfirmRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3" style={{ padding: "12px 14px", borderRadius: "12px", backgroundColor: "#F9FAFB" }}>
      <div className="shrink-0" style={{ marginTop: "1px" }}>{icon}</div>
      <div className="flex-1 min-w-0 flex flex-col">
        <span style={{ fontFamily: "inherit", fontSize: "12px", fontWeight: WEIGHT.bold, color: "#6B7280", letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: "4px" }}>
          {label}
        </span>
        <div className="flex flex-col">{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * BOTTOM BAR
 * ═══════════════════════════════════════════════════════════════════════════ */

function BottomBar({ step, canContinue, onBack, showBack, onContinue, leftAction, secondaryAction, backLabel, continueLabel, fontFamily, isRTL }: {
  step: Step; canContinue: boolean; onBack: () => void; showBack?: boolean; onContinue: () => void;
  leftAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  backLabel: string; continueLabel: string;
  fontFamily: string; isRTL: boolean; BackArrow: any; ForwardArrow: any;
}) {
  const ChevBack = isRTL ? ChevronRight : ChevronLeft;
  const ChevForward = isRTL ? ChevronLeft : ChevronRight;
  const continueEnabled = canContinue || step === "confirmed" || step === "history";
  return (
    <div className="shrink-0 flex items-center justify-between px-[40px] py-[20px] relative z-10">
      {showBack !== false ? (
        <button onClick={onBack} className="active:scale-95 transition-transform cursor-pointer"
          style={{
            height: "60px", padding: "0 32px", borderRadius: "16px",
            backgroundColor: "#fff",
            display: "flex", alignItems: "center", gap: "10px",
            border: `1.5px solid ${TEAL}`,
            outline: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}>
          {backLabel === "Exit" || backLabel === "خروج" || backLabel === "Cancel Edit" || backLabel === "إلغاء التعديل" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <ChevBack size={22} color={TEAL} strokeWidth={2.5} />
          )}
          <span style={{ fontFamily, fontSize: "22px", fontWeight: WEIGHT.semibold, color: TEAL }}>
            {backLabel}
          </span>
        </button>
      ) : leftAction ? (
        <button onClick={leftAction.onClick} className="active:scale-95 transition-transform cursor-pointer"
          style={{
            height: "60px", padding: "0 28px", borderRadius: "16px",
            backgroundColor: "#fff",
            display: "flex", alignItems: "center", gap: "10px",
            border: `1.5px solid ${TEAL}`,
            outline: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}>
          <span style={{ fontFamily, fontSize: "20px", fontWeight: WEIGHT.semibold, color: TEAL }}>
            {leftAction.label}
          </span>
        </button>
      ) : <div />}

      {/* Right-side cluster: optional secondary + primary */}
      <div className="flex items-center gap-3">
        {secondaryAction && (
          <button onClick={secondaryAction.onClick} className="active:scale-95 transition-transform cursor-pointer"
            style={{
              height: "60px", padding: "0 28px", borderRadius: "16px",
              backgroundColor: "#fff",
              display: "flex", alignItems: "center", gap: "10px",
              border: `1.5px solid ${TEAL}`,
              outline: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}>
            <span style={{ fontFamily, fontSize: "20px", fontWeight: WEIGHT.semibold, color: TEAL }}>
              {secondaryAction.label}
            </span>
          </button>
        )}
        <motion.button
          onClick={continueEnabled ? onContinue : undefined}
          whileTap={continueEnabled ? { scale: 0.97 } : {}}
          style={{
            height: "60px", padding: "0 32px", borderRadius: "16px",
            backgroundColor: continueEnabled ? TEAL : "#fff",
            display: "flex", alignItems: "center", gap: "10px",
            border: `1px solid ${continueEnabled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.3)"}`,
            outline: "none",
            cursor: continueEnabled ? "pointer" : "not-allowed",
            boxShadow: continueEnabled ? `0 4px 16px ${TEAL_50}` : "0 2px 8px rgba(0,0,0,0.08)",
            transition: "all 0.25s",
            opacity: continueEnabled ? 1 : 0.5,
          }}>
          {(continueLabel === "Exit" || continueLabel === "خروج") && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )}
          <span style={{ fontFamily, fontSize: "22px", fontWeight: WEIGHT.bold, color: continueEnabled ? "#fff" : TEAL }}>
            {continueLabel}
          </span>
          {step !== "confirmed" && (
            <ChevForward size={22} color={continueEnabled ? "#fff" : TEAL} strokeWidth={2.5} />
          )}
        </motion.button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * HISTORY VIEW
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Returns a short scheduled-for string for an order: e.g. "Lunch · Today" or "Breakfast · Yesterday" or "Dinner · Jun 27" */
function scheduledFor(order: any, isRTL: boolean): string {
  const d: Date = order.placedAt instanceof Date ? order.placedAt : new Date(order.placedAt);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  let dayLabel: string;
  if (d.toDateString() === today.toDateString()) dayLabel = isRTL ? "اليوم" : "Today";
  else if (d.toDateString() === yesterday.toDateString()) dayLabel = isRTL ? "أمس" : "Yesterday";
  else dayLabel = d.toLocaleDateString(isRTL ? "ar-SA" : "en-US", { weekday: "short", month: "short", day: "numeric" });
  return dayLabel;
}

function HistoryView({ activeOrders, pastOrders, fontFamily, isRTL, meals, onEdit }: {
  activeOrders: any[]; pastOrders: any[]; fontFamily: string; isRTL: boolean;
  meals?: MealPeriod[]; onEdit?: (orderId: string) => void;
}) {
  const [tab, setTab] = useState<"all" | "patient" | "companion">("all");
  const all = [...activeOrders, ...pastOrders];
  const patientOrders = all.filter((o) => o.orderFor !== "guest");
  const companionOrders = all.filter((o) => o.orderFor === "guest");
  const display = tab === "all" ? all : tab === "patient" ? patientOrders : companionOrders;

  const formatDate = (d: Date) => {
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    let time = d.toLocaleTimeString(isRTL ? "ar-SA" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    if (isRTL) {
      time = time.replace("ص", "صباحًا").replace("م", "مساءً").replace(/am/ig, "صباحًا").replace(/pm/ig, "مساءً");
    }
    if (isToday) return `${isRTL ? "اليوم" : "Today"}، ${time}`;
    if (isYesterday) return `${isRTL ? "أمس" : "Yesterday"}، ${time}`;
    return d.toLocaleDateString(isRTL ? "ar-SA" : "en-US", { month: "short", day: "numeric" }) + `، ${time}`;
  };

  return (
    <div className="flex-1 min-h-0 rounded-[30px] flex flex-col" style={{ backgroundColor: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", overflow: "hidden" }}>
      {/* Tabs row */}
      <div className="shrink-0 flex items-center justify-between px-[30px] pt-[28px] pb-[20px]">
        <div className="flex items-center gap-3 flex-wrap">
          <HistoryTab active={tab === "all"} onClick={() => setTab("all")} label={isRTL ? "جميع الطلبات" : "All Orders"} count={all.length} fontFamily={fontFamily} />
          <HistoryTab active={tab === "patient"} onClick={() => setTab("patient")} label={isRTL ? "للمريض" : "Patient"} count={patientOrders.length} fontFamily={fontFamily} />
          <HistoryTab active={tab === "companion"} onClick={() => setTab("companion")} label={isRTL ? "للمرافق" : "Companion"} count={companionOrders.length} fontFamily={fontFamily} />
        </div>
        <span style={{ fontFamily, fontSize: "22px", fontWeight: WEIGHT.semibold, color: "#565656" }}>
          {display.length} {isRTL ? (display.length > 1 ? "طلبات" : "طلب") : "Orders"}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 fo-scroll-strong overflow-y-auto pl-[30px] pr-[18px] pb-[24px] flex flex-col gap-[18px]">
        {display.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 min-h-[300px]">
            <ClipboardList size={56} color="#D1D5DB" />
            <p style={{ fontFamily, fontSize: "18px", fontWeight: WEIGHT.medium, color: "#9CA3AF" }}>
              {isRTL ? "لا توجد طلبات" : "No orders to show"}
            </p>
          </div>
        ) : (
          display.map((order) => {
            // Check if this order can be edited (today + window still open)
            const orderDate = order.placedAt instanceof Date ? order.placedAt : new Date(order.placedAt);
            const isToday = orderDate.toDateString() === new Date().toDateString();
            const mealId = order.mealId || order.mealType?.toLowerCase();
            const mealDef = meals?.find((m) => m.id === mealId);
            const canEdit = isToday && mealDef && isMealOrderable(mealDef);
            return (
              <OrderCard key={order.id} order={order} fontFamily={fontFamily} isRTL={isRTL} formatDate={formatDate}
                canEdit={!!canEdit} onEdit={onEdit ? () => onEdit(order.id) : undefined} mealDef={mealDef} />
            );
          })
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, fontFamily, isRTL, formatDate, canEdit, onEdit, mealDef }: {
  order: any; fontFamily: string; isRTL: boolean; formatDate: (d: Date) => string;
  canEdit?: boolean; onEdit?: () => void; mealDef?: MealPeriod;
}) {
  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;
  const [open, setOpen] = useState(false);
  const isGuest = order.orderFor === "guest";
  const ChevronIcon = open ? ChevronDown : (isRTL ? ChevronLeft : ChevronRight);
  const mt2 = order.mealType.toLowerCase();
  const nameAr = mt2 === "breakfast" ? "الفطور" : mt2 === "lunch" ? "الغداء" : mt2 === "dinner" ? "العشاء" : order.mealType;
  const translatedMealType = isRTL ? nameAr : (order.mealType.charAt(0).toUpperCase() + order.mealType.slice(1));

  // Resolve comesWith: use order data, or fall back to meal definition's included groups
  const comesWith = (order.comesWith && order.comesWith.length > 0)
    ? order.comesWith
    : (mealDef ? mealDef.groups.filter((g: any) => g.mode === "included").flatMap((g: any) => g.items.map((it: any) => it.name)) : []);

  return (
    <div style={{
      borderRadius: "20px", backgroundColor: "#fff", border: "1px solid rgba(0,0,0,0.1)",
    }}>
      {/* Header row — clickable */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center active:scale-[0.995] transition-transform"
        style={{
          padding: "20px 26px", gap: "20px",
          backgroundColor: "transparent", border: "none", outline: "none", cursor: "pointer",
          textAlign: isRTL ? "right" : "left",
        }}
      >
        <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: isGuest ? "rgba(var(--fo-secondary-rgb,217,119,6),0.1)" : TEAL_15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Utensils size={28} color={isGuest ? SECONDARY : TEAL} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span style={{ fontFamily, fontSize: "22px", fontWeight: WEIGHT.bold, color: "#000" }}>
              {translatedMealType}
            </span>
            <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.normal, color: "#565656" }}>
              {order.orderNumber}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock size={14} color="#9CA3AF" />
              <span style={{ fontFamily, fontSize: "14px", fontWeight: WEIGHT.medium, color: "#6B7280" }}>
                {isRTL ? "أُرسل" : "Placed"} {formatDate(order.placedAt)}
              </span>
            </div>
            {order.mealWindow && (
              <>
                <span style={{ color: "#D1D5DB" }}>·</span>
                <div className="flex items-center gap-1.5">
                  <Utensils size={14} color="#9CA3AF" />
                  <span style={{ fontFamily, fontSize: "14px", fontWeight: WEIGHT.medium, color: "#6B7280" }}>
                    {isRTL ? "التوصيل" : "Delivery"} {locTimeRange(order.mealWindow, isRTL)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        {/* Edit button — only when ordering window is still open */}
        {canEdit && onEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="shrink-0 flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
            style={{
              padding: "8px 16px", borderRadius: "10px",
              backgroundColor: "#fff", border: `1.5px solid ${TEAL}`,
              outline: "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.semibold, color: TEAL }}>
              {isRTL ? "تعديل الطلب" : "Edit Order"}
            </span>
          </button>
        )}
        <div className="flex items-center justify-center gap-2 shrink-0" style={{
          width: "185px", padding: "8px 16px", borderRadius: "10px",
          backgroundColor: isGuest ? `rgba(var(--fo-secondary-rgb),0.08)` : TEAL_BG_TINT,
          border: `1px solid ${isGuest ? `rgba(var(--fo-secondary-rgb),0.25)` : `${TEAL_25}`}`,
        }}>
          <User size={16} color={isGuest ? SECONDARY : TEAL} />
          <span style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.semibold, color: isGuest ? SECONDARY : TEAL, whiteSpace: "nowrap" }}>
            {isGuest ? (isRTL ? "للمرافق" : "For Companion") : (isRTL ? "للمريض" : "For Patient")}
          </span>
        </div>
        <div className="shrink-0 flex items-center justify-center" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#F3F4F6" }}>
          <ChevronIcon size={18} color="#6B7280" />
        </div>
      </button>

      {/* Expanded details — render unconditionally so siblings get natural layout */}
      {open && (
        <div>
          <div style={{ padding: "0 26px 22px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="grid grid-cols-2 gap-4" style={{ paddingTop: "18px" }}>
                {/* Your meal items — dedupe against comesWith so auto-included items never appear twice */}
                {(() => {
                  const includedSet = new Set((comesWith || []).map((it: any) => `${it.en}|${it.ar}`));
                  const mealItems = (order.items || []).filter((item: any) => !includedSet.has(`${item.name.en}|${item.name.ar}`));
                  return (
                    <DetailBlock icon={<Utensils size={18} color={TEAL} />} label={isRTL ? "وجباتك" : "Your Meal Items"} count={mealItems.length} isRTL={isRTL} fontFamily={fontFamily} accentColor={TEAL} badgeBg={TEAL_15}>
                      <ul style={{ margin: 0, padding: 0, paddingLeft: "6px", listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
                        {mealItems.map((item: any, i: number) => (
                          <li key={i} className="flex items-center gap-2.5">
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: TEAL, flexShrink: 0 }} />
                            <span style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.semibold, color: "#171717" }}>
                              {item.quantity > 1 ? `${item.quantity}× ` : ""}{loc(item.name)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </DetailBlock>
                  );
                })()}

                {/* Included with your meal */}
                {comesWith && comesWith.length > 0 && (
                  <DetailBlock icon={<Check size={18} color={GREEN} />} label={isRTL ? "مشمول مع وجبتك" : "Included with Your Meal"} count={comesWith.length} isRTL={isRTL} fontFamily={fontFamily} accentColor={GREEN} badgeBg={`${GREEN}20`}>
                    <ul style={{ margin: 0, padding: 0, paddingLeft: "6px", listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
                      {comesWith.map((it: any, i: number) => (
                        <li key={i} className="flex items-center gap-2.5">
                          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: GREEN, flexShrink: 0 }} />
                          <span style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.semibold, color: "#171717" }}>
                            {loc(it)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </DetailBlock>
                )}
              </div>


            </div>
        </div>
      )}
    </div>
  );
}

function DetailBlock({ icon, label, count, isRTL, fontFamily, children, accentColor, badgeBg }: { icon: React.ReactNode; label: string; count?: number; isRTL?: boolean; fontFamily: string; children: React.ReactNode; accentColor?: string; badgeBg?: string }) {
  const badgeColor = accentColor || TEAL;
  return (
    <div style={{ padding: "14px 18px", borderRadius: "12px", backgroundColor: "#F9FAFB" }}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span style={{ fontFamily, fontSize: "13px", fontWeight: WEIGHT.bold, color: "#6B7280", letterSpacing: "0.4px", textTransform: "uppercase" }}>
          {label}
        </span>
        {count !== undefined && (
          <div style={{
            marginLeft: "auto",
            padding: "3px 10px",
            borderRadius: "100px",
            backgroundColor: badgeBg || TEAL_15,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
          }}>
            <span style={{ fontFamily, fontSize: "13px", fontWeight: WEIGHT.bold, color: badgeColor }}>
              {count} {isRTL ? "عنصر" : (count === 1 ? "Item" : "Items")}
            </span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function HistoryTab({ active, onClick, label, count, fontFamily, primary }: {
  active: boolean; onClick: () => void; label: string; count: number; fontFamily: string; primary?: boolean;
}) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 active:scale-95 transition-transform"
      style={{
        padding: "13px 22px", borderRadius: "30px",
        backgroundColor: active ? TEAL : "#fff",
        border: active ? "none" : "1px solid rgba(0,0,0,0.1)",
        outline: "none", cursor: "pointer",
      }}>
      <span style={{ fontFamily, fontSize: "17px", fontWeight: WEIGHT.semibold, color: active ? "#fff" : "#6B6B6B" }}>
        {label}
      </span>
      <div style={{
        minWidth: "28px", height: "28px", padding: "0 8px", borderRadius: "100px",
        backgroundColor: active ? "rgba(255,255,255,0.15)" : "#DADADA",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.semibold, color: active ? "#fff" : "#464646" }}>
          {count}
        </span>
      </div>
    </button>
  );
}
