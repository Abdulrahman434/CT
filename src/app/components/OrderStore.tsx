import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { MEAL_WINDOWS, getMenuGroups } from "./menuData";
import type { MealId, DietType } from "./menuData";
import { nurseActions } from "./NurseDataStore";

/* ═══════════════════════════════════════════════════════════════════════════
 * ORDER TYPES
 * ═══════════════════════════════════════════════════════════════════════════ */

export type OrderStatus = "preparing" | "quality-check" | "delivering" | "delivered";

export interface OrderItem {
  id: string;
  name: { en: string; ar: string };
  quantity: number;
  calories: number;
  image: string;
}

export interface PlacedOrder {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  totalCalories: number;
  status: OrderStatus;
  placedAt: Date;
  estimatedDelivery: string;
  mealType: string;
  mealWindow?: string;
  comesWith?: { en: string; ar: string }[];
  orderFor?: "patient" | "guest";
  /** Which meal period this order belongs to (for edit matching) */
  mealId?: string;
  /** Saved item selections */
  selections?: Record<string, string[]>;
  /** ISO date this order is to be delivered on. Orders cover a rolling
   *  three-day window, so "tomorrow" is no longer a safe assumption. */
  deliveryDate?: string;
  /** Placed by the standing fallback rather than by the patient. */
  autoStandard?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LOCAL STORAGE PERSISTENCE
 * ═══════════════════════════════════════════════════════════════════════════ */

const ORDER_STORE_KEY = "careinn-meal-orders";

/* ── The kitchen's standing fallback ──────────────────────────────────
 * A patient who orders nothing still eats. When the evening ordering window
 * shuts, every one of tomorrow's meals that was not ordered is ordered here as
 * a standard meal — so the promise the meal cards make is kept by the system,
 * not by the patient remembering to act on it.
 *
 * It lives in the provider, which App.tsx mounts at the root, so it does not
 * depend on anyone having opened the meal screen that evening.
 *
 * The dates already handled are remembered, so re-opening the app after 8 PM
 * cannot order a second dinner. */
const ORDER_WINDOW_END_HOUR = 20;
const AUTO_ORDER_KEY = "careinn-auto-standard-orders";
const AUTO_MEAL_IDS: MealId[] = ["breakfast", "lunch", "dinner"];

function autoOrderedDates(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(AUTO_ORDER_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

function rememberAutoOrdered(dateStr: string) {
  try {
    const done = autoOrderedDates();
    if (done.includes(dateStr)) return;
    localStorage.setItem(AUTO_ORDER_KEY, JSON.stringify([...done, dateStr].slice(-14)));
  } catch { /* private mode — the in-list check below still prevents duplicates */ }
}

/** What the kitchen sends when nobody chose: everything that comes with the
 *  meal anyway, plus the first option of each group the patient would have
 *  picked from. It is a real, complete meal, not an empty order. */
function standardMeal(diet: DietType, mealId: MealId, day: Date) {
  const groups = getMenuGroups(diet, mealId, day.getDay());
  const selections: Record<string, string[]> = {};
  for (const g of groups) {
    selections[g.id] = g.mode === "included"
      ? g.items.map((i) => i.id)
      : g.items.slice(0, g.mode === "choose-2" ? 2 : 1).map((i) => i.id);
  }
  const items = groups
    .filter((g) => g.mode !== "included")
    .flatMap((g) => g.items.filter((i) => selections[g.id]?.includes(i.id)))
    .map((i) => ({ id: i.id, name: i.name, quantity: 1, calories: 0, image: (i as any).image || "" }));
  const comesWith = groups.filter((g) => g.mode === "included").flatMap((g) => g.items.map((i) => i.name));
  return { selections, items, comesWith };
}

function serializeOrders(orders: PlacedOrder[]): string {
  return JSON.stringify(orders.map((o) => ({
    ...o,
    placedAt: o.placedAt instanceof Date ? o.placedAt.toISOString() : o.placedAt,
  })));
}

function deserializeOrders(raw: string): PlacedOrder[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((o: any) => ({
      ...o,
      placedAt: new Date(o.placedAt),
    }));
  } catch {
    return [];
  }
}

function loadPersistedOrders(): PlacedOrder[] | null {
  try {
    const raw = localStorage.getItem(ORDER_STORE_KEY);
    if (!raw) return null;
    return deserializeOrders(raw);
  } catch {
    return null;
  }
}

function persistOrders(orders: PlacedOrder[]) {
  try {
    localStorage.setItem(ORDER_STORE_KEY, serializeOrders(orders));
  } catch {}
}

/* ═══════════════════════════════════════════════════════════════════════════
 * HELPER: is a meal window still open?
 * ═══════════════════════════════════════════════════════════════════════════ */

function isMealWindowOpen(mealId: string): boolean {
  const w = MEAL_WINDOWS[mealId as MealId];
  if (!w) return false;
  const now = new Date();
  const nowHours = now.getHours() + now.getMinutes() / 60;
  return nowHours < w.orderCutoff;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MOCK PAST ORDERS (yesterday/2-days-ago — won't interfere with today)
 * ═══════════════════════════════════════════════════════════════════════════ */

function createMockPastOrders(): PlacedOrder[] {
  const yesterday = new Date(Date.now() - 24 * 3600000);
  const twoDaysAgo = new Date(Date.now() - 48 * 3600000);
  return [
    {
      id: "past-1",
      orderNumber: "#3847",
      items: [
        { id: "m1", name: { en: "Grilled Chicken", ar: "دجاج مشوي" }, quantity: 1, calories: 380, image: "" },
        { id: "m2", name: { en: "Garden Salad", ar: "سلطة خضراء" }, quantity: 1, calories: 120, image: "" },
      ],
      totalCalories: 500,
      status: "delivered",
      placedAt: yesterday,
      estimatedDelivery: "25–35 min",
      mealType: "Lunch",
      mealWindow: "1:00 PM – 2:00 PM",
      comesWith: [
        { en: "Sautéed Vegetables", ar: "خضار سوتيه" },
        { en: "Water Bottle", ar: "زجاجة ماء" },
      ],
      orderFor: "patient",
      mealId: "lunch",
    },
    {
      id: "past-2",
      orderNumber: "#3812",
      items: [
        { id: "m3", name: { en: "Oatmeal Bowl", ar: "وعاء شوفان" }, quantity: 1, calories: 280, image: "" },
        { id: "m4", name: { en: "Fresh Orange Juice", ar: "عصير برتقال طازج" }, quantity: 2, calories: 220, image: "" },
      ],
      totalCalories: 500,
      status: "delivered",
      placedAt: yesterday,
      estimatedDelivery: "25–35 min",
      mealType: "Breakfast",
      mealWindow: "8:00 AM – 9:00 AM",
      comesWith: [
        { en: "Fresh Fruit (Whole)", ar: "فاكهة طازجة" },
        { en: "Water Bottle", ar: "زجاجة ماء" },
      ],
      orderFor: "patient",
      mealId: "breakfast",
    },
    {
      id: "past-3",
      orderNumber: "#3795",
      items: [
        { id: "g1", name: { en: "Beef Burger", ar: "برجر لحم" }, quantity: 1, calories: 620, image: "" },
        { id: "g2", name: { en: "French Fries", ar: "بطاطس مقلية" }, quantity: 1, calories: 350, image: "" },
        { id: "g3", name: { en: "Coke", ar: "كولا" }, quantity: 1, calories: 140, image: "" },
      ],
      totalCalories: 1110,
      status: "delivered",
      placedAt: twoDaysAgo,
      estimatedDelivery: "10 min",
      mealType: "Lunch",
      mealWindow: "1:00 PM – 2:00 PM",
      comesWith: [{ en: "Water Bottle", ar: "زجاجة ماء" }],
      orderFor: "guest",
      mealId: "lunch",
    },
    {
      id: "past-4",
      orderNumber: "#3756",
      items: [
        { id: "g4", name: { en: "Caesar Salad", ar: "سلطة سيزر" }, quantity: 1, calories: 320, image: "" },
        { id: "g5", name: { en: "Cappuccino", ar: "كابوتشينو" }, quantity: 1, calories: 120, image: "" },
      ],
      totalCalories: 440,
      status: "delivered",
      placedAt: twoDaysAgo,
      estimatedDelivery: "25 min",
      mealType: "Lunch",
      mealWindow: "1:00 PM – 2:00 PM",
      comesWith: [{ en: "Water Bottle", ar: "زجاجة ماء" }],
      orderFor: "guest",
      mealId: "lunch",
    },
  ];
}

/* ═══════════════════════════════════════════════════════════════════════════
 * CONTEXT
 * ═══════════════════════════════════════════════════════════════════════════ */

interface OrderStoreCtx {
  orders: PlacedOrder[];
  activeOrders: PlacedOrder[];
  pastOrders: PlacedOrder[];
  placeOrder: (order: Omit<PlacedOrder, "id" | "orderNumber" | "placedAt" | "status">) => PlacedOrder;
  updateOrder: (id: string, data: Partial<Omit<PlacedOrder, "id" | "orderNumber" | "placedAt">>) => void;
  getOrder: (id: string) => PlacedOrder | undefined;
  clearAllOrders: () => void;
  /** Demo reset: clears only today's orders whose meal window is still open */
  clearOpenOrders: () => void;
}

const OrderContext = createContext<OrderStoreCtx | null>(null);

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be inside OrderProvider");
  return ctx;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * PROVIDER — wraps the app, persists to localStorage
 * ═══════════════════════════════════════════════════════════════════════════ */

function getInitialOrders(): PlacedOrder[] {
  const persisted = loadPersistedOrders();
  if (persisted && persisted.length > 0) return persisted;
  return createMockPastOrders();
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<PlacedOrder[]>(getInitialOrders);

  // Persist to localStorage whenever orders change
  useEffect(() => {
    persistOrders(orders);
  }, [orders]);

  const placeOrder = useCallback((data: Omit<PlacedOrder, "id" | "orderNumber" | "placedAt" | "status">) => {
    const newOrder: PlacedOrder = {
      ...data,
      id: `order-${Date.now()}`,
      orderNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
      placedAt: new Date(),
      status: "preparing",
    };
    setOrders((prev) => [newOrder, ...prev]);

    // Simulate status progression
    setTimeout(() => {
      setOrders((prev) => prev.map((o) => o.id === newOrder.id ? { ...o, status: "quality-check" } : o));
    }, 15000);
    setTimeout(() => {
      setOrders((prev) => prev.map((o) => o.id === newOrder.id ? { ...o, status: "delivering" } : o));
    }, 30000);
    setTimeout(() => {
      setOrders((prev) => prev.map((o) => o.id === newOrder.id ? { ...o, status: "delivered" } : o));
    }, 60000);

    return newOrder;
  }, []);

  /* Standing fallback — see the note above standardMeal. Checked on mount and
     every minute, so an app left open across 8 PM acts at 8 PM. */
  useEffect(() => {
    const run = () => {
      /* The demo switch that makes every meal always orderable also turns off
         the deadline, and with it the thing this reacts to. */
      try { if (localStorage.getItem("fo_enforceTime") === "false") return; } catch { /* keep going */ }
      if (new Date().getHours() < ORDER_WINDOW_END_HOUR) return;

      const target = new Date();
      target.setDate(target.getDate() + 1);
      const dateStr = target.toDateString();
      if (autoOrderedDates().includes(dateStr)) return;

      setOrders((prev) => {
        const already = new Set(
          prev
            .filter((o) => o.deliveryDate && new Date(o.deliveryDate).toDateString() === dateStr)
            .map((o) => o.mealId || o.mealType?.toLowerCase()),
        );
        const missing = AUTO_MEAL_IDS.filter((m) => !already.has(m));
        rememberAutoOrdered(dateStr);
        if (missing.length === 0) return prev;

        const diet = (nurseActions.get().patientDiet || "regular") as DietType;
        const placed: PlacedOrder[] = missing.map((mealId) => {
          const { selections, items, comesWith } = standardMeal(diet, mealId, target);
          const w = MEAL_WINDOWS[mealId];
          return {
            id: `order-auto-${dateStr}-${mealId}`,
            orderNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
            placedAt: new Date(),
            status: "preparing",
            items,
            totalCalories: 0,
            estimatedDelivery: `${w.label.en} delivery`,
            mealType: w.label.en,
            mealWindow: w.timeRange,
            comesWith,
            orderFor: "patient",
            mealId,
            selections,
            deliveryDate: target.toISOString(),
            autoStandard: true,
          };
        });
        return [...placed, ...prev];
      });
    };
    run();
    const timer = setInterval(run, 60_000);
    return () => clearInterval(timer);
  }, []);

  const getOrder = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);
  const clearAllOrders = useCallback(() => setOrders([]), []);

  /** Demo reset: clears only today's orders whose meal ordering window is still open */
  const clearOpenOrders = useCallback(() => {
    const todayStr = new Date().toDateString();
    setOrders((prev) => prev.filter((o) => {
      const orderDate = o.placedAt instanceof Date ? o.placedAt : new Date(o.placedAt);
      // Keep orders from other days, remove all of today's orders
      return orderDate.toDateString() !== todayStr;
    }));
  }, []);

  const updateOrder = useCallback((id: string, data: Partial<Omit<PlacedOrder, "id" | "orderNumber" | "placedAt">>) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, ...data } : o));
  }, []);

  const activeOrders = orders.filter((o) => o.status !== "delivered");
  const pastOrders = orders.filter((o) => o.status === "delivered");

  return (
    <OrderContext.Provider value={{ orders, activeOrders, pastOrders, placeOrder, updateOrder, getOrder, clearAllOrders, clearOpenOrders }}>
      {children}
    </OrderContext.Provider>
  );
}

