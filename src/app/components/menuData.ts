/* ═══════════════════════════════════════════════════════════════════════════
 * menuData.ts — Fakeeh Hospital Menu Data (source: Fakeeh Menu - Diets x Days.pdf)
 *
 * 8 diets:
 *   ALL-DAYS (same menu every day):  Chemotherapy, Kids, OB
 *   DAY-SPECIFIC (varies Sun–Sat):   Diabetic, Low Potassium, Low Sodium, Regular, Soft Diet
 *
 * For day-specific diets, breakfast is constant across all days.
 * Only lunch and dinner change per weekday.
 * ═══════════════════════════════════════════════════════════════════════════ */

import {
  Droplets, Heart, FlaskConical, Baby, User, Utensils, Star, Soup, ClipboardList,
} from "lucide-react";

/* ── Types ── */
export type DietType =
  | "chemotherapy" | "diabetic" | "kids" | "low-potassium"
  | "low-sodium" | "ob" | "regular" | "soft-diet";

export type MealId = "breakfast" | "lunch" | "dinner";
export type GroupMode = "choose-1" | "choose-2" | "included";

export interface GroupItem {
  id: string;
  name: { en: string; ar: string };
  image?: string;
  isForAll?: boolean;
}

export interface MenuGroup {
  id: string;
  label: { en: string; ar: string };
  mode: GroupMode;
  items: GroupItem[];
}

/* ── Photo URLs (Unsplash) ── */
const P = {
  breakfastBg: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1200&auto=format&fit=crop",
  lunchBg:     "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop",
  dinnerBg:    "https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=1200&auto=format&fit=crop",
  cheese:      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=300&auto=format&fit=crop",
  milk:        "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=300&auto=format&fit=crop",
  bread:       "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop",
  omelette:    "https://images.unsplash.com/photo-1510693206972-df098062cb71?q=80&w=300&auto=format&fit=crop",
  scrambledEgg:"https://images.unsplash.com/photo-1612240498936-65f5101365d2?q=80&w=300&auto=format&fit=crop",
  shakshouka:  "https://images.unsplash.com/photo-1590330297626-d7aff25a0431?q=80&w=300&auto=format&fit=crop",
  foul:        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=300&auto=format&fit=crop",
  oats:        "https://images.unsplash.com/photo-1517673132405-a56a933b168d?q=80&w=300&auto=format&fit=crop",
  cornFlakes:  "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=300&auto=format&fit=crop",
  fruit:       "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=300&auto=format&fit=crop",
  water:       "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=300&auto=format&fit=crop",
  vegSoup:     "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=300&auto=format&fit=crop",
  greenSalad:  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300&auto=format&fit=crop",
  grilledFish: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=300&auto=format&fit=crop",
  beefSteak:   "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=300&auto=format&fit=crop",
  rice:        "https://images.unsplash.com/photo-1474483897765-dfa4f7e45c74?q=80&w=300&auto=format&fit=crop",
  pasta:       "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?q=80&w=300&auto=format&fit=crop",
  vegMix:      "https://images.unsplash.com/photo-1518977676405-d5f5e8a756c9?q=80&w=300&auto=format&fit=crop",
  fruitJelly:  "https://images.unsplash.com/photo-1558024920-b41e1887dc32?q=80&w=300&auto=format&fit=crop",
  custard:     "https://images.unsplash.com/photo-1488900128323-21503983a07e?q=80&w=300&auto=format&fit=crop",
  hummus:      "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?q=80&w=300&auto=format&fit=crop",
  croissant:   "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=300&auto=format&fit=crop",
  sandwich:    "https://images.unsplash.com/photo-1592415486689-125cbbfcbee2?q=80&w=300&auto=format&fit=crop",
  grilledChicken:"https://images.unsplash.com/photo-1604382440115-5f730e6ede1f?q=80&w=300&auto=format&fit=crop",
  fruitSalad:  "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=300&auto=format&fit=crop",
  juice:       "https://images.unsplash.com/photo-1534353473418-4cfa0ea1e78f?q=80&w=300&auto=format&fit=crop",
  hashbrown:   "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=300&auto=format&fit=crop",
  boiledEgg:   "https://images.unsplash.com/photo-1498654077810-12c21d4d6dc3?q=80&w=300&auto=format&fit=crop",
  burger:      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop",
  nuggets:     "https://images.unsplash.com/photo-1562802378-063ec186a863?q=80&w=300&auto=format&fit=crop",
  fishFingers: "https://images.unsplash.com/photo-1516100882582-96c3a05fe590?q=80&w=300&auto=format&fit=crop",
  iceCream:    "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=300&auto=format&fit=crop",
  brownies:    "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=300&auto=format&fit=crop",
  fries:       "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?q=80&w=300&auto=format&fit=crop",
  mashedPotato:"https://images.unsplash.com/photo-1568708167226-7df2f71cd0e9?q=80&w=300&auto=format&fit=crop",
  pancakes:    "https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=300&auto=format&fit=crop",
  sausage:     "https://images.unsplash.com/photo-1529059356018-b25dd2e6c6a1?q=80&w=300&auto=format&fit=crop",
  turkey:      "https://images.unsplash.com/photo-1529059356018-b25dd2e6c6a1?q=80&w=300&auto=format&fit=crop",
  yogurt:      "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=300&auto=format&fit=crop",
};

export { P as FOOD_PHOTOS };

/* ── Auto-assign images based on item name keywords ── */
function autoImg(en: string): string {
  const e = en.toLowerCase();
  if (e.includes("soup") || e.includes("orzo") || e.includes("harira") || e.includes("broth")) return P.vegSoup;
  if (e.includes("salad") || e.includes("coleslaw") || e.includes("taboul") || e.includes("fattoush") || e.includes("moutabe") || e.includes("rocca")) return P.greenSalad;
  if (e.includes("fish") || e.includes("samak") || e.includes("sayadi") || e.includes("seafood") || e.includes("tajine") || e.includes("tuna")) return P.grilledFish;
  if (e.includes("chicken") || e.includes("poultry") || e.includes("fajita") || e.includes("eminesh") || e.includes("chasseur")) return P.grilledChicken;
  if (e.includes("beef") || e.includes("steak") || e.includes("meat") || e.includes("veal") || e.includes("lamb") || e.includes("kofta") || e.includes("kabab") || e.includes("kabsa") || e.includes("mandi") || e.includes("goulash") || e.includes("kibbeh") || e.includes("blanquette") || e.includes("stroganoff") || e.includes("dawood") || e.includes("roast")) return P.beefSteak;
  if (e.includes("rice") || e.includes("biryani") || e.includes("saffron rice") || e.includes("vermicelli rice")) return P.rice;
  if (e.includes("pasta") || e.includes("spaghetti") || e.includes("penne") || e.includes("fettuccin") || e.includes("noodle") || e.includes("couscous") || e.includes("aglio") || e.includes("arabiata") || e.includes("pomodoro") || e.includes("lasagne") || e.includes("schezwan") || e.includes("macaroni")) return P.pasta;
  if (e.includes("omelette") || e.includes("omelet") || e.includes("scrambled")) return P.omelette;
  if (e.includes("boiled egg") || e.includes("poached egg") || e.includes("hard boiled")) return P.boiledEgg;
  if (e.includes("egg")) return P.scrambledEgg;
  if (e.includes("bread") || e.includes("toast") || e.includes("roll") || e.includes("khubz") || e.includes("samoli")) return P.bread;
  if (e.includes("cheese") || e.includes("platter") || e.includes("labn") || e.includes("labna")) return P.cheese;
  if (e.includes("yogurt") || e.includes("yoghurt") || e.includes("laban") || e.includes("raita")) return P.yogurt;
  if (e.includes("milk")) return P.milk;
  if (e.includes("fruit") && !e.includes("juice")) return P.fruit;
  if (e.includes("water bottle")) return P.water;
  if (e.includes("juice") || e.includes("tetra")) return P.juice;
  if (e.includes("corn flake") || e.includes("bran flake") || e.includes("muesli") || e.includes("choco flake") || e.includes("rice krisp")) return P.cornFlakes;
  if (e.includes("oat")) return P.oats;
  if (e.includes("jelly") || e.includes("custard") || e.includes("pudding") || e.includes("mousse") || e.includes("panna cotta")) return P.fruitJelly;
  if (e.includes("cake") || e.includes("brownie") || e.includes("tart") || e.includes("namoura")) return P.brownies;
  if (e.includes("croissant") || e.includes("danish") || e.includes("pastry") || e.includes("muffin") || e.includes("cinnamon")) return P.croissant;
  if (e.includes("sandwich")) return P.sandwich;
  if (e.includes("hummus")) return P.hummus;
  if (e.includes("foul") || e.includes("falafel") || e.includes("medamma") || e.includes("mudamma") || e.includes("baked bean")) return P.foul;
  if (e.includes("shakshuka") || e.includes("shakshouka")) return P.shakshouka;
  if (e.includes("ice cream")) return P.iceCream;
  if (e.includes("hash brown") || e.includes("potato") || e.includes("fries") || e.includes("wedge") || e.includes("smiley")) return P.hashbrown;
  if (e.includes("vegetable") || e.includes("roasted") || e.includes("sauteed") || e.includes("sautéed") || e.includes("grilled veg") || e.includes("ratatouille") || e.includes("jaffrezi")) return P.vegMix;
  if (e.includes("nugget") || e.includes("strip")) return P.nuggets;
  if (e.includes("burger")) return P.burger;
  if (e.includes("fish finger")) return P.fishFingers;
  if (e.includes("pancake") || e.includes("french toast")) return P.pancakes;
  if (e.includes("sausage") || e.includes("bacon") || e.includes("turkey") || e.includes("mortadella")) return P.sausage;
  if (e.includes("cucumber") || e.includes("tomato") || e.includes("lettuce") || e.includes("olive") || e.includes("corn on")) return P.greenSalad;
  if (e.includes("butter") || e.includes("jam") || e.includes("marmalade") || e.includes("honey")) return P.cheese;
  return P.vegMix;
}

/* ── Compact data builder ── */
type I = [string, string]; // [en, ar]
interface CG { id: string; en: string; ar: string; mode: GroupMode; items: I[]; }

/* ── Arabic ordinals for group labels ── */
const GROUP_AR: Record<string, string> = {
  A: "المجموعة الأولى", B: "المجموعة الثانية", C: "المجموعة الثالثة",
  D: "المجموعة الرابعة", E: "المجموعة الخامسة", F: "المجموعة السادسة",
  G: "المجموعة السابعة", H: "المجموعة الثامنة",
};

function mkGroups(gs: CG[], prefix: string): MenuGroup[] {
  return gs.map((g) => {
    const isIncluded = g.mode === "included";
    // Single-letter IDs (A, B, C…) → "Group A / المجموعة الأولى" (as printed in the PDF)
    // Descriptive IDs (CEREAL, EGGS, SIDE1…) → use the actual en/ar name from the data
    const isSingleLetter = /^[A-Z]$/.test(g.id);
    const label = isSingleLetter
      ? { en: `Group ${g.id}`, ar: GROUP_AR[g.id] || `المجموعة ${g.id}` }
      : { en: g.en, ar: g.ar };
    return {
      id: g.id,
      label,
      mode: g.mode,
      items: g.items.map(([en, ar], i) => ({
        id: `${prefix}-${g.id.toLowerCase()}-${i + 1}`,
        name: { en, ar },
        image: autoImg(en),
        ...(isIncluded ? { isForAll: true } : {}),
      })),
    };
  });
}

/* ── Diet config ── */
export const DIET_CONFIG: Record<DietType, {
  label: { en: string; ar: string };
  color: string;
  bg: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}> = {
  "chemotherapy":  { label: { en: "Chemotherapy",   ar: "العلاج الكيميائي" },  color: "#7C3AED", bg: "#F5F3FF", icon: FlaskConical },
  "diabetic":      { label: { en: "Diabetic",       ar: "السكري" },            color: "#2563EB", bg: "#EFF6FF", icon: Droplets     },
  "kids":          { label: { en: "Kids Menu",      ar: "قائمة الأطفال" },      color: "#D97706", bg: "#FFFBEB", icon: Baby          },
  "low-potassium": { label: { en: "Low Potassium",  ar: "قليل البوتاسيوم" },   color: "#DB2777", bg: "#FDF2F8", icon: Heart          },
  "low-sodium":    { label: { en: "Low Sodium",     ar: "قليل الصوديوم" },     color: "#059669", bg: "#ECFDF5", icon: Droplets       },
  "ob":            { label: { en: "OB Patients",    ar: "مرضى التوليد" },      color: "#B45309", bg: "#FEF3C7", icon: Star           },
  "regular":       { label: { en: "Regular",        ar: "عادي" },              color: "#A16207", bg: "#FEF9C3", icon: Utensils       },
  "soft-diet":     { label: { en: "Soft Diet",      ar: "نظام غذائي لين" },    color: "#92400E", bg: "#FEF3C7", icon: Soup           },
};

export const ALL_DIETS: DietType[] = [
  "regular", "diabetic", "low-sodium", "low-potassium", "soft-diet", "chemotherapy", "ob", "kids",
];

/* ═══════════════════════════════════════════════════════════════════════════
 * CHEMOTHERAPY — All Days (Page 1)
 * Serving: B 8–9 AM, L 1–2 PM, D 7–8 PM
 * ═══════════════════════════════════════════════════════════════════════════ */

const CHEMO_BREAKFAST = mkGroups([
  { id: "A", en: "Choose 2 Main", ar: "اختيار نوعين", mode: "choose-2", items: [
    ["Chicken Sandwich", "ساندوتش دجاج"], ["Tuna Sandwich", "ساندوتش تونة"],
    ["White Cheese Sandwich", "ساندوتش جبنة بيضاء"], ["Yellow Cheese Sandwich", "ساندوتش جبنة صفراء"],
    ["Boiled Egg Sandwich", "ساندوتش بيض مسلوق"], ["Plain Omelette Sandwich", "ساندوتش أومليت سادة"],
    ["Cheese Omelette Sandwich", "ساندوتش أومليت جبنة"], ["Labneh Sandwich", "ساندوتش لبنه"],
    ["Plain Croissant", "كرواسان سادة"], ["Zaatar Croissant", "كرواسان زعتر"],
    ["Cheese Croissant", "كرواسان جبنة"],
  ]},
  { id: "BREAD", en: "Choose 1 Bread", ar: "اختيار نوع الخبز", mode: "choose-1", items: [
    ["Toast", "توست"], ["Arabic Bread", "خبز عربي"], ["Samoli", "صامولي"],
  ]},
  { id: "B", en: "Dessert", ar: "الحلوى", mode: "choose-1", items: [
    ["English Cake", "انجلش كيك"], ["Fruit", "فواكه"], ["Jelly", "جلي"], ["Fruit Salad", "سلطة فواكه"],
  ]},
  { id: "C", en: "Complimentary", ar: "يأتي مع وجبتك", mode: "included", items: [
    ["Water Bottle", "مياه معدنية"], ["Tetra Pack Juice", "عصير"],
  ]},
], "ch-b");

const CHEMO_LUNCH = mkGroups([
  { id: "A", en: "Choose 1 Sandwich", ar: "اختيار ساندوتش", mode: "choose-1", items: [
    ["Chicken Sandwich", "ساندوتش دجاج"], ["Tuna Sandwich", "ساندوتش تونة"],
    ["White Cheese Sandwich", "ساندوتش جبنة بيضاء"], ["Yellow Cheese Sandwich", "ساندوتش جبنة صفراء"],
    ["Boiled Egg Sandwich", "ساندوتش بيض مسلوق"], ["Plain Omelette Sandwich", "ساندوتش أومليت سادة"],
    ["Cheese Omelette Sandwich", "ساندوتش أومليت جبنة"],
    ["Plain Croissant", "كرواسان سادة"], ["Zaatar Croissant", "كرواسان زعتر"],
    ["Cheese Croissant", "كرواسان جبنة"],
  ]},
  { id: "BREAD", en: "Choose 1 Bread", ar: "اختيار نوع الخبز", mode: "choose-1", items: [
    ["Toast", "توست"], ["Arabic Bread", "خبز عربي"], ["Samoli", "صامولي"],
  ]},
  { id: "B", en: "Main Course", ar: "الطبق الرئيسي", mode: "choose-1", items: [
    ["Chicken Kofta with White Rice", "كفتة دجاج مع أرز أبيض"],
    ["Beef Kofta with White Rice", "كفتة لحم مع أرز أبيض"],
    ["Grilled Chicken with White Rice", "دجاج مشوي مع أرز أبيض"],
    ["Beef Steak with White Rice", "ستيك لحم مع أرز أبيض"],
    ["Grilled Fish with White Rice", "سمك مشوي مع أرز أبيض"],
  ]},
  { id: "C", en: "Salad", ar: "سلطة", mode: "included", items: [
    ["Green Salad", "سلطة خضراء"],
  ]},
  { id: "D", en: "Dessert", ar: "الحلوى", mode: "choose-1", items: [
    ["English Cake", "انجلش كيك"], ["Fruit", "فواكه"], ["Jelly", "جلي"], ["Fruit Salad", "سلطة فواكه"],
  ]},
  { id: "E", en: "Complimentary", ar: "يأتي مع وجبتك", mode: "included", items: [
    ["Water Bottle", "مياه معدنية"], ["Tetra Pack Juice", "عصير"],
  ]},
], "ch-l");

const CHEMO_DINNER = mkGroups([
  { id: "A", en: "Choose 1 Sandwich", ar: "اختيار ساندوتش", mode: "choose-1", items: [
    ["Chicken Sandwich", "ساندوتش دجاج"], ["Tuna Sandwich", "ساندوتش تونة"],
    ["White Cheese Sandwich", "ساندوتش جبنة بيضاء"], ["Yellow Cheese Sandwich", "ساندوتش جبنة صفراء"],
    ["Boiled Egg Sandwich", "ساندوتش بيض مسلوق"], ["Plain Omelette Sandwich", "ساندوتش أومليت سادة"],
    ["Cheese Omelette Sandwich", "ساندوتش أومليت جبنة"],
    ["Plain Croissant", "كرواسان سادة"], ["Zaatar Croissant", "كرواسان زعتر"],
    ["Cheese Croissant", "كرواسان جبنة"],
  ]},
  { id: "BREAD", en: "Choose 1 Bread", ar: "اختيار نوع الخبز", mode: "choose-1", items: [
    ["Toast", "توست"], ["Arabic Bread", "خبز عربي"], ["Samoli", "صامولي"],
  ]},
  { id: "B", en: "Main Course", ar: "الطبق الرئيسي", mode: "choose-1", items: [
    ["Chicken Kofta with White Rice", "كفتة دجاج مع أرز أبيض"],
    ["Beef Kofta with White Rice", "كفتة لحم مع أرز أبيض"],
    ["Grilled Chicken with White Rice", "دجاج مشوي مع أرز أبيض"],
    ["Beef Steak with White Rice", "ستيك لحم مع أرز أبيض"],
    ["Grilled Fish with White Rice", "سمك مشوي مع أرز أبيض"],
  ]},
  { id: "C", en: "Salad", ar: "سلطة", mode: "included", items: [
    ["Green Salad", "سلطة خضراء"],
  ]},
  { id: "D", en: "Dessert", ar: "الحلوى", mode: "choose-1", items: [
    ["English Cake", "انجلش كيك"], ["Fruit", "فواكه"], ["Jelly", "جلي"], ["Fruit Salad", "سلطة فواكه"],
  ]},
  { id: "E", en: "Complimentary", ar: "يأتي مع وجبتك", mode: "included", items: [
    ["Water Bottle", "مياه معدنية"], ["Tetra Pack Juice", "عصير"],
  ]},
], "ch-d");

/* ═══════════════════════════════════════════════════════════════════════════
 * KIDS MENU — All Days (Page 9)
 * Serving: B 8–9 AM, L 1–2 PM, D 7–8 PM
 * Breakfast has Hot/Cold branching (handled by the component)
 * ═══════════════════════════════════════════════════════════════════════════ */

/* Shared breakfast groups (both hot & cold get these) */
const KIDS_BREAKFAST_SHARED = mkGroups([
  { id: "ACCOMP", en: "Accompaniments", ar: "الإضافات", mode: "choose-1", items: [
    ["Butter", "زبدة"], ["Margarine", "مارجرين"],
    ["Strawberry Jam", "مربى فراولة"], ["Orange Marmalade", "مربى برتقال"],
    ["Peanut Butter", "زبدة فول سوداني"],
  ]},
  { id: "CEREAL", en: "Cereals", ar: "الحبوب", mode: "choose-1", items: [
    ["Cornflakes", "كورن فليكس"], ["Choco Cornflakes", "شوكو كورن فليكس"],
    ["Bran Flakes", "رقائق النخالة"], ["Muesli", "موسلي"], ["Rice Krispies", "رايس كرسبي"],
  ]},
  { id: "FRUIT", en: "Fruit", ar: "الفواكه", mode: "choose-1", items: [
    ["Orange", "برتقال"], ["Apple", "تفاح"], ["Banana", "موز"], ["Sliced Fruit", "فاكهة مقطعة"],
  ]},
  { id: "BAKED", en: "Baked Breads", ar: "المخبوزات", mode: "choose-1", items: [
    ["White Sliced Bread", "خبز أبيض شرائح"], ["White Toast Bread", "خبز توست أبيض"],
    ["White Khubz", "خبز أبيض"], ["Brown Khubz", "خبز أسمر"],
  ]},
  { id: "JUICE", en: "Fruit Juice", ar: "عصير فاكهة", mode: "choose-1", items: [
    ["Orange Juice", "عصير برتقال"], ["Apple Juice", "عصير تفاح"],
    ["Pineapple Juice", "عصير أناناس"], ["Mango Juice", "عصير مانجو"],
  ]},
], "ki-b-sh");

/* Hot breakfast specific groups */
const KIDS_BREAKFAST_HOT = mkGroups([
  { id: "EGGS", en: "Eggs", ar: "البيض", mode: "choose-1", items: [
    ["Rolled Omelette - Plain", "أومليت سادة"], ["Rolled Omelette - Cheese", "أومليت جبنة"],
    ["Rolled Omelette - Mixed Vegetables", "أومليت خضار"], ["Poached Eggs", "بيض مسلوق بالماء"],
    ["Scrambled Eggs", "بيض مخفوق"], ["Hard Boiled Eggs", "بيض مسلوق"],
  ]},
  { id: "SIDE1", en: "Side Order 1", ar: "طبق جانبي ١", mode: "choose-1", items: [
    ["Beef Bacon", "بيكون لحم"], ["Smoked Turkey", "ديك رومي مدخن"],
    ["Chicken Sausage", "سجق دجاج"],
  ]},
  { id: "SIDE2", en: "Side Order 2", ar: "طبق جانبي ٢", mode: "choose-1", items: [
    ["Grilled Tomato Slices", "شرائح طماطم مشوية"], ["Hash Browns", "هاش براون"],
    ["Smiley Potato", "بطاطس مبتسمة"], ["Mushrooms", "فطر"],
    ["French Toast", "فرنش توست"], ["Foul Medammas", "فول مدمس"],
  ]},
], "ki-b-hot");

/* Cold breakfast specific groups */
const KIDS_BREAKFAST_COLD = mkGroups([
  { id: "COLD_MEATS", en: "Cold Meats", ar: "لحوم باردة", mode: "choose-1", items: [
    ["Turkey Ham", "لحم ديك رومي"], ["Chicken Mortadella", "مرتديلا دجاج"],
  ]},
  { id: "DAIRY", en: "Dairy", ar: "ألبان", mode: "choose-1", items: [
    ["Plain Yoghurt", "زبادي سادة"], ["Fruit Yoghurt", "زبادي بالفواكه"],
    ["Vanilla Dessert", "حلوى فانيليا"], ["Chocolate Dessert", "حلوى شوكولاته"],
    ["Sliced Cheese", "جبنة شرائح"], ["Low Fat Milk", "حليب قليل الدسم"],
    ["Full Fat Milk", "حليب كامل الدسم"], ["Strawberry Milk", "حليب فراولة"],
    ["Chocolate Milk", "حليب شوكولاته"], ["Vanilla Milk", "حليب فانيليا"],
  ]},
  { id: "COLD_SIDE", en: "Side Orders", ar: "أطباق جانبية", mode: "choose-1", items: [
    ["Sliced Tomato", "طماطم مقطعة"], ["Sliced Cucumber", "خيار مقطع"],
    ["Sliced Lettuce", "خس مقطع"], ["Olives", "زيتون"],
    ["Plain Croissant", "كرواسان سادة"], ["Danish Pastry", "فطيرة دانش"],
    ["Chocolate Chip Muffin", "مافن شوكولاته"], ["Cinnamon Roll", "لفائف القرفة"],
  ]},
], "ki-b-cold");

const KIDS_LUNCH = mkGroups([
  { id: "STARTERS", en: "Starters", ar: "المقبلات", mode: "choose-1", items: [
    ["Corn Soup", "شوربة ذرة"], ["Tomato Soup", "شوربة طماطم"],
    ["Chicken Soup", "شوربة دجاج"], ["Broccoli Soup", "شوربة بروكلي"],
    ["Mushroom Soup", "شوربة فطر"],
  ]},
  { id: "MAINS", en: "Mains", ar: "الأطباق الرئيسية", mode: "choose-1", items: [
    ["Cheese Burger", "تشيز برجر"], ["Chicken Nuggets (6 pcs)", "ناجتس دجاج (٦ قطع)"],
    ["Fish Fingers (6 pcs)", "أصابع سمك (٦ قطع)"], ["Spaghetti Bolognese", "سباغيتي بولونيز"],
    ["Grilled Chicken with Rice", "دجاج مشوي مع أرز"], ["Chicken Strips", "شرائح دجاج"],
    ["Meatball with Rice", "كرات لحم مع أرز"],
  ]},
  { id: "SIDE1", en: "Side Order 1", ar: "طبق جانبي ١", mode: "choose-1", items: [
    ["French Fries", "بطاطس مقلية"], ["Mashed Potato", "بطاطس مهروسة"],
    ["White Rice", "أرز أبيض"], ["Sautéed Vegetables", "خضار سوتيه"],
  ]},
  { id: "SIDE2", en: "Side Order 2", ar: "طبق جانبي ٢", mode: "choose-1", items: [
    ["Garden Salad", "سلطة خضراء"], ["Coleslaw Salad", "سلطة كول سلو"],
    ["Corn on The Cob", "ذرة مشوية"], ["Cucumber Sticks with Dip", "أصابع خيار مع صلصة"],
  ]},
  { id: "DESSERTS", en: "Desserts", ar: "الحلويات", mode: "choose-1", items: [
    ["Ice Cream", "آيس كريم"], ["Chocolate Brownie", "براوني شوكولاته"],
    ["Fresh Fruit", "فاكهة طازجة"], ["Rice Pudding", "أرز بالحليب"],
    ["Fruit Jelly", "جلي فواكه"], ["Plain Yoghurt", "زبادي سادة"],
  ]},
  { id: "DRINKS", en: "Drinks", ar: "المشروبات", mode: "choose-1", items: [
    ["Water Bottle", "مياه معدنية"], ["Fresh Orange Juice", "عصير برتقال طازج"],
    ["Fresh Apple Juice", "عصير تفاح طازج"], ["Tetra Pack Juice", "عصير"],
  ]},
], "ki-l");

/* Kids Dinner = same as Kids Lunch */
const KIDS_DINNER = mkGroups([
  { id: "STARTERS", en: "Starters", ar: "المقبلات", mode: "choose-1", items: [
    ["Corn Soup", "شوربة ذرة"], ["Tomato Soup", "شوربة طماطم"],
    ["Chicken Soup", "شوربة دجاج"], ["Broccoli Soup", "شوربة بروكلي"],
    ["Mushroom Soup", "شوربة فطر"],
  ]},
  { id: "MAINS", en: "Mains", ar: "الأطباق الرئيسية", mode: "choose-1", items: [
    ["Cheese Burger", "تشيز برجر"], ["Chicken Nuggets (6 pcs)", "ناجتس دجاج (٦ قطع)"],
    ["Fish Fingers (6 pcs)", "أصابع سمك (٦ قطع)"], ["Spaghetti Bolognese", "سباغيتي بولونيز"],
    ["Grilled Chicken with Rice", "دجاج مشوي مع أرز"], ["Chicken Strips", "شرائح دجاج"],
    ["Meatball with Rice", "كرات لحم مع أرز"],
  ]},
  { id: "SIDE1", en: "Side Order 1", ar: "طبق جانبي ١", mode: "choose-1", items: [
    ["French Fries", "بطاطس مقلية"], ["Mashed Potato", "بطاطس مهروسة"],
    ["White Rice", "أرز أبيض"], ["Sautéed Vegetables", "خضار سوتيه"],
  ]},
  { id: "SIDE2", en: "Side Order 2", ar: "طبق جانبي ٢", mode: "choose-1", items: [
    ["Garden Salad", "سلطة خضراء"], ["Coleslaw Salad", "سلطة كول سلو"],
    ["Corn on The Cob", "ذرة مشوية"], ["Cucumber Sticks with Dip", "أصابع خيار مع صلصة"],
  ]},
  { id: "DESSERTS", en: "Desserts", ar: "الحلويات", mode: "choose-1", items: [
    ["Ice Cream", "آيس كريم"], ["Chocolate Brownie", "براوني شوكولاته"],
    ["Fresh Fruit", "فاكهة طازجة"], ["Rice Pudding", "أرز بالحليب"],
    ["Fruit Jelly", "جلي فواكه"], ["Plain Yoghurt", "زبادي سادة"],
  ]},
  { id: "DRINKS", en: "Drinks", ar: "المشروبات", mode: "choose-1", items: [
    ["Water Bottle", "مياه معدنية"], ["Fresh Orange Juice", "عصير برتقال طازج"],
    ["Fresh Apple Juice", "عصير تفاح طازج"], ["Tetra Pack Juice", "عصير"],
  ]},
], "ki-d");

/* ═══════════════════════════════════════════════════════════════════════════
 * OB PATIENTS — All Days (Page 24)
 * Serving: B 8–10 AM, L 1–2 PM, D 7–8 PM
 * ═══════════════════════════════════════════════════════════════════════════ */

const OB_BREAKFAST = mkGroups([
  { id: "A", en: "Bread", ar: "الخبز", mode: "included", items: [
    ["Arabic Bread White", "خبز عربي أبيض"], ["Arabic Bread Brown", "خبز عربي أسمر"],
    ["Samoli Bread", "خبز صامولي"],
  ]},
  { id: "B", en: "Hot Items", ar: "أطباق ساخنة", mode: "choose-1", items: [
    ["Hash Brown", "هاش براون"], ["Grilled Tomato", "طماطم مشوية"],
    ["Potato Wedges", "بطاطس ودجز"],
  ]},
  { id: "C", en: "Cereals", ar: "حبوب الإفطار", mode: "choose-1", items: [
    ["Corn Flakes", "كورن فليكس"], ["Whole Bran Flakes", "رقائق القمح الكامل"],
  ]},
  { id: "D", en: "Cheese & Dairy", ar: "الأجبان والألبان", mode: "choose-1", items: [
    ["Cheese Platter", "طبق أجبان متنوع"], ["Labna", "لبنة"],
  ]},
  { id: "E", en: "Eggs", ar: "البيض", mode: "choose-1", items: [
    ["Espanola Omelette", "أومليت بالخضار"], ["Scrambled Egg", "بيض مخفوق"],
    ["Boiled Eggs", "بيض مسلوق"], ["Cheese Omelette", "أومليت جبنة"],
    ["Plain Omelette", "أومليت سادة"],
  ]},
  { id: "F", en: "Yogurt", ar: "الزبادي", mode: "choose-1", items: [
    ["Plain Yogurt", "زبادي سادة"], ["Fruit Yogurt", "زبادي بالفواكه"],
  ]},
  { id: "G", en: "Pastries", ar: "المعجنات", mode: "choose-1", items: [
    ["Croissant", "كرواسان سادة"], ["Muffin Cake", "كيك المافن"],
    ["Danish Pastry", "فطيرة الدانش"], ["Cinnamon Roll", "لفائف القرفة"],
  ]},
  { id: "H", en: "Complimentary", ar: "يأتي مع وجبتك", mode: "included", items: [
    ["Water Bottle", "مياه معدنية"], ["Tetra Pack Juice", "عصير"],
  ]},
], "ob-b");

const OB_LUNCH = mkGroups([
  { id: "A", en: "Soup", ar: "شوربة", mode: "choose-1", items: [
    ["Vegetable Soup", "شوربة خضار"], ["Orzo Soup", "شوربة لسان عصفور"],
    ["Chicken Soup", "شوربة دجاج"], ["Vermicelli Soup with Chicken", "شوربة الشعيرية مع الدجاج"],
  ]},
  { id: "B", en: "Salad", ar: "سلطة", mode: "choose-1", items: [
    ["Mix Green Salad", "سلطة خضراء مشكلة"], ["Carrot Salad", "سلطة الجزر"],
    ["Fattoush Salad", "سلطة فتوش"], ["Mutable", "متبل"],
    ["Tahini Salad", "سلطة طحينة"],
  ]},
  { id: "C", en: "Main Dish", ar: "الطبق الرئيسي", mode: "choose-1", items: [
    ["Grilled Fish served with Butter and Lemon Sauce", "سمك مشوي بصوص الزبدة والليمون"],
    ["Fish Panne", "سمك بانيه"],
    ["Grilled Chicken with Herbal Sauce", "دجاج مشوي بصوص الأعشاب"],
    ["Grilled Chicken Kofta", "كفتة الدجاج مشوية"],
    ["Chicken Panne", "دجاج اسكالوب بانيه"],
    ["Grilled Beef Kofta", "كفتة اللحم مشوية"],
  ]},
  { id: "D", en: "Starch", ar: "النشويات", mode: "choose-1", items: [
    ["White Rice", "أرز أبيض"], ["Rice of The Day", "أرز اليوم"],
    ["Pasta of The Day", "باستا اليوم"],
  ]},
  { id: "E", en: "Vegetables", ar: "الخضار", mode: "choose-1", items: [
    ["Vegetable Grilled", "خضار مشوي"], ["Vegetable Sautéed", "خضار سوتيه"],
    ["Potato of The Day", "بطاطس اليوم"],
  ]},
  { id: "F", en: "Dessert", ar: "الحلوى", mode: "choose-1", items: [
    ["Dessert of The Day", "حلى اليوم"], ["Fruit Salad", "سلطة فواكه"],
  ]},
  { id: "G", en: "Complimentary", ar: "يأتي مع وجبتك", mode: "included", items: [
    ["Water Bottle", "مياه معدنية"], ["Tetra Pack Juice", "عصير"],
  ]},
], "ob-l");

const OB_DINNER = mkGroups([
  { id: "A", en: "Soup", ar: "شوربة", mode: "choose-1", items: [
    ["Vegetable Soup", "شوربة خضار"], ["Orzo Soup", "شوربة لسان عصفور"],
    ["Chicken Soup", "شوربة دجاج"], ["Vermicelli Soup with Chicken", "شوربة الشعيرية مع الدجاج"],
  ]},
  { id: "B", en: "Salad", ar: "سلطة", mode: "choose-1", items: [
    ["Mix Green Salad", "سلطة خضراء مشكلة"], ["Carrot Salad", "سلطة الجزر"],
    ["Fattoush Salad", "سلطة فتوش"], ["Mutable", "متبل"],
    ["Tahini Salad", "سلطة طحينة"],
  ]},
  { id: "C", en: "Main Dish", ar: "الطبق الرئيسي", mode: "choose-1", items: [
    ["Grilled Fish served with Butter and Lemon Sauce", "سمك مشوي بصوص الزبدة والليمون"],
    ["Fish Panne", "سمك بانيه"],
    ["Grilled Chicken with Herbal Sauce", "دجاج مشوي بصوص الأعشاب"],
    ["Grilled Chicken Kofta", "كفتة الدجاج مشوية"],
    ["Chicken Panne", "دجاج اسكالوب بانيه"],
    ["Grilled Beef Kofta", "كفتة اللحم مشوية"],
  ]},
  { id: "D", en: "Starch", ar: "النشويات", mode: "choose-1", items: [
    ["White Rice", "أرز أبيض"], ["Rice of The Day", "أرز اليوم"],
    ["Pasta of The Day", "باستا اليوم"],
  ]},
  { id: "E", en: "Vegetables", ar: "الخضار", mode: "choose-1", items: [
    ["Vegetable Grilled", "خضار مشوي"], ["Vegetable Sautéed", "خضار سوتيه"],
    ["Potato of The Day", "بطاطس اليوم"],
  ]},
  { id: "F", en: "Dessert", ar: "الحلوى", mode: "choose-1", items: [
    ["Dessert of The Day", "حلى اليوم"], ["Fruit Salad", "سلطة فواكه"],
  ]},
  { id: "G", en: "Complimentary", ar: "يأتي مع وجبتك", mode: "included", items: [
    ["Water Bottle", "مياه معدنية"], ["Tetra Pack Juice", "عصير"],
  ]},
], "ob-d");

/* ═══════════════════════════════════════════════════════════════════════════
 * DIABETIC — Day-Specific (Pages 2–8)
 * Breakfast same every day. Lunch & Dinner vary Sun–Sat.
 * ═══════════════════════════════════════════════════════════════════════════ */

const DIABETIC_BREAKFAST = mkGroups([
  { id: "A", en: "Dairy", ar: "ألبان", mode: "included", items: [
    ["Cheese Platter", "طبق الجبن"], ["Low Fat Milk", "حليب قليل الدسم"],
  ]},
  { id: "B", en: "Bread", ar: "خبز", mode: "choose-1", items: [
    ["Bread Roll", "خبز الرول"], ["Arabic Bread", "خبز عربي"],
  ]},
  { id: "C", en: "Egg & Hot Dishes", ar: "البيض والأطباق الساخنة", mode: "choose-1", items: [
    ["Plain Omelette", "أومليت سادة"], ["Vegetable Omelette", "أومليت الخضروات"],
    ["Shakshuka", "شكشوكة"], ["Scrambled Egg", "البيض المخفوق"],
    ["Boiled Egg", "بيض مسلوق"], ["Foul Mudammas", "فول مدمس"],
    ["Corn Flakes", "رقائق الذرة"],
  ]},
  { id: "D", en: "Cereals", ar: "حبوب الإفطار", mode: "choose-1", items: [
    ["Oats", "الشوفان"], ["Bran Flakes", "رقائق نخالة"],
  ]},
  { id: "E", en: "Complimentary", ar: "يأتي مع وجبتك", mode: "included", items: [
    ["Fresh Fruit (Whole)", "فواكه طازجة"], ["Water Bottle", "مياه معدنية"],
  ]},
], "db-b");

/* Helper to build day-specific lunch/dinner for Diabetic */
function dbLunch(day: number, soups: I[], salads: I[], mains: I[], starch: I[], desserts: I[]): MenuGroup[] {
  return mkGroups([
    { id: "A", en: "Soup", ar: "شوربة", mode: "choose-1", items: soups },
    { id: "B", en: "Salad", ar: "سلطة", mode: "choose-1", items: salads },
    { id: "C", en: "Main Dish", ar: "الطبق الرئيسي", mode: "choose-1", items: mains },
    { id: "D", en: "Starch", ar: "النشويات", mode: "choose-1", items: starch },
    { id: "E", en: "Sautéed Vegetables", ar: "خضار سوتيه", mode: "included", items: [["Sautéed Vegetables", "خضار سوتيه"]] },
    { id: "F", en: "Dessert", ar: "الحلوى", mode: "choose-1", items: desserts },
    { id: "G", en: "Water", ar: "مياه", mode: "included", items: [["Water Bottle", "مياه معدنية"]] },
  ], `db-${day}-l`);
}

function dbDinner(day: number, soups: I[], salads: I[], mains: I[], starch: I[], desserts: I[]): MenuGroup[] {
  return mkGroups([
    { id: "A", en: "Soup", ar: "شوربة", mode: "choose-1", items: soups },
    { id: "B", en: "Salad", ar: "سلطة", mode: "choose-1", items: salads },
    { id: "C", en: "Main Dish", ar: "الطبق الرئيسي", mode: "choose-1", items: mains },
    { id: "D", en: "Starch", ar: "النشويات", mode: "choose-1", items: starch },
    { id: "E", en: "Roasted Vegetables", ar: "خضار الرستو", mode: "included", items: [["Roasted Vegetables", "خضار الرستو"]] },
    { id: "F", en: "Dessert", ar: "الحلوى", mode: "choose-1", items: desserts },
    { id: "G", en: "Water", ar: "مياه", mode: "included", items: [["Water Bottle", "مياه معدنية"]] },
  ], `db-${day}-d`);
}

const DIABETIC_LUNCH: MenuGroup[][] = [
  /* 0=Sun */ dbLunch(0,
    [["Lentil Soup","شوربة عدس"],["Chicken Vermicelli Soup","شوربة دجاج بالشعيرية"]],
    [["Spring Salad","سلطة الربيع"],["Quinoa Salad","سلطة الكينوا"]],
    [["Baked Fish & Coriander Tomato","فيلية سمك بالفرن مع الكزبرة وطماطم"],["Chinese Style Beef","لحم بقري على الطريقة الصينية"],["Chicken Fajita","فاهيتا الدجاج"]],
    [["White Rice","الأرز الأبيض"],["Pasta with Mushroom Sauce","باستا مشروم صوص"]],
    [["Plain Jelly","جلي"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* 1=Mon */ dbLunch(1,
    [["Vegetable Soup","شوربة خضار"],["Barley Lamb Soup","شوربة حب"]],
    [["Green Beans Salad","سلطة الفاصوليا الخضراء"],["Mix Green Salad","سلطة خضراء مشكلة"]],
    [["Grilled Fish Sayadiyah","سمك مشوي صيادية"],["Dawood Basha","داود باشا"],["Vegetables Stuffed Chicken","دجاج محشي"]],
    [["White Rice","الأرز الأبيض"],["Couscous with Vegetables","كسكس مع الخضار"]],
    [["Banana Cake","كيك الموز"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* 2=Tue */ dbLunch(2,
    [["Mushroom Cream Soup","شوربة الفطر بالكريمة"],["Harira Soup","شوربة حريرة المغربية"]],
    [["Greek Salad","سلطة يونانية"],["Mexican Cauliflower Salad","سلطة القرنبيط المكسيكية"]],
    [["Samak Harra","سمك حارة مشوية"],["Stir Fry Beef","بيف ستير فراي"],["Chicken Eminesh","شرائح صدور الدجاج مع المشروم والكريمة"]],
    [["White Rice","الأرز الأبيض"],["Schezwan Noodles","نودلز شيزوان"]],
    [["Fruit Custard","كاسترد بالفواكه"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* 3=Wed */ dbLunch(3,
    [["Corn Soup","شوربة الذرة"],["Mix Vegetable Soup","شوربة خضار مشكل"]],
    [["Tahina Salad","سلطة طحينة"],["Oriental Salad","سلطة شرقية"]],
    [["Grilled Fish with Vegetables","سمك مشوي مع الخضار"],["Beef Sour Cream Sauce","لحم مع الكريمة الحامضة"],["Tandoori Chicken","دجاج تندوري"]],
    [["White Rice","الأرز الأبيض"],["Saffron Rice","أرز بالزعفران"]],
    [["Fruit Jelly","جلي بالفواكه"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* 4=Thu */ dbLunch(4,
    [["Spinach Soup","شوربة السبانخ"],["Turkish Lentil Soup","شوربة العدس على الطريقة التركية"]],
    [["Broccoli Salad","سلطة بروكلي"],["Mix Green Salad","سلطة خضراء مشكلة"]],
    [["Grilled Fish","فيلية سمك مشوي"],["Chinese Style Beef","لحم على الطريقة الصينية"],["Grilled Chicken","دجاج مشوي"]],
    [["White Rice","الأرز الأبيض"],["Penne Pomodoro","بيني بومودورو"]],
    [["Carrot Cake","كيك الجزر"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* 5=Fri */ dbLunch(5,
    [["Cream Vegetable Soup","شوربة خضار مع الكريمة"],["Green Peas Soup with Mint","شوربة البازلاء مع النعناع"]],
    [["Artichoke Salad","سلطة الارتيشوك"],["Mix Green Salad","سلطة خضراء مشكلة"]],
    [["Fish Tajine","سمك طاجن"],["Roast Beef with Gravy","روستو بيف مع الصلصة حريفي"],["Chicken Mandi with Dukkus","دجاج مندي مع صوص دقوس"]],
    [["White Rice","الأرز الأبيض"],["Spaghetti with Tomato Sauce","سباغيتي مع الطماطم صوص"]],
    [["Plain Custard","كاسترد"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* 6=Sat */ dbLunch(6,
    [["Marrow Soup with Basil","شوربة كوسا مع الريحان"],["Oats Soup","شوربة الشوفان"]],
    [["Mix Green Salad","سلطة خضراء مشكلة"],["Moutabe","سلطة متبل"]],
    [["Grilled Fish with Sour Sauce","سمك مشوي بالصلصة الحامضة"],["Meat Kabab","كباب اللحم المشوي"],["Chicken Chasseur","دجاج بصوص الصياد"]],
    [["White Rice","الأرز الأبيض"],["Vegetable Pasta","باستا مع الخضروات"]],
    [["Plain Custard","كاسترد"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
];

const DIABETIC_DINNER: MenuGroup[][] = [
  /* 0=Sun */ dbDinner(0,
    [["Orzo Soup","شوربة لسان عصفور"],["Broccoli Soup","شوربة بروكلي"]],
    [["Mix Green Salad","سلطة خضراء مشكلة"],["Rocca Salad with Pomegranate","سلطة الجرجير مع الرمان"]],
    [["Grilled Fish Finger/Lemon Sauce","سمك فيلية مشوي أولي بصوص الليمون"],["Beef Goulash & Carrot and Green Peas","لحم جلاش مع الجزر والبازلاء والخضار"],["Turmeric Chicken","دجاج بالكركم"]],
    [["White Rice","الأرز الأبيض"],["Yellow Rice","أرز أصفر"]],
    [["Fruit Custard","كاسترد بالفواكه"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* 1=Mon */ dbDinner(1,
    [["Pumpkin Soup","شوربة القرع"],["Chicken Creamy Soup","شوربة دجاج بالكريمة"]],
    [["Coleslaw Salad","سلطة كول سلو"],["Baba Ghanoush Salad","سلطة بابا غنوج"]],
    [["Tandoori Fish","فيلية سمك تندور"],["Lamb with Tomato Sauce","لحم مع صوص الطماطم"],["Chicken Supreme","دجاج سوبريم"]],
    [["White Rice","الأرز الأبيض"],["Pasta Aglio E Olio","باستا بالثوم وزيت الزيتون"]],
    [["Plain Jelly","جلي"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* 2=Tue */ dbDinner(2,
    [["Cauliflower Soup","شوربة القرنبيط"],["Freekeh Meat Soup","شوربة فريكة باللحم"]],
    [["Fattoush Salad","سلطة فتوش"],["Cucumber Yogurt Salad","سلطة زبادي بالخيار"]],
    [["Mix Seafood with Sauce","تشكيلة من ثمار البحر مع الصوص"],["Veal Blanquette","اللحم مع صوص الأبيض"],["Chicken Picatta","دجاج بيكاتا"]],
    [["White Rice","الأرز الأبيض"],["Penne Arabiata","بيني أرابياتا"]],
    [["Carrot Cake","كيك الجزر"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* 3=Wed */ dbDinner(3,
    [["Marrow Cream Soup","شوربة كوسا بالكريمة"],["Oats Soup","شوربة الأوتكر"]],
    [["Oriental Salad","سلطة شرقية"],["Hummus","حمص"]],
    [["Fish Florentine","سمك فلورنتين"],["Beef Stroganoff","بيف استروجانوف"],["Chicken Kabsa","كبسة الدجاج"]],
    [["White Rice","الأرز الأبيض"],["Pasta Aglio E Olio","باستا بالثوم وزيت الزيتون"]],
    [["Plain Custard","كاسترد"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* 4=Thu */ dbDinner(4,
    [["Creamy Tomato Soup","شوربة طماطم بالكريمة"],["French Onion Soup","شوربة البصل الفرنسية"]],
    [["Fattoush Salad","سلطة فتوش"],["Red Beans Salad","سلطة الفاصوليا الحمراء والذرة"]],
    [["Grilled Salmon with Dill Sauce","سمك السلمون المشوي مع صوص الشبت"],["Steak with Gravy Sauce","ستيك مع صوص جريفي"],["Chinese-Style Chicken","دجاج بالخضار على الطريقة الصينية"]],
    [["White Rice","الأرز الأبيض"],["Fettuccine Cream Sauce","فيتوتشيني بصلصة الكريمة"]],
    [["Fruit Jelly","جلي بالفواكه"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* 5=Fri */ dbDinner(5,
    [["Carrot Cream Soup","شوربة جزر مع كريمة"],["Minestrone Soup","شوربة مينسترونى"]],
    [["Mix Green Salad","سلطة خضراء"],["Sweet Corn Salad","سلطة الذرة الحلوة"]],
    [["Fish with Saffron Sauce","سمك مع صوص الزعفران"],["Beef Kofta","كفتة لحم"],["Chicken Breast with Rosemary Sauce","دجاج مشوي مع صلصة روزماري"]],
    [["White Rice","الأرز الأبيض"],["Spaghetti with Tomato Sauce","سباغيتي مع الطماطم صوص"]],
    [["Carrot Cake","كيك الجزر"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* 6=Sat */ dbDinner(6,
    [["Vegetable Soup","شوربة الخضار"],["Corn Creamy Soup","شوربة الذرة بالكريمة"]],
    [["Mix Green Salad","سلطة خضراء مشكلة"],["Chick Peas Salad","سلطة الحمص حب"]],
    [["Fish Fillet/Lemon Butter Sauce","سمك فيلية مشوي بصلصة الليمون"],["Veal Green Peas Stew","يخنة اللحم مع البازلاء"],["Chicken Breast & Herb Sauce","الدجاج المشوي مع صوص الأعشاب"]],
    [["White Rice","الأرز الأبيض"],["Spaghetti Cream Sauce","سباغيتي صلصة الكريمة"]],
    [["Fruit Jelly","جلي بالفواكه"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
];

/* ═══════════════════════════════════════════════════════════════════════════
 * LOW POTASSIUM — Day-Specific (Pages 10–16)
 * ═══════════════════════════════════════════════════════════════════════════ */

const LP_BREAKFAST = mkGroups([
  { id: "A", en: "Dairy", ar: "ألبان", mode: "included", items: [
    ["Cheese Platter", "طبق الجبن"], ["Low Fat Milk", "حليب قليل الدسم"],
  ]},
  { id: "B", en: "Bread", ar: "خبز", mode: "choose-1", items: [
    ["Bread Roll", "خبز الرول"], ["Arabic Bread", "خبز عربي"],
  ]},
  { id: "C", en: "Eggs", ar: "البيض", mode: "choose-1", items: [
    ["Plain Omelette", "أومليت سادة"], ["Vegetable Omelette", "أومليت الخضروات"],
    ["Scrambled Egg", "البيض المخفوق"], ["Boiled Egg", "بيض مسلوق"],
  ]},
  { id: "D", en: "Complimentary", ar: "يأتي مع وجبتك", mode: "included", items: [
    ["Corn Flakes", "رقائق الذرة"], ["Fresh Fruit (Whole)", "فواكه طازجة"],
    ["Water Bottle", "مياه معدنية"],
  ]},
], "lp-b");

function lpLunch(day: number, soups: I[], mains: I[], starch: I[], dessert: I[]): MenuGroup[] {
  return mkGroups([
    { id: "A", en: "Soup", ar: "شوربة", mode: "choose-1", items: soups },
    { id: "B", en: "Salad", ar: "سلطة", mode: "included", items: [["Green Salad","سلطة خضراء"]] },
    { id: "C", en: "Main Dish", ar: "الطبق الرئيسي", mode: "choose-1", items: mains },
    { id: "D", en: "Starch", ar: "النشويات", mode: "choose-1", items: starch },
    { id: "E", en: "Dessert", ar: "الحلوى", mode: "included", items: dessert },
    { id: "F", en: "Water", ar: "مياه", mode: "included", items: [["Water Bottle","مياه معدنية"]] },
  ], `lp-${day}-l`);
}

function lpDinner(day: number, soups: I[], salad: I[], mains: I[], starch: I[], dessert: I[]): MenuGroup[] {
  return mkGroups([
    { id: "A", en: "Soup", ar: "شوربة", mode: "choose-1", items: soups },
    { id: "B", en: "Salad", ar: "سلطة", mode: "included", items: salad },
    { id: "C", en: "Main Dish", ar: "الطبق الرئيسي", mode: "choose-1", items: mains },
    { id: "D", en: "Starch", ar: "النشويات", mode: "choose-1", items: starch },
    { id: "E", en: "Dessert", ar: "الحلوى", mode: "included", items: dessert },
    { id: "F", en: "Water", ar: "مياه", mode: "included", items: [["Water Bottle","مياه معدنية"]] },
  ], `lp-${day}-d`);
}

const LP_LUNCH: MenuGroup[][] = [
  /* Sun */ lpLunch(0, [["Vegetables Soup","شوربة خضار"],["Chicken Vermicelli Soup","شوربة دجاج بالشعيرية"]], [["Baked Fish","فيلية سمك بالفرن"],["Chicken Fajita","ماهيتا الدجاج"],["Beef Steak","بيف ستيك"]], [["White Rice","الأرز الأبيض"],["Pasta with Mushroom","باستا مع المشروم"]], [["Plain Jelly","جلي"]]),
  /* Mon */ lpLunch(1, [["Vegetable Soup","شوربة خضار"],["Barley Lamb Soup","شوربة حب"]], [["Grilled Fish","فيليه سمك مشوي صيادية"],["Grilled Chicken","دجاج مشوي"],["Meat Balls with White Sauce","كرات اللحم مع صوص أبيض"]], [["White Rice","الأرز الأبيض"],["Couscous with Vegetables","كسكس مع الخضار"]], [["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Tue */ lpLunch(2, [["Vegetables Soup","شوربة خضار"],["Mushroom Cream Soup","شوربة الفطر بالكريمة"]], [["Grilled Fish Fillet with Olive Oil and Lemon Sauce","فيلية سمك مشوي صوص ليمون وزيت زيتون"],["Chicken Eminesh","شرائح صدور الدجاج مع المشروم والكريمة"],["Beef Steak","بيف ستيك"]], [["White Rice","الأرز الأبيض"],["Schezwan Noodles","نودلز شيزوان"]], [["Plain Jelly","جلي"]]),
  /* Wed */ lpLunch(3, [["Vegetable Soup","شوربة خضار"],["Corn Soup","شوربة ذرة"]], [["Fish Fillet with Vegetables","سمك فيلية مع الخضار"],["Chicken Kabab","كباب الدجاج المشوي"],["Beef Sour Cream Sauce","لحم مع الكريمة الحامضة"]], [["White Rice","الأرز الأبيض"],["Saffron Rice","أرز بالزعفران"]], [["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Thu */ lpLunch(4, [["Vegetables Soup","شوربة خضار"],["Orzo Soup","شوربة لسان عصفور"]], [["Grilled Fish","فيليه سمك مشوي"],["Grilled Chicken","دجاج مشوي"],["Meat Kabab","كباب اللحم المشوي"]], [["White Rice","الأرز الأبيض"],["Rice with Vegetables","أرز مع الخضار"]], [["Plain Jelly","جلي"]]),
  /* Fri */ lpLunch(5, [["Vegetable Soup","شوربة خضار"],["Green Peas Soup","شوربة البازلاء"]], [["Grilled Fish Fillet with Olive Oil and Lemon Sauce","فيلية سمك مشوي صوص الليمون وزيت زيتون"],["Chicken Mandi","دجاج مندي"],["Roast Beef with Gravy","روستو بيف مع الصلصة"]], [["Mandi Rice","أرز مندي"],["Spaghetti with White Sauce","سباغيتي مع صوص أبيض"]], [["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Sat */ lpLunch(6, [["Vegetables Soup","شوربة خضار"],["Marrow Soup with Basil","شوربة كوسا مع الريحان"]], [["Grilled Fish","فيليه سمك مشوي"],["Grilled Chicken Breast","دجاج مشوي مع صلصة رومانية"],["Meat Kabab","كباب اللحم المشوي"]], [["White Rice","الأرز الأبيض"],["Vegetable Pasta","باستا مع الخضروات"]], [["Fruit Salad","سلطة فواكه"]]),
];

const LP_DINNER: MenuGroup[][] = [
  /* Sun */ lpDinner(0, [["Vegetables Soup","شوربة خضار"],["Orzo Soup","شوربة لسان عصفور"]], [["Green Salad","سلطة خضراء"]], [["Grilled Fish Finger/Lemon Sauce","سمك فيلية مشوي أولي بصوص الليمون"],["Grilled Chicken","دجاج مشوي"],["Beef Goulash","لحم جلاش"]], [["White Rice","الأرز الأبيض"],["Yellow Rice","أرز أصفر"]], [["Fruit Salad","سلطة فواكه"]]),
  /* Mon */ lpDinner(1, [["Vegetables Soup","شوربة خضار"],["Chicken Creamy Soup","شوربة دجاج بالكريمة"]], [["Moutabe Salad","سلطة متبل"]], [["Fish Fillet with Vegetables","سمك فيلية مع الخضار"],["Chicken Supreme","دجاج سوبريم"],["Meat Mond","متن اللحم"]], [["White Rice","الأرز الأبيض"],["Pasta Aglio E Olio","باستا بالثوم وزيت الزيتون"]], [["Plain Jelly","جلي"]]),
  /* Tue */ lpDinner(2, [["Vegetable Soup","شوربة خضار"],["Cauliflower Soup","شوربة القرنبيط"]], [["Green Salad","سلطة خضراء"]], [["Grilled Fish","فيليه سمك مشوي"],["Grilled Chicken","دجاج مشوي"],["Veal Blanquette","لحم مع صوص الأبيض"]], [["White Rice","الأرز الأبيض"],["Penne Cream Sauce","بيني مع صوص الكريمة"]], [["Fruit Salad","سلطة فواكه"]]),
  /* Wed */ lpDinner(3, [["Vegetables Soup","شوربة خضار"],["Marrow Cream Soup","شوربة كوسا بالكريمة"]], [["Green Salad","سلطة خضراء"]], [["Fish with Saffron Sauce","سمك مع صوص الزعفران"],["Chicken Mandi","دجاج مندي"],["Beef Steak","بيف ستيك"]], [["White Rice","الأرز الأبيض"],["Pasta Aglio E Olio","باستا بالثوم وزيت الزيتون"]], [["Plain Jelly","جلي"]]),
  /* Thu */ lpDinner(4, [["Vegetable Soup","شوربة خضار"],["Chicken Cream Soup","شوربة دجاج بالكريمة"]], [["Green Salad","سلطة خضراء"]], [["Grilled Fish Fillet with Creamy Sauce","فيلية سمك مشوي مع صوص الكريمة"],["Chinese-Style Chicken","دجاج بالخضار على الطريقة الصينية"],["Steak with Gravy Sauce","ستيك مع صوص جريفي"]], [["White Rice","الأرز الأبيض"],["Fettuccine Cream Sauce","فيتوتشيني بصلصة الكريمة"]], [["English Cake","انجلش كيك"]]),
  /* Fri */ lpDinner(5, [["Vegetables Soup","شوربة خضار"],["Carrot Cream Soup","شوربة جزر مع كريمة"]], [["Green Salad","سلطة خضراء"]], [["Grilled Fish","فيليه سمك مشوي"],["Grilled Chicken","دجاج مشوي"],["Meat Balls with White Sauce","كرات اللحم مع صوص أبيض"]], [["White Rice","الأرز الأبيض"],["Vermicelli Rice","أرز الشعيرية"]], [["Plain Jelly","جلي"]]),
  /* Sat */ lpDinner(6, [["Vegetable Soup","شوربة الخضار"],["Corn Soup","شوربة الذرة"]],  [["Green Salad","سلطة خضراء"]], [["Fish Fillet/Lemon Butter Sauce","سمك فيلية مشوي بصلصة الليمون"],["Chicken Breast & Herb Sauce","الدجاج المشوي مع صوص الأعشاب"],["Meat Balls with White Sauce","كرات اللحم مع صوص أبيض"]], [["White Rice","الأرز الأبيض"],["Spaghetti with White Sauce","سباغيتي مع صوص أبيض"]], [["Fruit Jelly","جلي"]]),
];

/* ═══════════════════════════════════════════════════════════════════════════
 * LOW SODIUM — Day-Specific (Pages 17–23)
 * ═══════════════════════════════════════════════════════════════════════════ */

const LS_BREAKFAST = mkGroups([
  { id: "A", en: "Dairy", ar: "ألبان", mode: "included", items: [
    ["Cheese Platter", "طبق الجبن"], ["Low Fat Milk", "حليب قليل الدسم"],
  ]},
  { id: "B", en: "Bread", ar: "خبز", mode: "choose-1", items: [
    ["Bread Roll", "خبز الرول"], ["Arabic Bread", "خبز عربي"],
  ]},
  { id: "C", en: "Eggs & Hot Dishes", ar: "البيض والأطباق الساخنة", mode: "choose-1", items: [
    ["Plain Omelette", "أومليت سادة"], ["Vegetable Omelette", "أومليت الخضروات"],
    ["Shakshuka", "شكشوكة"], ["Scrambled Egg", "البيض المخفوق"],
    ["Boiled Egg", "بيض مسلوق"], ["Foul Mudammas", "فول مدمس"],
  ]},
  { id: "D", en: "Cereals", ar: "حبوب الإفطار", mode: "choose-1", items: [
    ["Oats", "الشوفان"], ["Bran Flakes", "رقائق نخالة"],
  ]},
  { id: "E", en: "Complimentary", ar: "يأتي مع وجبتك", mode: "included", items: [
    ["Fresh Fruit (Whole)", "فواكه طازجة"], ["Water Bottle", "مياه معدنية"],
  ]},
], "ls-b");

function lsLunch(day: number, soups: I[], salads: I[], mains: I[], starch: I[], desserts: I[]): MenuGroup[] {
  return mkGroups([
    { id: "A", en: "Soup", ar: "شوربة", mode: "choose-1", items: soups },
    { id: "B", en: "Salad", ar: "سلطة", mode: "choose-1", items: salads },
    { id: "C", en: "Main Dish", ar: "الطبق الرئيسي", mode: "choose-1", items: mains },
    { id: "D", en: "Starch", ar: "النشويات", mode: "choose-1", items: starch },
    { id: "E", en: "Sautéed Vegetables", ar: "خضار سوتيه", mode: "included", items: [["Sautéed Vegetables","خضار سوتيه"]] },
    { id: "F", en: "Dessert", ar: "الحلوى", mode: "choose-1", items: desserts },
    { id: "G", en: "Water", ar: "مياه", mode: "included", items: [["Water Bottle","مياه معدنية"]] },
  ], `ls-${day}-l`);
}

function lsDinner(day: number, soups: I[], salads: I[], mains: I[], starch: I[], desserts: I[]): MenuGroup[] {
  return mkGroups([
    { id: "A", en: "Soup", ar: "شوربة", mode: "choose-1", items: soups },
    { id: "B", en: "Salad", ar: "سلطة", mode: "choose-1", items: salads },
    { id: "C", en: "Main Dish", ar: "الطبق الرئيسي", mode: "choose-1", items: mains },
    { id: "D", en: "Starch", ar: "النشويات", mode: "choose-1", items: starch },
    { id: "E", en: "Roasted Vegetables", ar: "خضار الرستو", mode: "included", items: [["Roasted Vegetables","خضار الرستو"]] },
    { id: "F", en: "Dessert", ar: "الحلوى", mode: "choose-1", items: desserts },
    { id: "G", en: "Water", ar: "مياه", mode: "included", items: [["Water Bottle","مياه معدنية"]] },
  ], `ls-${day}-d`);
}

const LS_LUNCH: MenuGroup[][] = [
  /* Sun */ lsLunch(0, [["Lentil Soup","شوربة عدس"],["Chicken Vermicelli Soup","شوربة دجاج بالشعيرية"]], [["Spring Salad","سلطة الربيع"],["Quinoa Salad","سلطة الكينوا"]], [["Baked Fish & Coriander Tomato","فيلية سمك بالفرن مع الكزبرة وطماطم"],["Chinese Style Beef","لحم بقري على الطريقة الصينية"],["Chicken Fajita","فاهيتا الدجاج"]], [["White Rice","الأرز الأبيض"],["Pasta with Mushroom Sauce","باستا مشروم صوص"]], [["Plain Jelly","جلي"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Mon */ lsLunch(1, [["Vegetable Soup","شوربة خضار"],["Barley Lamb Soup","شوربة حب"]], [["Green Beans Salad","سلطة الفاصوليا الخضراء"],["Mix Green Salad","سلطة خضراء مشكلة"]], [["Grilled Fish Sayadiyah","سمك مشوي صيادية"],["Dawood Basha","داود باشا"],["Vegetables Stuffed Chicken","دجاج محشي خضار"]], [["White Rice","الأرز الأبيض"],["Couscous with Vegetables","كسكس مع الخضار"]], [["Banana Cake","كيك الموز"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Tue */ lsLunch(2, [["Mushroom Cream Soup","شوربة الفطر بالكريمة"],["Harira Soup","شوربة حريرة المغربية"]], [["Greek Salad","سلطة يونانية"],["Mexican Cauliflower Salad","سلطة القرنبيط المكسيكية"]], [["Samak Harra","سمك حارة مشوية"],["Stir Fry Beef","بيف ستير فراي"],["Chicken Eminesh","شرائح صدور الدجاج مع المشروم والكريمة"]], [["White Rice","الأرز الأبيض"],["Schezwan Noodles","نودلز شيزوان"]], [["Fruit Custard","كاسترد بالفواكه"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Wed */ lsLunch(3, [["Corn Soup","شوربة الذرة"],["Mix Vegetable Soup","شوربة خضار مشكل"]], [["Tahina Salad","سلطة طحينة"],["Oriental Salad","سلطة شرقية"]], [["Grilled Fish","سمك مشوي"],["Beef Sour Cream Sauce","لحم مع الكريمة الحامضة"],["Tandoori Chicken","دجاج تندوري"]], [["White Rice","الأرز الأبيض"],["Chinese Style Noodles","نودلز على الطريقة الصينية"]], [["Fruit Jelly","جلي بالفواكه"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Thu */ lsLunch(4, [["Spinach Soup","شوربة السبانخ"],["Turkish Lentil Soup","شوربة العدس على الطريقة التركية"]], [["Broccoli Salad","سلطة بروكلي"],["Mix Green Salad","سلطة خضراء مشكلة"]], [["Grilled Fish","فيلية سمك مشوي"],["Chinese Style Beef","لحم على الطريقة الصينية"],["Grilled Chicken","دجاج مشوي"]], [["White Rice","الأرز الأبيض"],["Penne Pomodoro","بيني بومودورو"]], [["Carrot Cake","كيك الجزر"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Fri */ lsLunch(5, [["Cream Vegetable Soup","شوربة خضار مع الكريمة"],["Green Peas Soup with Mint","شوربة البازلاء مع النعناع"]], [["Artichoke Salad","سلطة الارتيشوك"],["Mix Green Salad","سلطة خضراء مشكلة"]], [["Fish Tajine","سمك طاجن"],["Roast Beef with Gravy","روستو بيف مع الصلصة"],["Chicken Mandi with Dukkus","دجاج مندي مع صوص دقوس"]], [["White Rice","الأرز الأبيض"],["Mandi Rice","أرز مندي"]], [["Plain Custard","كاسترد"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Sat */ lsLunch(6, [["Marrow Soup with Basil","شوربة كوسا مع الريحان"],["Oats Soup","شوربة الشوفان"]], [["Mix Green Salad","سلطة خضراء مشكلة"],["Moutabe","سلطة متبل"]], [["Grilled Fish with Sour Sauce","سمك مشوي بالصلصة الحامضة"],["Meat Kabab","كباب اللحم المشوي"],["Chicken Chasseur","دجاج بصوص الصياد"]], [["White Rice","الأرز الأبيض"],["Vegetable Pasta","باستا مع الخضروات"]], [["Plain Custard","كاسترد"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
];

const LS_DINNER: MenuGroup[][] = [
  /* Sun */ lsDinner(0, [["Orzo Soup","شوربة لسان عصفور"],["Broccoli Soup","شوربة بروكلي"]], [["Mix Green Salad","سلطة خضراء مشكلة"],["Rocca Salad with Pomegranate","سلطة الجرجير مع الرمان"]], [["Grilled Fish Finger/Lemon Sauce","سمك فيلية مشوي أولي بصوص الليمون"],["Beef Goulash & Carrot and Green Peas","لحم جلاش مع الجزر والبازلاء والخضار"],["Turmeric Chicken","دجاج بالكركم"]], [["White Rice","الأرز الأبيض"],["Penne Pasta with Tomato Sauce","مكرونة بيني مع صوص طماطم"]], [["Fruit Custard","كاسترد بالفواكه"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Mon */ lsDinner(1, [["Pumpkin Soup","شوربة القرع"],["Chicken Creamy Soup","شوربة دجاج بالكريمة"]], [["Coleslaw Salad","سلطة كول سلو"],["Baba Ghanoush Salad","سلطة بابا غنوج"]], [["Tandoori Fish","فيلية سمك تندور"],["Lamb with Tomato Sauce","لحم مع صوص الطماطم"],["Chicken Supreme","دجاج سوبريم"]], [["White Rice","الأرز الأبيض"],["Pasta Aglio E Olio","باستا بالثوم وزيت الزيتون"]], [["Rice Pudding","أرز بالحليب"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Tue */ lsDinner(2, [["Cauliflower Soup","شوربة القرنبيط"],["Freekeh Meat Soup","شوربة فريكة باللحم"]], [["Fattoush Salad","سلطة فتوش"],["Cucumber Yogurt Salad","سلطة زبادي بالخيار"]], [["Mix Seafood with Sauce","تشكيلة من ثمار البحر مع الصوص"],["Veal Blanquette","اللحم مع صوص الأبيض"],["Chicken Picatta","دجاج بيكاتا"]], [["White Rice","الأرز الأبيض"],["Penne Arabiata","بيني أرابياتا"]], [["Carrot Cake","كيك الجزر"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Wed */ lsDinner(3, [["Marrow Cream Soup","شوربة كوسا بالكريمة"],["Oats Soup","شوربة الأوتكر"]], [["Oriental Salad","سلطة شرقية"],["Hummus","حمص"]], [["Fish Florentine","سمك فلورنتين"],["Beef Stroganoff","بيف استروجانوف"],["Chicken Kabsa","كبسة الدجاج"]], [["White Rice","الأرز الأبيض"],["Pasta Aglio E Olio","باستا بالثوم وزيت الزيتون"]], [["Plain Custard","كاسترد"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Thu */ lsDinner(4, [["Creamy Tomato Soup","شوربة طماطم بالكريمة"],["French Onion Soup","شوربة البصل الفرنسية"]], [["Fattoush Salad","سلطة فتوش"],["Red Beans Salad","سلطة الفاصوليا الحمراء"]], [["Grilled Salmon","سمك السلمون المشوي"],["Steak with Gravy Sauce","ستيك مع صوص جريفي"],["Chinese-Style Chicken","دجاج بالخضار على الطريقة الصينية"]], [["White Rice","الأرز الأبيض"],["Fettuccine Cream Sauce","فيتوتشيني بصلصة الكريمة"]], [["Fruit Jelly","جلي بالفواكه"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Fri */ lsDinner(5, [["Carrot Cream Soup","شوربة جزر مع كريمة"],["Minestrone Soup","شوربة مينسترونى"]], [["Mix Green Salad","سلطة خضراء"],["Sweet Corn Salad","سلطة الذرة الحلوة"]], [["Fish with Saffron Sauce","سمك مع صوص الزعفران"],["Beef Kofta","كفتة لحم"],["Chicken Breast with Rosemary Sauce","دجاج مشوي مع صلصة روزماري"]], [["White Rice","الأرز الأبيض"],["Spaghetti with Tomato Sauce","سباغيتي مع الطماطم صوص"]], [["Carrot Cake","كيك الجزر"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Sat */ lsDinner(6, [["Vegetable Soup","شوربة الخضار"],["Corn Creamy Soup","شوربة الذرة بالكريمة"]], [["Mix Green Salad","سلطة خضراء مشكلة"],["Chick Peas Salad","سلطة الحمص حب"]], [["Fish Fillet/Lemon Butter Sauce","سمك فيلية مشوي بصلصة الليمون"],["Veal Green Peas Stew","يخنة اللحم مع البازلاء"],["Chicken Breast & Herb Sauce","الدجاج المشوي مع صوص الأعشاب"]], [["White Rice","الأرز الأبيض"],["Spaghetti Tomato Sauce","سباغيتي صلصة الطماطم"]], [["Fruit Jelly","جلي"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
];

/* ═══════════════════════════════════════════════════════════════════════════
 * REGULAR — Day-Specific (Pages 25–31)
 * ═══════════════════════════════════════════════════════════════════════════ */

const REG_BREAKFAST = mkGroups([
  { id: "A", en: "Dairy & Bread", ar: "ألبان وخبز", mode: "included", items: [
    ["Cheese Platter", "طبق أجبان متنوع"], ["Milk", "حليب"], ["Bread", "خبز"],
  ]},
  { id: "B", en: "Eggs", ar: "البيض", mode: "choose-1", items: [
    ["Plain Omelette", "أومليت سادة"], ["Cheese Omelette", "أومليت جبنة"],
    ["Vegetable Omelette", "أومليت خضار"], ["Shakshuka", "شكشوكة"],
    ["Scrambled Egg", "بيض مخفوق"], ["Boiled Egg", "بيض مسلوق"],
  ]},
  { id: "C", en: "Hot Dishes", ar: "أطباق ساخنة", mode: "choose-1", items: [
    ["Foul Medammas", "فول مدمس"], ["Baked Beans", "فاصوليا بصلصة الطماطم"],
    ["Hash Brown Potato", "بطاطس هاش براون"], ["Falafel", "فلافل"],
  ]},
  { id: "D", en: "Cereals", ar: "حبوب الإفطار", mode: "choose-1", items: [
    ["Corn Flakes", "كورن فلاكس"], ["Choco Flakes", "رقائق الشوكولاتة"],
    ["Muesli", "موسلي"], ["Bran Flakes", "رقائق الشوفان"],
  ]},
  { id: "E", en: "Yogurt", ar: "الزبادي", mode: "choose-1", items: [
    ["Plain Yogurt", "زبادي سادة"], ["Fruit Yogurt", "زبادي الفواكه"],
  ]},
  { id: "F", en: "Pastries", ar: "المعجنات", mode: "choose-1", items: [
    ["Croissant", "كرواسان سادة"], ["Muffin Cake", "كيك المافن"],
    ["Danish Pastry", "فطيرة الدانش"], ["Cinnamon Roll", "لفائف القرفة"],
  ]},
  { id: "G", en: "Complimentary", ar: "يأتي مع وجبتك", mode: "included", items: [
    ["Water Bottle", "مياه معدنية"], ["Tetra Pack Juice", "عصير"],
  ]},
], "rg-b");

function regLunch(day: number, soups: I[], salads: I[], mains: I[], desserts: I[]): MenuGroup[] {
  return mkGroups([
    { id: "A", en: "Soup", ar: "شوربة", mode: "choose-1", items: soups },
    { id: "B", en: "Salad", ar: "سلطة", mode: "choose-1", items: salads },
    { id: "C", en: "Main Dish", ar: "الطبق الرئيسي", mode: "choose-1", items: mains },
    { id: "D", en: "Dessert", ar: "الحلوى", mode: "choose-1", items: desserts },
    { id: "E", en: "Complimentary", ar: "يأتي مع وجبتك", mode: "included", items: [["Water Bottle","مياه معدنية"],["Tetra Pack Juice","عصير"]] },
  ], `rg-${day}-l`);
}

function regDinner(day: number, soups: I[], salads: I[], mains: I[], desserts: I[]): MenuGroup[] {
  return mkGroups([
    { id: "A", en: "Soup", ar: "شوربة", mode: "choose-1", items: soups },
    { id: "B", en: "Salad", ar: "سلطة", mode: "choose-1", items: salads },
    { id: "C", en: "Main Dish", ar: "الطبق الرئيسي", mode: "choose-1", items: mains },
    { id: "D", en: "Dessert", ar: "الحلوى", mode: "choose-1", items: desserts },
    { id: "E", en: "Complimentary", ar: "يأتي مع وجبتك", mode: "included", items: [["Water Bottle","مياه معدنية"],["Tetra Pack Juice","عصير"]] },
  ], `rg-${day}-d`);
}

const REG_LUNCH: MenuGroup[][] = [
  /* Sun */ regLunch(0,
    [["Lentil Soup","شوربة عدس"],["Chicken Vermicelli Soup","شوربة دجاج بالشعيرية"]],
    [["Spring Salad","سلطة الربيع"],["Quinoa Salad","سلطة الكينوا"]],
    [["Baked Fish Fillet with Coriander Tomato Served with White Rice and Roasted Vegetables","فيلية سمك بالفرن مع الكزبرة وطماطم صوص يقدم مع أرز أبيض والخضار الرستو"],["Chicken Fajita Served with Chinese Fried Rice & Roasted Vegetables","فاهيتا دجاج يقدم مع أرز المقلي والخضار الرستو"],["Chinese Style Beef Served with Chinese Fried Rice and Roasted Vegetables","لحم بقري على الطريقة الصينية يقدم مع الأرز المقلي والخضار المشوي"],["Vegetarian: Vegetable Lasagne Served with Roasted Vegetables","نباتي: لازانيا الخضار مع الخضار الرستو"]],
    [["Cheese Cake","كيك الجبنة"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Mon */ regLunch(1,
    [["Potato & Leek Soup","شوربة البطاطس واكرات"],["Meat Barley Soup","شوربة الحب مع اللحم"]],
    [["Green Beans Salad with Bell Pepper","سلطة الفاصوليا الخضراء مع الفلفل الألوان"],["Assorted Hot Appetizer","مقبلات ساخنة متنوعة"]],
    [["Fish Sayadiyah Served with Sayadiyah Rice and Grilled Vegetables","سمك صيادية يقدم مع أرز صيادية والخضار المشوي"],["Chicken Stuffed Paprika Sauce Served with Yellow Rice","دجاج محشي مع صوص باربيكا يقدم مع الأرز الأصفر"],["Dawood Basha Served with Yellow Rice and Grilled Vegetables","داود باشا يقدم مع الأرز الأبيض والخضار المشوي"],["Vegetarian: Couscous with Vegetables","نباتي: كسكس مع الخضار"]],
    [["Mango Mousse","موس المانجو"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Tue */ regLunch(2,
    [["Mushroom Cream Soup","شوربة الفطر بالكريمة"],["Harira Soup","شوربة حريرة المغربية"]],
    [["Greek Salad","سلطة يونانية"],["Mexican Cauliflower Salad","سلطة القرنبيط المكسيكية"]],
    [["Sweet and Sour Fish Served with Rizi Bizi and Grilled Vegetables","سمك حلو وحامض يقدم مع أرز بالبازلاء والخضار المشوي"],["Chicken Eminesh Served with Rizi Bizi and Grilled Vegetables","شرائح صدور الدجاج مع المشروم والكريمة يقدم مع أرز بالزعفران الحبق المشوي"],["Stir Fry Beef Served with Rizi Bizi and Grilled Vegetables","بيف ستير فراي يقدم مع أرز والخضار المشوي"],["Vegetarian: Schezwan Fried Noodles with Seasonal Vegetables","نباتي: نودلز شيزوان مقلية مع الخضار الموسمي"]],
    [["Red Velvet Cake","كيكة رد فلفت"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Wed */ regLunch(3,
    [["Chinese Sweet Corn Soup","شوربة الذرة الحلوة الصينية"],["Vegetables Soup","شوربة الخضار"]],
    [["Mix Olives Salad","سلطة زيتون مشكل"],["Oriental Salad","سلطة شرقية"]],
    [["Greek Fish Served with Saffron Rice and Grilled Vegetables","سمك على الطريقة اليونانية يقدم مع أرز بالزعفران والخضار المشوي"],["Tandoori Chicken Served with Saffron Rice and Grilled Vegetables","دجاج تندوري يقدم مع أرز بالزعفران والخضار المشوي"],["Beef Sour Cream Sauce Served with Saffron Rice and Grilled Vegetables","لحم مع الكريمة الحامضة يقدم مع أرز بالزعفران والخضار المشوي"],["Vegetarian: Chinese Style Noodles Served with Grilled Vegetables","نباتي: نودلز على الطريقة الصينية يقدم مع المشوي"]],
    [["Chocolate Cake","كيك الشوكولاته"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Thu */ regLunch(4,
    [["Spinach Soup","شوربة السبانخ"],["Turkish Lentil Soup","شوربة العدس على الطريقة التركية"]],
    [["Broccoli Salad","سلطة بروكلي"],["Assorted Hot Appetizer","مقبلات ساخنة متنوعة"]],
    [["Fried Fish Fillet Served with Vegetable Rice and Sautéed Vegetables","فيلية سمك مقلي يقدم مع الأرز بالخضار وخضار سوتيه"],["Chicken Biryani Served with Sautéed Vegetables & Raita","دجاج برياني يقدم مع الخضار وصوص الآيتا"],["Beef Teriyaki Served with Vegetable Rice and Sautéed Vegetables","لحم ترياكي يقدم مع الأرز بالخضار وخضار سوتيه"],["Vegetarian: Sautéed Vegetables Served with Penne Pomodoro","نباتي: خضار سوتيه يقدم مع بيني بومودورو"]],
    [["Strawberry Mousse","موس فراولة"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Fri */ regLunch(5,
    [["Creamy Corn Soup","شوربة الذرة مع الكريمة"],["Green Peas Soup with Mint","شوربة البازلاء مع النعناع"]],
    [["Moroccan Lentil Salad","سلطة العدس المغربية"],["Artichoke Salad","سلطة الارتيشوك"]],
    [["Samak Harra Served with White Rice and Sautéed Vegetables","سمك حارة يقدم مع الأرز الأبيض وخضار سوتيه"],["Chicken Mandi with Dukkus Sauce and Sautéed Vegetables","مندي دجاج مع صوص دقوس وخضار سوتيه"],["Beef Roast with Gravy Served with White Rice and Sautéed Vegetables","روستو بيف مع الصلصة يقدم مع الأرز الأبيض وخضار سوتيه"],["Vegetarian: Sautéed Broccoli Served with Spaghetti","نباتي: بروكلي سوتيه يقدم مع سباغيتي مع الطماطم صوص"]],
    [["Banana Cake","كيك الموز"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Sat */ regLunch(6,
    [["Marrow Soup with Basil","شوربة كوسا مع الريحان"],["Oats Soup","شوربة الشوفان"]],
    [["Moutabel Salad","سلطة متبل"],["Beetroot Salad with Orange","سلطة البنجر مع البرتقال"]],
    [["Sweet and Sour Shrimps Served with White Rice & Sautéed Vegetables","جمبري حلو وحامض يقدم مع أرز أبيض وخضار سوتيه"],["Chicken Chasseur Served with White Rice and Sautéed Vegetables","دجاج بصوص الصياد يقدم مع أرز أبيض وخضار سوتيه"],["Meat Kabab Served with Red Rice and Sautéed Vegetables","كباب اللحم المشوي يقدم مع أرز أحمر وخضار سوتيه"],["Vegetarian: Vegetable Jaffrezi Served with White Rice","نباتي: خضار جفريزي الهندي يقدم مع أرز أبيض"]],
    [["Mango Panna Cotta","مانجو بانا كوتا"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
];

const REG_DINNER: MenuGroup[][] = [
  /* Sun */ regDinner(0,
    [["Orzo Soup","شوربة لسان عصفور"],["Broccoli Soup","شوربة بروكلي"]],
    [["Potato Salad with Mayonnaise","سلطة بطاطس مع المايونيز"],["Rocca Salad with Pomegranate","سلطة الجرجير مع الرمان"]],
    [["Orly Fish Fillet Served with Dill Rice and Sautéed Vegetables","سمك فيلية أورلي يقدم مع أرز بالشبت وخضار سوتيه"],["Chicken Curry Served with Vegetables Yellow Rice and Sautéed Vegetables","دجاج كاري يقدم مع أرز أصفر والخضار وخضار سوتيه"],["Beef Goulash with Carrot and Potato Served with Vegetables/Yellow Rice","لحم جلاش مع الجزر والبطاطس والخضار يقدم مع أرز أصفر والخضار وخضار سوتيه"],["Vegetarian: Greek Cauliflower Served with Penne Tomato Sauce with Herbs","نباتي: قرنبيط على الطريقة اليوناني يقدم مع بيني صوص الطماطم بالأعشاب"]],
    [["Namoura Billashta","نمورة بالقشطة"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Mon */ regDinner(1,
    [["Pumpkin Soup","شوربة القرع العسلي"],["Chicken Creamy Soup","شوربة دجاج بالكريمة"]],
    [["Coleslaw Salad","سلطة كول سلو"],["Baba Ghanoush Salad","سلطة بابا غنوج"]],
    [["Tandoori Fish Served with Saffron Rice and Sautéed Green Beans with Carrots","سمك فيلية تندور يقدم مع الأرز بالزعفران والفاصوليا خضراء مع الجزر سوتيه"],["Chicken Supreme Served with Saffron Rice and Sautéed Green Beans with Carrots","دجاج سوبريم يقدم مع الأرز بالزعفران والفاصوليا خضراء والخضار سوتيه"],["Meat Kabsa Served with Dukkus Sauce and Sautéed Vegetables","كبسة لحم يقدم صوص الدقوس الخضار والجزر سوتيه"],["Vegetarian: Vegetable Ratatouille Served with Pasta Aglio E Olio","نباتي: خضار ألواني يقدم مع الباستا بالثوم وزيت الزيتون"]],
    [["Dates Cake","كيك التمر"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Tue */ regDinner(2,
    [["Cauliflower Soup","شوربة القرنبيط"],["Freekeh Meat Soup","شوربة فريكة باللحم"]],
    [["Assorted Hot Appetizer","تشكيلة من المقبلات الساخنة"],["Fattoush Salad","سلطة فتوش"]],
    [["Mix Seafood with Dill Sauce Served with Saffron Vegetable Rice and Roasted Vegetables","تشكيلة ثمار بحر مع صوص الشبت يقدم مع أرز بالزعفران والخضار والخضار الرستو"],["Chicken Piccata Served with Penne Arabiata and Roasted Vegetables","دجاج بيكاتا يقدم مع بيني أرابياتا والخضار الرستو"],["Veal Blanquette Served with Saffron Vegetable Rice and Roasted Vegetables","اللحم مع صوص الأبيض والخضار يقدم مع أرز بالزعفران والخضار الرستو"],["Vegetarian: Roasted Vegetables Served with Penne Arabiata","نباتي: الخضار الرستو يقدم مع بيني أرابياتا"]],
    [["Lemon Tart","تارت الليمون"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Wed */ regDinner(3,
    [["Marrow Cream Soup","شوربة كوسا بالكريمة"],["Oats Soup","شوربة الكويكر"]],
    [["Italian Pasta Salad","سلطة باستا إيطالية"],["Hummus","حمص"]],
    [["Fish Florentine Served with Red Rice and Sautéed Vegetables","سمك فلورنتين يقدم مع أرز أحمر وخضار سوتيه"],["Chicken Kabsa Served with Dukkus Sauce and Sautéed Vegetables","كبسة الدجاج يقدم مع صوص الدقوس الخضار سوتيه"],["Beef Stroganoff Served with White Rice and Sautéed Vegetables","بيف استروجانوف يقدم مع أرز أبيض وخضار سوتيه"],["Vegetarian: Sweet and Sour Vegetables Served with Pasta Aglio E Olio","نباتي: خضار حلوة وحامضة يقدم مع مكرونة بالثوم وزيت الزيتون"]],
    [["Carrot Cake","كيك الجزر"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Thu */ regDinner(4,
    [["Creamy Tomato Soup","شوربة طماطم بالكريمة"],["French Onion Soup","شوربة البصل الفرنسية"]],
    [["Russian Salad","سلطة لاروس"],["Red Beans and Corn Salad","سلطة الفاصوليا الحمراء والذرة"]],
    [["Grilled Salmon with Dill Sauce Served with Fettuccine Cream Sauce and Grilled Vegetables","سمك السلمون المشوي مع صوص الشبت وفيتوتشيني بصلصة الكريمة وخضار مشوي"],["Chicken Chinese-Style Served with Fried Rice & Grilled Vegetables","دجاج الأخضار على الطريقة الصينية يقدم مع الأرز المقلي والخضار المشوي"],["Steak Pepper Sauce Served with White Rice and Grilled Vegetables","ستيك مع صوص الفلفل والأرز الأبيض والخضار المشوي"],["Vegetarian: Fettuccine Cream Sauce Served with Grilled Vegetables","نباتي: فيتوتشيني بصلصة الكريمة يقدم مع والخضار الرستوي"]],
    [["Supreme Cake","كيك سوبريم"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Fri */ regDinner(5,
    [["Carrot Cream Soup","شوربة جزر مع كريمة"],["Minestrone Soup","شوربة مينسترونى"]],
    [["Mix Green Salad","سلطة خضراء"],["Sweet Corn Salad","سلطة الذرة الحلوة"]],
    [["Fish with Curry Sauce Served with Yellow Rice and Roasted Vegetables","سمك مع صوص الكاري يقدم مع الأرز الأصفر والخضار الرستو"],["Roasted Chicken Rosemary Sauce with Vermicelli Rice and Roasted Vegetables","دجاج روستو بصلصة الروزماري يقدم مع أرز بالشعيرية والخضار الرستو"],["Kibbeh Bil Laban Served with Vermicelli Rice and Roasted Vegetables","كبة بلبن يقدم مع أرز بالشعيرية والخضار الرستو"],["Vegetarian: Mix Vegetable with Tomato Sauce & White Rice","نباتي: خضار مشكل مع صوص الطماطم يقدم مع الشعيرية"]],
    [["Custard with Fruit","كاسترد بالفواكه"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Sat */ regDinner(6,
    [["Vegetable Soup","شوربة الخضار"],["Corn Creamy Soup","شوربة الذرة بالكريمة"]],
    [["Assorted Hot Appetizer","تشكيلة من المقبلات الساخنة"],["Chick Peas Salad","سلطة الحمص حب"]],
    [["Grilled Fish Fillet with Lemon Butter Sauce Served with Yellow Rice and Grilled Vegetables","سمك فيلية مشوي بصلصة الليمون وريده يقدم مع أرز أصفر والخضار المشوي"],["Grilled Chicken & Herb Sauce Served with Yellow Rice and Grilled Vegetables","الدجاج المشوي مع صوص الأعشاب يقدم مع أرز أصفر وخضار مشوي"],["Veal Stew with Green Peas Served with White Rice and Grilled Vegetables","يخنة اللحم مع البازلاء يقدم مع أرز أبيض والخضار المشوي"],["Vegetarian: Assorted Grilled Vegetable Served with Spaghetti Milanese","نباتي: تشكيلة من الخضروات المشوية يقدم مع سباغيتي ميلانيز"]],
    [["Black Forest Cake","كيك بلاك فورست"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
];

/* ═══════════════════════════════════════════════════════════════════════════
 * SOFT DIET — Day-Specific (Pages 32–38)
 * ═══════════════════════════════════════════════════════════════════════════ */

const SD_BREAKFAST = mkGroups([
  { id: "A", en: "Dairy & Bread", ar: "ألبان وخبز", mode: "included", items: [
    ["Cheese Platter", "طبق الجبن"], ["Milk", "حليب"], ["Bread Roll", "خبز الرول"],
  ]},
  { id: "B", en: "Eggs", ar: "البيض", mode: "choose-1", items: [
    ["Plain Omelette", "أومليت سادة"], ["Cheese Omelette", "أومليت جبنة"],
    ["Vegetable Omelette", "أومليت الخضروات"], ["Shakshuka", "شكشوكة"],
    ["Scrambled Egg", "البيض المخفوق"], ["Boiled Egg", "بيض مسلوق"],
  ]},
  { id: "C", en: "Hot Dishes", ar: "أطباق ساخنة", mode: "choose-1", items: [
    ["Foul Mudammas", "فول مدمس"], ["Baked Beans", "فاصوليا مطبوخة"],
  ]},
  { id: "D", en: "Cereals", ar: "حبوب الإفطار", mode: "choose-1", items: [
    ["Oats", "الشوفان"], ["Bran Flakes", "رقائق نخالة"], ["Choco Flakes", "رقائق الشوكولاتة"],
  ]},
  { id: "E", en: "Yogurt", ar: "الزبادي", mode: "choose-1", items: [
    ["Plain Yogurt", "زبادي سادة"], ["Fruit Yogurt", "زبادي بالفواكه"],
  ]},
  { id: "F", en: "Pastries", ar: "المعجنات", mode: "choose-1", items: [
    ["Danish Pastry", "فطيرة دانش"], ["Cinnamon Roll", "لفائف القرفة"],
  ]},
  { id: "G", en: "Complimentary", ar: "يأتي مع وجبتك", mode: "included", items: [
    ["Water Bottle", "مياه معدنية"],
  ]},
], "sd-b");

function sdLunch(day: number, soups: I[], salad: I[], mains: I[], starch: I[], desserts: I[]): MenuGroup[] {
  return mkGroups([
    { id: "A", en: "Soup", ar: "شوربة", mode: "choose-1", items: soups },
    { id: "B", en: "Salad / Side", ar: "سلطة", mode: "included", items: salad },
    { id: "C", en: "Main Dish", ar: "الطبق الرئيسي", mode: "choose-1", items: mains },
    { id: "D", en: "Starch", ar: "النشويات", mode: "choose-1", items: starch },
    { id: "E", en: "Sautéed Vegetables", ar: "خضار سوتيه", mode: "included", items: [["Sautéed Vegetables","خضار سوتيه"]] },
    { id: "F", en: "Dessert", ar: "الحلوى", mode: "choose-1", items: desserts },
    { id: "G", en: "Complimentary", ar: "يأتي مع وجبتك", mode: "included", items: [["Water Bottle","مياه معدنية"],["Tetra Pack Juice","عصير"]] },
  ], `sd-${day}-l`);
}

function sdDinner(day: number, soups: I[], salad: I[], mains: I[], starch: I[], desserts: I[]): MenuGroup[] {
  return mkGroups([
    { id: "A", en: "Soup", ar: "شوربة", mode: "choose-1", items: soups },
    { id: "B", en: "Salad / Side", ar: "سلطة", mode: "included", items: salad },
    { id: "C", en: "Main Dish", ar: "الطبق الرئيسي", mode: "choose-1", items: mains },
    { id: "D", en: "Starch", ar: "النشويات", mode: "choose-1", items: starch },
    { id: "E", en: "Roasted Vegetables", ar: "خضار الرستو", mode: "included", items: [["Roasted Vegetables","خضار الرستو"]] },
    { id: "F", en: "Dessert", ar: "الحلوى", mode: "choose-1", items: desserts },
    { id: "G", en: "Water", ar: "مياه", mode: "included", items: [["Water Bottle","مياه معدنية"]] },
  ], `sd-${day}-d`);
}

const SD_LUNCH: MenuGroup[][] = [
  /* Sun */ sdLunch(0, [["Lentil Soup","شوربة عدس"],["Chicken Vermicelli Soup","شوربة دجاج بالشعيرية"]], [["Hummus","حمص"]], [["Baked Fish & Coriander Tomato","شنية سمك بالفرن مع الكزبرة وطماطم صوص"],["Chinese Style Beef","لحم بقري على الطريقة الصينية"],["Chicken Fajita","فاهيتا الدجاج"]], [["White Rice","الأرز الأبيض"],["Pasta with Mushroom Sauce","باستا مشروم صوص"]], [["Plain Jelly","جلي"],["Banana","موز"]]),
  /* Mon */ sdLunch(1, [["Vegetable Soup","شوربة خضار"],["Barley Lamb Soup","شوربة حب"]], [["Cucumber Yogurt","زبادي بالخيار"]], [["Grilled Fish Sayadiyah","سمك مشوي صيادية"],["Dawood Basha","داود باشا"],["Vegetables Stuffed Chicken","دجاج محشي خضار"]], [["White Rice","الأرز الأبيض"],["Couscous with Vegetables","كسكس مع الخضار"]], [["Banana Cake","كيك الموز"],["Banana","موز"]]),
  /* Tue */ sdLunch(2, [["Mushroom Cream Soup","شوربة الفطر بالكريمة"],["Harira Soup","شوربة حريرة المغربية"]], [["Hummus","حمص"]], [["Samak Harra","سمك حارة مشوية"],["Grilled Kofta with Bawaz","كفته مشوية مع البواز"],["Chicken Eminesh","شرائح صدور الدجاج مع المشروم والكريمة"]], [["White Rice","الأرز الأبيض"],["Schezwan Noodles","نودلز شيزوان"]], [["Fruit Custard","كاسترد"],["Banana","موز"]]),
  /* Wed */ sdLunch(3, [["Corn Soup","شوربة الذرة"],["Mix Vegetable Soup","شوربة خضار مشكل"]], [["Tahina Salad","سلطة طحينة"]], [["Grilled Fish with Vegetables","سمك مشوي مع الخضار"],["Beef Sour Cream Sauce","لحم مع الكريمة الحامضة"],["Tandoori Chicken","دجاج تندوري"]], [["White Rice","الأرز الأبيض"],["Saffron Rice","أرز بالزعفران"]], [["Fruit Jelly","جلي"],["Banana","موز"]]),
  /* Thu */ sdLunch(4, [["Spinach Soup","شوربة السبانخ"],["Turkish Lentil Soup","شوربة العدس على الطريقة التركية"]], [["Plain Yogurt","زبادي سادة"]], [["Grilled Fish","فيلية سمك مشوي"],["Chinese Style Beef","لحم على الطريقة الصينية"],["Grilled Chicken","دجاج مشوي"]], [["White Rice","الأرز الأبيض"],["Penne Pomodoro","بيني بومودورو"]], [["Carrot Cake","كيك الجزر"],["Banana","موز"]]),
  /* Fri */ sdLunch(5, [["Cream Vegetable Soup","شوربة خضار مع الكريمة"],["Green Peas Soup with Mint","شوربة البازلاء مع النعناع"]], [["Dukkus","دقوس"]], [["Fish Tajine","سمك طاجن"],["Roast Beef with Gravy","روستو بيف مع الصلصة حريفي"],["Chicken Mandi","دجاج مندي"]], [["White Rice","الأرز الأبيض"],["Mandi Rice","أرز مندي"]], [["Plain Custard","كاسترد"],["Banana","موز"]]),
  /* Sat */ sdLunch(6, [["Marrow Soup with Basil","شوربة كوسا مع الريحان"],["Oats Soup","شوربة الشوفان"]], [["Moutabel Salad","سلطة متبل"]], [["Grilled Fish with Sour Sauce","سمك مشوي بالصلصة الحامضة"],["Meat Kabab","كباب اللحم المشوي"],["Chicken Chasseur","دجاج بصوص الصياد"]], [["White Rice","الأرز الأبيض"],["Vegetable Pasta","باستا مع الخضروات"]], [["Plain Custard","كاسترد"],["Banana","موز"]]),
];

const SD_DINNER: MenuGroup[][] = [
  /* Sun */ sdDinner(0, [["Orzo Soup","شوربة لسان عصفور"],["Broccoli Soup","شوربة بروكلي"]], [["Tahinia","طحينة"]], [["Grilled Fish Finger/Lemon Sauce","سمك فيلية مشوي أولي بصوص الليمون"],["Beef Goulash & Carrot and Green Peas","لحم جلاش مع الجزر والبازلاء"],["Turmeric Chicken","دجاج بالكركم"]], [["White Rice","الأرز الأبيض"],["Yellow Rice with Vegetables","أرز أصفر مع الخضار"]], [["Custard","كاسترد"],["Carrot Cake","كيك جزر"]]),
  /* Mon */ sdDinner(1, [["Pumpkin Soup","شوربة القرع"],["Chicken Creamy Soup","شوربة دجاج بالكريمة"]], [["Baba Ghanoush Salad","سلطة بابا غنوج"]], [["Tandoori Fish","فيلية سمك تندور"],["Lamb with Tomato Sauce","لحم مع صوص الطماطم"],["Chicken Supreme","دجاج سوبريم"]], [["White Rice","الأرز الأبيض"],["Pasta Aglio E Olio","باستا بالثوم وزيت الزيتون"]], [["Rice Pudding","أرز بالحليب"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Tue */ sdDinner(2, [["Cauliflower Soup","شوربة القرنبيط"],["Freekeh Meat Soup","شوربة فريكة باللحم"]], [["Cucumber Yogurt","زبادي بالخيار"]], [["Mix Seafood with Sauce","تشكيلة من ثمار البحر مع الصوص"],["Veal Blanquette","اللحم مع صوص الأبيض"],["Chicken Picatta","دجاج بيكاتا"]], [["White Rice","الأرز الأبيض"],["Penne Arabiata","بيني أرابياتا"]], [["Carrot Cake","كيك الجزر"],["Fresh Fruit (Whole)","فواكه طازجة"]]),
  /* Wed */ sdDinner(3, [["Marrow Cream Soup","شوربة كوسا بالكريمة"],["Oats Soup","شوربة الأوتكر"]], [["Hummus","حمص"]], [["Fish Florentine","سمك فلورنتين"],["Beef Stroganoff","بيف استروجانوف"],["Chicken Kabsa","كبسة الدجاج"]], [["White Rice","الأرز الأبيض"],["Pasta Aglio E Olio","باستا بالثوم وزيت الزيتون"]], [["Plain Custard","كاسترد"],["Banana Cake","كيك الموز"]]),
  /* Thu */ sdDinner(4, [["Creamy Tomato Soup","شوربة طماطم بالكريمة"],["French Onion Soup","شوربة البصل الفرنسية"]], [["Cucumber Yogurt","زبادي بالخيار"]], [["Grilled Salmon","سمك السلمون"],["Meat Balls","كرات اللحم"],["Chinese-Style Chicken","دجاج بالخضار على الطريقة الصينية"]], [["White Rice","الأرز الأبيض"],["Fettuccine Cream Sauce","فيتوتشيني بصلصة الكريمة"]], [["Carrot Cake","كيك الجزر"],["Banana","موز"]]),
  /* Fri */ sdDinner(5, [["Carrot Cream Soup","شوربة جزر مع كريمة"],["Minestrone Soup","شوربة مينسترونى"]], [["Hummus","حمص"]], [["Fish with Saffron Sauce","سمك مع صوص الزعفران"],["Beef Kofta","كفتة لحم"],["Chicken Breast with Rosemary Sauce","دجاج مشوي مع صلصة روزماري"]], [["White Rice","الأرز الأبيض"],["Spaghetti with Tomato Sauce","سباغيتي مع الطماطم صوص"]], [["Rice Pudding","أرز بالحليب"],["Carrot Cake","كيك الجزر"]]),
  /* Sat */ sdDinner(6, [["Vegetable Soup","شوربة الخضار"],["Corn Creamy Soup","شوربة الذرة بالكريمة"]], [["Plain Yogurt","زبادي سادة"]], [["Fish Fillet/Lemon Butter Sauce","سمك فيلية مشوي بصلصة الليمون"],["Veal Green Peas Stew","يخنة اللحم مع البازلاء"],["Chicken Breast & Herb Sauce","الدجاج المشوي مع صوص الأعشاب"]], [["White Rice","الأرز الأبيض"],["Spaghetti Tomato Sauce","سباغيتي صلصة الطماطم"]], [["Fruit Jelly","جلي"],["Banana Cake","كيك موز"]]),
];

/* ═══════════════════════════════════════════════════════════════════════════
 * RESOLVER — Main export: returns MenuGroup[] for a given diet + meal + day
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Get the menu groups for a specific diet, meal, and day of week.
 * For all-days diets, dayOfWeek is ignored.
 * For day-specific diets, dayOfWeek should be 0=Sun … 6=Sat (from Date.getDay()).
 *
 * For Kids breakfast, returns the SHARED groups only.
 * Use getKidsBreakfastGroups() to get hot/cold specific groups.
 */
export function getMenuGroups(
  diet: DietType,
  meal: MealId,
  dayOfWeek: number,
): MenuGroup[] {
  switch (diet) {
    /* ── All-days diets ── */
    case "chemotherapy":
      return meal === "breakfast" ? CHEMO_BREAKFAST :
             meal === "lunch"     ? CHEMO_LUNCH    : CHEMO_DINNER;
    case "kids":
      return meal === "breakfast" ? KIDS_BREAKFAST_SHARED :
             meal === "lunch"     ? KIDS_LUNCH            : KIDS_DINNER;
    case "ob":
      return meal === "breakfast" ? OB_BREAKFAST :
             meal === "lunch"     ? OB_LUNCH     : OB_DINNER;

    /* ── Day-specific diets ── */
    case "diabetic":
      if (meal === "breakfast") return DIABETIC_BREAKFAST;
      return meal === "lunch" ? DIABETIC_LUNCH[dayOfWeek] ?? DIABETIC_LUNCH[0]
                              : DIABETIC_DINNER[dayOfWeek] ?? DIABETIC_DINNER[0];
    case "low-potassium":
      if (meal === "breakfast") return LP_BREAKFAST;
      return meal === "lunch" ? LP_LUNCH[dayOfWeek] ?? LP_LUNCH[0]
                              : LP_DINNER[dayOfWeek] ?? LP_DINNER[0];
    case "low-sodium":
      if (meal === "breakfast") return LS_BREAKFAST;
      return meal === "lunch" ? LS_LUNCH[dayOfWeek] ?? LS_LUNCH[0]
                              : LS_DINNER[dayOfWeek] ?? LS_DINNER[0];
    case "regular":
      if (meal === "breakfast") return REG_BREAKFAST;
      return meal === "lunch" ? REG_LUNCH[dayOfWeek] ?? REG_LUNCH[0]
                              : REG_DINNER[dayOfWeek] ?? REG_DINNER[0];
    case "soft-diet":
      if (meal === "breakfast") return SD_BREAKFAST;
      return meal === "lunch" ? SD_LUNCH[dayOfWeek] ?? SD_LUNCH[0]
                              : SD_DINNER[dayOfWeek] ?? SD_DINNER[0];

    default:
      return REG_BREAKFAST;
  }
}

/** Returns the Kids hot/cold breakfast specific groups */
export function getKidsBreakfastGroups(type: "hot" | "cold"): MenuGroup[] {
  return type === "hot"
    ? [...KIDS_BREAKFAST_SHARED, ...KIDS_BREAKFAST_HOT]
    : [...KIDS_BREAKFAST_SHARED, ...KIDS_BREAKFAST_COLD];
}

/** Serving window metadata for each meal */
export const MEAL_WINDOWS: Record<MealId, {
  label: { en: string; ar: string };
  timeRange: string;
  hours: [number, number];
  orderCutoff: number;
  color: string;
}> = {
  breakfast: { label: { en: "Breakfast", ar: "فطور" }, timeRange: "8:00 AM – 9:00 AM", hours: [8, 10], orderCutoff: 6, color: "#F59E0B" },
  lunch:     { label: { en: "Lunch", ar: "غداء" },     timeRange: "1:00 PM – 2:00 PM", hours: [13, 14], orderCutoff: 11, color: "#22C55E" },
  dinner:    { label: { en: "Dinner", ar: "عشاء" },    timeRange: "7:00 PM – 8:00 PM", hours: [19, 20], orderCutoff: 17, color: "#6366F1" },
};
