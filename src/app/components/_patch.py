"""
Patch FoodOrdering.tsx:
1. Replace imports/types (lines 1-55)
2. Replace MENU items (lines 92-361)  
3. Add filter logic to FoodOrdering component (after line 393)
4. Add banner + empty state + allergen chips to JSX
"""
import re

src = r"c:\Users\Balfaqih\OneDrive - Bits Arabia\General - CAREINN TO DO List\Redesign Bedside Screen UI (Abdulrahman) (Copy)alnajjar\src\app\components\FoodOrdering.tsx"

with open(src, "r", encoding="utf-8") as f:
    content = f.read()

# ── PATCH 1: Add useMemo, AlertTriangle, NurseDataStore import ──
content = content.replace(
    'import { useState, useCallback } from "react";',
    'import { useState, useCallback, useMemo } from "react";'
)
content = content.replace(
    '  ChevronRight,\n} from "lucide-react";',
    '  ChevronRight,\n  AlertTriangle,\n} from "lucide-react";'
)
content = content.replace(
    'import type { PlacedOrder, OrderStatus } from "./OrderStore";',
    'import type { PlacedOrder, OrderStatus } from "./OrderStore";\nimport { useNurseStore } from "./NurseDataStore";'
)

# ── PATCH 2: Replace MenuItem interface + add types + normalizer ──
old_types = '''type DietaryTag = "vegetarian" | "vegan" | "gluten-free" | "low-sodium" | "diabetic-friendly" | "high-protein";

interface MenuItem {
  id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  image: string;
  calories: number;
  tags: DietaryTag[];
  popular?: boolean;
}'''

new_types = '''type DietaryTag = "vegetarian" | "vegan" | "gluten-free" | "low-sodium" | "diabetic-friendly" | "high-protein";

type Allergen =
  | "peanuts" | "tree-nuts" | "shellfish" | "fish" | "eggs"
  | "dairy" | "lactose" | "gluten" | "wheat" | "soy" | "sesame"
  | "latex" | "penicillin";

type DietCompatibility =
  | "REG" | "DM" | "NAS" | "RD" | "LF" | "SOFT" | "CL" | "FL" | "BLAND" | "LP";

interface MenuItem {
  id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  image: string;
  calories: number;
  tags: DietaryTag[];
  popular?: boolean;
  suitableFor: DietCompatibility[];
  allergens: Allergen[];
  nutrition?: { protein?: number; carbs?: number; sodium?: number; sugar?: number; fat?: number };
}

/** Map raw nurse-entered allergy strings to standardized tokens */
function normalizeAllergyName(raw: string): Allergen | null {
  const lower = raw.toLowerCase().trim();
  const map: Record<string, Allergen> = {
    "peanut": "peanuts", "peanuts": "peanuts",
    "tree nut": "tree-nuts", "tree nuts": "tree-nuts", "nuts": "tree-nuts",
    "shellfish": "shellfish", "shrimp": "shellfish", "crab": "shellfish", "lobster": "shellfish",
    "fish": "fish", "egg": "eggs", "eggs": "eggs",
    "milk": "dairy", "dairy": "dairy", "lactose": "lactose",
    "gluten": "gluten", "wheat": "wheat", "soy": "soy", "soya": "soy",
    "sesame": "sesame", "latex": "latex", "penicillin": "penicillin",
  };
  return map[lower] ?? null;
}'''

content = content.replace(old_types, new_types)

# ── PATCH 3: Replace entire MENU constant ──
# Find start and end of MENU
menu_start = content.index('const MENU: MealCategory[] = [')
# Find the matching ];  after the MENU
# We know it ends with \n];\n\nconst DANGER
menu_end_marker = '];\n\nconst DANGER'
menu_end = content.index(menu_end_marker, menu_start)
menu_end += 2  # include the ];

new_menu = '''const MENU: MealCategory[] = [
  {
    id: "breakfast", label: { en: "Breakfast", ar: "\\u0627\\u0644\\u0641\\u0637\\u0648\\u0631" }, icon: Sun,
    timeRange: { en: "6:00 AM \\u2013 10:00 AM", ar: "\\u0666:\\u0660\\u0660 \\u0635 \\u2013 \\u0660\\u0660:\\u0660\\u0660 \\u0635" }, hours: [6, 10], color: "#F59E0B",
    items: [
      { id:"b1", name:{en:"Eggs & Toast",ar:"\\u0628\\u064a\\u0636 \\u0648\\u062a\\u0648\\u0633\\u062a"}, description:{en:"Scrambled eggs with whole wheat toast and fresh vegetables",ar:"\\u0628\\u064a\\u0636 \\u0645\\u062e\\u0641\\u0648\\u0642 \\u0645\\u0639 \\u062a\\u0648\\u0633\\u062a \\u0642\\u0645\\u062d \\u0643\\u0627\\u0645\\u0644 \\u0648\\u062e\\u0636\\u0631\\u0627\\u0648\\u0627\\u062a \\u0637\\u0627\\u0632\\u062c\\u0629"}, image:"https://images.unsplash.com/photo-1725986038149-00f65b707814?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3NwaXRhbCUyMGJyZWFrZmFzdCUyMHRyYXklMjBlZ2dzJTIwdG9hc3QlMjBoZWFsdGh5fGVufDF8fHx8MTc3MzgwNTgwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral", calories:320, tags:["high-protein"], popular:true, suitableFor:["REG","DM","NAS","LF","BLAND"], allergens:["eggs","gluten","wheat"], nutrition:{protein:22,carbs:28,sodium:380,fat:14} },
'''

# Actually this approach with unicode escapes is getting messy. Let me just do direct replacement.
print("Script approach abandoned - too complex with Arabic text escaping")
print("Will use direct file edits instead")
