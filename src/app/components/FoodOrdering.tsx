import * as React from "react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, ArrowRight, Sun, Sunrise, Coffee, Moon,
  Check, Clock, Calendar, Utensils, Soup, ClipboardList, ChefHat,
  Star, Heart, Droplets, Flame, Snowflake, Globe,
  Baby, User, FlaskConical, ChevronDown, ChevronRight, ChevronLeft, Home,
  AlertTriangle, X, Plus, ShieldAlert, Sparkles, CheckCircle2, Circle, SlidersHorizontal, Trash2,
} from "lucide-react";
import { InternalPageHeader } from "./InternalPageHeader";
import { ConfirmDialog } from "./ConfirmDialog";
import { useTheme, TYPE_SCALE, WEIGHT, TEXT_STYLE, SHADOW } from "./ThemeContext";
import { useLocale } from "./i18n";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ApiImage } from "./ApiImage";
import { useOrders } from "./OrderStore";
import { useNurseStore, nurseActions } from "./NurseDataStore";
import { useToast } from "./ToastNotifications";
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

/** One meal the patient has built but not yet sent to the kitchen.
 *  Keyed by day + meal, so re-opening a meal replaces it rather than
 *  stacking a second copy of the same dinner. */
interface PendingMeal {
  dayOffset: number;
  mealId: MealId;
  selections: Selections;
  orderData: any;
}

const pendingKey = (dayOffset: number, mealId: MealId) => `${dayOffset}:${mealId}`;

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

/* The photograph a meal is shown by. One file per meal serves the card's hero
   and the menu banner alike; the two differ only in the crop their container
   takes out of it. The card centres its crop; the banner is a far shallower
   slice, so `menuBand` names the height on the plate it should be taken from.

   There is deliberately no horizontal figure here. The banner is ~1306×165 and
   every photograph is 4:3, so `object-fit: cover` scales the image to the
   banner's WIDTH and crops it top and bottom: the horizontal slack is exactly
   0px, and an `object-position` X term cannot move the framing by a pixel. All
   that decides which half of the banner the food lands in is which side of the
   source frame it was shot on — recorded here as `foodSide` — so the banner
   mirrors the photograph when the food would otherwise fall under the text's
   gradient. */
const MEAL_CARD_PHOTOS: Record<MealId, { src: string; menuBand: number; foodSide: "left" | "right"; alt: { en: string; ar: string } }> = {
  breakfast: {
    src: "/assets/meals/breakfast.jpg",
    /* Eggs and toast fill the right of the frame; the left is bare counter. */
    menuBand: 56, foodSide: "right",
    alt: {
      en: "Breakfast tray: scrambled eggs, toast, fruit and juice",
      ar: "صينية الفطور: بيض مخفوق وخبز محمص وفواكه وعصير",
    },
  },
  lunch: {
    src: "/assets/meals/lunch.jpg",
    /* Fruit bowl and plate sit right of centre, bare counter to the left. */
    menuBand: 72, foodSide: "right",
    alt: {
      en: "Lunch tray: grilled chicken with rice, vegetables, salad and fruit",
      ar: "صينية الغداء: دجاج مشوي مع أرز وخضار وسلطة وفواكه",
    },
  },
  dinner: {
    src: "/assets/meals/dinner.jpg",
    /* The plate is shot left of centre; the right is napkin and cutlery. */
    menuBand: 64, foodSide: "left",
    alt: {
      en: "Dinner tray: baked salmon with mashed potato, vegetables and soup",
      ar: "صينية العشاء: سمك سلمون بالفرن مع بطاطس مهروسة وخضار وشوربة",
    },
  },
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

/* ── Ordering rules ───────────────────────────────────────────────────
 * The kitchen takes orders in one window each afternoon, 4:00 PM - 8:00 PM,
 * and that window buys exactly one day: tomorrow. One window for all three
 * meals, replacing the old per-meal orderCutoff, so the patient has a single
 * time to remember rather than three.
 *
 * The two days after tomorrow stay on screen and their menus open and read
 * like any other day's — they just cannot be ordered yet, because their own
 * window has not come round. That is a wait, not a lockout, and every surface
 * here says so: no padlock, no greyed-out day, only "Menu preview".
 *
 * A missed cutoff is not a missed meal: the kitchen sends a standard meal for
 * anything not ordered. The meal cards carry that promise, because the patient
 * most likely to miss the cutoff is the one who most needs to know they will
 * still be fed. */
const ORDER_WINDOW_START = 16;
const ORDER_WINDOW_END = 20;

/** Tomorrow and the two days after it. Today is already in the kitchen's
 *  hands by the time this window opens, so the run starts at +1. */
const ORDER_DAY_OFFSETS = [1, 2, 3] as const;

/** The one day this evening's window can actually buy. */
const ORDERABLE_DAY_OFFSET = 1;
const isOrderableDay = (offset: number) => offset === ORDERABLE_DAY_OFFSET;

/** Where tomorrow's meal stands in today's cycle.
 *
 *  "before"  the menu is readable, nothing can be chosen yet
 *  "open"    4-8 PM: choose, or change what was already chosen
 *  "closed"  8 PM onwards: whatever stands is final, and anything not chosen
 *            has been ordered as a standard meal (see OrderStore)
 *
 *  Only ever asked about ORDERABLE_DAY_OFFSET. The days behind it are preview
 *  regardless of the clock — their own window has not come round. */
export type OrderWindowState = "before" | "open" | "closed";

function orderWindowState(): OrderWindowState {
  if (!_enforceOrderTime) return "open";
  const now = new Date();
  const nowHours = now.getHours() + now.getMinutes() / 60;
  if (nowHours < ORDER_WINDOW_START) return "before";
  if (nowHours < ORDER_WINDOW_END) return "open";
  return "closed";
}

function isOrderWindowOpen(): boolean {
  return orderWindowState() === "open";
}

/** The state, re-read as the clock crosses 4 PM and 8 PM, so a screen left
 *  open through either boundary changes with it instead of going stale. */
function useOrderWindowState(): OrderWindowState {
  const [state, setState] = React.useState<OrderWindowState>(orderWindowState);
  React.useEffect(() => {
    const tick = () => setState((prev) => {
      const next = orderWindowState();
      return next === prev ? prev : next;
    });
    const timer = setInterval(tick, 20_000);
    return () => clearInterval(timer);
  }, []);
  return state;
}

/** Format a decimal hour (e.g. 11.5) as "11:30 AM" */
function formatHour(h: number, isRTL: boolean): string {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d.toLocaleTimeString(isRTL ? "ar-SA" : "en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

/** "4:00 PM – 8:00 PM" in the active language. */
function orderWindowLabel(isRTL: boolean): string {
  return `${formatHour(ORDER_WINDOW_START, isRTL)} – ${formatHour(ORDER_WINDOW_END, isRTL)}`;
}

/** The calendar date `offset` days from today. */
function dayForOffset(offset: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
}

function formatDayLong(offset: number, isRTL: boolean): string {
  return dayForOffset(offset).toLocaleDateString(isRTL ? "ar-SA" : "en-US",
    { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

/** Weekday alone — the day tabs are narrow. */
function formatDayWeekday(offset: number, isRTL: boolean): string {
  return dayForOffset(offset).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { weekday: "long" });
}

/** Day + month, shown under the weekday in the day tabs. */
function formatDayShort(offset: number, isRTL: boolean): string {
  return dayForOffset(offset).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { day: "numeric", month: "short" });
}

/** The date under a day tab's name. Tomorrow's tab is named for its relation
 *  to today rather than its weekday, so its date carries the weekday too; the
 *  other tabs are already named for theirs and only need the date. */
function formatDayTabDate(offset: number, isRTL: boolean): string {
  const locale = isRTL ? "ar-SA" : "en-US";
  return isOrderableDay(offset)
    ? dayForOffset(offset).toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" })
    : dayForOffset(offset).toLocaleDateString(locale, { month: "short", day: "numeric" });
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

const DEMO_PATIENT = { name: { en: "Sara Saleh", ar: "سارة صالح" }, room: "Room 412" };

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
/* Channels, not a colour: the menu banner fades this brand surface out over
   the photograph and needs an alpha on it. */
const TEAL_DARK_RGB = "var(--fo-primary-dark-rgb)";
const SECONDARY = "var(--fo-secondary)";
const GREEN = "#3FC168";
/* The green a "you picked this" tick badge is filled with, everywhere in the
   flow: Order For, Breakfast Type, and the meal cards. A tick means the same
   thing on all three, so it is the same green on all three — GREEN above stays
   the status colour, for pills and card borders. */
const TICK_GREEN = "#2DCC06";
const TICK_GREEN_SHADOW = "rgba(45,204,6,0.34)";
const TEAL_BG_TINT = "var(--fo-bg-tint)";
/* What the theme says text on a brand-coloured surface should be. */
const TEXT_ON_BRAND = "var(--hbs-text-inverse, #fff)";
/* Deliberately not a brand colour: a neutral scrim under text that sits on a
   photograph. The lighter brand palettes (the orange and the greens) leave the
   16px line short of AA against a pale plate without it. */
const PHOTO_TEXT_SHADOW = "0 1px 3px rgba(0,0,0,0.5)";

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

export function FoodOrdering({ onClose, initialView }: { onClose: () => void; initialView?: "order" | "my-orders" }) {
  const { theme } = useTheme();

  const { t, isRTL, fontFamily } = useLocale();
  const { placeOrder, activeOrders, pastOrders, orders, clearOpenOrders } = useOrders();
  const { showToast } = useToast();

  const nurseStore = useNurseStore();

  const [step, setStep] = useState<Step>("select-type");
  const [orderFor, setOrderFor] = useState<OrderFor>("patient");
  const [selectedMealId, setSelectedMealId] = useState<MealId | null>(null);
  const [selections, setSelections] = useState<Selections>({});
  const [lastOrderNumber, setLastOrderNumber] = useState("");
  const [kidsBreakfastType, setKidsBreakfastType] = useState<KidsBreakfastType>(null);
  /* Guards the one irreversible action in the flow: submitting sends the
     basket to the kitchen and there is no way back from it. */
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  /* ── The three-day pending order ──────────────────────────────────────
   * Choosing meals fills a basket; nothing reaches the kitchen until the
   * patient presses "Place order". That is what lets one visit cover three
   * days: without it, every meal built would submit itself and there would be
   * no point at which the patient could still change their mind. */
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(ORDER_DAY_OFFSETS[0]);
  const [pendingMeals, setPendingMeals] = useState<PendingMeal[]>([]);
  /** Meals sent in the last submission — the confirmation screen lists them. */
  const [submittedSummary, setSubmittedSummary] = useState<PendingMeal[]>([]);

  /* Already with the kitchen, keyed day + meal. Read back off the placed
     orders rather than kept alongside them, so it survives leaving this
     screen and coming back. */
  const patientChoseForTomorrow = useMemo(() => {
    const tomorrow = dayForOffset(ORDERABLE_DAY_OFFSET).toDateString();
    const sent = (orders as any[]).some((o) =>
      !o.autoStandard && o.deliveryDate && new Date(o.deliveryDate).toDateString() === tomorrow);
    return sent || pendingMeals.some((e) => isOrderableDay(e.dayOffset));
  }, [orders, pendingMeals]);

  const placedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const o of orders as any[]) {
      const mealId = o.mealId || o.mealType?.toLowerCase();
      if (!mealId || !o.deliveryDate) continue;
      const d = new Date(o.deliveryDate);
      if (Number.isNaN(d.getTime())) continue;
      for (const off of ORDER_DAY_OFFSETS) {
        if (d.toDateString() === dayForOffset(off).toDateString()) keys.add(pendingKey(off, mealId));
      }
    }
    return keys;
  }, [orders]);

  /* Tomorrow's window state, live across the 4 PM and 8 PM boundaries. */
  const windowState = useOrderWindowState();

  const [showHistoryOverlay, setShowHistoryOverlay] = useState(initialView === "my-orders");

  // Diet & Allergies interactive modal state
  const [showDietAllergiesModal, setShowDietAllergiesModal] = useState(false);
  const [dietAllergiesInitialTab, setDietAllergiesInitialTab] = useState<"diet" | "allergies">("diet");

  const handleOpenDietModal = useCallback(() => {
    setDietAllergiesInitialTab("diet");
    setShowDietAllergiesModal(true);
  }, []);

  const handleOpenAllergiesModal = useCallback(() => {
    setDietAllergiesInitialTab("allergies");
    setShowDietAllergiesModal(true);
  }, []);

  // Read diet from Care Teams Settings (NurseDataStore)
  const patientDiet = nurseStore.patientDiet as DietType | "npo";
  const isNpo = patientDiet === "npo";
  // Guest/companion always uses Regular diet menu; NPO patients can't order but guests can
  const effectiveDiet: DietType = orderFor === "guest" ? "regular" : (isNpo ? "regular" : patientDiet as DietType);
  // The menu shown is the one for the day currently being ordered for —
  // anywhere in the rolling window, not always tomorrow.
  const orderDay = dayForOffset(selectedDayOffset);
  const dayOfWeek = orderDay.getDay(); // 0=Sun … 6=Sat
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

  /** Turn the current build into the shape OrderStore keeps. */
  const buildOrderData = useCallback((meal: MealPeriod, sel: Selections, dayOffset: number) => {
    const selectedItems = meal.groups.flatMap((g) => {
      const chosen = sel[g.id] || [];
      if (g.mode === "included") return [];
      return chosen.map((id) => {
        const it = g.items.find((i) => i.id === id)!;
        return { id: it.id, name: it.name, qty: 1, image: it.image || "" };
      });
    });
    return {
      items: selectedItems.map((it) => ({ id: it.id, name: it.name, quantity: it.qty, calories: 0, image: it.image })),
      totalCalories: 0,
      estimatedDelivery: isMealActive(meal.hours) ? "25–35 min" : loc(meal.label) + " delivery",
      mealType: loc(meal.label),
      mealWindow: meal.timeRange,
      comesWith: meal.groups.filter((g) => g.mode === "included").flatMap((g) => g.items.map((it) => it.name)),
      orderFor,
      mealId: meal.id,
      selections: { ...sel },
      // Which day of the rolling window this is for. Without it the history
      // view can only ever say "tomorrow", which is wrong for two days in three.
      deliveryDate: dayForOffset(dayOffset).toISOString(),
    };
  }, [orderFor, isRTL]);

  /** Add the meal just built to the basket and return to the day's meals.
   *  Re-opening a meal replaces its entry rather than adding a second one. */
  const handleAddToPending = useCallback(() => {
    if (!currentMeal) return;
    const entry: PendingMeal = {
      dayOffset: selectedDayOffset,
      mealId: currentMeal.id,
      selections: { ...selections },
      orderData: buildOrderData(currentMeal, selections, selectedDayOffset),
    };
    setPendingMeals((prev) => [
      ...prev.filter((e) => pendingKey(e.dayOffset, e.mealId) !== pendingKey(entry.dayOffset, entry.mealId)),
      entry,
    ]);
    setSelectedMealId(null);
    setStep("select-meal");
  }, [currentMeal, selections, selectedDayOffset, buildOrderData]);

  /* A basket left unsent when the window shuts is still a choice the patient
     made, and the rules say a choice is kept. So it is submitted here rather
     than dropped — which also stops OrderStore's fallback from treating those
     meals as unchosen. Meals already with the kitchen are skipped, so this can
     never place a second order for the same meal. */
  useEffect(() => {
    if (windowState !== "closed") return;
    const due = pendingMeals.filter(
      (e) => isOrderableDay(e.dayOffset) && !placedKeys.has(pendingKey(e.dayOffset, e.mealId)),
    );
    if (due.length === 0) {
      if (pendingMeals.some((e) => isOrderableDay(e.dayOffset))) {
        setPendingMeals((prev) => prev.filter((e) => !isOrderableDay(e.dayOffset)));
      }
      return;
    }
    due.forEach((entry) => placeOrder(entry.orderData));
    setPendingMeals((prev) => prev.filter((e) => !isOrderableDay(e.dayOffset)));
  }, [windowState, pendingMeals, placedKeys, placeOrder]);

  /** The explicit submit. Everything in the basket goes to the kitchen now —
   *  nothing was sent while the patient was still choosing. */
  const handleSubmitOrder = useCallback(() => {
    setShowSubmitConfirm(false);
    if (pendingMeals.length === 0) return;
    const ordered = [...pendingMeals].sort(
      (a, b) => a.dayOffset - b.dayOffset || a.mealId.localeCompare(b.mealId),
    );
    let firstNumber = "";
    ordered.forEach((entry) => {
      const placed = placeOrder(entry.orderData);
      if (!firstNumber) firstNumber = placed.orderNumber;
    });
    setLastOrderNumber(firstNumber);
    setSubmittedSummary(ordered);
    setPendingMeals([]);

    /* The confirmation screen details one meal and lists the rest. Adding to
       the basket clears the current selection, so restore the last meal built
       — without it currentMeal is null and the confirmation renders empty. */
    const headline = ordered[ordered.length - 1];
    setSelectedDayOffset(headline.dayOffset);
    setSelectedMealId(headline.mealId);
    setSelections(headline.selections);

    // Fakeeh ONLY: Push notification to order for companion
    const isFakeeh = theme.id === "dsfh" || theme.id.includes("dsfh") || theme.id.includes("fakeeh");
    if (isFakeeh && orderFor === "patient") {
      setTimeout(() => {
        showToast({
          variant: "meal",
          category: isRTL ? "وجبة المرافق" : "COMPANION MEAL",
          title: isRTL ? "هل ترغب في طلب وجبات لمرافقك؟" : "Order for your companion",
          actionText: isRTL ? "اطلب الآن" : "Order Now",
          actionColor: "#16A34A",
          onTap: () => {
            setOrderFor("guest");
            setStep("select-meal");
          },
          secondaryActionText: isRTL ? "تفقد لاحقاً" : "Check Later",
          secondaryActionColor: "#6B7280",
          onSecondaryTap: () => {},
        });
      }, 500);
    }
    setStep("confirmed");
  }, [pendingMeals, placeOrder, orderFor, theme.id, showToast, isRTL]);

  const stepIndex: 1 | 2 | 3 | 4 =
    step === "select-type" ? 1 :
    step === "select-meal" ? 2 :
    step === "kids-breakfast-type" ? 2 :
    step === "build-meal"  ? 3 :
    step === "confirmed"   ? 4 : 1;

  const canContinue =
    step === "select-type" ? (isNpo && orderFor === "patient" ? false : true) :
    step === "select-meal" ? isOrderableDay(selectedDayOffset) && windowState === "open" && selectedMealId !== null :
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
        const already = pendingMeals.find(
          (e) => pendingKey(e.dayOffset, e.mealId) === pendingKey(selectedDayOffset, m.id),
        );
        setSelections(already ? { ...already.selections } : getInitialSelections(m));
        setStep("build-meal");
      }
    } else if (step === "kids-breakfast-type" && kidsBreakfastType) {
      // After selecting hot/cold, build meals with the selected type
      const updatedMeals = buildMeals(effectiveDiet, dayOfWeek, kidsBreakfastType);
      const m = updatedMeals.find((x) => x.id === "breakfast")!;
      setSelections(getInitialSelections(m));
      setStep("build-meal");
    } else if (step === "build-meal") {
      handleAddToPending();
    }
  }, [step, selectedMealId, effectiveDiet, dayOfWeek, kidsBreakfastType, meals, handleAddToPending, isNpo, orderFor, pendingMeals, selectedDayOffset]);

  const handleBack = useCallback(() => {
    if (step === "select-type") onClose();
    else if (step === "select-meal") setStep("select-type");
    else if (step === "kids-breakfast-type") setStep("select-meal");
    else if (step === "build-meal") {
      if (effectiveDiet === "kids" && selectedMealId === "breakfast") {
        setStep("kids-breakfast-type");
      } else {
        setStep("select-meal");
      }
    }
    else if (step === "confirmed") onClose();
    else if (step === "history") setStep("select-type");
  }, [step, onClose, effectiveDiet, selectedMealId]);

  const showPatientBar = step !== "history" && step !== "confirmed";
  const showBottomBar = true;
  const showBackButton = true;
  const isFlow = step === "select-type" || step === "select-meal" || step === "kids-breakfast-type" || step === "build-meal" || step === "confirmed";

  /* ── Derive CSS custom property values from current theme ── */
  const foVars = {
    "--fo-primary": theme.primary,
    "--fo-primary-rgb": hexToRgb(theme.primary),
    "--fo-primary-dark": theme.primaryDark,
    "--fo-primary-dark-rgb": hexToRgb(theme.primaryDark),
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
          name={orderFor === "guest" ? (isRTL ? "مرافق" : "Companion") : (isRTL ? DEMO_PATIENT.name.ar : DEMO_PATIENT.name.en)}
          mealName={currentMeal ? loc(currentMeal.label) : null}
          fontFamily={fontFamily}
          isRTL={isRTL}
          onDietClick={orderFor === "patient" ? handleOpenDietModal : undefined}
          onAllergiesClick={orderFor === "patient" ? handleOpenAllergiesModal : undefined}
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
                    selectedDayOffset={selectedDayOffset}
                    onSelectDay={(offset) => { setSelectedDayOffset(offset); setSelectedMealId(null); }}
                    pendingMealIds={new Set(
                      pendingMeals
                        .filter((e) => e.dayOffset === selectedDayOffset)
                        .map((e) => e.mealId),
                    )}
                    placedMealIds={new Set(
                      meals.filter((m) => placedKeys.has(pendingKey(selectedDayOffset, m.id))).map((m) => m.id),
                    )}
                    hasSelection={patientChoseForTomorrow}
                    windowState={windowState}
                  />
                )}
                {step === "kids-breakfast-type" && (
                  <KidsBreakfastTypeStep key="kbt" selected={kidsBreakfastType} onSelect={setKidsBreakfastType} fontFamily={fontFamily} isRTL={isRTL} />
                )}
                {step === "build-meal" && currentMeal && (
                  <BuildMealStep key="b" meal={currentMeal} selections={selections} onToggle={handleToggleItem} fontFamily={fontFamily} isRTL={isRTL} dayOffset={selectedDayOffset} />
                )}
                {step === "confirmed" && currentMeal && (
                  <ConfirmStep key="c"
                    orderNumber={lastOrderNumber} meal={currentMeal} selections={selections}
                    orderFor={orderFor}
                    patientName={orderFor === "guest" ? (isRTL ? "مرافق" : "Companion") : (isRTL ? DEMO_PATIENT.name.ar : DEMO_PATIENT.name.en)}
                    room={DEMO_PATIENT.room.replace("Room ", "")}
                    dietLabel={dietDisplayLabel}
                    allergiesLabel={allergiesLabel}
                    meals={meals}
                    orders={orders}
                    submitted={submittedSummary.map((e) => ({ dayOffset: e.dayOffset, mealId: e.mealId }))}
                    onOrderMeal={(mealId) => {
                      setSelectedMealId(mealId);
                      setSelections(getInitialSelections(meals.find((m) => m.id === mealId)!));
                      setStep("build-meal");
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
                  {isRTL ? "عرض طلباتك" : "View your orders"}
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
            // The basket can only be sent from the meal list — the one screen
            // where the patient can see what is in it across all three days.
            step === "select-meal" && windowState === "open" && pendingMeals.length > 0
              ? {
                  label: isRTL
                    ? `إرسال الطلب (${pendingMeals.length})`
                    : `Place order (${pendingMeals.length})`,
                  onClick: () => setShowSubmitConfirm(true),
                }
              : undefined
          }
          backLabel={
            (isRTL ? "رجوع" : "Back")
          }
          continueLabel={
            step === "build-meal" ? (isRTL ? "أضف إلى الطلب" : "Add to order") :
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
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── DIET & ALLERGIES INTERACTIVE MODAL ─── */}
      <DietAllergiesModal
        isOpen={showDietAllergiesModal}
        onClose={() => setShowDietAllergiesModal(false)}
        initialTab={dietAllergiesInitialTab}
        currentDiet={patientDiet}
        currentAllergies={patientAllergies}
        onSelectDiet={(diet) => nurseActions.setPatientDiet(diet)}
        onToggleAllergy={(allergy) => {
          if (patientAllergies.includes(allergy)) {
            nurseActions.removeAllergy(allergy);
          } else {
            nurseActions.addAllergy(allergy);
          }
        }}
        onAddCustomAllergy={(allergy) => nurseActions.addAllergy(allergy)}
        onClearAllergies={() => nurseActions.setAllergies([])}
        fontFamily={fontFamily}
        isRTL={isRTL}
      />

      {/* ─── SUBMIT CONFIRMATION ─── */}
      {/* The last point at which the basket can still be changed. Confirming
          sends it to the kitchen; from then on the order is final. */}
      <ConfirmDialog
        visible={showSubmitConfirm}
        message={t("food.submitConfirm.message")}
        onConfirm={handleSubmitOrder}
        onCancel={() => setShowSubmitConfirm(false)}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * TOP BAR
 * ═══════════════════════════════════════════════════════════════════════════ */

function TopBar({ onBack, onMyOrders, showMyOrders, onDemoClear, title, fontFamily, isRTL, BackArrow }: {
  onBack: () => void; onMyOrders: () => void; showMyOrders?: boolean; onDemoClear: () => void;
  title: string; fontFamily: string; isRTL: boolean; BackArrow: any;
}) {
  const { locale, setLocale } = useTheme();
  const [enforceTime, setEnforceTimeLocal] = React.useState(() => getEnforceOrderTime());

  const iconBtnStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "42px", height: "42px",
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "10px",
    color: "#fff", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer",
  };

  return (
    <InternalPageHeader 
      title={title}
      icon={<Utensils size={24} />}
      onClose={onBack}
      rightAction={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* My Orders (leftmost) */}
          {showMyOrders && (
            <button onClick={onMyOrders} style={{ 
              display: "flex", alignItems: "center", gap: "8px", 
              backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "10px 16px",
              color: "#fff", fontFamily, fontWeight: 600, border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer"
            }}>
              <ClipboardList size={20} />
              {isRTL ? "طلباتي" : "My Orders"}
            </button>
          )}
          {/* Language switcher — Globe icon */}
          <button
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            title={locale === "ar" ? "Switch to English" : "التبديل للعربية"}
            style={iconBtnStyle}
          >
            <Globe size={20} />
          </button>
          {/* Time restriction toggle */}
          <button
            onClick={() => {
              const next = !enforceTime;
              setEnforceOrderTime(next);
              setEnforceTimeLocal(next);
            }}
            title={enforceTime ? (isRTL ? "تقييد الوقت مُفعّل" : "Time restriction ON") : (isRTL ? "تقييد الوقت مُعطّل" : "Time restriction OFF")}
            style={{
              ...iconBtnStyle,
              backgroundColor: enforceTime ? "rgba(255,255,255,0.15)" : "rgba(255,200,50,0.35)",
            }}
          >
            <Clock size={20} />
          </button>
          {/* Demo reset button (rightmost) */}
          <button onClick={onDemoClear} title={isRTL ? "إعادة تعيين الطلبات" : "Reset Orders (Demo)"}
            style={iconBtnStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
          </button>
        </div>
      }
    />
  );
}

function PatientBar({
  isKid,
  orderFor,
  name,
  dietLabel,
  allergiesLabel,
  mealName,
  fontFamily,
  isRTL,
  onDietClick,
  onAllergiesClick,
}: {
  isKid: boolean;
  orderFor: OrderFor;
  name: string;
  dietLabel: string;
  allergiesLabel: string;
  mealName: string | null;
  fontFamily: string;
  isRTL: boolean;
  onDietClick?: () => void;
  onAllergiesClick?: () => void;
}) {
  const isGuest = orderFor === "guest";
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="shrink-0 mx-12 mt-[12px] flex items-center justify-center gap-[16px]"
      style={{ backgroundColor: "#fff", borderRadius: "24px", padding: "16px 22px", border: "1px solid rgba(0,0,0,0.1)" }}
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
          <Pill
            icon={<DietSvg />}
            label={isRTL ? "الحمية:" : "Diet:"}
            value={dietLabel}
            fontFamily={fontFamily}
            onClick={onDietClick}
            tooltip={isRTL ? "انقر لتغيير الحمية (اختيار واحد فقط)" : "Click to select diet (single selection)"}
            interactive={Boolean(onDietClick)}
          />
          <Pill
            icon={<AlertSvg />}
            label={isRTL ? "الحساسية:" : "Allergies:"}
            value={allergiesLabel}
            fontFamily={fontFamily}
            onClick={onAllergiesClick}
            tooltip={isRTL ? "انقر لتعديل الحساسيات (اختيارات متعددة)" : "Click to edit allergies (multiple selection)"}
            interactive={Boolean(onAllergiesClick)}
          />
        </div>
      </div>
    </motion.div>
  );
}

function Pill({
  icon,
  label,
  value,
  fontFamily,
  onClick,
  tooltip,
  interactive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  fontFamily: string;
  onClick?: () => void;
  tooltip?: string;
  interactive?: boolean;
}) {
  const isInteractive = Boolean(onClick);
  const Tag = isInteractive ? motion.button : "div";

  return (
    <Tag
      {...(isInteractive ? { onClick, whileTap: { scale: 0.96 }, title: tooltip } : {})}
      className={`flex items-center gap-[8px] ${isInteractive ? "cursor-pointer group transition-all" : ""}`}
      style={{
        backgroundColor: isInteractive ? "rgba(0, 138, 171, 0.08)" : "#F2F9FB",
        borderRadius: "10px",
        padding: "9px 15px",
        border: isInteractive ? "1.5px solid rgba(0, 138, 171, 0.25)" : "1px solid transparent",
        outline: "none",
      }}
    >
      {icon}
      <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.semibold, color: "#303030", whiteSpace: "nowrap", lineHeight: 1.2 }}>{label}</span>
      <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.semibold, color: isInteractive ? "#008AAB" : "#303030", whiteSpace: "nowrap", lineHeight: 1.2 }}>{value}</span>
      {isInteractive && (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#008AAB"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.8, marginInlineStart: "2px" }}
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      )}
    </Tag>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * DIET & ALLERGIES MODAL (Interactive: Single Diet, Multiple Allergies)
 * ═══════════════════════════════════════════════════════════════════════════ */

interface DietOptionItem {
  id: DietType | "npo";
  label: { en: string; ar: string };
  desc: { en: string; ar: string };
  color: string;
  bg: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

const ALL_DIET_OPTIONS: DietOptionItem[] = [
  {
    id: "regular",
    label: { en: "Regular Diet", ar: "عادي" },
    desc: { en: "Standard balanced hospital meal plan", ar: "خطة وجبات قياسية متوازنة وصحية" },
    color: "#0284C7",
    bg: "#F0F9FF",
    icon: Utensils,
  },
  {
    id: "diabetic",
    label: { en: "Diabetic", ar: "السكري" },
    desc: { en: "Controlled carbohydrates & low sugar", ar: "كربوهيدرات مقننة وسكريات منخفضة" },
    color: "#2563EB",
    bg: "#EFF6FF",
    icon: Droplets,
  },
  {
    id: "low-sodium",
    label: { en: "Low Sodium", ar: "قليل الصوديوم" },
    desc: { en: "Heart-healthy with restricted salt", ar: "صحي للقلب ومقيد الملح" },
    color: "#059669",
    bg: "#ECFDF5",
    icon: Heart,
  },
  {
    id: "low-potassium",
    label: { en: "Low Potassium", ar: "قليل البوتاسيوم" },
    desc: { en: "Kidney-care with low potassium foods", ar: "صحي للكلى بأطعمة منخفضة البوتاسيوم" },
    color: "#DB2777",
    bg: "#FDF2F8",
    icon: Heart,
  },
  {
    id: "soft-diet",
    label: { en: "Soft Diet", ar: "نظام غذائي لين" },
    desc: { en: "Easy to chew and digest meals", ar: "وجبات سهلة المضغ والهضم والبلع" },
    color: "#D97706",
    bg: "#FFFBEB",
    icon: Soup,
  },
  {
    id: "chemotherapy",
    label: { en: "Chemotherapy", ar: "العلاج الكيميائي" },
    desc: { en: "Nutrient-dense oncology nutrition", ar: "تغذية متكاملة لمرضى العلاج الكيميائي" },
    color: "#7C3AED",
    bg: "#F5F3FF",
    icon: FlaskConical,
  },
  {
    id: "ob",
    label: { en: "OB Patients", ar: "مرضى التوليد" },
    desc: { en: "Maternity & postpartum nutrition", ar: "تغذية للأمهات بعد الولادة وفترة الحمل" },
    color: "#EA580C",
    bg: "#FFF7ED",
    icon: Star,
  },
  {
    id: "kids",
    label: { en: "Kids Menu", ar: "قائمة الأطفال" },
    desc: { en: "Child-friendly meals and fun choices", ar: "وجبات شهية ومناسبة للأطفال" },
    color: "#059669",
    bg: "#ECFDF5",
    icon: Baby,
  },
  {
    id: "npo",
    label: { en: "NPO / Fasting", ar: "صائم (NPO)" },
    desc: { en: "Nothing by mouth (fasting for medical tests/surgery)", ar: "ممنوع تناول الطعام بالفم (صيام للفحوصات/الجراحة)" },
    color: "#DC2626",
    bg: "#FEF2F2",
    icon: AlertTriangle,
  },
];

const PRESET_ALLERGIES: { en: string; ar: string }[] = [
  { en: "Penicillin", ar: "بنسلين" },
  { en: "Latex", ar: "لاتكس" },
  { en: "Shellfish", ar: "المأكولات البحرية" },
  { en: "Peanuts", ar: "الفول السوداني" },
  { en: "Aspirin", ar: "أسبرين" },
  { en: "Sulfonamides", ar: "سلفوناميد" },
  { en: "Morphine", ar: "مورفين" },
  { en: "Eggs", ar: "البيض" },
  { en: "Dairy", ar: "منتجات الألبان" },
  { en: "Gluten", ar: "الجلوتين" },
  { en: "Tree Nuts", ar: "المكسرات" },
  { en: "NSAIDs", ar: "مضادات الالتهاب" },
];

function DietAllergiesModal({
  isOpen,
  onClose,
  initialTab,
  currentDiet,
  currentAllergies,
  onSelectDiet,
  onToggleAllergy,
  onAddCustomAllergy,
  onClearAllergies,
  fontFamily,
  isRTL,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialTab: "diet" | "allergies";
  currentDiet: string;
  currentAllergies: string[];
  onSelectDiet: (diet: string) => void;
  onToggleAllergy: (allergy: string) => void;
  onAddCustomAllergy: (allergy: string) => void;
  onClearAllergies: () => void;
  fontFamily: string;
  isRTL: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"diet" | "allergies">(initialTab);
  const [customAllergyInput, setCustomAllergyInput] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setCustomAllergyInput("");
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const loc = (v: { en: string; ar: string }) => (isRTL ? v.ar : v.en);

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customAllergyInput.trim();
    if (trimmed) {
      onAddCustomAllergy(trimmed);
      setCustomAllergyInput("");
    }
  };

  // Combine preset and any existing custom allergies in a single deduplicated list
  const allKnownAllergies = Array.from(
    new Set([...PRESET_ALLERGIES.map((a) => a.en), ...currentAllergies])
  );

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-6"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.55)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[840px] max-h-[90vh] flex flex-col rounded-[28px] overflow-hidden"
          style={{
            backgroundColor: "#FFFFFF",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
            fontFamily,
          }}
        >
          {/* ── Header ── */}
          <div
            className="shrink-0 flex items-center justify-between px-8 py-5"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#FAFCFD" }}
          >
            <div className="flex items-center gap-3.5">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  backgroundColor: "rgba(0, 138, 171, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SlidersHorizontal size={22} color="#008AAB" />
              </div>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: WEIGHT.bold, color: "#171717", margin: 0 }}>
                  {isRTL ? "الحمية والحساسية للمريض" : "Patient Diet & Allergies"}
                </h3>
                <p style={{ fontSize: "13px", fontWeight: WEIGHT.medium, color: "#6B7280", margin: 0, marginTop: "2px" }}>
                  {isRTL ? "اضبط الحمية الغذائية وسجل الحساسيات النشطة" : "Configure patient meal diet and allergy precautions"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                backgroundColor: "#F3F4F6",
                border: "none",
                outline: "none",
                color: "#6B7280",
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* ── Tabs (Diet vs Allergies) ── */}
          <div
            className="shrink-0 flex items-center gap-3 px-8 pt-4 pb-2"
            style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <button
              onClick={() => setActiveTab("diet")}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold cursor-pointer transition-all active:scale-98"
              style={{
                backgroundColor: activeTab === "diet" ? "#008AAB" : "#F3F4F6",
                color: activeTab === "diet" ? "#FFFFFF" : "#4B5563",
                fontSize: "15px",
                border: "none",
                outline: "none",
              }}
            >
              <Utensils size={18} />
              <span>{isRTL ? "الحمية الغذائية" : "Diet"}</span>
              <span
                style={{
                  fontSize: "12px",
                  padding: "2px 8px",
                  borderRadius: "100px",
                  backgroundColor: activeTab === "diet" ? "rgba(255,255,255,0.25)" : "#E5E7EB",
                  color: activeTab === "diet" ? "#FFFFFF" : "#374151",
                }}
              >
                1
              </span>
            </button>

            <button
              onClick={() => setActiveTab("allergies")}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold cursor-pointer transition-all active:scale-98"
              style={{
                backgroundColor: activeTab === "allergies" ? "#E11D48" : "#F3F4F6",
                color: activeTab === "allergies" ? "#FFFFFF" : "#4B5563",
                fontSize: "15px",
                border: "none",
                outline: "none",
              }}
            >
              <AlertTriangle size={18} />
              <span>{isRTL ? "الحساسية" : "Allergies"}</span>
              <span
                style={{
                  fontSize: "12px",
                  padding: "2px 8px",
                  borderRadius: "100px",
                  backgroundColor: activeTab === "allergies" ? "rgba(255,255,255,0.25)" : "#E5E7EB",
                  color: activeTab === "allergies" ? "#FFFFFF" : "#374151",
                }}
              >
                {currentAllergies.length}
              </span>
            </button>
          </div>

          {/* ── Content Body ── */}
          <div className="flex-1 min-h-0 overflow-y-auto px-8 py-5 fo-scroll">
            {activeTab === "diet" ? (
              <div className="flex flex-col gap-4">
                {/* Diets Grid (Single Selection) */}
                <div className="grid grid-cols-2 gap-3.5">
                  {ALL_DIET_OPTIONS.map((d) => {
                    const isSelected = currentDiet === d.id;
                    const Icon = d.icon;
                    return (
                      <motion.button
                        key={d.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectDiet(d.id)}
                        className="flex items-start gap-3.5 p-4 rounded-2xl text-left cursor-pointer transition-all"
                        style={{
                          backgroundColor: isSelected ? d.bg : "#FFFFFF",
                          border: isSelected ? `2px solid ${d.color}` : "1.5px solid #E5E7EB",
                          boxShadow: isSelected ? `0 4px 16px ${d.color}25` : "none",
                          outline: "none",
                          textAlign: isRTL ? "right" : "left",
                        }}
                      >
                        {/* Diet Icon */}
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            backgroundColor: isSelected ? d.color : "#F3F4F6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={22} color={isSelected ? "#FFFFFF" : d.color} />
                        </div>

                        {/* Label & Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span style={{ fontSize: "16px", fontWeight: WEIGHT.bold, color: isSelected ? d.color : "#1F2937" }}>
                              {loc(d.label)}
                            </span>
                            {/* Single selection Radio indicator */}
                            <div
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                border: isSelected ? `6px solid ${d.color}` : "2px solid #D1D5DB",
                                backgroundColor: "#FFFFFF",
                                flexShrink: 0,
                                transition: "all 0.2s ease",
                              }}
                            />
                          </div>
                          <p style={{ fontSize: "12.5px", fontWeight: WEIGHT.medium, color: "#6B7280", margin: 0, marginTop: "4px", lineHeight: 1.4 }}>
                            {loc(d.desc)}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* NPO Informational Alert */}
                {currentDiet === "npo" && (
                  <div
                    className="flex items-start gap-3.5 p-4 rounded-2xl mt-2"
                    style={{ backgroundColor: "#FEF2F2", border: "1.5px solid #FECACA" }}
                  >
                    <AlertTriangle size={22} color="#DC2626" className="shrink-0 mt-0.5" />
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: WEIGHT.bold, color: "#991B1B", margin: 0 }}>
                        {isRTL ? "تنبيه الصيام (NPO)" : "NPO Fasting Status"}
                      </p>
                      <p style={{ fontSize: "13px", fontWeight: WEIGHT.medium, color: "#B91C1C", margin: 0, marginTop: "2px", lineHeight: 1.4 }}>
                        {isRTL
                          ? "عند تفعيل وضع الصيام، سيتم تعطيل طلب الوجبات للمريض مع إمكانية طلب المرافقين."
                          : "When NPO is active, patient meal ordering is disabled while companion meal orders remain allowed."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Allergies Section (Multiple Selection) ── */
              <div className="flex flex-col gap-5">
                {/* Header info & clear button */}
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: WEIGHT.bold, color: "#4B5563" }}>
                      {isRTL ? "الحساسيات المحددة:" : "Selected Allergies:"}
                    </span>
                  </div>

                  <button
                    onClick={onClearAllergies}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all active:scale-95"
                    style={{
                      backgroundColor: currentAllergies.length === 0 ? "#E0F2FE" : "#FEE2E2",
                      color: currentAllergies.length === 0 ? "#0369A1" : "#B91C1C",
                      border: "none",
                      outline: "none",
                    }}
                  >
                    <Trash2 size={13} />
                    <span>{isRTL ? "لا توجد حساسية (مسح الكل)" : "No Known Allergies (Clear)"}</span>
                  </button>
                </div>

                {/* Active Allergies Chips */}
                <div className="flex flex-wrap gap-2.5">
                  {allKnownAllergies.map((allergyName) => {
                    const isSelected = currentAllergies.includes(allergyName);
                    const preset = PRESET_ALLERGIES.find((p) => p.en.toLowerCase() === allergyName.toLowerCase());
                    const arLabel = preset ? preset.ar : allergyName;
                    const enLabel = preset ? preset.en : allergyName;
                    const label = isRTL ? arLabel : enLabel;

                    return (
                      <motion.button
                        key={allergyName}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onToggleAllergy(allergyName)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-all"
                        style={{
                          backgroundColor: isSelected ? "#FEE2E2" : "#F9FAFB",
                          border: isSelected ? "1.5px solid #EF4444" : "1.5px solid #E5E7EB",
                          color: isSelected ? "#991B1B" : "#4B5563",
                          fontSize: "14px",
                          outline: "none",
                          boxShadow: isSelected ? "0 2px 8px rgba(239, 68, 68, 0.18)" : "none",
                        }}
                      >
                        {isSelected ? (
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              backgroundColor: "#EF4444",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Check size={12} color="#FFFFFF" strokeWidth={3} />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              border: "1.5px solid #D1D5DB",
                            }}
                          />
                        )}
                        <span>{label}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Add Custom Allergy Input */}
                <form
                  onSubmit={handleAddCustom}
                  className="flex items-center gap-2 p-3 rounded-2xl mt-2"
                  style={{ backgroundColor: "#F9FAFB", border: "1.5px dashed #D1D5DB" }}
                >
                  <Plus size={20} color="#6B7280" className="shrink-0" />
                  <input
                    type="text"
                    value={customAllergyInput}
                    onChange={(e) => setCustomAllergyInput(e.target.value)}
                    placeholder={isRTL ? "إضافة حساسية أخرى مخصصة..." : "Add other custom allergy..."}
                    style={{
                      flex: 1,
                      backgroundColor: "transparent",
                      border: "none",
                      outline: "none",
                      fontFamily,
                      fontSize: "14px",
                      color: "#1F2937",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!customAllergyInput.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      backgroundColor: customAllergyInput.trim() ? "#008AAB" : "#E5E7EB",
                      color: customAllergyInput.trim() ? "#FFFFFF" : "#9CA3AF",
                      border: "none",
                      outline: "none",
                      cursor: customAllergyInput.trim() ? "pointer" : "default",
                    }}
                  >
                    {isRTL ? "إضافة" : "Add"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div
            className="shrink-0 flex items-center justify-end px-8 py-4"
            style={{ borderTop: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#FAFCFD" }}
          >
            <button
              onClick={onClose}
              className="px-8 py-2.5 rounded-xl font-bold cursor-pointer transition-transform active:scale-95"
              style={{
                backgroundColor: "#008AAB",
                color: "#FFFFFF",
                fontSize: "15px",
                border: "none",
                outline: "none",
                boxShadow: "0 4px 14px rgba(0, 138, 171, 0.3)",
              }}
            >
              {isRTL ? "تم / تطبيق" : "Done / Apply"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
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
                  backgroundColor: selected ? TICK_GREEN : "#fff",
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
 * STEP 2: CHOOSE MEALS (rolling three-day window)
 * ═══════════════════════════════════════════════════════════════════════════ */

function ChooseMealStep({ meals, selectedMealId, onSelect, onDeselect, fontFamily, isRTL, selectedDayOffset, onSelectDay, pendingMealIds, placedMealIds, hasSelection, windowState }: {
  meals: MealPeriod[]; selectedMealId: MealId | null; onSelect: (id: MealId) => void;
  /** Open a meal's menu to read on a day that cannot be ordered yet. */
  onDeselect?: () => void; fontFamily: string; isRTL: boolean;
  /** Which day of the run is on screen. Only ORDERABLE_DAY_OFFSET can be bought. */
  selectedDayOffset: number;
  onSelectDay: (offset: number) => void;
  /** Meals already in the basket for the selected day. */
  pendingMealIds: Set<MealId>;
  /** Meals already sent to the kitchen for the selected day. */
  placedMealIds: Set<MealId>;
  /** Has the patient chosen anything for TOMORROW — whichever day's tab is on
   *  screen? The notice always speaks about tomorrow, so it cannot be read off
   *  the visible day. A standard meal placed on their behalf is not a choice. */
  hasSelection: boolean;
  /** Where tomorrow's meal stands in today's cycle. */
  windowState: OrderWindowState;
}) {
  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;
  /* The meal whose menu is being read. Reading never leaves this screen: the
     patient is browsing, not part-way through an order, and a full screen with
     a back button would tell them otherwise. */
  const [menuMeal, setMenuMeal] = React.useState<MealPeriod | null>(null);
  const windowStr = orderWindowLabel(isRTL);
  const windowStartStr = formatHour(ORDER_WINDOW_START, isRTL);
  const windowEndStr = formatHour(ORDER_WINDOW_END, isRTL);
  const dayOrderable = isOrderableDay(selectedDayOffset);
  /* A meal is choosable only on tomorrow's tab, and only inside the window.
     Outside it the same card opens the same menu to read. */
  const canOrder = dayOrderable && windowState === "open";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
      className="h-full flex flex-col px-[40px] pt-[32px] pb-[20px] gap-[16px] relative">
      {/* Centered heading */}
      <div className="shrink-0 text-center flex flex-col items-center gap-[10px]">
        <h2 style={{ fontFamily, fontSize: "28px", fontWeight: WEIGHT.bold, color: "#171717", letterSpacing: "0.4px", textTransform: "uppercase" }}>
          {isRTL ? "اختر وجباتك" : "Choose Your Meals"}
        </h2>

        {/* Day tabs — a day and its date, nothing else. Every tab is live:
            switching to one shows that day's menu. Which day can be ordered
            is said by the cards below (their badge) and by the notice, so the
            tabs stay a plain row of dates rather than repeating it a third
            time in smaller type. */}
        <div className="flex items-center justify-center gap-3" dir={isRTL ? "rtl" : "ltr"}>
          {ORDER_DAY_OFFSETS.map((offset) => {
            const active = offset === selectedDayOffset;
            const orderable = isOrderableDay(offset);
            const name = orderable
              ? (isRTL ? "غداً" : "Tomorrow")
              : formatDayWeekday(offset, isRTL);
            return (
              <button
                key={offset}
                onClick={() => onSelectDay(offset)}
                data-fo-day={offset}
                data-fo-day-orderable={orderable ? "true" : "false"}
                className="active:scale-[0.97] transition-transform cursor-pointer"
                style={{
                  minWidth: "190px", padding: "10px 20px", borderRadius: "16px",
                  backgroundColor: active ? TEAL_15 : "#fff",
                  /* Constant 2px, colour only — otherwise the active tab is
                     two pixels taller than its neighbours and the row of
                     dates stops sitting on one baseline. */
                  border: `2px solid ${active ? TEAL : "rgba(0,0,0,0.10)"}`,
                  outline: "none",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "1px",
                }}
              >
                <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.bold, color: active ? TEAL : "#171717" }}>
                  {name}
                </span>
                {/* The date lives inside the tab it belongs to, and on the
                    active tab it takes the day name's colour rather than a
                    greyed-down one — it is part of the same answer. */}
                <span style={{ fontFamily, fontSize: "13px", fontWeight: WEIGHT.medium, color: active ? TEAL : "#6B7280" }}>
                  {formatDayTabDate(offset, isRTL)}
                </span>
              </button>
            );
          })}
        </div>

        {/* The one thing said about the window anywhere on this screen, and
            it says which of the three states tomorrow is actually in. */}
        {/* The amber the rest of this screen already uses for anything to do
            with the clock — the "Opens 4:00 PM" badge is the same palette. */}
        <div data-fo-notice data-fo-window-state={windowState}
          className="flex items-center gap-3"
          style={{
            maxWidth: "900px",
            padding: "14px 26px",
            borderRadius: "18px",
            backgroundColor: "#FEF3C7",
            border: "1.5px solid #F59E0B",
          }}>
          <Clock size={20} color="#D97706" className="shrink-0" />
          {/* One sentence for each situation the patient can actually be in.
              Nothing here explains the rules — it says where they stand. */}
          <p style={{
            fontFamily, fontSize: "16px", fontWeight: WEIGHT.medium, color: "#92400E",
            margin: 0, lineHeight: 1.5, textAlign: isRTL ? "right" : "left",
          }}>
            {windowState === "before" && (isRTL
              ? `يفتح باب طلب الوجبات الساعة ${windowStartStr}.`
              : `Meal ordering opens at ${windowStartStr}.`)}
            {windowState === "open" && !hasSelection && (isRTL
              ? `باب طلب وجبات الغد مفتوح الآن، ويُغلق الساعة ${windowEndStr}.`
              : `Tomorrow's meal ordering is open now, closing at ${windowEndStr}.`)}
            {windowState === "open" && hasSelection && (isRTL
              ? `وجبات الغد جاهزة. لا يزال بإمكانك التعديل حتى الساعة ${windowEndStr}.`
              : `Your meals for tomorrow are set. You can still make changes until ${windowEndStr}.`)}
            {windowState === "closed" && hasSelection && (isRTL
              ? `تم تأكيد طلبك لوجبات الغد.`
              : `Your order for tomorrow is confirmed.`)}
            {windowState === "closed" && !hasSelection && (isRTL
              ? `سيتم تقديم وجبة قياسية غداً.`
              : `A standard meal will be served tomorrow.`)}
          </p>
        </div>
      </div>

      {/* Cards row — narrower, centered with whitespace, photo-led */}
      <div className="flex-1 min-h-0 flex items-center justify-center gap-[28px]" dir={isRTL ? "rtl" : "ltr"}>
        {meals.map((meal) => {
          /* In the basket for the day on screen — not sent to the kitchen. */
          const inOrder = pendingMealIds.has(meal.id);
          const placed = dayOrderable && placedMealIds.has(meal.id);
          const selected = dayOrderable && selectedMealId === meal.id;
          const chosen = dayOrderable && (selected || inOrder);

          const photo = MEAL_CARD_PHOTOS[meal.id];

          /* Tomorrow's cards report what is actually true of the order. Every
             other day gets one badge, the same on all three cards, because on
             those days there is nothing per-meal to report yet. */
          let statusBg = "#F1F5F9";
          let statusColor = "#475569";
          let statusText = isRTL ? "للاطلاع فقط" : "Preview only";
          /* Choosing a meal does NOT restyle the card. The badge keeps saying
             what the day is doing — the window is open, or it opens at four,
             or it has shut — and the tick in the corner is the whole of what
             changes. A card that rewrote its own badge and footer on tap made
             the three cards stop reading as one row of equals. Only an order
             already with the kitchen earns a different badge, because that is
             a different fact about the day, not a selection. */
          if (dayOrderable) {
            if (placed) {
              statusBg = GREEN; statusColor = "#fff";
              statusText = isRTL ? "تم إرسال الطلب" : "Order placed";
            } else if (windowState === "open") {
              statusBg = `${GREEN}1F`; statusColor = GREEN;
              statusText = isRTL ? "متاح للطلب" : "Open for ordering";
            } else if (windowState === "before") {
              statusBg = "#FEF3C7"; statusColor = "#B45309";
              statusText = isRTL ? `يفتح ${windowStartStr}` : `Opens ${windowStartStr}`;
            } else {
              statusText = isRTL ? "انتهى وقت الطلب" : "Ordering closed";
            }
          }

          /* The line under the divider is the card's action, not a button of
             its own: the whole card has always been the tap target. It stays
             put when a meal is chosen — see the note above. */
          const actionLabel = !canOrder
            ? (isRTL ? "عرض القائمة" : "View menu")
            : placed
              ? (isRTL ? "تغيير الاختيار" : "Change selection")
              : (isRTL ? `أرسل قبل ${windowEndStr}` : `Submit before ${windowEndStr}`);

          /* Outside the window the card still opens — to read, not to pick. */
          const handleClick = () => canOrder ? onSelect(meal.id) : setMenuMeal(meal);

          return (
            <motion.div key={meal.id}
              role="button"
              tabIndex={0}
              onClick={handleClick}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }}
              data-fo-meal={meal.id}
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -2 }}
              dir={isRTL ? "rtl" : "ltr"}
              style={{
                width: "390px",
                borderRadius: "24px",
                backgroundColor: "#fff",
                /* A chosen card is framed as well as ticked. The width is the
                   same 2px in every state and only the colour moves, so the
                   card cannot change size under the patient's finger — the
                   three cards stay on the same baseline whichever is picked. */
                border: `2px solid ${(chosen || placed) ? (placed ? GREEN : TEAL) : "rgba(0,0,0,0.08)"}`,
                boxShadow: "none",
                cursor: "pointer", outline: "none",
                transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
                display: "flex", flexDirection: "column", alignItems: "center",
                /* No padding: the photograph runs to the card's own edges and
                   the card's radius is what rounds its top corners. */
                padding: 0,
                position: "relative",
                overflow: "hidden",
              }}>
              {/* Chosen, or already with the kitchen */}
              {(chosen || placed) && (
                <div className="absolute pop-in" style={{ top: "16px", [isRTL ? "left" : "right"]: "16px", zIndex: 2, width: "36px", height: "36px", borderRadius: "50%", backgroundColor: TICK_GREEN, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${TICK_GREEN_SHADOW}` }}>
                  <Check size={20} color="#fff" strokeWidth={3} />
                </div>
              )}

              {/* The meal, photographed: full-bleed across the card and flush
                  with its top edge. A fixed height rather than a ratio, so the
                  three cards end on the same baseline whatever the crop does. */}
              <ImageWithFallback
                data-fo-hero={meal.id}
                src={photo.src}
                alt={loc(photo.alt)}
                loading="lazy"
                style={{
                  display: "block", width: "100%",
                  height: "clamp(150px, 14vw, 190px)",
                  objectFit: "cover", objectPosition: "center",
                  flexShrink: 0,
                }}
              />

              {/* Everything the card says, inset from the edges the photo owns */}
              <div className="w-full flex-1 flex flex-col items-center" style={{
                padding: "18px 28px 24px", gap: "12px", justifyContent: "space-between",
              }}>
                {/* Meal name */}
                <span style={{ fontFamily, fontSize: "32px", fontWeight: WEIGHT.bold, color: "#171717", lineHeight: 1 }}>
                  {loc(meal.label)}
                </span>

                {/* Status */}
                <div className="flex items-center gap-2" data-fo-status style={{
                  padding: "9px 18px", borderRadius: "100px",
                  backgroundColor: statusBg,
                }}>
                  <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.bold, color: statusColor }}>
                    {statusText}
                  </span>
                </div>

                {/* Divider + the card's action */}
                <div className="w-full flex flex-col items-center" style={{ marginTop: "auto" }}>
                  <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(0,0,0,0.06)", marginBottom: "16px" }} />
                  <div className="flex items-center justify-center gap-2" data-fo-action={meal.id}>
                    {/* The clock belongs to the deadline, not to "View menu". */}
                    {canOrder && !placed && <Clock size={15} color="#6B7280" className="shrink-0" />}
                    <span style={{
                      fontFamily, fontSize: "16px",
                      fontWeight: (placed || !canOrder) ? WEIGHT.bold : WEIGHT.medium,
                      color: (placed || !canOrder) ? TEAL : "#6B7280",
                      textAlign: "center",
                    }}>
                      {actionLabel}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Menu reader ───────────────────────────────────────────────────
          Everything on this day's menu for one meal, and no way to act on it.
          There is deliberately no control in here but the close: the card that
          opened it could not be ordered from, and a picker inside a preview
          would be a promise the kitchen cannot keep. */}
      <AnimatePresence>
        {menuMeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            /* Fixed, not absolute: anchored to the step it would only get
               88% of a ~660px band and the menu would still scroll. The kiosk
               scales the whole app with a transform, so "fixed" resolves to
               that canvas rather than the browser window. */
            className="fixed inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 60 }}
            onClick={() => setMenuMeal(null)}
            data-fo-menu-overlay
          >
            <motion.div
              initial={{ scale: 0.94, y: 14 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={`${loc(menuMeal.label)} — ${formatDayLong(selectedDayOffset, isRTL)}`}
              data-fo-menu-modal
              dir={isRTL ? "rtl" : "ltr"}
              className="flex flex-col"
              style={{
                /* A day's menu is five groups of two to four dishes with long
                   names. At the old 880px it was a scrollbar with a window
                   around it; this fits most days whole. */
                width: "1240px", maxHeight: "86%",
                backgroundColor: "#fff", borderRadius: "24px",
                boxShadow: "0 16px 48px rgba(0,0,0,0.25)",
                overflow: "hidden",
              }}
            >
              {/* Header — which meal, which day, and the way out */}
              <div className="shrink-0 flex items-center gap-5 px-10 py-7" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%",
                  backgroundColor: menuMeal.id === "breakfast" ? "#FEF3C7" : menuMeal.id === "lunch" ? "#E0F2FE" : "#EDE9FE",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {(() => {
                    const I = menuMeal.id === "breakfast" ? Sun : menuMeal.id === "lunch" ? Sunrise : Moon;
                    return <I size={28} color={menuMeal.id === "breakfast" ? "#F59E0B" : menuMeal.id === "lunch" ? TEAL : "#7C3AED"} />;
                  })()}
                </div>
                <div className="flex-1 min-w-0" style={{ textAlign: isRTL ? "right" : "left" }}>
                  <p style={{ fontFamily, fontSize: "24px", fontWeight: WEIGHT.bold, color: "#171717", margin: 0, lineHeight: 1.2 }}>
                    {loc(menuMeal.label)}
                  </p>
                  <p style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.medium, color: "#6B7280", margin: "3px 0 0" }}>
                    {`${formatDayLong(selectedDayOffset, isRTL)} · ${locTimeRange(menuMeal.timeRange, isRTL)}`}
                  </p>
                </div>
                <button
                  onClick={() => setMenuMeal(null)}
                  aria-label={isRTL ? "إغلاق" : "Close"}
                  data-fo-menu-close
                  className="shrink-0 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                  style={{
                    width: "48px", height: "48px", borderRadius: "14px",
                    backgroundColor: "rgba(0,0,0,0.05)", border: "none", outline: "none",
                  }}
                >
                  <X size={24} color="#6B7280" strokeWidth={2.5} />
                </button>
              </div>

              {/* The menu itself — read, not chosen */}
              <div className="flex-1 min-h-0 fo-scroll overflow-y-auto px-10 py-8 flex flex-col gap-8">
                {menuMeal.groups.map((g) => (
                  <div key={g.id}>
                    <div className="flex items-center gap-2" style={{ marginBottom: "14px" }}>
                      <span style={{ fontFamily, fontSize: "13px", fontWeight: WEIGHT.bold, color: "#6B7280", letterSpacing: "0.4px", textTransform: "uppercase" }}>
                        {loc(g.label)}
                      </span>
                      {g.mode === "included" && (
                        <span style={{ fontFamily, fontSize: "12px", fontWeight: WEIGHT.semibold, color: GREEN }}>
                          {isRTL ? "يأتي مع وجبتك" : "Comes with your meal"}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px 40px" }}>
                      {g.items.map((it) => (
                        <div key={it.id} className="flex items-center gap-3">
                          <div style={{
                            width: "7px", height: "7px", borderRadius: "50%",
                            backgroundColor: g.mode === "included" ? GREEN : TEAL, flexShrink: 0,
                          }} />
                          <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.medium, color: "#171717", lineHeight: 1.4 }}>
                            {loc(it.name)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Why it can only be read */}
              <div className="shrink-0 flex items-center gap-3 px-10 py-6" style={{ borderTop: "1px solid rgba(0,0,0,0.08)", backgroundColor: "#FEF3C7" }}>
                <Clock size={20} color="#D97706" className="shrink-0" />
                <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.medium, color: "#92400E", lineHeight: 1.45 }}>
                  {/* Named for the day it is, and answering the only question
                      a preview raises: when can I order this? */}
                  {!isOrderableDay(selectedDayOffset)
                    ? (isRTL
                        ? `هذه معاينة لقائمة ${formatDayWeekday(selectedDayOffset, isRTL)}. ستتمكن من الطلب منها في اليوم السابق.`
                        : `This is a preview of ${formatDayWeekday(selectedDayOffset, isRTL)}'s menu. You'll be able to order it the day before.`)
                    : windowState === "before"
                      ? (isRTL
                          ? `هذه معاينة لقائمة الغد. يفتح باب الطلب الساعة ${windowStartStr}.`
                          : `This is a preview of tomorrow's menu. You'll be able to order it from ${windowStartStr}.`)
                      : (isRTL
                          ? "أُغلق باب الطلب لوجبات الغد. اختياراتك نهائية."
                          : "Ordering for tomorrow has closed. Your choices are final.")}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
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
                  backgroundColor: isActive ? TICK_GREEN : "#fff",
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


function BuildMealStep({ meal, selections, onToggle, fontFamily, isRTL, dayOffset }: {
  meal: MealPeriod;
  selections: Selections;
  onToggle: (gid: string, itemId: string, group: MenuGroup) => void;
  fontFamily: string;
  isRTL: boolean;
  /** Day of the rolling window this build is for. */
  dayOffset: number;
}) {
  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;
  const active = isMealActive(meal.hours);
  const requiredGroups = getRequiredGroups(meal);
  const includedGroups = meal.groups.filter((g) => g.mode === "included");
  const totalSelectedReq = requiredGroups.reduce((sum, g) => sum + (selections[g.id] || []).length, 0);

  /* The tray is a running total of an order being built, so it belongs only to
     the day that can actually be ordered. On any other day this screen is a
     menu being read and the groups take the full width. */
  const showTray = isOrderableDay(dayOffset);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
      className={`h-full flex px-[28px] pt-[16px] pb-[16px] ${showTray ? "gap-[20px]" : ""}`}>
      {/* The groups. Full width when there is no tray beside them. */}
      <div className="flex-1 min-w-0 flex flex-col relative" style={{
        borderRadius: "20px",
        border: "1.5px solid rgba(0,0,0,0.08)",
        backgroundColor: "#fff",
        overflow: "hidden",
      }}>
        {/* The menu's header: this meal photographed, with the day it is for
            and the hour it is served written across it. The gradient runs from
            the text's side so the words keep their contrast whatever the photo
            is doing underneath, and the photograph is flipped when it has to be
            so the food sits on the clear side rather than under the words. */}
        {(() => {
          const dateStr = dayForOffset(dayOffset).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { weekday: "long", day: "numeric", month: "long" });
          const photo = MEAL_CARD_PHOTOS[meal.id];
          /* The text, and so the gradient that carries it, takes the leading
             side: the left in English, the right in Arabic. The food wants the
             other one. Where the photograph was not shot that way round it is
             mirrored — the only move available, since cover leaves no horizontal
             slack at this banner's proportions (see MEAL_CARD_PHOTOS). */
          const foodBelongs: "left" | "right" = isRTL ? "left" : "right";
          const mirrored = photo.foodSide !== foodBelongs;
          return (
            <div data-fo-menu-banner={meal.id} className="shrink-0 relative" style={{
              height: "clamp(120px, 13vw, 165px)", overflow: "hidden", backgroundColor: TEAL_DARK,
            }}>
              <ImageWithFallback
                src={photo.src}
                alt={loc(photo.alt)}
                loading="lazy"
                style={{
                  display: "block", width: "100%", height: "100%",
                  objectFit: "cover",
                  objectPosition: `50% ${photo.menuBand}%`,
                  transform: mirrored ? "scaleX(-1)" : undefined,
                }}
              />
              <div className="absolute inset-0" style={{
                background: `linear-gradient(${isRTL ? 270 : 90}deg, rgba(${TEAL_DARK_RGB}, 0.94) 0%, rgba(${TEAL_DARK_RGB}, 0.85) 22%, rgba(${TEAL_DARK_RGB}, 0.45) 42%, rgba(${TEAL_DARK_RGB}, 0) 58%)`,
              }} />
              <div className="absolute inset-0 flex flex-col justify-center gap-1" style={{
                padding: "0 28px",
                /* The lines stretch the full width and are placed by text-align:
                   in an RTL subtree a column flex-end resolves to the LEFT, which
                   put the text off the gradient entirely. */
                alignItems: "stretch",
                textAlign: isRTL ? "right" : "left",
              }}>
                <span style={{ fontFamily, fontSize: "28px", fontWeight: WEIGHT.bold, color: TEXT_ON_BRAND, textShadow: PHOTO_TEXT_SHADOW, lineHeight: 1.15 }}>
                  {isRTL ? `قائمة ${loc(meal.label)}` : `${loc(meal.label)} Menu`}
                </span>
                {/* Opacity rather than a white with alpha baked in, so the
                    second line stays a shade of whatever the theme's inverse
                    text is. */}
                <span style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.medium, color: TEXT_ON_BRAND, opacity: 0.88, textShadow: PHOTO_TEXT_SHADOW, lineHeight: 1.4 }}>
                  {`${dateStr} · ${locTimeRange(meal.timeRange, isRTL)}`}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Groups list */}
        <div className="flex-1 min-h-0 fo-scroll-strong overflow-y-auto flex flex-col gap-[12px] p-[14px]">
          {requiredGroups.map((g, idx) => (
            <BuildGroup key={g.id} group={g} index={idx + 1} selections={selections[g.id] || []} onToggle={(itemId) => onToggle(g.id, itemId, g)} fontFamily={fontFamily} isRTL={isRTL} />
          ))}

          {includedGroups.length > 0 && (
            <div style={{ padding: "14px 20px", borderRadius: "20px", border: "1.5px solid rgba(0,0,0,0.08)", backgroundColor: "#F9FAFB" }}>
              <div className="flex items-center gap-2 mb-2">
                <Check size={18} color={GREEN} />
                <span style={{ fontFamily, fontSize: "13px", fontWeight: WEIGHT.bold, color: "#6B7280", letterSpacing: "0.3px", textTransform: "uppercase" }}>
                  {isRTL ? "مشمول مع وجبتك" : "Included with Your Meal"}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                {includedGroups.flatMap((g) => g.items).map((it) => (
                  <div key={it.id} className="flex items-center gap-2">
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: GREEN }} />
                    <span style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.medium, color: "#4B5563" }}>
                      {loc(it.name)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ height: "16px" }} />
        </div>
        {/* Bottom fade hint */}
        <div className="pointer-events-none absolute left-0 right-0 bottom-0" style={{ height: "32px", background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 100%)" }} />
      </div>

      {/* RIGHT: meal tray — only for the day being ordered (see showTray) */}
      {showTray && (
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
            {totalSelectedReq === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ minHeight: "180px" }}>
                <Utensils size={40} color="#D1D5DB" />
                <p style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.medium, color: "#9CA3AF" }}>
                  {isRTL ? "لم يتم اختيار أي عنصر" : "No item is selected"}
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* Included with your meal — pinned to bottom */}
          {includedGroups.length > 0 && (
            <div className="shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#F9FAFB", borderRadius: "0 0 18px 18px", padding: "16px 20px" }}>
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
        </div>
      )}
    </motion.div>
  );
}

function BuildGroup({ group, index, selections, onToggle, fontFamily, isRTL }: {
  group: MenuGroup; index: number; selections: string[]; onToggle: (id: string) => void; fontFamily: string; isRTL: boolean;
}) {
  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;
  const max = group.mode === "choose-2" ? 2 : 1;
  const done = selections.length >= max;

  return (
    <div style={{ padding: "16px 20px", borderRadius: "20px", border: "1.5px solid rgba(0,0,0,0.08)", backgroundColor: "#fff" }}>
      {/* Header: number circle + Item N + Choose only N */}
      <div className="flex items-center gap-3 mb-3">
        <div style={{ width: "40px", height: "40px", borderRadius: "50%",
          backgroundColor: done ? GREEN : "#E7F1F1",
          display: "flex", alignItems: "center", justifyItems: "center", flexShrink: 0 }}>
          {done
            ? <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}><Check size={20} color="#fff" strokeWidth={2.5} /></div>
            : <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily, fontSize: "18px", fontWeight: WEIGHT.bold, color: TEAL }}>{index}</span></div>}
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

      {/* 2-column grid of equal width boxes with wrapped long text */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", paddingBottom: "4px" }}>
        {group.items.map((item) => {
          const sel = selections.includes(item.id);
          return (
            <button key={item.id} onClick={() => onToggle(item.id)}
              className="flex items-center gap-3 w-full active:scale-95 transition-transform"
              style={{
                padding: "14px 18px",
                minHeight: "56px",
                borderRadius: "14px",
                backgroundColor: "#fff",
                border: sel ? `2px solid ${TEAL}` : "1.5px solid rgba(0,0,0,0.12)",
                boxShadow: sel ? `0 2px 8px ${TEAL_20}` : "none",
                cursor: "pointer", outline: "none",
                transition: "border 0.15s, box-shadow 0.15s",
                textAlign: isRTL ? "right" : "left",
              }}>
              <div style={{
                width: "20px", height: "20px", borderRadius: "5px",
                backgroundColor: sel ? TEAL : "#fff",
                border: sel ? "none" : "1.8px solid #D1D5DB",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {sel && <Check size={14} color="#fff" strokeWidth={3} />}
              </div>
              <span style={{
                fontFamily,
                fontSize: "15px",
                fontWeight: WEIGHT.semibold,
                color: sel ? TEAL : "#171717",
                whiteSpace: "normal",
                wordBreak: "break-word",
                lineHeight: "1.35",
              }}>
                {loc(item.name)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * STEP 4: CONFIRM
 * ═══════════════════════════════════════════════════════════════════════════ */

function ConfirmStep({ orderNumber, meal, selections, orderFor, patientName, room, dietLabel, allergiesLabel, fontFamily, isRTL, meals, orders, onOrderMeal, submitted }: {
  orderNumber: string; meal: MealPeriod; selections: Selections;
  orderFor: OrderFor; patientName: string; room: string | null; dietLabel: string; allergiesLabel: string;
  fontFamily: string; isRTL: boolean;
  meals?: MealPeriod[]; orders?: any[]; onOrderMeal?: (mealId: MealId) => void;
  /** Everything sent in this submission, across the rolling window. */
  submitted?: { dayOffset: number; mealId: MealId }[];
}) {
  const isGuest = orderFor === "guest";
  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;
  const required = getRequiredGroups(meal);
  const included = meal.groups.filter((g) => g.mode === "included");

  const selectedItems = required.flatMap((g) => {
    const sel = selections[g.id] || [];
    return g.items.filter((i) => sel.includes(i.id)).map((i) => loc(i.name));
  });
  const includedItems = included.flatMap((g) => g.items).map((i) => loc(i.name));

  // The headline meal is the last one built; the summary below lists them all.
  const summary = submitted && submitted.length ? submitted : [];
  const headlineOffset = summary.find((e) => e.mealId === meal.id)?.dayOffset ?? ORDER_DAY_OFFSETS[0];
  const deliveryDate = formatDayLong(headlineOffset, isRTL);
  const dayCount = new Set(summary.map((e) => e.dayOffset)).size;

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

        {/* ── LEFT — Success message ── */}
        <div style={{ padding: "36px 32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "18px" }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
            style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: GREEN, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 22px ${GREEN}50` }}>
            <Check size={38} color="#fff" strokeWidth={3} />
          </motion.div>
          <div className="text-center">
            <h2 style={{ fontFamily, fontSize: "28px", fontWeight: WEIGHT.bold, color: "#171717", lineHeight: 1.2 }}>
              {isRTL ? "تم تأكيد طلب الوجبة" : "Meal Order Confirmed"}
            </h2>
            <p style={{ fontFamily, fontSize: "15px", fontWeight: WEIGHT.medium, color: "#6B7280", lineHeight: 1.5, marginTop: "12px", maxWidth: "360px" }}>
              {isRTL
                ? `تم إرسال طلبك إلى المطبخ وسيتم توصيله في الوقت المحدد.`
                : `Your order has been sent to the kitchen and will be delivered during the scheduled time.`}
            </p>
          </div>

          {/* ── What was sent, across the rolling window ── */}
          {summary.length > 0 && meals && meals.length > 0 && (
            <div style={{ marginTop: "8px", width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <p style={{ fontFamily, fontSize: "13px", fontWeight: WEIGHT.bold, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center", marginBottom: "2px" }}>
                {isRTL
                  ? `وجباتك المطلوبة (${summary.length}) · ${dayCount} ${dayCount === 1 ? "يوم" : "أيام"}`
                  : `Meals In This Order (${summary.length}) · ${dayCount} ${dayCount === 1 ? "day" : "days"}`}
              </p>
              {summary.map((entry) => {
                const m = meals.find((mm) => mm.id === entry.mealId);
                if (!m) return null;
                const MealIcon = m.icon;
                return (
                  <div
                    key={`${entry.dayOffset}-${entry.mealId}`}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: "14px",
                      backgroundColor: `${GREEN}12`, border: `1.5px solid ${GREEN}40`,
                      display: "flex", alignItems: "center", gap: "14px",
                    }}
                  >
                    <div style={{
                      width: "38px", height: "38px", borderRadius: "12px",
                      backgroundColor: `${GREEN}15`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <MealIcon size={19} color={GREEN} />
                    </div>
                    <div style={{ flex: 1, textAlign: isRTL ? "right" : "left" }}>
                      <p style={{ fontFamily, fontSize: "16px", fontWeight: WEIGHT.bold, color: "#171717", lineHeight: 1.2 }}>
                        {loc(m.label)}
                      </p>
                      <p style={{ fontFamily, fontSize: "13px", fontWeight: WEIGHT.medium, color: "#6B7280", marginTop: "2px" }}>
                        {`${formatDayWeekday(entry.dayOffset, isRTL)} · ${locTimeRange(m.timeRange, isRTL)}`}
                      </p>
                    </div>
                    <Check size={18} color={GREEN} strokeWidth={3} />
                  </div>
                );
              })}
            </div>
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
                  {isRTL ? "لـ" : "For "}{patientName}
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
                  {deliveryDate}
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
          {backLabel === "Exit" || backLabel === "خروج" ? (
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

function HistoryView({ activeOrders, pastOrders, fontFamily, isRTL, meals }: {
  activeOrders: any[]; pastOrders: any[]; fontFamily: string; isRTL: boolean;
  meals?: MealPeriod[];
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
    <div className="flex-1 min-h-0 flex flex-col" style={{ overflow: "hidden" }}>
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
            const mealId = order.mealId || order.mealType?.toLowerCase();
            const mealDef = meals?.find((m) => m.id === mealId);

            return (
              <OrderCard key={order.id} order={order} fontFamily={fontFamily} isRTL={isRTL} formatDate={formatDate}
                mealDef={mealDef} />
            );
          })
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, fontFamily, isRTL, formatDate, mealDef }: {
  order: any; fontFamily: string; isRTL: boolean; formatDate: (d: Date) => string;
  mealDef?: MealPeriod;
}) {
  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;
  const [open, setOpen] = useState(false);
  const isGuest = order.orderFor === "guest";
  const ChevronIcon = open ? ChevronDown : (isRTL ? ChevronLeft : ChevronRight);
  // Resolve meal label from mealId (language-independent) rather than stored mealType string
  const MEAL_LABELS: Record<string, { en: string; ar: string }> = {
    breakfast: { en: "Breakfast", ar: "الفطور" },
    lunch: { en: "Lunch", ar: "الغداء" },
    dinner: { en: "Dinner", ar: "العشاء" },
  };
  const resolvedMealId = order.mealId || order.mealType?.toLowerCase();
  const translatedMealType = mealDef
    ? loc(mealDef.label)
    : (MEAL_LABELS[resolvedMealId] ? loc(MEAL_LABELS[resolvedMealId]) : order.mealType);

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
                <span style={{ color: "#D1D5DB" }}>·</span>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} color="#9CA3AF" />
                  <span style={{ fontFamily, fontSize: "14px", fontWeight: WEIGHT.medium, color: "#6B7280" }}>
                    {(() => {
                      // Orders span a three-day window; fall back to tomorrow
                      // only for records placed before deliveryDate existed.
                      const d = order.deliveryDate ? new Date(order.deliveryDate) : dayForOffset(1);
                      return d.toLocaleDateString(isRTL ? "ar-SA" : "en-US", { weekday: "long", day: "numeric", month: "long" });
                    })()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
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
