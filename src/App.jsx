import { useState } from "react";

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

export default function CampingChecklist() {
  const [checked, setChecked] = useState({});
  const [activeTab, setActiveTab] = useState("checklist");
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(SECTIONS.map((s) => [s.id, true]))
  );

  const toggle = (id) => setChecked((p) => ({ ...p, [id]: !p[id] }));
  const toggleSection = (id) => setOpenSections((p) => ({ ...p, [id]: !p[id] }));

  const allItems = SECTIONS.flatMap((s) =>
    s.subsections
      ? s.subsections.flatMap((sub) => sub.items)
      : s.items
  );
  const totalCount = allItems.length;
  const checkedCount = allItems.filter((i) => checked[i.id]).length;
  const pct = Math.round((checkedCount / totalCount) * 100);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #1a2e1a 0%, #2d4a22 40%, #1c3018 100%)",
      fontFamily: "'Georgia', serif",
      color: "#f5f0e8",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #2a4a20 0%, #1e3815 100%)",
        borderBottom: "3px solid #8fb86a",
        padding: "28px 24px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(143,184,106,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,180,50,0.06) 0%, transparent 50%)",
        }} />
        <div style={{ fontSize: 40, marginBottom: 6 }}>🏕️</div>
        <h1 style={{
          margin: 0, fontSize: 26, fontWeight: "bold",
          color: "#d4e8a8", letterSpacing: "0.02em",
          textShadow: "0 2px 12px rgba(0,0,0,0.4)",
        }}>Camp Kettlewood · The Hilton</h1>
        <p style={{ margin: "6px 0 0", color: "#a8c87a", fontSize: 14, fontStyle: "italic" }}>
          4 Families · 8 Adults · 5 Kids · May 22–24, 2026
        </p>

        {/* Weather Strip */}
        <div style={{
          display: "flex", gap: 8, marginTop: 18, justifyContent: "center", flexWrap: "wrap",
        }}>
          {Object.values(WEATHER).map((w) => (
            <div key={w.day} style={{
              background: "rgba(0,0,0,0.35)", borderRadius: 10,
              padding: "8px 14px", border: "1px solid rgba(143,184,106,0.3)",
              minWidth: 140, textAlign: "center",
            }}>
              <div style={{ fontSize: 20 }}>{w.icon}</div>
              <div style={{ fontWeight: "bold", color: "#d4e8a8", fontSize: 13 }}>{w.day}</div>
              <div style={{ color: "#ffcc44", fontSize: 12, fontWeight: "bold" }}>
                ▲{w.high} {w.low !== "—" ? `▼${w.low}` : ""}
              </div>
              <div style={{ color: "#c8d8a8", fontSize: 11, marginTop: 3, fontStyle: "italic", lineHeight: 1.3 }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", borderBottom: "2px solid rgba(143,184,106,0.3)",
        background: "rgba(0,0,0,0.2)", overflowX: "auto",
      }}>
        {[
          { id: "checklist", label: "📋 Packing List" },
          { id: "activities", label: "🎯 Day Activities" },
          { id: "stores", label: "🛒 Nearby Stores" },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, minWidth: 120, padding: "14px 10px", border: "none", cursor: "pointer",
            background: activeTab === tab.id ? "rgba(143,184,106,0.2)" : "transparent",
            color: activeTab === tab.id ? "#d4e8a8" : "#8aaa68",
            fontWeight: activeTab === tab.id ? "bold" : "normal",
            fontSize: 14, borderBottom: activeTab === tab.id ? "3px solid #8fb86a" : "3px solid transparent",
            transition: "all 0.2s", fontFamily: "Georgia, serif",
          }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px 60px" }}>

        {/* CHECKLIST TAB */}
        {activeTab === "checklist" && (
          <>
            {/* Progress */}
            <div style={{
              margin: "20px 0 16px", background: "rgba(0,0,0,0.3)",
              borderRadius: 12, padding: "14px 18px",
              border: "1px solid rgba(143,184,106,0.25)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                <span style={{ color: "#a8c87a", fontSize: 13 }}>Packing Progress</span>
                <span style={{ color: "#d4e8a8", fontWeight: "bold", fontSize: 15 }}>{checkedCount} / {totalCount} items</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 99, height: 10, overflow: "hidden" }}>
                <div style={{
                  width: `${pct}%`, height: "100%",
                  background: "linear-gradient(90deg, #5a9432, #8fb86a)",
                  borderRadius: 99, transition: "width 0.4s",
                }} />
              </div>
              <div style={{ textAlign: "right", color: "#8fb86a", fontSize: 12, marginTop: 4 }}>{pct}%</div>
            </div>

            {SECTIONS.map((section) => (
              <div key={section.id} style={{ marginBottom: 12 }}>
                <button onClick={() => toggleSection(section.id)} style={{
                  width: "100%", textAlign: "left", background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(143,184,106,0.3)", borderRadius: openSections[section.id] ? "10px 10px 0 0" : 10,
                  padding: "12px 16px", cursor: "pointer", color: "#d4e8a8",
                  display: "flex", alignItems: "center", gap: 10,
                  fontFamily: "Georgia, serif",
                }}>
                  <span style={{ fontSize: 20 }}>{section.emoji}</span>
                  <span style={{ fontWeight: "bold", fontSize: 15, flex: 1 }}>{section.label}</span>
                  <span style={{ color: "#8fb86a", fontSize: 18 }}>{openSections[section.id] ? "▾" : "▸"}</span>
                </button>

                {openSections[section.id] && (
                  <div style={{
                    background: "rgba(0,0,0,0.25)", border: "1px solid rgba(143,184,106,0.2)",
                    borderTop: "none", borderRadius: "0 0 10px 10px", padding: "10px 14px 14px",
                  }}>
                    {section.note && (
                      <div style={{
                        background: "rgba(143,184,106,0.1)", borderLeft: "3px solid #8fb86a",
                        borderRadius: "0 6px 6px 0", padding: "7px 12px", marginBottom: 10,
                        color: "#b8d88a", fontSize: 12, fontStyle: "italic",
                      }}>ℹ️ {section.note}</div>
                    )}
                    {section.subsections ? section.subsections.map((sub, si) => (
                      <div key={si} style={{ marginBottom: 14 }}>
                        <div style={{
                          color: "#ffcc44", fontSize: 13, fontWeight: "bold",
                          marginBottom: 8, paddingBottom: 4,
                          borderBottom: "1px dashed rgba(255,204,68,0.3)",
                        }}>{sub.label}</div>
                        {sub.items.map((item) => (
                          <CheckItem key={item.id} item={item} checked={!!checked[item.id]} onToggle={toggle} />
                        ))}
                      </div>
                    )) : section.items.map((item) => (
                      <CheckItem key={item.id} item={item} checked={!!checked[item.id]} onToggle={toggle} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* ACTIVITIES TAB */}
        {activeTab === "activities" && (
          <div style={{ paddingTop: 20 }}>
            <div style={{
              background: "rgba(255,180,50,0.1)", border: "1px solid rgba(255,180,50,0.3)",
              borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#ffd966",
              fontSize: 13, fontStyle: "italic",
            }}>
              🌧️ <strong>Saturday May 23</strong> — Forecast: <strong>High 68°F, Low 51°F, 40% rain / Showers.</strong> Friday arrival: 65°F / 47°F low / 24% rain. Sunday checkout: 72°F / mostly cloudy — warmest day! Plan outdoor activities for Sat morning, use the canvas living room as your rain refuge. Grill still works in light rain!
            </div>
            {ACTIVITIES.map((block) => (
              <div key={block.time} style={{ marginBottom: 24 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10, marginBottom: 14,
                  borderBottom: `2px solid ${block.color}44`, paddingBottom: 8,
                }}>
                  <span style={{ fontSize: 24 }}>{block.emoji}</span>
                  <h2 style={{ margin: 0, color: block.color, fontSize: 17 }}>{block.time}</h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {block.items.map((act, i) => (
                    <div key={i} style={{
                      background: "rgba(0,0,0,0.3)", borderRadius: 10,
                      padding: "12px 16px", border: `1px solid ${block.color}33`,
                      borderLeft: `4px solid ${block.color}`,
                    }}>
                      <div style={{ fontWeight: "bold", color: "#f5f0e8", fontSize: 14, marginBottom: 4 }}>{act.title}</div>
                      <div style={{ color: "#c8d8a8", fontSize: 13, lineHeight: 1.5 }}>{act.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Nearby Attractions */}
            <div style={{
              background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "16px",
              border: "1px solid rgba(143,184,106,0.3)", marginTop: 8,
            }}>
              <h3 style={{ margin: "0 0 12px", color: "#d4e8a8", fontSize: 15 }}>📍 Nearby Attractions Worth the Drive</h3>
              {[
                { name: "Green Meadows Petting Farm", dist: "~15 min", icon: "🐄", note: "Best for ages 3–8. Hayrides, animal feeding." },
                { name: "Lake Geneva Public Beach", dist: "~30 min", icon: "🏖️", note: "Swimming, ice cream, lakefront walk." },
                { name: "East Troy Electric Railroad Museum", dist: "~15 min", icon: "🚃", note: "Vintage streetcar rides — all ages love it." },
                { name: "The Elegant Farmer", dist: "~10 min", icon: "🥧", note: "Famous apple pie baked in a paper bag. A must-stop!" },
              ].map((a, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  padding: "8px 0", borderBottom: i < 3 ? "1px solid rgba(143,184,106,0.15)" : "none",
                }}>
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

        {/* STORES TAB */}
        {activeTab === "stores" && (
          <div style={{ paddingTop: 20 }}>
            <div style={{
              background: "rgba(255,180,50,0.1)", border: "1px solid rgba(255,180,50,0.3)",
              borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#ffd966",
              fontSize: 13,
            }}>
              💡 <strong>Pro tip:</strong> Stop at Sawyer's Farm & Meat Plant or Hansen's IGA first — they're right in East Troy, 5 min from camp. Save Walmart/ALDI/Pick 'n Save runs for if you forgot something bigger. Alcohol is cheaper to bring from Illinois.
            </div>
            {STORES.map((s, i) => (
              <div key={i} style={{
                background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "14px 16px",
                marginBottom: 10, border: "1px solid rgba(143,184,106,0.25)",
                display: "flex", gap: 14, alignItems: "flex-start",
              }}>
                <span style={{ fontSize: 28, marginTop: 2 }}>🛒</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "bold", color: "#d4e8a8", fontSize: 14 }}>{s.name}</div>
                  <div style={{ color: "#8fb86a", fontSize: 12, margin: "3px 0" }}>
                    📍 {s.dist} from camp &nbsp;|&nbsp; ⏰ {s.hours}
                  </div>
                  <div style={{ color: "#b8c8a0", fontSize: 13, fontStyle: "italic" }}>{s.note}</div>
                </div>
              </div>
            ))}

            {/* Meal Plan */}
            <div style={{
              background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "16px",
              border: "1px solid rgba(143,184,106,0.3)", marginTop: 16,
            }}>
              <h3 style={{ margin: "0 0 14px", color: "#d4e8a8", fontSize: 15 }}>🍽️ Suggested Meal Plan (13 people)</h3>
              {[
                { meal: "Fri 5/22 — Dinner", icon: "🍔", desc: "Arrival dinner: Burgers + veggie skewers on the grill. Quick and crowd-pleasing. Chips & dip as snack while cooking." },
                { meal: "Sat 5/23 — Breakfast", icon: "🥞", desc: "Pancakes + scrambled eggs + bacon on the grill. Coffee maker in the living tent." },
                { meal: "Sat 5/23 — Lunch", icon: "🥪", desc: "Easy: sandwiches, fruit, chips. No cooking needed — spend time on activities." },
                { meal: "Sat 5/23 — Dinner (BIG BBQ)", icon: "🍗", desc: "Full spread: BBQ chicken, shrimp foil packets, fish, corn on the cob, grilled veggies. The main event!" },
                { meal: "Sun 5/24 — Breakfast", icon: "🍳", desc: "Eggs & bacon. Use up the remaining breakfast supplies before check-out at 1 PM." },
              ].map((m, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, padding: "10px 0",
                  borderBottom: i < 4 ? "1px dashed rgba(143,184,106,0.2)" : "none",
                }}>
                  <span style={{ fontSize: 22 }}>{m.icon}</span>
                  <div>
                    <div style={{ fontWeight: "bold", color: "#d4e8a8", fontSize: 13 }}>{m.meal}</div>
                    <div style={{ color: "#a8c87a", fontSize: 12, lineHeight: 1.5 }}>{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckItem({ item, checked, onToggle }) {
  return (
    <div
      onClick={() => onToggle(item.id)}
      style={{
        display: "flex", alignItems: "flex-start", gap: 10, padding: "7px 4px",
        cursor: "pointer", borderRadius: 6, transition: "background 0.15s",
        opacity: checked ? 0.55 : 1,
      }}
    >
      <div style={{
        width: 20, height: 20, minWidth: 20, borderRadius: 5, marginTop: 1,
        border: checked ? "2px solid #8fb86a" : "2px solid rgba(143,184,106,0.4)",
        background: checked ? "#8fb86a" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {checked && <span style={{ color: "#1a2e1a", fontSize: 13, fontWeight: "bold" }}>✓</span>}
      </div>
      <div style={{ flex: 1 }}>
        <span style={{
          color: checked ? "#6a9050" : "#e8f0d8", fontSize: 13,
          textDecoration: checked ? "line-through" : "none",
          lineHeight: 1.5,
        }}>
          {item.text}
        </span>
        {item.required && !checked && (
          <span style={{
            marginLeft: 8, fontSize: 10, color: "#ef4444",
            background: "rgba(239,68,68,0.15)", borderRadius: 4,
            padding: "1px 5px", verticalAlign: "middle",
          }}>essential</span>
        )}
      </div>
    </div>
  );
}
