import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Sun,
  Coffee,
  Moon,
  Cookie,
  Plus,
  Minus,
  ShoppingCart,
  Check,
  Leaf,
  Flame,
  X,
  Clock,
  ChefHat,
  Utensils,
  Heart,
  GlassWater,
  ClipboardList,
  Bell,
  RotateCcw,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTheme, TYPE_SCALE, WEIGHT, TEXT_STYLE, SHADOW, SPACE, LEADING } from "./ThemeContext";
import { useLocale } from "./i18n";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useOrders } from "./OrderStore";
import type { PlacedOrder, OrderStatus } from "./OrderStore";
import pancakesImg from "../../assets/b167c7c821f762f1a84e11f36986d483ad5614d0.png";
import scrambledEggsImg from "../../assets/075c5a0d40e038030a1d251707da75764fd76276.png";
import coffeeImg from "../../assets/9df352703d6019b682a622cf9d906127db5bc7a5.png";
import teaImg from "../../assets/0270c84b734264f02001c49c568266e21d08eaa2.png";
import milkImg from "../../assets/15ae1834fda72d939586113cfa43abdbcedb2dc2.png";
import lemonTeaImg from "../../assets/f79d8913c4dbf3edcd50cd2e9c1efa1483970622.png";

/* ═══════════════════════════════════════════════════════════════════════════
 * FOOD DATA — mock hospital menu
 * ═══════════════════════════════════════════════════════════════════════════ */

type DietaryTag = "vegetarian" | "vegan" | "gluten-free" | "low-sodium" | "diabetic-friendly" | "high-protein";

interface MenuItem {
  id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  image: string;
  calories: number;
  tags: DietaryTag[];
  popular?: boolean;
}

interface MealCategory {
  id: string;
  label: { en: string; ar: string };
  icon: React.ComponentType<any>;
  timeRange: { en: string; ar: string };
  /** Hour range [start, end) in 24h format. null = all day */
  hours: [number, number] | null;
  items: MenuItem[];
  color: string; // accent color for category
}

/** Check if current time is within a meal's serving window */
function isMealTimeActive(hours: [number, number] | null): boolean {
  if (!hours) return true; // all-day
  const now = new Date().getHours();
  return now >= hours[0] && now < hours[1];
}

/** Get delivery message based on whether meal is currently being served */
function getDeliveryMessage(category: MealCategory, isRTL: boolean): { label: string; detail: string } {
  if (isMealTimeActive(category.hours)) {
    return {
      label: isRTL ? "وقت التوصيل المتوقع" : "Est. Delivery",
      detail: isRTL ? "٢٥–٣٥ دقيقة" : "25–35 min",
    };
  }
  // Pre-order: will be delivered during that meal's window
  const timeStr = isRTL ? category.timeRange.ar : category.timeRange.en;
  const mealName = isRTL ? category.label.ar : category.label.en;
  return {
    label: isRTL ? "سيتم التوصيل في" : "Delivered during",
    detail: isRTL ? `${mealName} (${timeStr})` : `${mealName} (${timeStr})`,
  };
}

const MENU: MealCategory[] = [
  {
    id: "breakfast",
    label: { en: "Breakfast", ar: "الفطور" },
    icon: Sun,
    timeRange: { en: "6:00 AM – 10:00 AM", ar: "٦:٠٠ ص – ٠٠:٠٠ ص" },
    hours: [6, 10],
    color: "#F59E0B",
    items: [
      {
        id: "b1",
        name: { en: "Eggs & Toast", ar: "بيض وتوست" },
        description: { en: "Scrambled eggs with whole wheat toast and fresh vegetables", ar: "بيض مخفوق مع توست قمح كامل وخضراوات طازجة" },
        image: "https://images.unsplash.com/photo-1725986038149-00f65b707814?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3NwaXRhbCUyMGJyZWFrZmFzdCUyMHRyYXklMjBlZ2dzJTIwdG9hc3QlMjBoZWFsdGh5fGVufDF8fHx8MTc3MzgwNTgwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 320,
        tags: ["high-protein"],
        popular: true,
      },
      {
        id: "b2",
        name: { en: "Oatmeal Bowl", ar: "طبق شوفان" },
        description: { en: "Warm oatmeal topped with honey, cinnamon, and fresh fruits", ar: "شوفان دافئ بالعسل والقرفة والفواكه الطازجة" },
        image: "https://images.unsplash.com/photo-1631077019185-84d961548731?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvYXRtZWFsJTIwcG9ycmlkZ2UlMjBib3dsJTIwYnJlYWtmYXN0JTIwaGVhbHRoeXxlbnwxfHx8fDE3NzM4MDU4MDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 250,
        tags: ["vegetarian", "diabetic-friendly"],
      },
      {
        id: "b3",
        name: { en: "Fluffy Pancakes", ar: "بان كيك" },
        description: { en: "Light buttermilk pancakes with maple syrup and fresh berries", ar: "بان كيك خفيف بشراب القيقب والتوت الطازج" },
        image: pancakesImg,
        calories: 380,
        tags: ["vegetarian"],
      },
      {
        id: "b4",
        name: { en: "Avocado Toast", ar: "توست أفوكادو" },
        description: { en: "Smashed avocado on sourdough with poached eggs and herbs", ar: "أفوكادو مهروس على خبز العجينة المخمرة مع بيض مسلوق وأعشاب" },
        image: "https://images.unsplash.com/photo-1767034235859-d656cd447242?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY3JhbWJsZWQlMjBlZ2dzJTIwYXZvY2FkbyUyMHRvYXN0JTIwYnJlYWtmYXN0JTIwcGxhdGV8ZW58MXx8fHwxNzczODA1ODExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 340,
        tags: ["vegetarian", "high-protein"],
        popular: true,
      },
      {
        id: "b5",
        name: { en: "Yogurt & Granola", ar: "زبادي وجرانولا" },
        description: { en: "Creamy Greek yogurt with crunchy granola and drizzled honey", ar: "زبادي يوناني كريمي مع جرانولا مقرمشة وعسل" },
        image: "https://images.unsplash.com/photo-1729368628910-2d58db8657a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2d1cnQlMjBwYXJmYWl0JTIwZ3Jhbm9sYSUyMGJlcnJpZXN8ZW58MXx8fHwxNzczODA1ODA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 210,
        tags: ["vegetarian", "gluten-free"],
      },
      {
        id: "b6",
        name: { en: "Scrambled Eggs with Toast", ar: "بيض مخفوق مع توست" },
        description: { en: "Fluffy scrambled eggs served on whole grain toast with fresh herbs and vegetables", ar: "بيض مخفوق هش مقدم على توست حبوب كاملة مع أعشاب طازجة وخضراوات" },
        image: scrambledEggsImg,
        calories: 290,
        tags: ["high-protein"],
      },
    ],
  },
  {
    id: "lunch",
    label: { en: "Lunch", ar: "الغداء" },
    icon: Coffee,
    timeRange: { en: "12:00 PM – 3:00 PM", ar: "٢:٠٠ م – ٣:٠٠ م" },
    hours: [12, 15],
    color: "#22C55E",
    items: [
      {
        id: "l1",
        name: { en: "Grilled Chicken & Rice", ar: "دجاج مشوي وأرز" },
        description: { en: "Herb-marinated grilled chicken breast with basmati rice and grilled vegetables", ar: "صدر دجاج مشوي بالأعشاب مع أرز بسمتي وخضراوات مشوية" },
        image: "https://images.unsplash.com/photo-1604382440115-5f730e6ede1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwY2hpY2tlbiUyMHJpY2UlMjBwbGF0ZSUyMGhlYWx0aHklMjBsdW5jaHxlbnwxfHx8fDE3NzM4MDU4MDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 450,
        tags: ["high-protein", "gluten-free"],
        popular: true,
      },
      {
        id: "l2",
        name: { en: "Lentil Soup", ar: "شوربة عدس" },
        description: { en: "Traditional Arabic lentil soup with warm pita bread", ar: "شوربة عدس عربية تقليدية مع خبز بيتا دافئ" },
        image: "https://images.unsplash.com/photo-1636044984153-dd292d223bdb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmFiaWMlMjBsZW50aWwlMjBzb3VwJTIwYm93bCUyMHdhcm18ZW58MXx8fHwxNzczODA1ODA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 220,
        tags: ["vegan", "low-sodium", "diabetic-friendly"],
        popular: true,
      },
      {
        id: "l3",
        name: { en: "Garden Salad", ar: "سلطة خضراء" },
        description: { en: "Fresh mixed greens with cherry tomatoes, cucumber, and lemon vinaigrette", ar: "خضروات مشكلة طازجة مع طماطم كرزية وخيار وصلصة الليمون" },
        image: "https://images.unsplash.com/photo-1622756144420-6877b1b7476e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGdyZWVuJTIwc2FsYWQlMjBib3lsJTIwaGVhbHRoeXxlbnwxfHx8fDE3NzM4MDU4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 150,
        tags: ["vegan", "gluten-free", "low-sodium"],
      },
      {
        id: "l4",
        name: { en: "Penne Pasta", ar: "باستا بيني" },
        description: { en: "Penne with tomato basil sauce, fresh parmesan, and herbs", ar: "بيني بصلصة الطماطم والريحان والبارميزان الطازج والأعشاب" },
        image: "https://images.unsplash.com/photo-1770350482632-2ac108790b58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMHBlbm5lJTIwdG9tYXRvJTIwYmFzaWwlMjBwbGF0ZXxlbnwxfHx8fDE3NzM4MDU4MDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 420,
        tags: ["vegetarian"],
      },
      {
        id: "l5",
        name: { en: "Chicken Soup", ar: "شوربة دجاج" },
        description: { en: "Hearty chicken soup with vegetables and herbs — comfort food", ar: "شوربة دجاج شهية بالخضراوات والأعشاب — طعام مريح" },
        image: "https://images.unsplash.com/photo-1612108438004-257c47560118?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwc291cCUyMGJyb3RoJTIwdmVnZXRhYmxlcyUyMHdhcm18ZW58MXx8fHwxNzczODA1ODA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 190,
        tags: ["low-sodium", "gluten-free"],
      },
    ],
  },
  {
    id: "dinner",
    label: { en: "Dinner", ar: "العشاء" },
    icon: Moon,
    timeRange: { en: "6:00 PM – 9:00 PM", ar: "٦:٠٠ م – ٩:٠٠ م" },
    hours: [18, 21],
    color: "#8B5CF6",
    items: [
      {
        id: "d1",
        name: { en: "Grilled Salmon", ar: "سلمون مشوي" },
        description: { en: "Atlantic salmon fillet with steamed vegetables and lemon butter sauce", ar: "فيليه سلمون أطلسي مع خضراوات مطهوة وصلصة الليمون والزبدة" },
        image: "https://images.unsplash.com/photo-1689672235271-727de51355e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxtb24lMjBkaW5uZXIlMjBwbGF0ZSUyMHZlZ2V0YWJsZXMlMjBlbGVnYW50fGVufDF8fHx8MTc3MzgwNTgwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 380,
        tags: ["high-protein", "gluten-free"],
        popular: true,
      },
      {
        id: "d2",
        name: { en: "Lamb Kabsa", ar: "كبسة لحم" },
        description: { en: "Traditional Saudi spiced rice with tender lamb and aromatic herbs", ar: "أرز سعودي تقليدي بالبهارات مع لحم طري وأعشاب عطرية" },
        image: "https://images.unsplash.com/photo-1646997577271-00e32bb0dc0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYW1iJTIwa2Fic2ElMjByaWNlJTIwU2F1ZGklMjBBcmFiaWFuJTIwZm9vZHxlbnwxfHx8fDE3NzM4MDU4MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 520,
        tags: ["high-protein"],
        popular: true,
      },
      {
        id: "d3",
        name: { en: "Mediterranean Fish", ar: "سمك متوسطي" },
        description: { en: "Grilled sea bass with roasted vegetables and olive oil drizzle", ar: "سمك قاروص مشوي مع خضراوات محمصة وزيت زيتون" },
        image: "https://images.unsplash.com/photo-1673436977947-0787164a9abc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmlsbGVkJTIwZmlzaCUyMHZlZ2V0YWJsZXMlMjBNZWRpdGVycmFuZWFuJTIwcGxhdGV8ZW58MXx8fHwxNzczODA1ODA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 350,
        tags: ["high-protein", "gluten-free", "low-sodium"],
      },
      {
        id: "d4",
        name: { en: "Steamed Vegetables", ar: "خضراوات مطهوة" },
        description: { en: "Seasonal steamed vegetables with light herb seasoning", ar: "خضراوات موسمية مطهوة بالبخار مع توابل أعشاب خفيفة" },
        image: "https://images.unsplash.com/photo-1518164147695-36c13dd568f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVhbWVkJTIwdmVnZXRhYmxlcyUyMGJyb2Njb2xpJTIwY2Fycm90cyUyMGhlYWx0aHl8ZW58MXx8fHwxNzczODA1ODA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 120,
        tags: ["vegan", "gluten-free", "low-sodium", "diabetic-friendly"],
      },
      {
        id: "d5",
        name: { en: "Hummus & Pita", ar: "حمص وخبز بيتا" },
        description: { en: "Creamy hummus with warm pita bread and olive oil garnish", ar: "حمص كريمي مع خبز بيتا دافئ وزيت زيتون" },
        image: "https://images.unsplash.com/photo-1743674453093-592bed88018e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW1tdXMlMjBwaXRhJTIwYnJlYWQlMjBNaWRkbGUlMjBFYXN0ZXJuJTIwYXBwZXRpemVyfGVufDF8fHx8MTc3MzgwNTgwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 280,
        tags: ["vegan"],
      },
    ],
  },
  {
    id: "snacks",
    label: { en: "Snacks", ar: "وجبات خفيفة" },
    icon: Cookie,
    timeRange: { en: "Available all day", ar: "متاح طوال اليوم" },
    hours: null,
    color: "#EC4899",
    items: [
      {
        id: "s1",
        name: { en: "Fresh Fruit Bowl", ar: "طبق فواكه طازجة" },
        description: { en: "Seasonal mixed fruits — naturally sweet and refreshing", ar: "فواكه مشكلة موسمية — حلوة ومنعشة بشكل طبيعي" },
        image: "https://images.unsplash.com/photo-1681840524567-732960c82f4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZydWl0JTIwYm93bCUyMGNvbG9yZnVsJTIwaGVhbHRoeSUyMHNuYWNrfGVufDF8fHx8MTc3MzgwNTgwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 120,
        tags: ["vegan", "gluten-free", "diabetic-friendly"],
        popular: true,
      },
      {
        id: "s2",
        name: { en: "Yogurt Parfait", ar: "بارفيه زبادي" },
        description: { en: "Greek yogurt layered with granola, honey, and mixed berries", ar: "زبادي يوناني بطبقات جرانولا والعسل والتوت المشكل" },
        image: "https://images.unsplash.com/photo-1729368628910-2d58db8657a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2d1cnQlMjBwYXJmYWl0JTIwZ3Jhbm9sYSUyMGJlcnJpZXN8ZW58MXx8fHwxNzczODA1ODA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 200,
        tags: ["vegetarian"],
      },
      {
        id: "s3",
        name: { en: "Mixed Nuts", ar: "مكسرات مشكلة" },
        description: { en: "Premium roasted almonds, cashews, and walnuts — lightly salted", ar: "لوز وكاجو وجوز محمص فاخر — مملح قليلاً" },
        image: "https://images.unsplash.com/photo-1598371623789-44e341c1b6ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXhlZCUyMG51dHMlMjBhbG1vbmRzJTIwc25hY2slMjBib3lsJTIwaGVhbHRoeXxlbnwxfHx8fDE3NzM4MDU4MTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 280,
        tags: ["vegan", "gluten-free", "high-protein"],
      },
      {
        id: "s4",
        name: { en: "Rice Pudding", ar: "أرز بالحليب" },
        description: { en: "Creamy traditional rice pudding with cinnamon and rosewater", ar: "أرز بالحليب تقليدي كريمي بالقرفة وماء الورد" },
        image: "https://images.unsplash.com/photo-1745236549159-f1297ef35fb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwcHVkZGluZyUyMGRlc3NlcnQlMjBjcmVhbXklMjBib3lsfGVufDF8fHx8MTc3MzgwNTgwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 240,
        tags: ["vegetarian", "gluten-free"],
      },
      {
        id: "s5",
        name: { en: "Chocolate Pudding", ar: "بودنغ شوكولاتة" },
        description: { en: "Silky dark chocolate pudding — a comforting treat", ar: "بودنغ شوكولاتة داكنة ناعم — حلوى مريحة" },
        image: "https://images.unsplash.com/photo-1673551494277-92204546b504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBwdWRkaW5nJTIwZGVzc2VydCUyMGN1cHxlbnwxfHx8fDE3NzM4MDU4MTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        calories: 310,
        tags: ["vegetarian"],
      },
    ],
  },
  {
    id: "drinks",
    label: { en: "Drinks", ar: "مشروبات" },
    icon: GlassWater,
    timeRange: { en: "Available all day", ar: "متاح طوال اليوم" },
    hours: null,
    color: "#0EA5E9",
    items: [
      {
        id: "dr1",
        name: { en: "Fresh Orange Juice", ar: "عصير برتقال طازج" },
        description: { en: "Freshly squeezed orange juice, no added sugar", ar: "عصير برتقال طازج بدون سكر مضاف" },
        image: coffeeImg,
        calories: 110,
        tags: ["vegan", "gluten-free", "diabetic-friendly"],
        popular: true,
      },
      {
        id: "dr2",
        name: { en: "Green Herbal Tea", ar: "شاي أعشاب أخضر" },
        description: { en: "Calming green tea with natural herbs — caffeine-free option available", ar: "شاي أخضر مهدئ بأعشاب طبيعية — متوفر بدون كافيين" },
        image: teaImg,
        calories: 5,
        tags: ["vegan", "gluten-free", "diabetic-friendly"],
      },
      {
        id: "dr3",
        name: { en: "Lemon Mint Water", ar: "ماء بالليمون والنعناع" },
        description: { en: "Refreshing infused water with fresh lemon and mint leaves", ar: "ماء منعش بالليمون الطازج وأوراق النعناع" },
        image: lemonTeaImg,
        calories: 10,
        tags: ["vegan", "gluten-free", "low-sodium", "diabetic-friendly"],
        popular: true,
      },
      {
        id: "dr4",
        name: { en: "Warm Milk & Honey", ar: "حليب دافئ بالعسل" },
        description: { en: "Warm whole milk with natural honey — perfect before bedtime", ar: "حليب كامل دافئ بالعسل الطبيعي — مثالي قبل النوم" },
        image: milkImg,
        calories: 180,
        tags: ["vegetarian", "gluten-free"],
      },
      {
        id: "dr5",
        name: { en: "Berry Smoothie", ar: "سموذي التوت" },
        description: { en: "Blended mixed berries with yogurt and a touch of honey", ar: "توت مشكل مخلوط مع زبادي ولمسة من العسل" },
        image: coffeeImg,
        calories: 160,
        tags: ["vegetarian", "gluten-free"],
        popular: true,
      },
    ],
  },
];

const DANGER = "#D10044";

const TAG_CONFIG: Record<DietaryTag, { label: { en: string; ar: string }; icon: React.ComponentType<any>; color: string }> = {
  "vegetarian":       { label: { en: "Vegetarian", ar: "نباتي" },          icon: Leaf,          color: "#22C55E" },
  "vegan":            { label: { en: "Vegan", ar: "نباتي صرف" },           icon: Leaf,          color: "#16A34A" },
  "gluten-free":      { label: { en: "Gluten Free", ar: "خالٍ من الغلوتين" }, icon: Check,       color: "#8B5CF6" },
  "low-sodium":       { label: { en: "Low Sodium", ar: "قليل الملح" },      icon: Heart,         color: "#3B82F6" },
  "diabetic-friendly":{ label: { en: "Diabetic Friendly", ar: "مناسب لمرضى السكري" }, icon: Check, color: "#0EA5E9" },
  "high-protein":     { label: { en: "High Protein", ar: "غني بالبروتين" },  icon: Flame,         color: "#F97316" },
};

/* ═══════════════════════════════════════════════════════════════════════════
 * TYPES
 * ═══════════════════════════════════════════════════════════════════════════ */

type OrderStep = "menu" | "confirmed" | "history";

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export function FoodOrdering({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const { isRTL, fontFamily } = useLocale();
  const { placeOrder: placeOrderToStore } = useOrders();

  const [step, setStep] = useState<OrderStep>("menu");
  const [activeCategory, setActiveCategory] = useState(MENU[0].id);
  const [sliderIndex, setSliderIndex] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [specialNotes, setSpecialNotes] = useState("");
  const [lastOrderNumber, setLastOrderNumber] = useState("");

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const category = MENU.find((c) => c.id === activeCategory)!;
  const clampedSliderIndex = ((sliderIndex % category.items.length) + category.items.length) % category.items.length;
  const totalItems = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const totalCalories = cart.reduce((sum, ci) => sum + ci.menuItem.calories * ci.quantity, 0);

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prev.map((ci) => ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      }
      return [...prev, { menuItem: item, quantity: 1, notes: "" }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((ci) => ci.menuItem.id === itemId ? { ...ci, quantity: ci.quantity - 1 } : ci);
      }
      return prev.filter((ci) => ci.menuItem.id !== itemId);
    });
  }, []);

  const getQty = (itemId: string) => cart.find((ci) => ci.menuItem.id === itemId)?.quantity || 0;

  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;

  /* Determine delivery info based on which categories are in the cart */
  const cartCategories = [...new Set(cart.map((ci) => {
    for (const cat of MENU) {
      if (cat.items.some((mi) => mi.id === ci.menuItem.id)) return cat;
    }
    return null;
  }).filter(Boolean))] as MealCategory[];

  /** 
   * If ALL categories in cart are currently active → 25-35 min.
   * If ANY category is outside its time window → it's a pre-order for that meal period.
   * Show per-category delivery info. 
   */
  const getOrderDeliveryInfo = (): { label: string; detail: string; isPreOrder: boolean }[] => {
    if (cartCategories.length === 0) return [];
    const infos: { label: string; detail: string; isPreOrder: boolean }[] = [];
    const allActive = cartCategories.every((cat) => isMealTimeActive(cat.hours));
    if (allActive) {
      infos.push({
        label: isRTL ? "وقت التوصيل المتوقع" : "Est. Delivery",
        detail: isRTL ? "٢٥–٣٥ دقيقة" : "25–35 min",
        isPreOrder: false,
      });
    } else {
      for (const cat of cartCategories) {
        const msg = getDeliveryMessage(cat, isRTL);
        infos.push({ ...msg, isPreOrder: !isMealTimeActive(cat.hours) });
      }
    }
    return infos;
  };

  const deliveryInfos = getOrderDeliveryInfo();

  const handlePlaceOrder = () => {
    const mealTypes = [...new Set(cartCategories.map((c) => loc(c.label)))].join(", ");
    const placed = placeOrderToStore({
      items: cart.map((ci) => ({
        id: ci.menuItem.id,
        name: ci.menuItem.name,
        quantity: ci.quantity,
        calories: ci.menuItem.calories * ci.quantity,
        image: ci.menuItem.image,
      })),
      totalCalories,
      specialNotes,
      estimatedDelivery: deliveryInfos[0]?.detail || "25–35 min",
      mealType: mealTypes,
    });
    setLastOrderNumber(placed.orderNumber);
    setStep("confirmed");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${theme.primary} 0%, ${theme.primaryDark} 40%, #0a1628 100%)`,
      }}
    >
      {/* Subtle hospital bg */}
      <img
        src={theme.heroImageUrl}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        style={{ opacity: 0.06, mixBlendMode: "luminosity" }}
      />

      <style>{`
        @keyframes foodIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .food-scroll::-webkit-scrollbar { width: 4px; }
        .food-scroll::-webkit-scrollbar-track { background: transparent; }
        .food-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 100px; }
        .food-scroll { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent; }
      `}</style>

      <AnimatePresence mode="wait">
        {step === "menu" && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? 40 : -40 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center gap-5 px-12 pt-10 pb-4 relative z-10">
              <button
                onClick={onClose}
                className="flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                style={{
                  width: "52px", height: "52px",
                  borderRadius: theme.radiusMd,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <BackArrow size={24} color="#fff" />
              </button>
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "52px", height: "52px",
                    borderRadius: theme.radiusMd,
                    backgroundColor: "rgba(255,255,255,0.12)",
                  }}
                >
                  <Utensils size={26} color="#fff" />
                </div>
                <div>
                  <h2 style={{ fontFamily, ...TEXT_STYLE.display, fontSize: "32px", color: "#fff", lineHeight: "36px" }}>
                    {isRTL ? "طلب الوجبات" : "Meal Ordering"}
                  </h2>
                  <p style={{ fontFamily, ...TEXT_STYLE.caption, color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                    {isRTL ? "اختر وجبتك المفضلة" : "Choose your favorite meal"}
                  </p>
                </div>
              </div>

              {/* My Orders button */}
              <button
                onClick={() => setStep("history")}
                className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                style={{
                  height: "48px",
                  padding: "0 20px",
                  borderRadius: theme.radiusMd,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  outline: "none",
                }}
              >
                <ClipboardList size={20} color="rgba(255,255,255,0.8)" />
                <span style={{ fontFamily, ...TEXT_STYLE.buttonSm, color: "rgba(255,255,255,0.8)" }}>
                  {isRTL ? "طلباتي" : "My Orders"}
                </span>
              </button>

              {/* Cart badge */}
              {totalItems > 0 && (
                null
              )}
            </div>

            {/* Category tabs */}
            <div className="shrink-0 px-12 pb-5 relative z-10">
              <div className="flex gap-3 w-full">
                {MENU.map((cat) => {
                  const active = cat.id === activeCategory;
                  const Icon = cat.icon;
                  const isActive = isMealTimeActive(cat.hours);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setActiveCategory(cat.id); setSliderIndex(1); }}
                      className="flex items-center justify-center gap-3 flex-1 cursor-pointer active:scale-95 transition-all"
                      style={{
                        height: "64px",
                        padding: "0 24px",
                        borderRadius: theme.radiusMd,
                        backgroundColor: active ? "#fff" : "rgba(255,255,255,0.08)",
                        border: active ? "none" : "1px solid rgba(255,255,255,0.12)",
                        outline: "none",
                      }}
                    >
                      <Icon size={20} color={active ? theme.primary : "rgba(255,255,255,0.6)"} />
                      <div className="flex flex-col" style={{ alignItems: isRTL ? "flex-end" : "flex-start" }}>
                        <span style={{
                          fontFamily,
                          ...TEXT_STYLE.subtitle,
                          color: active ? theme.primaryDark : "rgba(255,255,255,0.8)",
                        }}>
                          {loc(cat.label)}
                        </span>
                        {isActive ? (
                          <span style={{ fontFamily, ...TEXT_STYLE.caption, color: active ? "#6B7280" : "rgba(255,255,255,0.55)" }}>
                            {loc(cat.timeRange)}
                          </span>
                        ) : (
                          <span
                            className="flex items-center gap-1"
                            style={{
                              padding: "2px 8px",
                              borderRadius: theme.radiusSm,
                              backgroundColor: active ? "#FEF3C7" : "rgba(245,158,11,0.15)",
                              marginTop: "2px",
                            }}
                          >
                            <Clock size={11} color="#F59E0B" />
                            <span style={{ fontFamily, ...TEXT_STYLE.micro, color: active ? "#D97706" : "#FBBF24" }}>
                              {loc(cat.timeRange)}
                            </span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Menu carousel + order preview */}
            <div className="flex-1 min-h-0 flex gap-5 px-12 pb-8 relative z-10">
              {/* Menu carousel */}
              <div className="flex-1 min-w-0 flex flex-col">
                {/* Carousel area */}
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full flex items-center justify-center"
                      style={{ height: "100%" }}
                    >
                      <FoodCarousel
                        items={category.items}
                        activeIndex={clampedSliderIndex}
                        onIndexChange={setSliderIndex}
                        getQty={getQty}
                        onAdd={addToCart}
                        onRemove={removeFromCart}
                        categoryColor={category.color}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Dots indicator */}
                  <div className="shrink-0 flex items-center justify-center gap-2 mt-4">
                    {category.items.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSliderIndex(i)}
                        className="cursor-pointer transition-all active:scale-90"
                        style={{
                          width: i === clampedSliderIndex ? "28px" : "8px",
                          height: "8px",
                          borderRadius: theme.radiusFull,
                          backgroundColor: i === clampedSliderIndex ? "#fff" : "rgba(255,255,255,0.25)",
                          border: "none",
                          outline: "none",
                          transition: "all 0.3s ease",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Order preview sidebar — visible when cart has items */}
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: isRTL ? -24 : 24, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 400 }}
                    exit={{ opacity: 0, x: isRTL ? -24 : 24, width: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="shrink-0 flex flex-col overflow-hidden"
                    style={{ width: 400 }}
                  >
                    <OrderPreviewPanel
                      cart={cart}
                      totalItems={totalItems}
                      totalCalories={totalCalories}
                      specialNotes={specialNotes}
                      onSpecialNotesChange={setSpecialNotes}
                      deliveryInfos={deliveryInfos}
                      onAdd={addToCart}
                      onRemove={removeFromCart}
                      onPlaceOrder={handlePlaceOrder}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {step === "confirmed" && (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col flex-1 items-center justify-center"
          >
            <ConfirmationStep orderNumber={lastOrderNumber} totalItems={totalItems} deliveryInfos={deliveryInfos} onClose={onClose} onViewOrders={() => setStep("history")} />
          </motion.div>
        )}

        {step === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1 min-h-0"
          >
            <OrdersLogStep onBack={() => setStep("menu")} onClose={onClose} onReorder={(items) => {
              items.forEach((item) => {
                // Add items back to cart for reordering
                for (let i = 0; i < item.quantity; i++) {
                  const menuItem = MENU.flatMap((m) => m.items).find((mi) => mi.id === item.id);
                  if (menuItem) addToCart(menuItem);
                }
              });
              setStep("menu");
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * FOOD CAROUSEL — shows 3 items, center one is bigger
 * ═══════════════════════════════════════════════════════════════════════════ */

function FoodCarousel({
  items,
  activeIndex,
  onIndexChange,
  getQty,
  onAdd,
  onRemove,
  categoryColor,
}: {
  items: MenuItem[];
  activeIndex: number;
  onIndexChange: (i: number) => void;
  getQty: (id: string) => number;
  onAdd: (item: MenuItem) => void;
  onRemove: (id: string) => void;
  categoryColor: string;
}) {
  const { theme } = useTheme();
  const { isRTL } = useLocale();
  const len = items.length;

  // Circular navigation helpers
  const wrap = (i: number) => ((i % len) + len) % len;
  const goPrev = () => onIndexChange(wrap(activeIndex - 1));
  const goNext = () => onIndexChange(wrap(activeIndex + 1));

  // Always show 3: prev (wrapped), center, next (wrapped)
  const prevIdx = wrap(activeIndex - 1);
  const nextIdx = wrap(activeIndex + 1);
  const visible: { item: MenuItem; position: "left" | "center" | "right"; originalIndex: number }[] = [
    { item: items[prevIdx], position: "left", originalIndex: prevIdx },
    { item: items[activeIndex], position: "center", originalIndex: activeIndex },
    { item: items[nextIdx], position: "right", originalIndex: nextIdx },
  ];

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="flex items-center gap-4 w-full h-full justify-center">
      {/* Prev arrow */}
      <button
        onClick={isRTL ? goNext : goPrev}
        className="shrink-0 flex items-center justify-center cursor-pointer active:scale-90 transition-all"
        style={{
          width: "48px",
          height: "48px",
          borderRadius: theme.radiusFull,
          backgroundColor: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.1)",
          outline: "none",
        }}
      >
        <PrevIcon size={24} color="#fff" />
      </button>

      {/* Cards */}
      <div className="flex-1 flex items-center justify-center gap-5" style={{ minHeight: 0, height: "100%" }}>
        <AnimatePresence mode="popLayout">
          {visible.map(({ item, position, originalIndex }) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: position === "center" ? 1 : 0.55,
                scale: position === "center" ? 1 : 0.82,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={() => {
                if (position !== "center") onIndexChange(originalIndex);
              }}
              style={{
                flex: position === "center" ? "0 0 42%" : "0 0 26%",
                maxHeight: "100%",
                cursor: position !== "center" ? "pointer" : "default",
                filter: position === "center" ? "none" : "brightness(0.7)",
                zIndex: position === "center" ? 2 : 1,
              }}
            >
              <FoodCard
                item={item}
                qty={getQty(item.id)}
                onAdd={() => onAdd(item)}
                onRemove={() => onRemove(item.id)}
                delay={0}
                categoryColor={categoryColor}
                isCenter={position === "center"}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Next arrow */}
      <button
        onClick={isRTL ? goPrev : goNext}
        className="shrink-0 flex items-center justify-center cursor-pointer active:scale-90 transition-all"
        style={{
          width: "48px",
          height: "48px",
          borderRadius: theme.radiusFull,
          backgroundColor: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.1)",
          outline: "none",
        }}
      >
        <NextIcon size={24} color="#fff" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * FOOD CARD
 * ═══════════════════════════════════════════════════════════════════════════ */

function FoodCard({
  item,
  qty,
  onAdd,
  onRemove,
  delay,
  categoryColor,
  isCenter = true,
}: {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  delay: number;
  categoryColor: string;
  isCenter?: boolean;
}) {
  const { theme } = useTheme();
  const { isRTL, fontFamily } = useLocale();
  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;
  const inCart = qty > 0;
  const [showInfo, setShowInfo] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="relative flex flex-col overflow-hidden"
      style={{
        borderRadius: theme.radiusXl,
        backgroundColor: theme.surface,
        border: inCart ? `2px solid ${theme.primary}` : theme.cardBorder,
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: inCart ? `0 0 24px ${theme.primary}20` : SHADOW.md,
      }}
    >
      {/* Image — bigger area */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "1 / 0.85" }}>
        <ImageWithFallback
          src={item.image}
          alt={loc(item.name)}
          className="w-full h-full object-cover"
          style={{ transition: "transform 0.3s" }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)" }}
        />
        {/* Popular badge */}
        {item.popular && (
          <div
            className="absolute flex items-center gap-1.5"
            style={{
              top: "10px",
              [isRTL ? "right" : "left"]: "10px",
              padding: "5px 10px",
              borderRadius: theme.radiusFull,
              backgroundColor: categoryColor,
              boxShadow: `0 4px 12px ${categoryColor}50`,
            }}
          >
            <Heart size={12} color="#fff" fill="#fff" />
            <span style={{ fontFamily, fontSize: "11px", fontWeight: WEIGHT.bold, color: "#fff" }}>
              {isRTL ? "شائع" : "Popular"}
            </span>
          </div>
        )}
        {/* Info icon — tap to see description (center card only) */}
        {isCenter && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }}
            className="absolute flex items-center justify-center cursor-pointer active:scale-90 transition-all"
            style={{
              top: "10px",
              [isRTL ? "left" : "right"]: "10px",
              width: "32px", height: "32px",
              borderRadius: theme.radiusFull,
              backgroundColor: showInfo ? "#fff" : "rgba(0,0,0,0.45)",
              backdropFilter: "blur(8px)",
              border: "none", outline: "none",
            }}
          >
            <Info size={16} color={showInfo ? theme.primary : "#fff"} />
          </button>
        )}
        {/* Calories badge */}
        <div
          className="absolute flex items-center gap-1"
          style={{
            bottom: "10px",
            [isRTL ? "left" : "right"]: "10px",
            padding: "4px 10px",
            borderRadius: theme.radiusFull,
            backgroundColor: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Flame size={13} color="#F59E0B" />
          <span style={{ fontFamily, fontSize: "12px", fontWeight: WEIGHT.semibold, color: "rgba(255,255,255,0.9)" }}>
            {item.calories} {isRTL ? "سعرة" : "kcal"}
          </span>
        </div>

        {/* Description overlay — shown on info tap */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex flex-col justify-end p-4"
              style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
              onClick={(e) => { e.stopPropagation(); setShowInfo(false); }}
            >
              <p style={{
                fontFamily,
                ...TEXT_STYLE.body,
                color: "#fff",
                margin: 0,
                lineHeight: LEADING.relaxed,
              }}>
                {loc(item.description)}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {item.tags.map((tag) => {
                  const cfg = TAG_CONFIG[tag];
                  return (
                    <span
                      key={tag}
                      style={{
                        padding: "3px 8px",
                        borderRadius: theme.radiusFull,
                        backgroundColor: `${cfg.color}30`,
                        fontFamily, fontSize: "11px", fontWeight: WEIGHT.bold, color: "#fff",
                      }}
                    >
                      {loc(cfg.label)}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content — compact: name + tags + controls */}
      <div className="flex flex-col px-4 pt-3 pb-4 gap-2">
        <div>
          <h3 style={{ fontFamily, ...TEXT_STYLE.cardTitle, color: theme.textHeading, margin: 0 }}>
            {loc(item.name)}
          </h3>
          {/* Description — only on center card */}
          {isCenter && (
            <p style={{
              fontFamily,
              ...TEXT_STYLE.body,
              color: theme.textMuted,
              margin: "4px 0 0",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical" as any,
              overflow: "hidden",
            }}>
              {loc(item.description)}
            </p>
          )}
        </div>

        {/* Add / Quantity controls — only on center card */}
        {isCenter && (
          <div className="flex items-center gap-3">
            {qty === 0 ? (
              <button
                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                className="flex-1 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform"
                style={{
                  height: "56px",
                  borderRadius: theme.radiusMd,
                  backgroundColor: theme.primary,
                  border: "none",
                  outline: "none",
                  boxShadow: `0 4px 16px ${theme.primary}40`,
                }}
              >
                <Plus size={20} color="#fff" />
                <span style={{ fontFamily, ...TEXT_STYLE.button, color: "#fff" }}>
                  {isRTL ? "أضف" : "Add"}
                </span>
              </button>
            ) : (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex-1 flex items-center justify-between"
                style={{
                  height: "44px",
                  borderRadius: theme.radiusMd,
                  backgroundColor: `${theme.primary}10`,
                  border: `1px solid ${theme.primary}25`,
                  padding: "0 6px",
                }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(); }}
                  className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                  style={{
                    width: "36px", height: "36px",
                    borderRadius: theme.radiusSm,
                    backgroundColor: qty === 1 ? DANGER : theme.primary,
                    border: "none", outline: "none",
                  }}
                >
                  {qty === 1 ? <X size={18} color="#fff" /> : <Minus size={18} color="#fff" />}
                </button>
                <span style={{ fontFamily, ...TEXT_STYLE.button, color: theme.textHeading }}>{qty}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onAdd(); }}
                  className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                  style={{
                    width: "36px", height: "36px",
                    borderRadius: theme.radiusSm,
                    backgroundColor: theme.primary,
                    border: "none", outline: "none",
                  }}
                >
                  <Plus size={18} color="#fff" />
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * ORDER PREVIEW PANEL (sidebar next to menu)
 * ═══════════════════════════════════════════════════════════════════════════ */

function OrderPreviewPanel({
  cart,
  totalItems,
  totalCalories,
  specialNotes,
  onSpecialNotesChange,
  deliveryInfos,
  onAdd,
  onRemove,
  onPlaceOrder,
}: {
  cart: CartItem[];
  totalItems: number;
  totalCalories: number;
  specialNotes: string;
  onSpecialNotesChange: (v: string) => void;
  deliveryInfos: { label: string; detail: string; isPreOrder: boolean }[];
  onAdd: (item: MenuItem) => void;
  onRemove: (itemId: string) => void;
  onPlaceOrder: () => void;
}) {
  const { theme } = useTheme();
  const { isRTL, fontFamily } = useLocale();
  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        borderRadius: theme.radiusXl,
        backgroundColor: theme.surface,
        border: theme.cardBorder,
        boxShadow: SHADOW.lg,
      }}
    >
      {/* Header */}
      <div className="shrink-0 px-5 pt-5 pb-3" style={{ borderBottom: `1px solid ${theme.borderDefault}` }}>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: "36px", height: "36px",
              borderRadius: theme.radiusMd,
              backgroundColor: `${theme.primary}12`,
            }}
          >
            <ShoppingCart size={18} color={theme.primary} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 style={{ fontFamily, ...TEXT_STYLE.subtitle, color: theme.textHeading, margin: 0 }}>
              {isRTL ? "طلبك" : "Your Order"}
            </h3>
            <p style={{ fontFamily, ...TEXT_STYLE.micro, color: theme.textMuted, margin: 0 }}>
              {totalItems} {isRTL ? "عنصر" : `item${totalItems !== 1 ? "s" : ""}`} · {totalCalories} {isRTL ? "سعرة" : "kcal"}
            </p>
          </div>
        </div>
      </div>

      {/* Cart items list */}
      <div className="flex-1 min-h-0 overflow-y-auto food-scroll px-4 py-3 flex flex-col gap-2">
        {cart.map((ci) => (
          <div
            key={ci.menuItem.id}
            className="flex items-center gap-3"
            style={{
              padding: "8px",
              borderRadius: theme.radiusMd,
              backgroundColor: `${theme.primary}04`,
              border: `1px solid ${theme.borderDefault}`,
            }}
          >
            <ImageWithFallback
              src={ci.menuItem.image}
              alt={loc(ci.menuItem.name)}
              style={{
                width: "44px", height: "44px",
                borderRadius: theme.radiusSm,
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
            <div className="flex-1 min-w-0">
              <p style={{
                fontFamily,
                ...TEXT_STYLE.caption,
                fontWeight: WEIGHT.semibold,
                color: theme.textHeading,
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {loc(ci.menuItem.name)}
              </p>
              <p style={{ fontFamily, ...TEXT_STYLE.micro, color: theme.textMuted, margin: 0 }}>
                {ci.menuItem.calories * ci.quantity} {isRTL ? "سعرة" : "kcal"}
              </p>
            </div>
            {/* Qty controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onRemove(ci.menuItem.id)}
                className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                style={{
                  width: "28px", height: "28px",
                  borderRadius: theme.radiusSm,
                  backgroundColor: ci.quantity === 1 ? `${DANGER}12` : `${theme.primary}10`,
                  border: "none", outline: "none",
                }}
              >
                {ci.quantity === 1 ? <X size={14} color={DANGER} /> : <Minus size={14} color={theme.primary} />}
              </button>
              <span style={{ fontFamily, ...TEXT_STYLE.caption, fontWeight: WEIGHT.bold, color: theme.textHeading, width: "24px", textAlign: "center" }}>
                {ci.quantity}
              </span>
              <button
                onClick={() => onAdd(ci.menuItem)}
                className="flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                style={{
                  width: "28px", height: "28px",
                  borderRadius: theme.radiusSm,
                  backgroundColor: theme.primary,
                  border: "none", outline: "none",
                }}
              >
                <Plus size={14} color="#fff" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer — notes, delivery, place order */}
      <div className="shrink-0 px-4 pb-4 pt-3 flex flex-col gap-3" style={{ borderTop: `1px solid ${theme.borderDefault}` }}>
        {/* Special notes */}
        <textarea
          value={specialNotes}
          onChange={(e) => onSpecialNotesChange(e.target.value)}
          placeholder={isRTL ? "ملاحظات (حساسية، تفضيلات)..." : "Notes (allergies, preferences)..."}
          className="w-full resize-none"
          rows={2}
          style={{
            fontFamily,
            ...TEXT_STYLE.caption,
            color: theme.textHeading,
            backgroundColor: `${theme.primary}06`,
            border: `1px solid ${theme.borderDefault}`,
            borderRadius: theme.radiusMd,
            padding: "10px 12px",
            outline: "none",
          }}
        />

        {/* Delivery info */}
        {deliveryInfos.map((info, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock size={14} color={info.isPreOrder ? "#F59E0B" : theme.textMuted} />
              <span style={{ fontFamily, ...TEXT_STYLE.micro, color: theme.textBody }}>
                {info.label}
              </span>
            </div>
            <span style={{ fontFamily, ...TEXT_STYLE.micro, fontWeight: WEIGHT.bold, color: info.isPreOrder ? "#F59E0B" : theme.textHeading }}>
              {info.detail}
            </span>
          </div>
        ))}

        {/* Place order */}
        <button
          onClick={onPlaceOrder}
          className="w-full flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-transform"
          style={{
            height: "52px",
            borderRadius: theme.radiusMd,
            backgroundColor: theme.primary,
            border: "none",
            outline: "none",
            boxShadow: `0 6px 24px ${theme.primary}40`,
          }}
        >
          <ChefHat size={20} color="#fff" />
          <span style={{ fontFamily, ...TEXT_STYLE.buttonSm, color: "#fff" }}>
            {isRTL ? "تأكيد الطلب" : "Place Order"}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ReviewStep removed — merged into OrderPreviewPanel sidebar */

/* ═══════════════════════════════════════════════════════════════════════════
 * CONFIRMATION STEP
 * ═══════════════════════════════════════════════════════════════════════════ */

function ConfirmationStep({ orderNumber, totalItems, deliveryInfos, onClose, onViewOrders }: { orderNumber: string; totalItems: number; deliveryInfos: { label: string; detail: string; isPreOrder: boolean }[]; onClose: () => void; onViewOrders: () => void }) {
  const { theme } = useTheme();
  const { isRTL, fontFamily } = useLocale();

  return (
    <motion.div
      className="flex flex-col items-center gap-6 relative z-10 px-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      style={{ maxWidth: "600px", margin: "0 auto" }}
    >
      {/* Success card */}
      <div
        className="w-full flex flex-col items-center gap-6"
        style={{
          padding: "40px 32px",
          borderRadius: theme.radiusXl,
          backgroundColor: theme.surface,
          border: theme.cardBorder,
          boxShadow: SHADOW.lg,
        }}
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="flex items-center justify-center"
          style={{
            width: "100px", height: "100px",
            borderRadius: "50%",
            backgroundColor: "#22C55E15",
            border: "2px solid #22C55E30",
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.35 }}
            className="flex items-center justify-center"
            style={{
              width: "72px", height: "72px",
              borderRadius: "50%",
              backgroundColor: "#22C55E",
              boxShadow: "0 8px 32px rgba(34,197,94,0.35)",
            }}
          >
            <Check size={36} color="#fff" strokeWidth={3} />
          </motion.div>
        </motion.div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h2 style={{ fontFamily, fontSize: TYPE_SCALE["2xl"], fontWeight: WEIGHT.bold, color: theme.textHeading, lineHeight: LEADING.snug, margin: 0 }}>
            {isRTL ? "تم تقديم طلبك!" : "Order Placed!"}
          </h2>
          <p style={{ fontFamily, ...TEXT_STYLE.body, color: theme.textBody, margin: 0 }}>
            {deliveryInfos.some((d) => d.isPreOrder)
              ? (isRTL ? "تم حفظ تفضيلاتك! سيتم تجهيز وجبتك وتوصيلها في الموعد المحدد." : "Your preferences have been saved! Your meal will be delivered during the scheduled time.")
              : (isRTL ? "طلبك قيد التحضير. سيتم توصيل وجبتك خلال ٢٥–٣٥ دقيقة." : "Your order is being prepared. Delivery in 25–35 minutes.")}
          </p>
        </div>

        {/* Order number & delivery info */}
        <div
          className="w-full flex flex-col gap-4"
          style={{
            padding: "20px 24px",
            borderRadius: theme.radiusLg,
            backgroundColor: `${theme.primary}06`,
            border: `1px solid ${theme.borderDefault}`,
          }}
        >
          <div className="flex items-center justify-between">
            <span style={{ fontFamily, ...TEXT_STYLE.body, color: theme.textBody }}>
              {isRTL ? "رقم الطلب" : "Order Number"}
            </span>
            <span style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading, letterSpacing: "1px" }}>
              {orderNumber}
            </span>
          </div>
          <div style={{ borderTop: `1px solid ${theme.borderDefault}` }} />
          {deliveryInfos.map((info, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} color={info.isPreOrder ? "#F59E0B" : theme.textMuted} />
                <span style={{ fontFamily, ...TEXT_STYLE.body, color: theme.textBody }}>
                  {info.label}
                </span>
              </div>
              <span style={{ fontFamily, ...TEXT_STYLE.bodyEmphasis, color: info.isPreOrder ? "#F59E0B" : theme.textHeading }}>
                {info.detail}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Notification hint */}
      <motion.div
        className="w-full flex items-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        style={{
          padding: "18px 24px",
          borderRadius: theme.radiusLg,
          backgroundColor: `${theme.primary}08`,
          border: `1px solid ${theme.primary}20`,
        }}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: "44px", height: "44px",
            borderRadius: theme.radiusMd,
            backgroundColor: `${theme.primary}15`,
          }}
        >
          <Bell size={22} color={theme.primary} />
        </div>
        <p style={{ fontFamily, ...TEXT_STYLE.body, color: theme.textBody, margin: 0, flex: 1 }}>
          {isRTL
            ? "سيتم إرسال تحديثات حالة طلبك إلى لوحة الإشعارات. اضغط على جرس الإشعارات في الشاشة الرئيسية لمتابعة طلبك."
            : "Order status updates will be sent to your notifications panel. Tap the bell icon on the home screen to track your order."}
        </p>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="w-full flex gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        <button
          onClick={onClose}
          className="flex-1 flex items-center justify-center gap-3 cursor-pointer active:scale-[0.97] transition-transform"
          style={{
            height: "60px",
            borderRadius: theme.radiusMd,
            backgroundColor: theme.primary,
            border: "none",
            outline: "none",
            boxShadow: `0 8px 32px ${theme.primary}40`,
          }}
        >
          <Bell size={22} color="#fff" />
          <span style={{ fontFamily, ...TEXT_STYLE.button, color: "#fff" }}>
            {isRTL ? "العودة للرئيسية" : "Back to Home"}
          </span>
        </button>
        <button
          onClick={onViewOrders}
          className="flex items-center justify-center gap-3 cursor-pointer active:scale-[0.97] transition-transform"
          style={{
            height: "60px",
            padding: "0 28px",
            borderRadius: theme.radiusMd,
            backgroundColor: theme.surface,
            border: theme.cardBorder,
            outline: "none",
            boxShadow: SHADOW.md,
          }}
        >
          <ClipboardList size={20} color={theme.textBody} />
          <span style={{ fontFamily, ...TEXT_STYLE.button, color: theme.textBody }}>
            {isRTL ? "طلباتي" : "My Orders"}
          </span>
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * ORDERS LOG STEP
 * ═══════════════════════════════════════════════════════════════════════════ */

const STATUS_CONFIG: Record<OrderStatus, { label: { en: string; ar: string }; color: string; icon: React.ComponentType<any> }> = {
  "preparing":     { label: { en: "Preparing", ar: "قيد التحضير" },     color: "#F59E0B", icon: ChefHat },
  "quality-check": { label: { en: "Quality Check", ar: "فحص الجودة" },  color: "#3B82F6", icon: Heart },
  "delivering":    { label: { en: "On the Way", ar: "في الطريق" },      color: "#8B5CF6", icon: Utensils },
  "delivered":     { label: { en: "Delivered", ar: "تم التوصيل" },       color: "#22C55E", icon: Check },
};

function OrdersLogStep({ onBack, onClose, onReorder }: {
  onBack: () => void;
  onClose: () => void;
  onReorder: (items: { id: string; quantity: number }[]) => void;
}) {
  const { theme } = useTheme();
  const { isRTL, fontFamily } = useLocale();
  const { activeOrders, pastOrders } = useOrders();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const loc = (v: { en: string; ar: string }) => isRTL ? v.ar : v.en;
  const [tab, setTab] = useState<"active" | "past">("active");

  const displayOrders = tab === "active" ? activeOrders : pastOrders;

  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: Date) => {
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    if (isToday) return isRTL ? "اليوم" : "Today";
    if (isYesterday) return isRTL ? "أمس" : "Yesterday";
    return d.toLocaleDateString(isRTL ? "ar-SA" : "en-US", { month: "short", day: "numeric" });
  };

  return (
    <>
      {/* Header */}
      <div className="shrink-0 flex items-center gap-5 px-12 pt-10 pb-6 relative z-10">
        <button
          onClick={onBack}
          className="flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
          style={{
            width: "52px", height: "52px",
            borderRadius: theme.radiusMd,
            backgroundColor: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <BackArrow size={24} color="#fff" />
        </button>
        <div className="flex items-center gap-4 flex-1">
          <div
            className="flex items-center justify-center"
            style={{
              width: "52px", height: "52px",
              borderRadius: theme.radiusMd,
              backgroundColor: "rgba(255,255,255,0.15)",
            }}
          >
            <ClipboardList size={26} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily, ...TEXT_STYLE.display, fontSize: "32px", color: "#fff", lineHeight: "36px" }}>
              {isRTL ? "طلباتي" : "My Orders"}
            </h2>
            <p style={{ fontFamily, ...TEXT_STYLE.caption, color: "rgba(255,255,255,0.6)", marginTop: "2px" }}>
              {isRTL
                ? `${activeOrders.length} نشط · ${pastOrders.length} سابق`
                : `${activeOrders.length} active · ${pastOrders.length} past`}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="shrink-0 px-12 pb-5 relative z-10">
        <div className="flex gap-3">
          {(["active", "past"] as const).map((t) => {
            const isActive = tab === t;
            const count = t === "active" ? activeOrders.length : pastOrders.length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
                style={{
                  height: "48px",
                  padding: "0 24px",
                  borderRadius: theme.radiusFull,
                  backgroundColor: isActive ? "#fff" : "rgba(255,255,255,0.08)",
                  border: isActive ? "none" : "1px solid rgba(255,255,255,0.12)",
                  outline: "none",
                }}
              >
                <span style={{ fontFamily, ...TEXT_STYLE.subtitle, color: isActive ? theme.primaryDark : "rgba(255,255,255,0.8)" }}>
                  {t === "active" ? (isRTL ? "الطلبات النشطة" : "Active Orders") : (isRTL ? "الطلبات السابقة" : "Past Orders")}
                </span>
                <span
                  className="flex items-center justify-center"
                  style={{
                    minWidth: "24px", height: "24px",
                    borderRadius: theme.radiusFull,
                    backgroundColor: isActive ? theme.primary : "rgba(255,255,255,0.15)",
                    fontFamily, fontSize: TYPE_SCALE.xs, fontWeight: WEIGHT.bold,
                    color: "#fff", padding: "0 6px",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders list */}
      <div className="flex-1 min-h-0 px-12 pb-8 relative z-10">
        <div className="food-scroll overflow-y-auto h-full pr-2 flex flex-col gap-4">
          {displayOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ minHeight: "300px" }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: "80px", height: "80px",
                  borderRadius: theme.radiusLg,
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
              >
                <ClipboardList size={36} color="rgba(255,255,255,0.3)" />
              </div>
              <p style={{ fontFamily, ...TEXT_STYLE.subtitle, color: "rgba(255,255,255,0.4)" }}>
                {tab === "active"
                  ? (isRTL ? "لا توجد طلبات نشطة" : "No active orders")
                  : (isRTL ? "لا توجد طلبات سابقة" : "No past orders")}
              </p>
            </div>
          ) : (
            displayOrders.map((order, i) => {
              const statusCfg = STATUS_CONFIG[order.status];
              const StatusIcon = statusCfg.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    padding: "20px 24px",
                    borderRadius: theme.radiusLg,
                    backgroundColor: theme.surface,
                    border: theme.cardBorder,
                    boxShadow: SHADOW.md,
                  }}
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span style={{ fontFamily, fontSize: TYPE_SCALE.lg, fontWeight: WEIGHT.bold, color: theme.textHeading }}>
                        {order.orderNumber}
                      </span>
                      <span style={{ fontFamily, ...TEXT_STYLE.caption, color: theme.textMuted }}>
                        {formatDate(order.placedAt)} · {formatTime(order.placedAt)}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-2"
                      style={{
                        padding: "6px 14px",
                        borderRadius: theme.radiusFull,
                        backgroundColor: `${statusCfg.color}15`,
                        border: `1px solid ${statusCfg.color}30`,
                      }}
                    >
                      <StatusIcon size={16} color={statusCfg.color} />
                      <span style={{ fontFamily, fontSize: TYPE_SCALE.xs, fontWeight: WEIGHT.bold, color: statusCfg.color }}>
                        {loc(statusCfg.label)}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                      {order.items.map((item, j) => (
                        <span key={j} style={{ fontFamily, ...TEXT_STYLE.body, color: theme.textBody }}>
                          {item.quantity}x {loc(item.name)}{j < order.items.length - 1 ? "," : ""}
                        </span>
                      ))}
                    </div>
                    <span style={{ fontFamily, ...TEXT_STYLE.caption, color: theme.textMuted }}>
                      {order.totalCalories} kcal
                    </span>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span
                        style={{
                          fontFamily, fontSize: TYPE_SCALE.xs, fontWeight: WEIGHT.semibold,
                          color: theme.textMuted, padding: "4px 10px",
                          borderRadius: theme.radiusSm, backgroundColor: `${theme.primary}08`,
                        }}
                      >
                        {order.mealType}
                      </span>
                      {order.status !== "delivered" && (
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} color={theme.textMuted} />
                          <span style={{ fontFamily, ...TEXT_STYLE.caption, color: theme.textMuted }}>
                            {order.estimatedDelivery}
                          </span>
                        </div>
                      )}
                      {order.specialNotes && (
                        <span style={{ fontFamily, ...TEXT_STYLE.caption, color: theme.textMuted }}>
                          {isRTL ? "ملاحظة:" : "Note:"} {order.specialNotes}
                        </span>
                      )}
                    </div>
                    {order.status === "delivered" && (
                      <button
                        onClick={() => onReorder(order.items.map((it) => ({ id: it.id, quantity: it.quantity })))}
                        className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                        style={{
                          height: "40px",
                          padding: "0 16px",
                          borderRadius: theme.radiusMd,
                          backgroundColor: `${theme.primary}10`,
                          border: `1px solid ${theme.primary}20`,
                          outline: "none",
                        }}
                      >
                        <RotateCcw size={16} color={theme.primary} />
                        <span style={{ fontFamily, ...TEXT_STYLE.buttonSm, color: theme.primary }}>
                          {isRTL ? "إعادة الطلب" : "Reorder"}
                        </span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}