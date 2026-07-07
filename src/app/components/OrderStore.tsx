import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

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
}

/* ═══════════════════════════════════════════════════════════════════════════
 * CONTEXT
 * ═══════════════════════════════════════════════════════════════════════════ */

interface OrderStoreCtx {
  orders: PlacedOrder[];
  activeOrders: PlacedOrder[];
  pastOrders: PlacedOrder[];
  placeOrder: (order: Omit<PlacedOrder, "id" | "orderNumber" | "placedAt" | "status">) => PlacedOrder;
  getOrder: (id: string) => PlacedOrder | undefined;
  clearAllOrders: () => void;
}

const OrderContext = createContext<OrderStoreCtx | null>(null);

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be inside OrderProvider");
  return ctx;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * PROVIDER — wraps the app
 * ═══════════════════════════════════════════════════════════════════════════ */

// Start with some mock past orders for the log
const MOCK_PAST_ORDERS: PlacedOrder[] = [
  {
    id: "past-1",
    orderNumber: "#3847",
    items: [
      { id: "m1", name: { en: "Grilled Chicken", ar: "دجاج مشوي" }, quantity: 1, calories: 380, image: "" },
      { id: "m2", name: { en: "Garden Salad", ar: "سلطة خضراء" }, quantity: 1, calories: 120, image: "" },
    ],
    totalCalories: 500,
    status: "delivered",
    placedAt: new Date(Date.now() - 4 * 3600000),
    estimatedDelivery: "25–35 min",
    mealType: "Lunch",
    mealWindow: "1:00 PM – 2:00 PM",
    comesWith: [
      { en: "Sautéed Vegetables", ar: "خضار سوتيه" },
      { en: "Water Bottle", ar: "زجاجة ماء" },
    ],
    orderFor: "patient",
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
    placedAt: new Date(Date.now() - 24 * 3600000),
    estimatedDelivery: "25–35 min",
    mealType: "Breakfast",
    mealWindow: "8:00 AM – 10:00 AM",
    comesWith: [
      { en: "Fresh Fruit (Whole)", ar: "فاكهة طازجة" },
      { en: "Water Bottle", ar: "زجاجة ماء" },
    ],
    orderFor: "patient",
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
    status: "delivering",
    placedAt: new Date(Date.now() - 35 * 60 * 1000),
    estimatedDelivery: "10 min",
    mealType: "Lunch",
    mealWindow: "1:00 PM – 2:00 PM",
    comesWith: [
      { en: "Water Bottle", ar: "زجاجة ماء" },
    ],
    orderFor: "guest",
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
    placedAt: new Date(Date.now() - 26 * 3600000),
    estimatedDelivery: "25 min",
    mealType: "Lunch",
    mealWindow: "1:00 PM – 2:00 PM",
    comesWith: [
      { en: "Water Bottle", ar: "زجاجة ماء" },
    ],
    orderFor: "guest",
  },
];

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<PlacedOrder[]>(MOCK_PAST_ORDERS);

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

  const activeOrders = orders.filter((o) => o.status !== "delivered");
  const pastOrders = orders.filter((o) => o.status === "delivered");

  return (
    <OrderContext.Provider value={{ orders, activeOrders, pastOrders, placeOrder, getOrder, clearAllOrders }}>
      {children}
    </OrderContext.Provider>
  );
}
