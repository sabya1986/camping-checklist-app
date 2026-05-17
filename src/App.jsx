import { useState, useMemo, useEffect, useRef } from "react";
import { db } from "./firebase";
import { ref as dbRef, onValue, set } from "firebase/database";

// ── Packing List Data ──────────────────────────────────────────────────────

const WEATHER = {
  fri: { day: "Fri 5/22 — Arrival", high: "65°F", low: "47°F", desc: "Mostly cloudy. 24% rain chance. Cool & breezy — pack a jacket for arrival evening. 11 mph winds.", icon: "🌥️" },
  sat: { day: "Sat 5/23 — Full Day", high: "68°F", low: "51°F", desc: "Showers, 40% rain chance. Dress in layers! Use canvas living room as rain backup. Grill can still work!", icon: "🌧️" },
  sun: { day: "Sun 5/24 — Checkout", high: "72°F", low: "52°F", desc: "Mostly cloudy. 24% rain chance. Warmest day of the trip! Pack up in the morning — checkout by 1 PM.", icon: "🌥️" },
};

const SECTIONS = [
  {
    id: "sleep",
    emoji: "🛏️",
    label: "Sleeping & Comfort",
    note: "Bedding, plush mattresses & mosquito netting are provided. Outlets in each tent.",
    items: [
      { id: "s1", text: "Extra sleeping pads/air mattresses for overflow (camp provides 8 beds for 13 people)", required: true },
      { id: "s2", text: "Sleeping bags or warm blankets (nights 47–51°F — it'll be chilly, pack something warm!)", required: true },
      { id: "s3", text: "Pillows (not provided)", required: true },
      { id: "s4", text: "Portable fan (outlets available — but likely unnecessary given 65°F highs & chilly nights)", required: false },
      { id: "s5", text: "Earplugs / sleep masks", required: false },
      { id: "s6", text: "Nightlight or small lantern for kids' tents", required: true },
      { id: "s7", text: "Extension cord / power strip (outlets in tents)", required: false },
    ],
  },
  {
    id: "clothing",
    emoji: "👕",
    label: "Clothing & Personal",
    note: "Temps: highs 65–72°F / lows 47–51°F. Pack warm layers! Rain possible Fri (24%), likely Sat (40%), light chance Sun (24%).",
    items: [
      { id: "c1", text: "Light tees + jeans or light pants for daytime (2–3 sets per person) — 65–68°F with wind & clouds, shorts will feel chilly", required: true },
      { id: "c2", text: "Warm fleece, hoodie, or mid-weight jacket for evenings — nights drop to 47–51°F, a light jacket won't be enough!", required: true },
      { id: "c3", text: "Rain jacket / poncho for each person", required: true },
      { id: "c4", text: "Comfortable hiking/walking shoes (trail terrain)", required: true },
      { id: "c5", text: "Sandals / flip flops for camp lounging & showers", required: true },
      { id: "c6", text: "Swimwear (probably skip — 65–68°F & cloudy/rainy makes Lake Geneva swimming unlikely)", required: false },
      { id: "c7", text: "Pajamas for kids (a warm set for cooler nights)", required: true },
      { id: "c8", text: "Socks (extra pairs — 3 per person minimum)", required: true },
      { id: "c9", text: "Warm beanie or knit hat (skip the sun hat — it'll be mostly cloudy; a beanie is essential for 47–51°F nights)", required: true },
      { id: "c10", text: "Underwear (3 per person)", required: true },
    ],
  },
  {
    id: "toiletries",
    emoji: "🧴",
    label: "Toiletries & Health",
    note: "Modern bathrooms & outdoor showers are a short walk from camp.",
    items: [
      { id: "t1", text: "Sunscreen SPF 50+ (bring from home — your trusted brand)", required: true },
      { id: "t2", text: "DEET bug spray (Wisconsin mosquitoes are real — bring 2 bottles)", required: true },
      { id: "t3", text: "Shower caddy / toiletry bag per family", required: true },
      { id: "t4", text: "Towels (bath towels — not provided; beach towels optional given unlikely swimming weather)", required: true },
      { id: "t5", text: "Shampoo, conditioner, body wash (travel size)", required: true },
      { id: "t6", text: "Toothbrush, toothpaste, floss", required: true },
      { id: "t7", text: "Deodorant", required: true },
      { id: "t8", text: "Wet wipes / hand sanitizer (kids get dirty fast)", required: true },
      { id: "t9", text: "Feminine hygiene products as needed", required: false },
      { id: "t10", text: "Shower shoes / flip flops for shared outdoor showers", required: true },
    ],
  },
  {
    id: "firstaid",
    emoji: "🩹",
    label: "First Aid & Safety",
    note: "5 kids aged 3–11. Be prepared!",
    items: [
      { id: "f1", text: "First aid kit (band-aids, gauze, antiseptic, tweezers)", required: true },
      { id: "f2", text: "Children's ibuprofen / acetaminophen", required: true },
      { id: "f3", text: "Adult pain reliever / antihistamine (Benadryl)", required: true },
      { id: "f4", text: "Hydrocortisone cream (bug bites & rashes)", required: true },
      { id: "f5", text: "Moleskin / blister pads (for hiking)", required: false },
      { id: "f6", text: "Prescription medications for anyone who needs them", required: true },
      { id: "f7", text: "EpiPen if anyone has allergies", required: true },
      { id: "f8", text: "Tick removal tool / fine-tipped tweezers", required: true },
      { id: "f9", text: "Thermometer", required: false },
      { id: "f10", text: "Emergency contacts list (offline, in a bag)", required: true },
      { id: "f11", text: "Camp phone number saved: 608-386-1222", required: true },
    ],
  },
  {
    id: "cooking",
    emoji: "🔥",
    label: "Cooking & Food",
    note: "Propane grill, cookware, pots/pans, utensils, dishes, and a refrigerator/freezer are all PROVIDED.",
    subsections: [
      {
        label: "🏠 Bring from Chicago (specialty / bulk / brand-specific)",
        items: [
          { id: "ck1", text: "Spice kit: salt, pepper, garlic powder, paprika, cumin, chili flakes", required: true },
          { id: "ck2", text: "Marinades & BBQ sauces (your preferred brands)", required: true },
          { id: "ck3", text: "Olive oil / cooking spray", required: true },
          { id: "ck4", text: "Aluminum foil (heavy duty — for fish/shrimp/veggies on grill)", required: true },
          { id: "ck5", text: "Ziplock bags (various sizes — marinating, leftovers)", required: true },
          { id: "ck6", text: "Paper towels & dish soap", required: true },
          { id: "ck7", text: "Cutting board & sharp knife (camp set may be basic)", required: true },
          { id: "ck8", text: "Instant coffee / pods for the provided coffee maker", required: true },
          { id: "ck9", text: "Kids' juice boxes, pouches, or drink mix", required: true },
          { id: "ck10", text: "Beer, wine, spirits (buy before leaving IL — cheaper)", required: false },
          { id: "ck11", text: "Specialty snacks for picky kids (Goldfish, fruit pouches, etc.)", required: false },
          { id: "ck12", text: "Breakfast staples: pancake mix, maple syrup, granola/oats", required: false },
          { id: "ck13", text: "Condiments: ketchup, mustard, mayo, hot sauce", required: true },
          { id: "ck14", text: "S'mores kit: graham crackers, chocolate bars, marshmallows", required: true },
          { id: "ck15", text: "Trash bags (10+ gallon)", required: true },
        ],
      },
      {
        label: "🛒 Buy Locally (Hansen's IGA or Sawyer's Farm & Meat — East Troy, 5 min away)",
        items: [
          { id: "bl1", text: "Ground beef / burger patties (8–10 patties) — Sawyer's Farm has excellent local meat", required: true },
          { id: "bl2", text: "Chicken thighs / breasts (2–3 lbs for 13 people)", required: true },
          { id: "bl3", text: "Shrimp (1–2 lbs) and/or fish fillets", required: true },
          { id: "bl4", text: "Veggie assortment: bell peppers, zucchini, corn, onions, mushrooms", required: true },
          { id: "bl5", text: "Burger buns & hot dog buns", required: true },
          { id: "bl6", text: "Eggs & bacon for Saturday breakfast", required: true },
          { id: "bl7", text: "Bread / sandwich supplies for Friday lunch", required: true },
          { id: "bl8", text: "Fresh fruit & salad (watermelon, strawberries — in season in late May)", required: true },
          { id: "bl9", text: "Chips, dips, salsa — snack spread", required: false },
          { id: "bl10", text: "Milk, creamer for coffee", required: true },
          { id: "bl11", text: "Water (cases of bottles) and/or reusable water cooler", required: true },
          { id: "bl12", text: "Ice (2 bags — for cooler & drinks)", required: true },
          { id: "bl13", text: "Cheese slices for burgers", required: true },
          { id: "bl14", text: "Kid-friendly snacks: apples, bananas, PB crackers, string cheese", required: true },
        ],
      },
    ],
  },
  {
    id: "kids",
    emoji: "🎉",
    label: "Kids' Entertainment & Activities",
    note: "Ages 3, 6, 6, 7, 11. Keep them busy from arrival to bedtime!",
    items: [
      { id: "k1", text: "Glow sticks / LED bracelets for nighttime fun", required: true },
      { id: "k2", text: "Frisbee, football, soccer ball", required: true },
      { id: "k3", text: "Jump rope & bubbles (great for the 3 & 6 year olds)", required: true },
      { id: "k4", text: "Sidewalk chalk (great on the camp's hard surfaces)", required: false },
      { id: "k5", text: "Card games: Uno, Go Fish, Old Maid", required: true },
      { id: "k6", text: "Board games for the canvas living room: Sequence, Jenga", required: false },
      { id: "k7", text: "Nature scavenger hunt printout (easy to prep in Chicago)", required: true },
      { id: "k8", text: "Coloring books & crayons for the 3-year-old", required: true },
      { id: "k9", text: "Headlamps (one per kid — they LOVE these at night)", required: true },
      { id: "k10", text: "Bug-catching kit / magnifying glass (age-appropriate)", required: false },
      { id: "k11", text: "Glow-in-the-dark Frisbee for evening play", required: false },
      { id: "k12", text: "Tablet with downloaded movies (for the 3-year-old's nap/meltdown moments)", required: false },
      { id: "k13", text: "Small backpack per kid for hikes", required: false },
      { id: "k14", text: "Change of clothes for each kid in a day bag (they will get dirty)", required: true },
    ],
  },
  {
    id: "gear",
    emoji: "🎒",
    label: "General Camp Gear",
    note: "Camp provides hammock, fire pit, firewood & fire starters.",
    items: [
      { id: "g1", text: "Cooler (large — for drinks & keeping meat cold en route)", required: true },
      { id: "g2", text: "Camp chairs (4 families × 2 = 8 chairs minimum)", required: true },
      { id: "g3", text: "Folding table (for food prep/serving, camp may have one)", required: false },
      { id: "g4", text: "Reusable water bottles (one per person)", required: true },
      { id: "g5", text: "Flashlights or headlamps (adults)", required: true },
      { id: "g6", text: "Portable Bluetooth speaker", required: true },
      { id: "g7", text: "Extra propane cylinder (confirm camp has a full tank, bring a backup)", required: false },
      { id: "g8", text: "Grill brush (to clean provided propane grill)", required: false },
      { id: "g9", text: "Tongs & spatula set (camp provides, but extras are nice for simultaneous grilling)", required: false },
      { id: "g10", text: "Rope / bungee cords (general utility)", required: false },
      { id: "g11", text: "Duct tape (always)", required: false },
      { id: "g12", text: "Tarps (backup rain cover — in case of downpours on 5/23 evening)", required: false },
      { id: "g13", text: "Laundry bags / wet bag (for dirty/wet clothes)", required: true },
      { id: "g14", text: "Car phone chargers (for the drive)", required: false },
    ],
  },
];

const ACTIVITIES = [
  {
    time: "Morning (8–11 AM)",
    emoji: "☀️",
    color: "#f59e0b",
    items: [
      { title: "Camp Breakfast Cook-Off", desc: "Split into 2 teams — each makes a different breakfast dish on the grill. Eggs, bacon, pancakes. Kids flip pancakes!" },
      { title: "Nature Scavenger Hunt", desc: "Give each kid a printed list: find a feather, a pinecone, a spider web, a smooth rock, 3 different bugs. Whoever finds all 10 items first wins." },
      { title: "Pond Walk & Hiking Trails", desc: "Camp Kettlewood has trails around the property and a pond. Perfect 45–60 min morning walk for all ages. The 3-year-old can ride in a carrier." },
      { title: "Hammock Relay & Lawn Games", desc: "Camp provides a hammock. Set up cornhole, frisbee, or a soccer shootout between families." },
    ],
  },
  {
    time: "Afternoon (12–5 PM)",
    emoji: "🌤️",
    color: "#3b82f6",
    items: [
      { title: "Green Meadows Petting Farm (15 min away)", desc: "Perfect for the 3, 6 & 7-year-olds. They can feed animals, go on a hayride, and learn about the farm. Check hours before leaving camp." },
      { title: "Lake Geneva Public Beach", desc: "30 min away. Great for the older kids (7 & 11). Swimming unlikely given 65–68°F & rain chances, but the lakefront walk and ice cream at the Riviera Dockyard are still worth the trip!" },
      { title: "East Troy Electric Railroad Museum", desc: "Ride a restored vintage electric streetcar through the countryside. The 11-year-old and history-loving adults will love it. 15 min from camp." },
      { title: "Big BBQ Prep Party", desc: "Get the kids involved in the cook! The 11 & 7-year-olds can skewer shrimp/veggies, the 6-year-olds can wash produce, and the 3-year-old can 'season' with a spoon." },
    ],
  },
  {
    time: "Evening (5 PM – Bedtime)",
    emoji: "🔥",
    color: "#ef4444",
    items: [
      { title: "Grand BBQ Cookout", desc: "Fire up the propane grill. Suggested order: chicken first (longest cook), then burgers & shrimp, then fish & veggie skewers. Use foil packets for shrimp/fish. Set up a condiment station in the canvas living room." },
      { title: "Campfire S'mores & Storytelling", desc: "Firewood & starters are provided! Light the fire at dusk. Each kid roasts their own marshmallow. Adults can share spooky campfire stories (age-appropriate — keep the 3-year-old happy ones!)." },
      { title: "Glow-In-The-Dark Games", desc: "Hand out glow sticks. Play glow Frisbee, glow tag, or make glow bracelets. The kids will run wild and tire themselves out naturally." },
      { title: "Star Gazing", desc: "East Troy is away from city light pollution. Lay blankets out and spot constellations. Download the Star Walk app before you leave Chicago." },
      { title: "Canvas Living Room Wind-Down", desc: "Board games, card games (Uno!), and hot chocolate for the kids as a bedtime transition. Adults can continue with drinks around the fire." },
    ],
  },
];

const STORES = [
  { name: "Hansen's IGA Market", dist: "~5 min", hours: "6am–9pm", note: "Right in East Troy. Best for produce, dairy, meat, basics." },
  { name: "Sawyer's Farm & Meat Plant", dist: "~10 min", hours: "Call ahead", note: "Local butcher — excellent fresh burgers, chicken, sausage." },
  { name: "The Elegant Farmer", dist: "~10 min", hours: "Seasonal hours", note: "Farm market, deli, famous apple pie. Great for unique snacks & local produce." },
  { name: "Walmart Supercenter (Mukwonago)", dist: "~20 min", hours: "24 hrs", note: "Full selection. Best for bulk supplies, gear gaps, or specialty items." },
  { name: "ALDI (Mukwonago)", dist: "~20 min", hours: "8:30am–8pm", note: "Best prices on staples, snacks, cheese, drinks." },
  { name: "Pick 'n Save (Mukwonago)", dist: "~20 min", hours: "6am–11pm", note: "Full grocery + pharmacy. Good for any last-minute needs." },
];

// ── Supply List Data ───────────────────────────────────────────────────────

const FAMILY_COLORS = {
  farhana: { dot: "#fbbf24", dot2: "🟡" },
  upasha:  { dot: "#3b82f6", dot2: "🔵" },
  upasana: { dot: "#f97316", dot2: "🟠" },
  farzana: { dot: "#ef4444", dot2: "🔴" },
  prerna:  { dot: "#a78bfa", dot2: "🟣" },
  all:     { dot: "#8fb86a", dot2: "🌍" },
};

// Assignments use PICK AND CHOOSE (Main Sheet col 6–7) as primary source,
// Sheet1 family column as fallback, Main Sheet family columns for items not elsewhere assigned.
// Upasha and Upasana are two distinct families.
const SUPPLY_SECTIONS = [
  { id: "individual", emoji: "🏕️", label: "Individual Items", note: "Each family brings their own — per-household supplies.",
    items: [
      { id: "tent",      name: "TENT",             family: "" },
      { id: "tarp",      name: "TARP",             family: "" },
      { id: "ropes",     name: "ROPES",            family: "" },
      { id: "tiki-ind",  name: "TIKI LIGHT",       family: "" },
      { id: "hooks",     name: "HOOKS FOR TENT",   family: "" },
      { id: "hammer",    name: "HAMMER",           family: "" },
      { id: "bed",       name: "BED + BLOWER",     family: "" },
      { id: "torch",     name: "TORCH",            family: "" },
      { id: "blanket",   name: "BLANKET + PILLOW", family: "" },
      { id: "bugrepel",  name: "BUG REPELLANT",    family: "" },
      { id: "afterbite", name: "AFTER BITE",       family: "" },
      { id: "flashlight",name: "FLASHLIGHT",       family: "" },
      { id: "batteries", name: "BATTERIES",        family: "" },
      { id: "umbrella",  name: "UMBRELLA",         family: "" },
      { id: "chair",     name: "CHAIR",            family: "" },
      { id: "water",     name: "WATER",            family: "" },
    ],
  },
  { id: "lunch-dinner", emoji: "🍖", label: "Lunch / Dinner", note: "Main protein and dinner items.",
    items: [
      { id: "fish1",       name: "FISH 1 — POMPANO",          family: "upasha"  }, // PnC: Upasha
      { id: "fish2",       name: "FISH 2",                    family: "upasha"  }, // PnC: Upasha
      { id: "chicken",     name: "CHICKEN",                   family: "prerna"  }, // PnC: Prerna
      { id: "mutton",      name: "MUTTON",                    family: "farzana" }, // PnC: Farzana
      { id: "veggies",     name: "VEGGIES",                   family: "upasha"  }, // PnC: Upasha
      { id: "shrimp",      name: "SHRIMP",                    family: "" }, // PnC: Farhana
      { id: "paneer1",     name: "PANEER 1",                  family: "" }, // PnC: Farhana
      { id: "paneer2",     name: "PANEER 2",                  family: "upasha"  }, // PnC: Upasha
      { id: "biryani",     name: "Biryani [Chicken/Shrimp]",  family: "" }, // PnC: Farhana
      { id: "maggie",      name: "MAGGIE",                    family: "upasha"  }, // PnC: Upasha
      { id: "fish-gen",    name: "FISH (general)",            family: ""        },
      { id: "chicken-tand",name: "CHICKEN TANDOORI",          family: ""        },
      { id: "keema",       name: "Mutton keema sliders",      family: ""        },
      { id: "quesadilla",  name: "Tortilla & shredded cheese",family: ""        },
    ],
  },
  { id: "breakfast", emoji: "🍳", label: "Breakfast", note: "Saturday morning spread.",
    items: [
      { id: "sausage",     name: "Sausage",                                              family: "upasha"  }, // PnC: Upasha
      { id: "eggs",        name: "EGGS",                                                 family: "" }, // PnC: Farhana
      { id: "shred-cheese",name: "Shredded CHEESE",                                     family: "upasana" }, // Sheet1: Upasana (different item from CHEESE→Upasha)
      { id: "bread2",      name: "BREAD (2)",                                            family: "upasana" }, // Sheet1: Upasana (different item from BREAD→Prerna)
      { id: "hashbrown",   name: "HASHBROWN",                                            family: "upasha"  }, // PnC: Upasha
      { id: "brownbread",  name: "Brown bread",                                          family: ""        },
      { id: "muffin",      name: "ENGLISH MUFFIN",                                       family: "upasha"  }, // Sheet1: Upasha
      { id: "garlicbread", name: "Garlic Bread",                                         family: "prerna"  }, // Sheet1: Prerna
      { id: "charcuterie", name: "Charcuterie board (crackers, cheese, chicken salami)", family: "prerna"  }, // Sheet1: Prerna
      { id: "woodentray",  name: "Wooden tray",                                          family: "farzana" }, // Sheet1: Farzana
      { id: "charcheese",  name: "Cheese for charcuterie",                               family: "farzana" }, // Sheet1: Farzana
    ],
  },
  { id: "common-nonfood", emoji: "🧹", label: "Common Items — Non Food", note: "Shared supplies and equipment.",
    items: [
      { id: "plates",    name: "PLATES",              family: "farzana" }, // PnC: Farzana
      { id: "cups",      name: "CUPS [Water & Tea]",  family: "" }, // PnC: Farhana
      { id: "tissues",   name: "TISSUES CleanX",      family: "upasha"  }, // PnC: Upasha
      { id: "trashbag",  name: "TRASHBAG",            family: "farzana" }, // PnC: Farzana
      { id: "spoons",    name: "SPOON AND FORKS",     family: "prerna"  }, // PnC: Prerna
      { id: "cutboard",  name: "CUTTING BOARD",       family: "" }, // PnC: Farhana/Upasha → Farhana
      { id: "knife",     name: "KNIFE",               family: "all"     }, // PnC: Farhana/Upasha → All
      { id: "alfoil",    name: "ALUMINIUM FOIL (2)",  family: "" }, // PnC: Farhana
      { id: "ziplock",   name: "ZIPLOCK",             family: "upasha"  }, // PnC: Upasha
      { id: "papertowel",name: "Paper Towel",         family: "" }, // PnC: Farhana
      { id: "tikifluid", name: "TIKI LIGHT FLUID",    family: "prerna"  }, // PnC: Prerna
      { id: "dishsoap",  name: "Dish Soap And Brush", family: "" }, // PnC: Farhana
      { id: "strainer",  name: "Strainer",            family: "upasana" }, // Sheet1: Upasana
      { id: "fogger",    name: "FOGGER",              family: "upasha"  }, // Sheet1: Upasha/Prerna → Upasha
      { id: "tablecloth",name: "Table cloth",         family: "farzana" }, // Main Sheet Farzana col
      { id: "bbq",       name: "BARBEQUE STAND",      family: "farzana" }, // Sheet1: Farzana
      { id: "cooler",    name: "COOLER",              family: "all"     }, // Sheet1: All
      { id: "coal",      name: "COAL + IGNITOR",      family: "farzana" }, // Sheet1: Farzana
      { id: "lighter",   name: "LIGHTER",             family: "farzana" }, // Sheet1: Farzana
      { id: "firstaid",  name: "FIRST AID",           family: "all"     },
      { id: "tp",        name: "TOILET PAPER",        family: "all"     },
      { id: "cookutil",  name: "COOKING UTENSILS",    family: "all"     },
      { id: "burner",    name: "BURNER",              family: "upasha"  }, // Sheet1: Upasha
      { id: "pan",       name: "PAN",                 family: "upasha"  }, // Sheet1: Upasha
      { id: "servspoon", name: "Serving Spoons",      family: "all"     },
      { id: "clingfoil", name: "Clingfoil",           family: "prerna"  }, // Main Sheet Prerna col
      { id: "bluetooth", name: "Bluetooth speaker",   family: "prerna"  }, // Main Sheet Prerna col
      { id: "pantea",    name: "Pan for tea",         family: ""        },
      { id: "tblcloth2", name: "TABLE CLOTH (extra)", family: ""        },
    ],
  },
  { id: "snacks", emoji: "🍫", label: "Snacks & Condiments", note: "Drinks, snacks, and cooking basics.",
    items: [
      { id: "soda",       name: "SODA",                   family: "" }, // PnC: Farhana
      { id: "chips",      name: "Chips",                  family: "upasha"  }, // PnC: Upasha
      { id: "pitachips",  name: "PITA CHIPS",             family: "" }, // Main Sheet Farhana col
      { id: "fruits",     name: "FRUITS 1 2 3",           family: "prerna"  }, // PnC: Prerna
      { id: "tea",        name: "TEA",                    family: "farzana" }, // PnC: Farzana
      { id: "coffee",     name: "Coffee",                 family: "prerna"  }, // Sheet1: Prerna
      { id: "milk",       name: "MILK",                   family: "prerna"  }, // PnC: Prerna
      { id: "biscuits",   name: "BISCUITS",               family: "farzana" }, // PnC: Farzana
      { id: "sugar",      name: "SUGAR",                  family: "" }, // PnC: Farhana
      { id: "salt",       name: "SALT",                   family: "" }, // PnC: Farhana
      { id: "pepper",     name: "Pepper",                 family: "farzana" }, // Sheet1: Farzana
      { id: "spices",     name: "Spices",                 family: "upasha"  }, // Main Sheet Upasha col
      { id: "oil",        name: "OIL",                    family: "" }, // PnC: Farhana
      { id: "butter",     name: "BUTTER",                 family: "" }, // PnC: Farhana
      { id: "ketchup",    name: "KETCHUP",                family: "upasha"  }, // PnC: Upasha
      { id: "jam",        name: "JAM",                    family: "farzana" }, // PnC: Farzana
      { id: "cheeseit",   name: "Cheese it",              family: "upasha"  }, // Main Sheet Upasha col
      { id: "fri-tea",    name: "Tea for friday evening", family: "" }, // Main Sheet Farhana col
      { id: "watermelon", name: "Watermelon",             family: "farzana" }, // Sheet1: Farzana
      { id: "grapes",     name: "Grapes & strawberries",  family: "all"     }, // Sheet1: All
      { id: "ranch",      name: "Ranch",                  family: "upasha"  }, // Sheet1: Upasha
    ],
  },
  { id: "kids", emoji: "👶", label: "Kids Meals", note: "Kid-friendly food.",
    items: [
      { id: "macncheese", name: "Mac n cheese",      family: "upasana" }, // Sheet1: Upasana
      { id: "pasta",      name: "Raw Pasta & sauce", family: "prerna"  }, // Sheet1: Prerna
      { id: "kidssnacks", name: "Kids snacks",       family: ""        },
      { id: "waffles",    name: "Waffles",           family: "farzana" }, // Sheet1: Farzana
      { id: "ramen",      name: "Ramen",             family: "prerna"  }, // Sheet1: Prerna
      { id: "kidsjuice",  name: "Kids juice",        family: "upasana" }, // Sheet1: Upasana (JUICE→Upasha in PnC is adults)
      { id: "oreo",       name: "Oreo cookies",      family: ""        },
      { id: "pancakes",   name: "Pancakes",          family: "farzana" }, // Sheet1: Farzana
      { id: "samosa",     name: "Samosa",            family: "upasana" }, // Sheet1: Upasana
      { id: "nuggets",    name: "Nuggets for kids",  family: ""        },
    ],
  },
  { id: "dessert", emoji: "🔥", label: "Dessert & S'mores", note: "Sweet endings.",
    items: [
      { id: "brownies",    name: "Brownies",            family: "prerna"  }, // PnC: Prerna
      { id: "croissant",   name: "Chocolate Croissant", family: "upasha"  }, // Main Sheet Upasha col
      { id: "grahams",     name: "Graham crackers",     family: "farzana" }, // Sheet1: Farzana
      { id: "marshmallow", name: "Marshmallow",         family: "farzana" }, // Sheet1: Farzana
      { id: "chocolate",   name: "Chocolate",           family: "farzana" }, // Sheet1: Farzana
    ],
  },
  { id: "friday", emoji: "🌙", label: "Friday Arrival Special", note: "Arrival night quick items.",
    items: [
      { id: "fri-sandwich", name: "Chicken sandwich",                 family: "prerna"  }, // Sheet1: Prerna
      { id: "fri-peppers",  name: "Bell peppers, corn, lemon, onion", family: "upasana" }, // Sheet1: Upasana
    ],
  },
];

const INITIAL_MEAL_SLOTS = [
  { id: "friday-dinner", label: "🌙 Friday — Dinner", dishes: [
    { id: "d1", name: "Chicken Biryani",    ings: ["Chicken", "Basmati Rice", "Biryani Spices", "Yogurt"] },
    { id: "d2", name: "Shrimp Biryani",     ings: ["SHRIMP", "Basmati Rice", "Biryani Spices"] },
    { id: "d3", name: "Keema Sliders",      ings: ["Ground Mutton", "Slider Buns", "Onion", "Spices"] },
  ]},
  { id: "sat-breakfast", label: "☀️ Saturday — Breakfast", dishes: [
    { id: "d4", name: "Eggs Benedict",  ings: ["EGGS", "ENGLISH MUFFIN", "Hollandaise Sauce", "Sausage"] },
    { id: "d5", name: "Full Breakfast", ings: ["EGGS", "HASHBROWN", "Shredded CHEESE", "BREAD (2)"] },
  ]},
  { id: "sat-lunch", label: "☀️ Saturday — Lunch", dishes: [
    { id: "d6", name: "Mutton & Paneer Spread", ings: ["MUTTON", "PANEER 1", "VEGGIES", "Garlic Bread"] },
  ]},
  { id: "sat-dinner", label: "☀️ Saturday — Dinner", dishes: [
    { id: "d7", name: "Grand BBQ", ings: ["CHICKEN", "PANEER 2", "FISH 2", "SHRIMP", "VEGGIES"] },
  ]},
  { id: "sun-brunch", label: "🌤️ Sunday — Brunch", dishes: [] },
];

// ── Helpers ────────────────────────────────────────────────────────────────

// Firebase Realtime Database can return arrays as numeric-keyed objects.
// This converts them back to proper arrays safely.
function ensureArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  return Object.values(val);
}

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getFamilyInfo(key) {
  return FAMILY_COLORS[key] || { dot: "#34d399", dot2: "🟢" };
}

function computeInitialFromMenu(slots) {
  const existingNames = new Set(
    SUPPLY_SECTIONS.flatMap((s) => s.items).map((it) => it.name.toLowerCase())
  );
  const result = [];
  const seen = new Set();
  slots.forEach((slot) => {
    slot.dishes.forEach((dish) => {
      dish.ings.forEach((ing) => {
        const key = ing.toLowerCase();
        if (!existingNames.has(key) && !seen.has(key)) {
          seen.add(key);
          result.push({ id: "ing-" + slugify(ing) + "-init", name: ing, family: "", fromMenu: true });
        }
      });
    });
  });
  return result;
}

function getFamColor(key) {
  const map = {
    farhana: { bg: "rgba(251,191,36,.15)", border: "rgba(251,191,36,.4)",  text: "#fde68a" },
    upasha:  { bg: "rgba(59,130,246,.15)", border: "rgba(59,130,246,.4)",  text: "#bfdbfe" },
    upasana: { bg: "rgba(249,115,22,.15)", border: "rgba(249,115,22,.4)",  text: "#fdba74" },
    farzana: { bg: "rgba(239,68,68,.15)",  border: "rgba(239,68,68,.4)",   text: "#fecaca" },
    prerna:  { bg: "rgba(167,139,250,.15)",border: "rgba(167,139,250,.4)", text: "#ddd6fe" },
    all:     { bg: "rgba(143,184,106,.2)", border: "rgba(143,184,106,.5)", text: "#a8d87a" },
  };
  return map[key] || { bg: "rgba(52,211,153,.15)", border: "rgba(52,211,153,.4)", text: "#a7f3d0" };
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function CampingChecklist() {
  // ── Existing packing list state ──
  const [checked, setChecked] = useState({});
  const [activeTab, setActiveTab] = useState("checklist");
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(SECTIONS.map((s) => [s.id, true]))
  );

  const toggle = (id) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const toggleSection = (id) => setOpenSections((p) => ({ ...p, [id]: !p[id] }));

  const allPackItems = SECTIONS.flatMap((s) =>
    s.subsections ? s.subsections.flatMap((sub) => sub.items) : s.items
  );
  const totalCount = allPackItems.length;
  const checkedCount = allPackItems.filter((i) => checked[i.id]).length;
  const pct = Math.round((checkedCount / totalCount) * 100);

  // ── Supply List state ──
  const [families, setFamilies] = useState(["upasha","upasana","farzana","prerna"]);
  const [familyNames, setFamilyNames] = useState({ upasha:"Upasha", upasana:"Upasana", farzana:"Farzana", prerna:"Prerna" });
  const [assignments, setAssignments] = useState(() => {
    const init = {};
    SUPPLY_SECTIONS.forEach((sec) => sec.items.forEach((it) => { init[it.id] = it.family ? [it.family] : []; }));
    return init;
  });
  const [supplySections, setSupplySections] = useState(() =>
    SUPPLY_SECTIONS.map(s => ({ ...s, items: s.items.map(it => ({ ...it })) }))
  );
  const [supplyFilter, setSupplyFilter] = useState("all");
  const [supplyChecked, setSupplyChecked] = useState({});
  const [openSupplySections, setOpenSupplySections] = useState({
    individual: true, "lunch-dinner": true, breakfast: true,
    "common-nonfood": false, snacks: false, kids: false, dessert: false, friday: false, "from-menu": false,
  });
  const [mealSlots, setMealSlots] = useState(INITIAL_MEAL_SLOTS);
  const [fromMenuItems, setFromMenuItems] = useState(() => computeInitialFromMenu(INITIAL_MEAL_SLOTS));

  // ── Modal state ──
  const [showFamiliesModal, setShowFamiliesModal] = useState(false);
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [showDishDetailModal, setShowDishDetailModal] = useState(false);
  const [activeDishId, setActiveDishId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // ── Sync status ──
  const [syncStatus, setSyncStatus] = useState("connecting"); // "connecting" | "synced" | "syncing"
  const lastSyncedRef = useRef(null);
  const writeTimerRef = useRef(null);
  const initializedRef = useRef(false); // guard: don't write until first Firebase read completes

  // ── Toast ──
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  // ── Add Dish form ──
  const [newDishName, setNewDishName] = useState("");
  const [newDishSlot, setNewDishSlot] = useState("friday-dinner");
  const [newDishIngs, setNewDishIngs] = useState([""]);

  // ── Dish detail extra ings ──
  const [extraIngs, setExtraIngs] = useState([""]);

  // ── New family name ──
  const [newFamilyName, setNewFamilyName] = useState("");

  // ── Firebase: real-time listener (mount only) ──
  useEffect(() => {
    const campingRef = dbRef(db, "campingData");
    const unsub = onValue(
      campingRef,
      (snap) => {
        const raw = snap.val();
        initializedRef.current = true;

        if (!raw) {
          // No data yet in Firebase — write our defaults on next tick
          setSyncStatus("synced");
          return;
        }

        try {
          const data = { ...raw };

          // Normalize arrays (Firebase can return numeric-keyed objects instead of arrays)
          let families = ensureArray(data.families).filter(f => f !== "farhana");
          if (!families.includes("upasana")) {
            const idx = families.indexOf("upasha");
            families.splice(idx >= 0 ? idx + 1 : families.length, 0, "upasana");
          }

          const familyNames = data.familyNames ? { ...data.familyNames } : {};
          delete familyNames.farhana;
          if (!familyNames.upasana) familyNames.upasana = "Upasana";
          if (familyNames.upasha !== "Upasha") familyNames.upasha = "Upasha";

          // Normalize assignments: old format was string, new format is string[]
          const rawAsgn = data.assignments || {};
          const assignments = {};
          Object.keys(rawAsgn).forEach(id => {
            const v = rawAsgn[id];
            if (Array.isArray(v)) {
              assignments[id] = v.filter(f => f && f !== "farhana" && f !== "unassigned");
            } else if (typeof v === "string" && v && v !== "farhana" && v !== "unassigned") {
              assignments[id] = [v];
            } else {
              assignments[id] = [];
            }
          });

          // Normalize nested arrays for mealSlots
          const mealSlots = ensureArray(data.mealSlots).map(slot => ({
            ...slot,
            dishes: ensureArray(slot.dishes).map(dish => ({
              ...dish,
              ings: ensureArray(dish.ings),
            })),
          }));

          const fromMenuItems = ensureArray(data.fromMenuItems);

          // Normalize supply sections (editable sections)
          const fbSupplySections = data.supplySections
            ? ensureArray(data.supplySections).map(sec => ({ ...sec, items: ensureArray(sec.items) }))
            : null;

          const normalized = {
            families,
            familyNames,
            assignments,
            supplyChecked: data.supplyChecked || {},
            mealSlots,
            fromMenuItems,
            checked: data.checked || {},
            ...(fbSupplySections && { supplySections: fbSupplySections }),
          };

          const snapStr = JSON.stringify(normalized);
          lastSyncedRef.current = snapStr;

          setFamilies(normalized.families);
          setFamilyNames(normalized.familyNames);
          setAssignments(normalized.assignments);
          setSupplyChecked(normalized.supplyChecked);
          setMealSlots(normalized.mealSlots);
          setFromMenuItems(normalized.fromMenuItems);
          setChecked(normalized.checked);
          if (fbSupplySections) setSupplySections(fbSupplySections);
        } catch (err) {
          console.error("Firebase data normalization error:", err);
        }
        setSyncStatus("synced");
      },
      (err) => {
        // Permission denied or network error — fall back to local defaults silently
        console.warn("Firebase read error:", err.message);
        initializedRef.current = true;
        setSyncStatus("synced");
      }
    );
    return () => unsub();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Firebase: debounced write on state change ──
  useEffect(() => {
    // Don't write until Firebase has been read at least once (prevents overwriting with defaults)
    if (!initializedRef.current) return;
    const payload = { families, familyNames, assignments, supplyChecked, mealSlots, fromMenuItems, checked, supplySections };
    const str = JSON.stringify(payload);
    if (str === lastSyncedRef.current) return;
    setSyncStatus("syncing");
    if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    writeTimerRef.current = setTimeout(() => {
      set(dbRef(db, "campingData"), payload)
        .then(() => { lastSyncedRef.current = str; setSyncStatus("synced"); })
        .catch((err) => { console.warn("Firebase write error:", err.message); setSyncStatus("synced"); });
    }, 600);
    return () => { if (writeTimerRef.current) clearTimeout(writeTimerRef.current); };
  }, [families, familyNames, assignments, supplyChecked, mealSlots, fromMenuItems, checked, supplySections]);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handler = () => setOpenDropdownId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // ── dishUsageMap: ingredient name (lowercase) → array of dish names ──
  const dishUsageMap = useMemo(() => {
    const map = {};
    mealSlots.forEach((slot) => {
      slot.dishes.forEach((dish) => {
        dish.ings.forEach((ing) => {
          const key = ing.toLowerCase();
          if (!map[key]) map[key] = [];
          if (!map[key].includes(dish.name)) map[key].push(dish.name);
        });
      });
    });
    return map;
  }, [mealSlots]);

  // ── Effective supply sections (editable + from-menu) ──
  const effectiveSections = useMemo(() => [
    ...supplySections,
    { id: "from-menu", emoji: "✨", label: "From Menu Builder", note: "Ingredients added via the Meal Plan tab.", items: fromMenuItems },
  ], [supplySections, fromMenuItems]);

  // ── Helpers ──
  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2600);
  };

  const getFamLabel = (key) => {
    if (!key || key === "") return "⬜ Unassigned";
    if (key === "all") return "🌍 All";
    const info = getFamilyInfo(key);
    return `${info.dot2} ${familyNames[key] || key}`;
  };

  const getFamLabels = (fams) => {
    if (!fams || fams.length === 0) return "⬜ Unassigned";
    if (fams.includes("all")) return "🌍 All";
    if (fams.length === 1) return getFamLabel(fams[0]);
    const dots = fams.map(f => getFamilyInfo(f).dot2).join("");
    const names = fams.map(f => familyNames[f] || f).join(", ");
    return fams.length <= 2 ? `${dots} ${names}` : `${dots} ${fams.length} families`;
  };

  const countFor = (fam) => {
    const all = [...supplySections.flatMap((s) => s.items), ...fromMenuItems];
    return all.filter((it) => {
      const a = assignments[it.id] || [];
      if (fam === "unassigned") return a.length === 0;
      return a.includes(fam) || a.includes("all");
    }).length;
  };

  const toggleFamily = (itemId, fam) => {
    setAssignments((p) => {
      const cur = p[itemId] || [];
      let next;
      if (fam === "") {
        next = [];
      } else if (fam === "all") {
        next = cur.includes("all") ? [] : ["all"];
      } else {
        next = cur.includes(fam)
          ? cur.filter(f => f !== fam)
          : [...cur.filter(f => f !== "all"), fam];
      }
      return { ...p, [itemId]: next };
    });
  };

  const addToSupply = (ingName) => {
    const key = ingName.toLowerCase();
    const allStatic = supplySections.flatMap((s) => s.items);
    if (allStatic.some((it) => it.name.toLowerCase() === key)) return;
    const newId = "ing-" + slugify(ingName) + "-" + Date.now();
    setFromMenuItems((prev) => {
      if (prev.some((it) => it.name.toLowerCase() === key)) return prev;
      return [...prev, { id: newId, name: ingName, family: "", fromMenu: true }];
    });
    setAssignments((p) => ({ ...p, [newId]: [] }));
    setOpenSupplySections((p) => ({ ...p, "from-menu": true }));
  };

  // ── Supply section / item CRUD ──
  const updateSection = (secId, changes) =>
    setSupplySections(prev => prev.map(s => s.id === secId ? { ...s, ...changes } : s));

  const deleteSection = (secId) => {
    if (!confirm("Delete this section and all its items?")) return;
    const sec = supplySections.find(s => s.id === secId);
    if (sec) {
      setAssignments(p => {
        const next = { ...p };
        sec.items.forEach(it => delete next[it.id]);
        return next;
      });
    }
    setSupplySections(prev => prev.filter(s => s.id !== secId));
    showToast("Section deleted");
  };

  const addSection = () => {
    const id = "sec-" + Date.now();
    setSupplySections(prev => [...prev, { id, emoji: "📦", label: "New Section", note: "", items: [] }]);
    setOpenSupplySections(p => ({ ...p, [id]: true }));
    showToast("✓ New section added");
  };

  const addItem = (secId) => {
    const id = "item-" + Date.now();
    setSupplySections(prev => prev.map(s => s.id === secId
      ? { ...s, items: [...s.items, { id, name: "New Item", family: "" }] }
      : s
    ));
    setAssignments(p => ({ ...p, [id]: [] }));
  };

  const updateItem = (secId, itemId, changes) =>
    setSupplySections(prev => prev.map(s => s.id === secId
      ? { ...s, items: s.items.map(it => it.id === itemId ? { ...it, ...changes } : it) }
      : s
    ));

  const deleteItem = (secId, itemId) => {
    setSupplySections(prev => prev.map(s => s.id === secId
      ? { ...s, items: s.items.filter(it => it.id !== itemId) }
      : s
    ));
    setAssignments(p => { const next = { ...p }; delete next[itemId]; return next; });
  };

  const saveDish = () => {
    if (!newDishName.trim()) { alert("Enter a dish name"); return; }
    const ings = newDishIngs.filter((i) => i.trim());
    const newDish = { id: "d" + Date.now(), name: newDishName.trim(), ings };
    setMealSlots((prev) => prev.map((s) => s.id === newDishSlot ? { ...s, dishes: [...s.dishes, newDish] } : s));
    ings.forEach((ing) => addToSupply(ing));
    setShowAddDishModal(false);
    setNewDishName("");
    setNewDishIngs([""]);
    setActiveTab("supply");
    showToast(`✓ "${newDishName.trim()}" added — ${ings.length} ingredient${ings.length !== 1 ? "s" : ""} in Supply List`);
  };

  const saveExtraIngs = () => {
    const valid = extraIngs.filter((i) => i.trim());
    if (!valid.length) { setShowDishDetailModal(false); return; }
    setMealSlots((prev) => prev.map((slot) => ({
      ...slot,
      dishes: slot.dishes.map((d) => d.id === activeDishId ? { ...d, ings: [...d.ings, ...valid] } : d),
    })));
    valid.forEach((ing) => addToSupply(ing));
    setShowDishDetailModal(false);
    setExtraIngs([""]);
    showToast(`✓ ${valid.length} ingredient${valid.length > 1 ? "s" : ""} added to Supply List`);
  };

  const addFamily = () => {
    const name = newFamilyName.trim();
    if (!name) return;
    const key = name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    setFamilies((p) => [...p, key]);
    setFamilyNames((p) => ({ ...p, [key]: name }));
    setNewFamilyName("");
    showToast(`✓ Added family "${name}"`);
  };

  const removeFamily = (key) => {
    if (!confirm(`Remove ${familyNames[key] || key}? Their items will become Unassigned.`)) return;
    setFamilies((p) => p.filter((f) => f !== key));
    setAssignments((p) => {
      const next = { ...p };
      Object.keys(next).forEach((id) => { if (next[id] === key) next[id] = ""; });
      return next;
    });
    if (supplyFilter === key) setSupplyFilter("all");
    showToast("Family removed — items are now Unassigned");
  };

  // ── Style helpers ──
  const S = {
    card: { background: "rgba(0,0,0,.3)", borderRadius: 10, border: "1px solid rgba(143,184,106,.25)", padding: "14px 16px", marginBottom: 10 },
    input: { width: "100%", background: "rgba(0,0,0,.3)", border: "1px solid rgba(143,184,106,.3)", borderRadius: 8, padding: "8px 12px", color: "#f5f0e8", fontSize: 13, fontFamily: "Georgia,serif", marginBottom: 10, outline: "none", boxSizing: "border-box" },
    inputSm: { background: "rgba(0,0,0,.3)", border: "1px solid rgba(143,184,106,.3)", borderRadius: 6, padding: "6px 10px", color: "#f5f0e8", fontSize: 12, fontFamily: "Georgia,serif", flex: 1, outline: "none" },
    btnPrimary: { padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 12, background: "linear-gradient(135deg,#5a9432,#8fb86a)", color: "#fff", fontWeight: "bold" },
    btnGhost: { padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(143,184,106,.4)", cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 12, background: "transparent", color: "#a8c87a" },
    lbl: { fontSize: 11, color: "#8fb86a", marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: ".05em" },
  };

  const activeDish = activeDishId ? mealSlots.flatMap((s) => s.dishes).find((d) => d.id === activeDishId) : null;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#1a2e1a 0%,#2d4a22 40%,#1c3018 100%)", fontFamily: "Georgia,serif", color: "#f5f0e8" }}>

      {/* ── Toast animation style ── */}
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg,#2a4a20 0%,#1e3815 100%)", borderBottom: "3px solid #8fb86a", padding: "28px 24px 20px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%,rgba(143,184,106,.08) 0%,transparent 60%),radial-gradient(circle at 80% 20%,rgba(255,180,50,.06) 0%,transparent 50%)" }} />
        <div style={{ fontSize: 40, marginBottom: 6 }}>🏕️</div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: "bold", color: "#d4e8a8", letterSpacing: ".02em", textShadow: "0 2px 12px rgba(0,0,0,.4)" }}>Camp Kettlewood · The Hilton</h1>
        <p style={{ margin: "6px 0 0", color: "#a8c87a", fontSize: 14, fontStyle: "italic" }}>4 Families · 8 Adults · 5 Kids · May 22–24, 2026</p>
        <div style={{ marginTop: 6, fontSize: 11, color: syncStatus === "syncing" ? "#fbbf24" : syncStatus === "connecting" ? "#94a3b8" : "#8fb86a", letterSpacing: ".03em" }}>
          {syncStatus === "connecting" ? "🔴 Connecting…" : syncStatus === "syncing" ? "🔄 Saving…" : "🟢 Live — all changes synced"}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 18, justifyContent: "center", flexWrap: "wrap" }}>
          {Object.values(WEATHER).map((w) => (
            <div key={w.day} style={{ background: "rgba(0,0,0,.35)", borderRadius: 10, padding: "8px 14px", border: "1px solid rgba(143,184,106,.3)", minWidth: 140, textAlign: "center" }}>
              <div style={{ fontSize: 20 }}>{w.icon}</div>
              <div style={{ fontWeight: "bold", color: "#d4e8a8", fontSize: 13 }}>{w.day}</div>
              <div style={{ color: "#ffcc44", fontSize: 12, fontWeight: "bold" }}>▲{w.high} ▼{w.low}</div>
              <div style={{ color: "#c8d8a8", fontSize: 11, marginTop: 3, fontStyle: "italic", lineHeight: 1.3 }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", borderBottom: "2px solid rgba(143,184,106,.3)", background: "rgba(0,0,0,.2)", overflowX: "auto" }}>
        {[
          { id: "checklist", label: "📋 Packing List" },
          { id: "activities", label: "🎯 Day Activities" },
          { id: "supply",    label: "🛍️ Supply List" },
          { id: "menu",      label: "🍽️ Meal Plan" },
          { id: "stores",    label: "🛒 Nearby Stores" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, minWidth: 110, padding: "14px 8px", border: "none", cursor: "pointer",
            background: activeTab === tab.id ? "rgba(143,184,106,.2)" : "transparent",
            color: activeTab === tab.id ? "#d4e8a8" : "#8aaa68",
            fontWeight: activeTab === tab.id ? "bold" : "normal",
            fontSize: 13, borderBottom: activeTab === tab.id ? "3px solid #8fb86a" : "3px solid transparent",
            transition: "all .2s", fontFamily: "Georgia,serif",
          }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 14px 60px" }}>

        {/* ════ PACKING LIST TAB ════ */}
        {activeTab === "checklist" && (
          <>
            <div style={{ margin: "20px 0 16px", background: "rgba(0,0,0,.3)", borderRadius: 12, padding: "14px 18px", border: "1px solid rgba(143,184,106,.25)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                <span style={{ color: "#a8c87a", fontSize: 13 }}>Packing Progress</span>
                <span style={{ color: "#d4e8a8", fontWeight: "bold", fontSize: 15 }}>{checkedCount} / {totalCount} items</span>
              </div>
              <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 99, height: 10, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#5a9432,#8fb86a)", borderRadius: 99, transition: "width .4s" }} />
              </div>
              <div style={{ textAlign: "right", color: "#8fb86a", fontSize: 12, marginTop: 4 }}>{pct}%</div>
            </div>

            {SECTIONS.map((section) => (
              <div key={section.id} style={{ marginBottom: 12 }}>
                <button onClick={() => toggleSection(section.id)} style={{ width: "100%", textAlign: "left", background: "rgba(0,0,0,.4)", border: "1px solid rgba(143,184,106,.3)", borderRadius: openSections[section.id] ? "10px 10px 0 0" : 10, padding: "12px 16px", cursor: "pointer", color: "#d4e8a8", display: "flex", alignItems: "center", gap: 10, fontFamily: "Georgia,serif" }}>
                  <span style={{ fontSize: 20 }}>{section.emoji}</span>
                  <span style={{ fontWeight: "bold", fontSize: 15, flex: 1 }}>{section.label}</span>
                  <span style={{ color: "#8fb86a", fontSize: 18 }}>{openSections[section.id] ? "▾" : "▸"}</span>
                </button>
                {openSections[section.id] && (
                  <div style={{ background: "rgba(0,0,0,.25)", border: "1px solid rgba(143,184,106,.2)", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "10px 14px 14px" }}>
                    {section.note && (
                      <div style={{ background: "rgba(143,184,106,.1)", borderLeft: "3px solid #8fb86a", borderRadius: "0 6px 6px 0", padding: "7px 12px", marginBottom: 10, color: "#b8d88a", fontSize: 12, fontStyle: "italic" }}>ℹ️ {section.note}</div>
                    )}
                    {section.subsections ? section.subsections.map((sub, si) => (
                      <div key={si} style={{ marginBottom: 14 }}>
                        <div style={{ color: "#ffcc44", fontSize: 13, fontWeight: "bold", marginBottom: 8, paddingBottom: 4, borderBottom: "1px dashed rgba(255,204,68,.3)" }}>{sub.label}</div>
                        {sub.items.map((item) => <CheckItem key={item.id} item={item} checked={!!checked[item.id]} onToggle={toggle} />)}
                      </div>
                    )) : section.items.map((item) => <CheckItem key={item.id} item={item} checked={!!checked[item.id]} onToggle={toggle} />)}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ════ ACTIVITIES TAB ════ */}
        {activeTab === "activities" && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ background: "rgba(255,180,50,.1)", border: "1px solid rgba(255,180,50,.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#ffd966", fontSize: 13, fontStyle: "italic" }}>
              🌧️ <strong>Saturday May 23</strong> — Forecast: <strong>High 68°F, Low 51°F, 40% rain / Showers.</strong> Friday arrival: 65°F / 47°F low / 24% rain. Sunday checkout: 72°F / mostly cloudy — warmest day! Plan outdoor activities for Sat morning, use the canvas living room as your rain refuge. Grill still works in light rain!
            </div>
            {ACTIVITIES.map((block) => (
              <div key={block.time} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, borderBottom: `2px solid ${block.color}44`, paddingBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{block.emoji}</span>
                  <h2 style={{ margin: 0, color: block.color, fontSize: 17 }}>{block.time}</h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {block.items.map((act, i) => (
                    <div key={i} style={{ background: "rgba(0,0,0,.3)", borderRadius: 10, padding: "12px 16px", border: `1px solid ${block.color}33`, borderLeft: `4px solid ${block.color}` }}>
                      <div style={{ fontWeight: "bold", color: "#f5f0e8", fontSize: 14, marginBottom: 4 }}>{act.title}</div>
                      <div style={{ color: "#c8d8a8", fontSize: 13, lineHeight: 1.5 }}>{act.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ background: "rgba(0,0,0,.3)", borderRadius: 10, padding: 16, border: "1px solid rgba(143,184,106,.3)", marginTop: 8 }}>
              <h3 style={{ margin: "0 0 12px", color: "#d4e8a8", fontSize: 15 }}>📍 Nearby Attractions Worth the Drive</h3>
              {[
                { name: "Green Meadows Petting Farm", dist: "~15 min", icon: "🐄", note: "Best for ages 3–8. Hayrides, animal feeding." },
                { name: "Lake Geneva Public Beach", dist: "~30 min", icon: "🏖️", note: "Swimming, ice cream, lakefront walk." },
                { name: "East Troy Electric Railroad Museum", dist: "~15 min", icon: "🚃", note: "Vintage streetcar rides — all ages love it." },
                { name: "The Elegant Farmer", dist: "~10 min", icon: "🥧", note: "Famous apple pie baked in a paper bag. A must-stop!" },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 0", borderBottom: i < 3 ? "1px solid rgba(143,184,106,.15)" : "none" }}>
                  <span style={{ fontSize: 22 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontWeight: "bold", color: "#d4e8a8", fontSize: 13 }}>{a.name} <span style={{ color: "#8fb86a", fontWeight: "normal" }}>· {a.dist}</span></div>
                    <div style={{ color: "#a8c87a", fontSize: 12, fontStyle: "italic" }}>{a.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ SUPPLY LIST TAB ════ */}
        {activeTab === "supply" && (
          <div style={{ paddingTop: 14 }}>

            {/* Toolbar: family filter + edit toggle */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "14px 0 10px", alignItems: "center" }}>
              <span style={{ color: "#a8c87a", fontSize: 11, whiteSpace: "nowrap" }}>Family →</span>
              {[{ key: "all", label: "🌍 All" }, ...families.map((f) => ({ key: f, label: `${getFamilyInfo(f).dot2} ${familyNames[f] || f}`, dot: getFamilyInfo(f).dot })), { key: "unassigned", label: "⬜ Unassigned" }].map(({ key, label, dot }) => {
                const active = supplyFilter === key;
                const fc = key === "all" || key === "unassigned" ? null : getFamColor(key);
                return (
                  <button key={key} onClick={() => setSupplyFilter(key)} style={{
                    padding: "5px 12px", borderRadius: 20, cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 12,
                    border: active ? `1.5px solid ${dot || (key === "unassigned" ? "rgba(148,163,184,.4)" : "#8fb86a")}` : "1.5px solid rgba(143,184,106,.3)",
                    background: active ? (fc ? fc.bg : key === "unassigned" ? "rgba(148,163,184,.12)" : "rgba(143,184,106,.18)") : "transparent",
                    color: active ? (fc ? fc.text : key === "unassigned" ? "#94a3b8" : "#d4e8a8") : "#a8c87a",
                  }}>{label}</button>
                );
              })}
              <button onClick={() => setShowFamiliesModal(true)} style={{ padding: "5px 12px", borderRadius: 20, cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 12, border: "1.5px dashed rgba(143,184,106,.4)", background: "rgba(143,184,106,.08)", color: "#8fb86a" }}>⚙️ Families</button>
              <button onClick={() => setEditMode(m => !m)} style={{ padding: "5px 12px", borderRadius: 20, cursor: "pointer", fontFamily: "Georgia,serif", fontSize: 12, border: editMode ? "1.5px solid #8fb86a" : "1.5px dashed rgba(143,184,106,.4)", background: editMode ? "rgba(143,184,106,.25)" : "rgba(143,184,106,.08)", color: editMode ? "#d4e8a8" : "#8fb86a", marginLeft: "auto" }}>{editMode ? "✓ Done Editing" : "✏️ Edit Sections"}</button>
            </div>

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(families.length + 1, 5)}, 1fr)`, gap: 6, marginBottom: 14 }}>
              {[...families, "unassigned"].map((f) => {
                const isUn = f === "unassigned";
                const info = isUn ? { dot: "#94a3b8", dot2: "⬜" } : getFamilyInfo(f);
                const name = isUn ? "Unassigned" : (familyNames[f] || f);
                const n = countFor(f);
                return (
                  <div key={f} onClick={() => setSupplyFilter(f)} style={{ background: "rgba(0,0,0,.3)", borderRadius: 8, padding: "8px 6px", border: supplyFilter === f ? `1px solid ${info.dot}` : "1px solid rgba(143,184,106,.18)", textAlign: "center", cursor: "pointer" }}>
                    <div style={{ fontSize: 20, fontWeight: "bold", color: info.dot }}>{n}</div>
                    <div style={{ fontSize: 10, color: "#8fb86a", marginTop: 1 }}>{info.dot2} {name}</div>
                  </div>
                );
              })}
            </div>

            {/* Sections */}
            {effectiveSections.map((sec) => {
              const isFromMenu = sec.id === "from-menu";
              const visItems = editMode
                ? sec.items  // show all items in edit mode
                : sec.items.filter((it) => {
                    if (supplyFilter === "all") return true;
                    const a = assignments[it.id] || [];
                    if (supplyFilter === "unassigned") return a.length === 0;
                    return a.includes(supplyFilter) || a.includes("all");
                  });
              if (!editMode && visItems.length === 0 && !isFromMenu) return null;
              if (!editMode && visItems.length === 0 && isFromMenu && supplyFilter !== "all") return null;

              const isOpen = openSupplySections[sec.id] ?? false;
              const inpSm = { background: "rgba(0,0,0,.4)", border: "1px solid rgba(143,184,106,.35)", borderRadius: 5, padding: "3px 7px", color: "#f5f0e8", fontSize: 12, fontFamily: "Georgia,serif", outline: "none" };
              return (
                <div key={sec.id} style={{ marginBottom: 10 }}>
                  {/* Section header */}
                  <div style={{ width: "100%", textAlign: "left", background: "rgba(0,0,0,.4)", border: "1px solid rgba(143,184,106,.3)", borderRadius: isOpen ? "10px 10px 0 0" : 10, padding: "10px 14px", color: "#d4e8a8", display: "flex", alignItems: "center", gap: 8, fontFamily: "Georgia,serif" }}>
                    {editMode && !isFromMenu ? (
                      <>
                        <input value={sec.emoji} onChange={e => updateSection(sec.id, { emoji: e.target.value })} style={{ ...inpSm, width: 34, textAlign: "center" }} />
                        <input value={sec.label} onChange={e => updateSection(sec.id, { label: e.target.value })} style={{ ...inpSm, flex: 1 }} />
                        <button onClick={() => deleteSection(sec.id)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 15, padding: "0 2px" }} title="Delete section">🗑</button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 16, cursor: "pointer" }} onClick={() => setOpenSupplySections(p => ({ ...p, [sec.id]: !p[sec.id] }))}>{sec.emoji}</span>
                        <span style={{ fontWeight: "bold", fontSize: 13, flex: 1, cursor: "pointer" }} onClick={() => setOpenSupplySections(p => ({ ...p, [sec.id]: !p[sec.id] }))}>{sec.label}</span>
                        <span style={{ background: "rgba(143,184,106,.2)", borderRadius: 10, padding: "1px 7px", fontSize: 11, color: "#8fb86a" }}>{visItems.length} items</span>
                        <span onClick={() => setOpenSupplySections(p => ({ ...p, [sec.id]: !p[sec.id] }))} style={{ color: "#8fb86a", fontSize: 14, transition: "transform .2s", display: "inline-block", transform: isOpen ? "rotate(90deg)" : "none", cursor: "pointer" }}>▸</span>
                      </>
                    )}
                  </div>

                  {(isOpen || editMode) && (
                    <div style={{ background: "rgba(0,0,0,.22)", border: "1px solid rgba(143,184,106,.2)", borderTop: "none", borderRadius: "0 0 10px 10px", padding: "8px 12px 12px" }}>
                      {sec.note && !editMode && <div style={{ background: "rgba(143,184,106,.1)", borderLeft: "3px solid #8fb86a", borderRadius: "0 5px 5px 0", padding: "5px 10px", marginBottom: 8, color: "#b8d88a", fontSize: 11, fontStyle: "italic" }}>ℹ️ {sec.note}</div>}
                      {visItems.length === 0 && isFromMenu && !editMode && (
                        <div style={{ color: "#8fb86a", fontSize: 12, fontStyle: "italic", padding: "4px 0" }}>No items yet — add dishes in the Meal Plan tab.</div>
                      )}
                      {visItems.map((it) => {
                        const done = supplyChecked[it.id];
                        const fams = assignments[it.id] || [];
                        const dishes = dishUsageMap[it.name.toLowerCase()] || [];
                        // Badge style: single family = colored, multiple = neutral green, none = gray
                        const badgeStyle = fams.length === 0
                          ? { bg: "rgba(148,163,184,.1)", border: "rgba(148,163,184,.3)", text: "#94a3b8" }
                          : fams.includes("all") ? getFamColor("all")
                          : fams.length === 1 ? (getFamColor(fams[0]) || { bg: "rgba(52,211,153,.15)", border: "rgba(52,211,153,.4)", text: "#a7f3d0" })
                          : { bg: "rgba(143,184,106,.15)", border: "rgba(143,184,106,.4)", text: "#d4e8a8" };
                        return (
                          <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 2px", borderRadius: 5, cursor: "default" }}>
                            {/* Checkbox (hidden in edit mode) */}
                            {!editMode && (
                              <div onClick={() => setSupplyChecked((p) => ({ ...p, [it.id]: !p[it.id] }))} style={{ width: 18, height: 18, minWidth: 18, borderRadius: 4, border: done ? "2px solid #8fb86a" : "2px solid rgba(143,184,106,.4)", background: done ? "#8fb86a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .15s" }}>
                                {done && <span style={{ color: "#1a2e1a", fontSize: 11, fontWeight: "bold" }}>✓</span>}
                              </div>
                            )}

                            {/* Name — input in edit mode, text otherwise */}
                            {editMode && !isFromMenu ? (
                              <input value={it.name} onChange={e => updateItem(sec.id, it.id, { name: e.target.value })} style={{ ...inpSm, flex: 1 }} />
                            ) : (
                              <span style={{ flex: 1, fontSize: 12, color: done ? "#6a9050" : "#e8f0d8", textDecoration: done ? "line-through" : "none", lineHeight: 1.4 }}>
                                {it.name}
                                {it.fromMenu && <span style={{ fontSize: 9, background: "rgba(52,211,153,.2)", border: "1px solid rgba(52,211,153,.4)", color: "#6ee7b7", borderRadius: 4, padding: "1px 5px", marginLeft: 4, verticalAlign: "middle" }}>NEW</span>}
                                {dishes.length > 0 && (
                                  <span style={{ marginLeft: 4 }}>
                                    <span title={`Used in: ${dishes.join(", ")}`} style={{ fontSize: 10, background: "rgba(251,191,36,.15)", border: "1px solid rgba(251,191,36,.35)", color: "#fde68a", borderRadius: 4, padding: "1px 6px", verticalAlign: "middle", cursor: "default" }}>
                                      🍽️ {dishes.length > 1 ? `${dishes.length} dishes` : dishes[0]}
                                    </span>
                                  </span>
                                )}
                              </span>
                            )}

                            {/* Delete button (edit mode only) */}
                            {editMode && !isFromMenu && (
                              <button onClick={() => deleteItem(sec.id, it.id)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, padding: "0 2px", flexShrink: 0 }}>🗑</button>
                            )}

                            {/* Multi-family assign dropdown (hidden in edit mode) */}
                            {!editMode && (
                              <div style={{ position: "relative", display: "inline-block", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                                <span onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === it.id ? null : it.id); }} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 10, fontSize: 11, fontWeight: "bold", cursor: "pointer", border: `1px solid ${badgeStyle.border}`, background: badgeStyle.bg, color: badgeStyle.text, whiteSpace: "nowrap", userSelect: "none", maxWidth: 160 }}>
                                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{getFamLabels(fams)}</span> ✎
                                </span>
                                {openDropdownId === it.id && (
                                  <div style={{ position: "absolute", top: "calc(100% + 3px)", right: 0, zIndex: 200, background: "#1e3518", border: "1px solid #8fb86a", borderRadius: 8, padding: "6px 4px", minWidth: 160, boxShadow: "0 8px 24px rgba(0,0,0,.6)" }}>
                                    <div style={{ padding: "2px 8px 6px", fontSize: 10, color: "#8fb86a", borderBottom: "1px solid rgba(143,184,106,.2)", marginBottom: 4 }}>Select one or more families</div>
                                    {families.map((f) => {
                                      const checked = fams.includes(f);
                                      const fi = getFamilyInfo(f);
                                      return (
                                        <label key={f} onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 9px", cursor: "pointer", borderRadius: 4, background: checked ? "rgba(143,184,106,.12)" : "transparent" }}>
                                          <input type="checkbox" checked={checked} onChange={() => toggleFamily(it.id, f)} style={{ accentColor: fi.dot, cursor: "pointer" }} />
                                          <span style={{ color: "#c8d8a8", fontSize: 11 }}>{fi.dot2} {familyNames[f] || f}</span>
                                        </label>
                                      );
                                    })}
                                    <div style={{ height: 1, background: "rgba(143,184,106,.2)", margin: "4px 0" }} />
                                    <label onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 9px", cursor: "pointer", borderRadius: 4, background: fams.includes("all") ? "rgba(143,184,106,.12)" : "transparent" }}>
                                      <input type="checkbox" checked={fams.includes("all")} onChange={() => toggleFamily(it.id, "all")} style={{ accentColor: "#8fb86a", cursor: "pointer" }} />
                                      <span style={{ color: "#c8d8a8", fontSize: 11 }}>🌍 All Families</span>
                                    </label>
                                    <button onClick={e => { e.stopPropagation(); toggleFamily(it.id, ""); setOpenDropdownId(null); }} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", color: "#94a3b8", fontSize: 11, padding: "5px 9px", cursor: "pointer", borderRadius: 4, fontFamily: "Georgia,serif", marginTop: 2 }}>⬜ Clear / Unassigned</button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {/* Add item button (edit mode, non-from-menu sections) */}
                      {editMode && !isFromMenu && (
                        <button onClick={() => addItem(sec.id)} style={{ width: "100%", marginTop: 8, padding: "6px", background: "transparent", border: "1px dashed rgba(143,184,106,.4)", borderRadius: 6, color: "#8fb86a", fontSize: 12, cursor: "pointer", fontFamily: "Georgia,serif" }}>＋ Add item</button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add Section button (edit mode only) */}
            {editMode && (
              <button onClick={addSection} style={{ width: "100%", marginTop: 4, padding: "10px", background: "rgba(143,184,106,.1)", border: "1px dashed rgba(143,184,106,.5)", borderRadius: 10, color: "#8fb86a", fontSize: 13, cursor: "pointer", fontFamily: "Georgia,serif" }}>＋ Add New Section</button>
            )}
          </div>
        )}

        {/* ════ MEAL PLAN TAB ════ */}
        {activeTab === "menu" && (
          <div style={{ paddingTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0 12px" }}>
              <span style={{ color: "#d4e8a8", fontSize: 15, fontWeight: "bold" }}>🍽️ Weekend Meal Plan</span>
              <button style={S.btnPrimary} onClick={() => { setNewDishName(""); setNewDishIngs([""]); setNewDishSlot("friday-dinner"); setShowAddDishModal(true); }}>+ Add Dish</button>
            </div>

            {mealSlots.map((slot) => (
              <div key={slot.id} style={{ background: "rgba(0,0,0,.3)", border: "1px solid rgba(143,184,106,.22)", borderRadius: 10, padding: 14, marginBottom: 12 }}>
                <h3 style={{ color: "#d4e8a8", fontSize: 14, margin: "0 0 10px", paddingBottom: 6, borderBottom: "1px solid rgba(143,184,106,.2)" }}>{slot.label}</h3>
                {slot.dishes.length === 0 && <div style={{ color: "#8fb86a", fontSize: 12, fontStyle: "italic", padding: "4px 0" }}>No dishes yet — add one above.</div>}
                {slot.dishes.map((dish) => (
                  <div key={dish.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(143,184,106,.1)" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "#e8f0d8" }}>{dish.name}</div>
                      <div style={{ fontSize: 11, color: "#8fb86a", marginTop: 2 }}>{dish.ings.join(" · ")}</div>
                    </div>
                    <button onClick={() => { setActiveDishId(dish.id); setExtraIngs([""]); setShowDishDetailModal(true); }} style={{ background: "transparent", border: "1px solid rgba(143,184,106,.3)", color: "#8fb86a", borderRadius: 5, padding: "2px 7px", fontSize: 11, cursor: "pointer", fontFamily: "Georgia,serif", whiteSpace: "nowrap" }}>Ingredients ✎</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ════ STORES TAB ════ */}
        {activeTab === "stores" && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ background: "rgba(255,180,50,.1)", border: "1px solid rgba(255,180,50,.3)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#ffd966", fontSize: 13 }}>
              💡 <strong>Pro tip:</strong> Stop at Sawyer's Farm & Meat Plant or Hansen's IGA first — they're right in East Troy, 5 min from camp. Save Walmart/ALDI/Pick 'n Save runs for if you forgot something bigger. Alcohol is cheaper to bring from Illinois.
            </div>
            {STORES.map((s, i) => (
              <div key={i} style={{ background: "rgba(0,0,0,.3)", borderRadius: 10, padding: "14px 16px", marginBottom: 10, border: "1px solid rgba(143,184,106,.25)", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 28, marginTop: 2 }}>🛒</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", color: "#d4e8a8", fontSize: 14 }}>{s.name}</div>
                  <div style={{ color: "#8fb86a", fontSize: 12, margin: "3px 0" }}>📍 {s.dist} from camp &nbsp;|&nbsp; ⏰ {s.hours}</div>
                  <div style={{ color: "#b8c8a0", fontSize: 13, fontStyle: "italic" }}>{s.note}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════ MANAGE FAMILIES MODAL ════ */}
      {showFamiliesModal && (
        <div onClick={() => setShowFamiliesModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(160deg,#1e3515,#1a2e1a)", border: "1px solid #8fb86a", borderRadius: 14, padding: 22, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.7)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid rgba(143,184,106,.3)" }}>
              <span style={{ color: "#d4e8a8", fontSize: 16, fontWeight: "bold" }}>👨‍👩‍👧 Manage Families</span>
              <button onClick={() => setShowFamiliesModal(false)} style={{ background: "transparent", border: "none", color: "#8fb86a", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>

            {families.map((f) => {
              const info = getFamilyInfo(f);
              return (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid rgba(143,184,106,.12)" }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: info.dot, flexShrink: 0 }} />
                  <input
                    defaultValue={familyNames[f] || f}
                    onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== (familyNames[f] || f)) { setFamilyNames((p) => ({ ...p, [f]: v })); showToast(`✓ Renamed to "${v}"`); } }}
                    style={{ flex: 1, background: "rgba(0,0,0,.3)", border: "1px solid rgba(143,184,106,.3)", borderRadius: 6, padding: "5px 9px", color: "#f5f0e8", fontSize: 12, fontFamily: "Georgia,serif", outline: "none" }}
                  />
                  <button onClick={() => removeFamily(f)} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14, padding: "2px 4px" }}>✕</button>
                </div>
              );
            })}

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(143,184,106,.2)" }}>
              <span style={S.lbl}>Add new family</span>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={newFamilyName} onChange={(e) => setNewFamilyName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addFamily()} placeholder="Family name…" style={{ ...S.inputSm, marginBottom: 0 }} />
                <button style={S.btnPrimary} onClick={addFamily}>+ Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ ADD DISH MODAL ════ */}
      {showAddDishModal && (
        <div onClick={() => setShowAddDishModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(160deg,#1e3515,#1a2e1a)", border: "1px solid #8fb86a", borderRadius: 14, padding: 22, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.7)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid rgba(143,184,106,.3)" }}>
              <span style={{ color: "#d4e8a8", fontSize: 16, fontWeight: "bold" }}>🍽️ Add New Dish</span>
              <button onClick={() => setShowAddDishModal(false)} style={{ background: "transparent", border: "none", color: "#8fb86a", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>

            <span style={S.lbl}>Dish name</span>
            <input value={newDishName} onChange={(e) => setNewDishName(e.target.value)} placeholder="e.g. Chicken Biryani" style={S.input} />

            <span style={S.lbl}>Meal slot</span>
            <select value={newDishSlot} onChange={(e) => setNewDishSlot(e.target.value)} style={{ ...S.input, cursor: "pointer" }}>
              {mealSlots.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>

            <span style={S.lbl}>Ingredients <span style={{ color: "#8fb86a", fontWeight: "normal", textTransform: "none", letterSpacing: 0 }}>(each will appear in Supply List)</span></span>
            {newDishIngs.map((ing, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <input value={ing} onChange={(e) => setNewDishIngs((p) => p.map((v, i) => i === idx ? e.target.value : v))} placeholder={`Ingredient ${idx + 1}…`} style={S.inputSm} />
                {newDishIngs.length > 1 && <button onClick={() => setNewDishIngs((p) => p.filter((_, i) => i !== idx))} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, padding: "0 2px" }}>✕</button>}
              </div>
            ))}
            <button onClick={() => setNewDishIngs((p) => [...p, ""])} style={{ ...S.btnGhost, width: "100%", margin: "6px 0 14px" }}>+ Add ingredient</button>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button style={S.btnGhost} onClick={() => setShowAddDishModal(false)}>Cancel</button>
              <button style={S.btnPrimary} onClick={saveDish}>Save & Add to Supply List</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ DISH DETAIL MODAL ════ */}
      {showDishDetailModal && activeDish && (
        <div onClick={() => setShowDishDetailModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "linear-gradient(160deg,#1e3515,#1a2e1a)", border: "1px solid #8fb86a", borderRadius: 14, padding: 22, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.7)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid rgba(143,184,106,.3)" }}>
              <span style={{ color: "#d4e8a8", fontSize: 16, fontWeight: "bold" }}>{activeDish.name}</span>
              <button onClick={() => setShowDishDetailModal(false)} style={{ background: "transparent", border: "none", color: "#8fb86a", fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>

            <span style={S.lbl}>Ingredients in supply list</span>
            <div style={{ marginBottom: 14 }}>
              {activeDish.ings.map((ing, i) => {
                const aId = [...SUPPLY_SECTIONS.flatMap((s) => s.items), ...fromMenuItems].find((it) => it.name.toLowerCase() === ing.toLowerCase())?.id;
                const fam = aId ? (assignments[aId] || "") : "";
                const fc = fam ? getFamColor(fam) : null;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid rgba(143,184,106,.1)" }}>
                    <span style={{ fontSize: 12, flex: 1, color: "#e8f0d8" }}>{ing}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 7px", borderRadius: 10, fontSize: 11, border: `1px solid ${fc?.border || "rgba(148,163,184,.3)"}`, background: fc?.bg || "rgba(148,163,184,.1)", color: fc?.text || "#94a3b8" }}>{getFamLabel(fam)}</span>
                  </div>
                );
              })}
            </div>

            <span style={S.lbl}>Add more ingredients</span>
            {extraIngs.map((ing, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <input value={ing} onChange={(e) => setExtraIngs((p) => p.map((v, i) => i === idx ? e.target.value : v))} placeholder="New ingredient…" style={S.inputSm} />
                {extraIngs.length > 1 && <button onClick={() => setExtraIngs((p) => p.filter((_, i) => i !== idx))} style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, padding: "0 2px" }}>✕</button>}
              </div>
            ))}
            <button onClick={() => setExtraIngs((p) => [...p, ""])} style={{ ...S.btnGhost, width: "100%", margin: "6px 0 14px" }}>+ Add ingredient</button>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button style={S.btnGhost} onClick={() => setShowDishDetailModal(false)}>Close</button>
              <button style={S.btnPrimary} onClick={saveExtraIngs}>Add to Supply List</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toastVisible && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1e3518", border: "1px solid #8fb86a", borderRadius: 10, padding: "10px 20px", fontSize: 13, color: "#d4e8a8", zIndex: 9999, boxShadow: "0 8px 24px rgba(0,0,0,.5)", animation: "toastIn .3s ease", whiteSpace: "nowrap" }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}

function CheckItem({ item, checked, onToggle }) {
  return (
    <div onClick={() => onToggle(item.id)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 4px", cursor: "pointer", borderRadius: 6, transition: "background .15s", opacity: checked ? 0.55 : 1 }}>
      <div style={{ width: 20, height: 20, minWidth: 20, borderRadius: 5, marginTop: 1, border: checked ? "2px solid #8fb86a" : "2px solid rgba(143,184,106,.4)", background: checked ? "#8fb86a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
        {checked && <span style={{ color: "#1a2e1a", fontSize: 13, fontWeight: "bold" }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <span style={{ color: checked ? "#6a9050" : "#e8f0d8", fontSize: 13, textDecoration: checked ? "line-through" : "none", lineHeight: 1.5 }}>{item.text}</span>
        {item.required && !checked && (
          <span style={{ marginLeft: 8, fontSize: 10, color: "#ef4444", background: "rgba(239,68,68,.15)", borderRadius: 4, padding: "1px 5px", verticalAlign: "middle" }}>essential</span>
        )}
      </div>
    </div>
  );
}
