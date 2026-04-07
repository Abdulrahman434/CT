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
  specialNotes: string;
  status: OrderStatus;
  placedAt: Date;
  estimatedDelivery: string;
  mealType: string;
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
    specialNotes: "",
    status: "delivered",
    placedAt: new Date(Date.now() - 4 * 3600000),
    estimatedDelivery: "25–35 min",
    mealType: "Lunch",
  },
  {
    id: "past-2",
    orderNumber: "#3812",
    items: [
      { id: "m3", name: { en: "Oatmeal Bowl", ar: "وعاء شوفان" }, quantity: 1, calories: 280, image: "" },
      { id: "m4", name: { en: "Fresh Orange Juice", ar: "عصير برتقال طازج" }, quantity: 2, calories: 220, image: "" },
    ],
    totalCalories: 500,
    specialNotes: "No sugar",
    status: "delivered",
    placedAt: new Date(Date.now() - 24 * 3600000),
    estimatedDelivery: "25–35 min",
    mealType: "Breakfast",
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

  const activeOrders = orders.filter((o) => o.status !== "delivered");
  const pastOrders = orders.filter((o) => o.status === "delivered");

  return (
    <OrderContext.Provider value={{ orders, activeOrders, pastOrders, placeOrder, getOrder }}>
      {children}
    </OrderContext.Provider>
  );
}
