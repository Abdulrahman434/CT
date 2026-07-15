import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { MEAL_WINDOWS } from "./menuData";
import type { MealId } from "./menuData";

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
  /** Saved item selections for pre-filling during edit */
  selections?: Record<string, string[]>;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * LOCAL STORAGE PERSISTENCE
 * ═══════════════════════════════════════════════════════════════════════════ */

const ORDER_STORE_KEY = "careinn-meal-orders";

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

