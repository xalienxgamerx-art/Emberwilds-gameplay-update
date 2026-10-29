import type {
  Activity, BiomeId, DevelopmentType, Diet, Element, Family, FearKind, ItemId, MutationId, OriginId,
  PersonalityId, Rarity, ReproPairing, StatKey, Stats, StatusId, TraitId,
} from "./types";

export const WORLD_SIZE = 4096;
export const TICK_MINUTES = 5;
export const DAY_TICKS = 288;
export const SEASON_DAYS = 7;
export const PARTY_MAX = 3;
/** How many monsters the home pen holds. */
export const PEN_MAX = 30;

/* ---------------------------------- Elements --------------------------------- */

export const ELEMENTS: Record<Element, { name: string; color: string; glyph: string }> = {
  neutral: { name: "Neutral", color: "#c9b99a", glyph: "◇" },
  fire: { name: "Fire", color: "#e8742a", glyph: "♨" },
  water: { name: "Water", color: "#3f9fd8", glyph: "≈" },
  earth: { name: "Earth", color: "#b08a4a", glyph: "▲" },
  air: { name: "Air", color: "#9fd3e6", glyph: "~" },
  nature: { name: "Nature", color: "#5fae4e", glyph: "♣" },
  frost: { name: "Frost", color: "#a9dcf2", glyph: "*" },
  shadow: { name: "Shadow", color: "#9a6fd0", glyph: "◐" },
};

const EFFECT: Partial<Record<Element, Partial<Record<Element, number>>>> = {
  fire: { nature: 1.5, frost: 1.5, water: 0.5, fire: 0.5, earth: 0.75 },
  water: { fire: 1.5, earth: 1.5, water: 0.5, nature: 0.5 },
  earth: { fire: 1.25, frost: 1.25, air: 0.5, nature: 0.75 },
  air: { nature: 1.5, earth: 0.75, air: 0.75 },
  nature: { water: 1.5, earth: 1.5, fire: 0.5, air: 0.75, nature: 0.5 },
  frost: { nature: 1.5, air: 1.5, fire: 0.5, frost: 0.5 },
  shadow: { neutral: 1.25, shadow: 0.5, fire: 0.75 },
};

export function elementMult(att: Element, def: Element): number {
  return EFFECT[att]?.[def] ?? 1;
}

/* ---------------------------------- Biomes ---------------------------------- */

export interface BiomeDef {
  name: string;
  color: string;
  passable: boolean;
  cost: number;
  density: number;
  forage: [ItemId, number][];
  forageChance: number;
  vegetation: string;
  blurb: string;
  noun: string;
}

export const BIOMES: Record<BiomeId, BiomeDef> = {
  deep: { name: "Deep Sea", color: "#1d3a63", passable: false, cost: 99, density: 0, forage: [], forageChance: 0, vegetation: "None", blurb: "Cold, black water. Nothing you know lives here.", noun: "Deep" },
  sea: { name: "Shallow Sea", color: "#2f6aa0", passable: false, cost: 99, density: 0, forage: [], forageChance: 0, vegetation: "Kelp", blurb: "Salt spray and gull cries.", noun: "Sound" },
  lake: { name: "Lake", color: "#3a7fb5", passable: false, cost: 99, density: 0, forage: [], forageChance: 0, vegetation: "Reeds", blurb: "Still water, mirror-bright.", noun: "Mere" },
  river: { name: "River", color: "#4c93c9", passable: true, cost: 2, density: 0.6, forage: [["fish", 5], ["herb", 1]], forageChance: 0.55, vegetation: "Reeds, watercress", blurb: "Rich in fresh water. Common wildlife.", noun: "Ford" },
  beach: { name: "Beach", color: "#e3cf8f", passable: true, cost: 1, density: 0.5, forage: [], forageChance: 0.35, vegetation: "Dune grass", blurb: "Warm sand, driftwood and shells.", noun: "Strand" },
  meadow: { name: "Meadow", color: "#86b84d", passable: true, cost: 1, density: 1, forage: [["berries", 5], ["carrot", 2], ["tomato", 1], ["herb", 2], ["honeycomb", 1]], forageChance: 0.4, vegetation: "Wildflowers, clover", blurb: "Open grass humming with bees.", noun: "Lea" },
  forest: { name: "Forest", color: "#3f7d3a", passable: true, cost: 1, density: 1.2, forage: [["nuts", 5], ["mushroom", 3], ["berries", 2], ["potato", 2], ["onion", 1], ["garlic", 1], ["honeycomb", 1]], forageChance: 0.5, vegetation: "Oak, beech, fern", blurb: "Dappled shade and the smell of loam.", noun: "Wood" },
  taiga: { name: "Pine Taiga", color: "#2f5f45", passable: true, cost: 1, density: 0.9, forage: [["nuts", 4], ["mushroom", 3], ["berries", 1]], forageChance: 0.4, vegetation: "Pine, spruce, lichen", blurb: "Needles hush every footstep.", noun: "Pines" },
  gloomwood: { name: "Gloomwood", color: "#3b2f4f", passable: true, cost: 2, density: 1.1, forage: [["mushroom", 6], ["herb", 1]], forageChance: 0.45, vegetation: "Black oak, ghostcap", blurb: "The light here feels borrowed.", noun: "Hollow" },
  marsh: { name: "Marsh", color: "#5d7a4a", passable: true, cost: 2, density: 1.1, forage: [["mushroom", 3], ["herb", 3]], forageChance: 0.45, vegetation: "Sedge, bog myrtle", blurb: "Sucking mud and croaking reeds.", noun: "Fen" },
  steppe: { name: "Steppe", color: "#b7a95a", passable: true, cost: 1, density: 0.8, forage: [["herb", 2], ["onion", 2], ["garlic", 1], ["berries", 1], ["nuts", 1]], forageChance: 0.25, vegetation: "Feather grass", blurb: "Wind runs for miles without stopping.", noun: "Reach" },
  desert: { name: "Desert", color: "#d9b46a", passable: true, cost: 2, density: 0.6, forage: [["cactus_fruit", 5], ["ore", 1]], forageChance: 0.25, vegetation: "Saguaro, scrub", blurb: "Heat shimmers off the dunes.", noun: "Waste" },
  tundra: { name: "Tundra", color: "#9fae9a", passable: true, cost: 1, density: 0.6, forage: [["berries", 2], ["herb", 1]], forageChance: 0.2, vegetation: "Moss, dwarf willow", blurb: "Thin soil over frozen ground.", noun: "Barrow" },
  snow: { name: "Snowfield", color: "#e7eef2", passable: true, cost: 2, density: 0.5, forage: [["herb", 1]], forageChance: 0.1, vegetation: "None", blurb: "Blinding white, squeaking underfoot.", noun: "Drift" },
  hills: { name: "Hills", color: "#8f9b55", passable: true, cost: 2, density: 0.9, forage: [["berries", 2], ["ore", 2], ["potato", 2], ["carrot", 1], ["herb", 1]], forageChance: 0.3, vegetation: "Heather, gorse", blurb: "Rolling slopes and old stone walls.", noun: "Downs" },
  mountain: { name: "Mountain", color: "#7a6f66", passable: true, cost: 3, density: 0.6, forage: [["ore", 5], ["herb", 1]], forageChance: 0.35, vegetation: "Alpine scrub", blurb: "Scree, wind and eagles.", noun: "Crag" },
  peak: { name: "High Peak", color: "#d9d4cf", passable: false, cost: 99, density: 0, forage: [], forageChance: 0, vegetation: "None", blurb: "Ice and rock above the clouds.", noun: "Spire" },
};

/* ---------------------------------- Items ----------------------------------- */

export interface ItemDef {
  name: string;
  glyph: string;
  color: string;
  food: number;
  heal: number;
  cures: StatusId[];
  /** Battle status a brew grants to the drinker (buff potions; absent for plain goods). */
  grants?: StatusId;
  value: number;
  /** Diets that will eat this as food; an empty list marks a remedy that skips the diet check. */
  diets: Diet[];
  desc: string;
}

export const ITEMS: Record<ItemId, ItemDef> = {
  berries: { name: "Wild Berries", glyph: "•", color: "#c2334a", food: 18, heal: 6, cures: [], value: 2, diets: ["herbivore", "omnivore"], desc: "Tart and sweet. A common snack." },
  nuts: { name: "Raw Nuts", glyph: "◦", color: "#a0723a", food: 14, heal: 3, cures: [], value: 2, diets: ["herbivore", "omnivore"], desc: "Hard shells. Better roasted over a fire." },
  roasted_nuts: { name: "Roasted Nuts", glyph: "◉", color: "#c98a3c", food: 26, heal: 8, cures: [], value: 6, diets: ["herbivore", "omnivore", "carnivore"], desc: "Smoky and irresistible to warm-blooded beasts." },
  fish: { name: "River Fish", glyph: "≻", color: "#7fb7d6", food: 24, heal: 6, cures: [], value: 4, diets: ["carnivore", "omnivore"], desc: "Still flapping." },
  meat: { name: "Gamey Meat", glyph: "ʘ", color: "#b24b3a", food: 32, heal: 8, cures: [], value: 6, diets: ["carnivore", "omnivore"], desc: "Raw. Predators go wild for it." },
  egg: { name: "Wild Egg", glyph: "◍", color: "#efe3c8", food: 20, heal: 4, cures: [], value: 8, diets: ["carnivore", "omnivore"], desc: "A speckled egg from the wild. A meal — or a price." },
  herb: { name: "Bitterleaf", glyph: "♠", color: "#5fae4e", food: 4, heal: 14, cures: ["poisoned", "burning"], value: 5, diets: ["herbivore"], desc: "Chewed into a poultice. Cures poison." },
  mushroom: { name: "Ghostcap", glyph: "♣", color: "#cdb7e6", food: 10, heal: 0, cures: [], value: 3, diets: ["herbivore", "omnivore"], desc: "Usually nourishing. Sometimes not." },
  cactus_fruit: { name: "Cactus Fruit", glyph: "♦", color: "#e05a8a", food: 16, heal: 10, cures: ["burning"], value: 4, diets: ["herbivore", "omnivore"], desc: "Juicy and cooling." },
  honeycomb: { name: "Honeycomb", glyph: "⬢", color: "#f2c14e", food: 30, heal: 12, cures: [], value: 9, diets: ["herbivore", "omnivore"], desc: "Golden and sticky. Spirits adore it." },
  ore: { name: "Glintstone", glyph: "◆", color: "#a7b4c2", food: 30, heal: 0, cures: [], value: 12, diets: ["lithovore"], desc: "Valuable to traders. Edible to some." },
  tonic: { name: "Hearth Tonic", glyph: "♥", color: "#e8742a", food: 0, heal: 40, cures: ["poisoned", "burning", "blinded", "slowed"], value: 20, diets: [], desc: "A hamlet remedy. Restores 40 HP and clears ailments." },
  // wild vegetables: plain forage, no cures, wilds-only
  carrot: { name: "Wild Carrot", glyph: "√", color: "#e07b39", food: 16, heal: 3, cures: [], value: 3, diets: ["herbivore", "omnivore"], desc: "A crisp root pulled from the earth." },
  potato: { name: "Wild Potato", glyph: "●", color: "#d3b276", food: 20, heal: 4, cures: [], value: 3, diets: ["herbivore", "omnivore"], desc: "Starch of the hills. Fills the belly." },
  tomato: { name: "Vine Tomato", glyph: "❊", color: "#d8452f", food: 14, heal: 5, cures: [], value: 4, diets: ["herbivore", "omnivore"], desc: "Sun-ripened and bursting." },
  onion: { name: "Wild Onion", glyph: "◎", color: "#b892c9", food: 10, heal: 2, cures: [], value: 3, diets: ["herbivore", "omnivore"], desc: "Sharp and pungent. Worth the tears." },
  garlic: { name: "Garlic Bulb", glyph: "✤", color: "#e9d9b8", food: 6, heal: 3, cures: [], value: 4, diets: ["herbivore", "omnivore"], desc: "Fiery little cloves. Keeps monsters honest." },
  // hamlet remedies: potions, cures and battle brews
  draught: { name: "Herbal Draught", glyph: "❥", color: "#6fae6f", food: 0, heal: 15, cures: [], value: 8, diets: [], desc: "A light brew of bitterleaf. Restores 15 HP." },
  greater_tonic: { name: "Greater Tonic", glyph: "✚", color: "#c0392b", food: 0, heal: 90, cures: ["poisoned", "burning", "blinded", "slowed"], value: 45, diets: [], desc: "A rare deep-cask remedy. Restores 90 HP and clears ailments." },
  antidote: { name: "Antidote", glyph: "☥", color: "#8bc34a", food: 0, heal: 0, cures: ["poisoned"], value: 12, diets: [], desc: "Draws the venom out. Cures Poison." },
  firebane: { name: "Firebane Salve", glyph: "✜", color: "#f2a24e", food: 0, heal: 0, cures: ["burning"], value: 12, diets: [], desc: "Cool chamomile wax. Cures Burning." },
  brighteye: { name: "Brighteye Drops", glyph: "☼", color: "#9fd3e6", food: 0, heal: 0, cures: ["blinded"], value: 12, diets: [], desc: "A sting, then clarity. Cures Blinded." },
  windstep: { name: "Windstep Brew", glyph: "➹", color: "#3fb8a5", food: 0, heal: 0, cures: ["slowed", "rooted", "stunned"], value: 16, diets: [], desc: "Loosens stiff limbs. Cures Slowed, Rooted and Stunned." },
  warybrew: { name: "Warybrew", glyph: "⛨", color: "#3fb8a5", food: 0, heal: 0, cures: [], grants: "wary", value: 18, diets: [], desc: "Sharpens the senses. Grants Wary (+3 DV) for the coming fight." },
  ironbrew: { name: "Ironbrew", glyph: "▣", color: "#b08a4a", food: 0, heal: 0, cures: [], grants: "shelled", value: 18, diets: [], desc: "Hardens the hide. Grants Shelled (+4 AV) for the coming fight." },
};

export const SHOP_STOCK: ItemId[] = [
  "tonic", "draught", "greater_tonic", "antidote", "firebane", "brighteye", "windstep", "warybrew", "ironbrew",
  "meat", "roasted_nuts", "honeycomb", "herb", "fish",
];

/* ----------------------------- Personality etc ------------------------------ */

export interface PersonalityDef {
  name: string;
  mods: Partial<Stats>;
  tame: number;
  aggression: number;
  desc: string;
}

export const PERSONALITIES: Record<PersonalityId, PersonalityDef> = {
  brave: { name: "Brave", mods: { atk: 1.1, agi: 0.95 }, tame: 0, aggression: 0.25, desc: "Charges first, asks never." },
  timid: { name: "Timid", mods: { agi: 1.1, atk: 0.92 }, tame: 0.05, aggression: -0.35, desc: "Flees at the first sign of trouble." },
  curious: { name: "Curious", mods: { wis: 1.1, def: 0.95 }, tame: 0.06, aggression: -0.1, desc: "Wants to know what you are." },
  lazy: { name: "Lazy", mods: { def: 1.1, agi: 0.9 }, tame: 0.03, aggression: -0.2, desc: "Sleeps whenever it can." },
  gluttonous: { name: "Gluttonous", mods: { hp: 1.1, agi: 0.95 }, tame: 0.04, aggression: 0, desc: "Food solves everything." },
  loyal: { name: "Loyal", mods: { def: 1.05, hp: 1.05 }, tame: 0.02, aggression: 0, desc: "Never leaves a friend behind." },
  fierce: { name: "Fierce", mods: { atk: 1.12, def: 0.92 }, tame: -0.1, aggression: 0.45, desc: "Bites first. Bites second too." },
  gentle: { name: "Gentle", mods: { wis: 1.08, atk: 0.94 }, tame: 0.1, aggression: -0.3, desc: "Soft-spoken, if monsters speak." },
};

export interface MutationDef {
  name: string;
  good: boolean;
  mods: Partial<Stats>;
  desc: string;
}

export const MUTATIONS: Record<MutationId, MutationDef> = {
  thick_hide: { name: "Thick Hide", good: true, mods: { def: 1.15 }, desc: "+15% DEF. Skin like boiled leather." },
  twin_hearted: { name: "Twin-Hearted", good: true, mods: { hp: 1.2 }, desc: "+20% HP. Two heartbeats, slightly out of time." },
  luminous: { name: "Luminous", good: true, mods: { wis: 1.15 }, desc: "+15% WIS. Glows faintly in the dark." },
  quickened: { name: "Quickened", good: true, mods: { agi: 1.15 }, desc: "+15% AGI. Twitchy, restless." },
  iron_jaw: { name: "Iron Jaw", good: true, mods: { atk: 1.15 }, desc: "+15% ATK. Bites through bark." },
  old_soul: { name: "Old Soul", good: true, mods: { wis: 1.1, hp: 1.05 }, desc: "Seems to remember things it never saw." },
  frail: { name: "Frail", good: false, mods: { hp: 0.85 }, desc: "-15% HP. Bruises easily." },
  hollow_eyed: { name: "Hollow-Eyed", good: false, mods: { def: 0.9, atk: 1.08 }, desc: "Stares at nothing. Hits harder. Sleeps poorly." },
  ember_veins: { name: "Ember Veins", good: true, mods: { atk: 1.08, agi: 1.05 }, desc: "Its blood runs warm and bright." },
  star_marked: { name: "Star-Marked", good: true, mods: { hp: 1.08, atk: 1.08, def: 1.08, agi: 1.08, wis: 1.08 }, desc: "A pale star pattern on its hide. +8% all." },
};

export const TRAITS: Record<TraitId, { name: string; desc: string }> = {
  warm_blooded: { name: "Warm-blooded", desc: "Handles cold environments better than most." },
  slick: { name: "Slick", desc: "Slippery film: +1 AV, immune to rooted." },
  thorny: { name: "Thorny", desc: "Attackers in melee take 1d3 piercing damage." },
  mossy_shell: { name: "Mossy Shell", desc: "Regenerates 1 HP per turn on grass and in rain." },
  night_eyes: { name: "Night Eyes", desc: "+3 to hit and DV at night." },
  flutter: { name: "Flutter", desc: "Crosses water and mud at no extra cost." },
  stoneskin: { name: "Stoneskin", desc: "+2 AV. Sinks in water." },
  frost_coat: { name: "Frost Coat", desc: "Resists frost, thrives in snow." },
  regal: { name: "Regal", desc: "Allies adjacent gain +1 to hit." },
  photosynth: { name: "Photosynth", desc: "Regenerates 2 HP per turn in daylight." },
  sunborn: { name: "Sunborn", desc: "Immune to burning. Fire skills +25%." },
};

export const STATUSES: Record<StatusId, { name: string; color: string; desc: string }> = {
  burning: { name: "Burning", color: "#e8742a", desc: "Takes 1d4+1 fire damage per turn." },
  soaked: { name: "Soaked", color: "#3f9fd8", desc: "Fire ×0.5, frost ×1.5, can't burn." },
  poisoned: { name: "Poisoned", color: "#8bc34a", desc: "Takes 1d3 damage per turn." },
  slowed: { name: "Slowed", color: "#a9dcf2", desc: "Move -1, initiative -5." },
  rooted: { name: "Rooted", color: "#6b8e23", desc: "Cannot move." },
  stunned: { name: "Stunned", color: "#f2c14e", desc: "Loses next turn." },
  blinded: { name: "Blinded", color: "#9a6fd0", desc: "-5 to hit." },
  shelled: { name: "Shelled", color: "#b08a4a", desc: "+4 AV." },
  wary: { name: "Wary", color: "#3fb8a5", desc: "+3 DV." },
  veiled: { name: "Veiled", color: "#d9b46a", desc: "+4 DV." },
};

export const ORIGINS: Record<OriginId, { name: string; desc: string; perk: string; gold: number; bag: Partial<Record<ItemId, number>> }> = {
  wanderer: { name: "Wanderer", desc: "You've slept under a thousand skies.", perk: "+60 gold, camping heals 50% faster.", gold: 100, bag: { berries: 4, tonic: 1 } },
  herbalist: { name: "Herbalist", desc: "You know which leaves heal and which kill.", perk: "Double herbs when foraging. Mushrooms never poison.", gold: 40, bag: { herb: 4, berries: 3, mushroom: 2 } },
  ranger: { name: "Ranger", desc: "You read tracks like letters.", perk: "+10% tame chance. Ambushes are rarer.", gold: 40, bag: { meat: 3, roasted_nuts: 2 } },
  scholar: { name: "Scholar", desc: "Every creature is a book half-read.", perk: "See exact genes and odds. +20% XP.", gold: 50, bag: { berries: 3, honeycomb: 1 } },
};

export const SCARVES = ["#f5f2ea", "#c0392b", "#e8742a", "#f2c14e", "#3fb8a5", "#3f7fd0", "#9a6fd0"];

/* ---------------------------------- Skills ---------------------------------- */

export type SkillTarget = "enemy" | "ally" | "self" | "tile";

export interface SkillDef {
  name: string;
  element: Element;
  dice: [number, number];
  range: number;
  radius: number;
  target: SkillTarget;
  cooldown: number;
  acc: number;
  pen: number;
  heal?: number;
  status?: [StatusId, number, number];
  selfStatus?: [StatusId, number];
  ignite?: boolean;
  drain?: boolean;
  dash?: boolean;
  verb: string;
  desc: string;
}

export const SKILLS: Record<string, SkillDef> = {
  bite: { name: "Bite", element: "neutral", dice: [1, 6], range: 1, radius: 0, target: "enemy", cooldown: 0, acc: 0, pen: 0, verb: "bites", desc: "A plain, honest bite." },
  tackle: { name: "Tackle", element: "neutral", dice: [1, 5], range: 1, radius: 0, target: "enemy", cooldown: 0, acc: 1, pen: 0, verb: "slams into", desc: "Full-body bump." },
  peck: { name: "Peck", element: "air", dice: [1, 4], range: 1, radius: 0, target: "enemy", cooldown: 0, acc: 2, pen: 1, verb: "pecks", desc: "Quick and precise." },
  pinch: { name: "Pinch", element: "earth", dice: [1, 6], range: 1, radius: 0, target: "enemy", cooldown: 0, acc: 0, pen: 1, verb: "pinches", desc: "Chitin clamps shut." },
  tusk: { name: "Tusk Gore", element: "nature", dice: [1, 6], range: 1, radius: 0, target: "enemy", cooldown: 0, acc: 0, pen: 1, verb: "gores", desc: "Thorn-tipped tusks." },
  crunch: { name: "Crunch", element: "earth", dice: [1, 8], range: 1, radius: 0, target: "enemy", cooldown: 0, acc: -1, pen: 2, verb: "crunches", desc: "Stone mandibles." },
  frost_nip: { name: "Frost Nip", element: "frost", dice: [1, 6], range: 1, radius: 0, target: "enemy", cooldown: 0, acc: 1, pen: 0, status: ["slowed", 0.25, 2], verb: "nips", desc: "Cold teeth. May slow." },
  shell_bash: { name: "Shell Bash", element: "earth", dice: [1, 6], range: 1, radius: 0, target: "enemy", cooldown: 0, acc: 0, pen: 1, verb: "shell-bashes", desc: "Heavy and slow." },
  ember: { name: "Ember", element: "fire", dice: [1, 6], range: 3, radius: 0, target: "enemy", cooldown: 1, acc: 0, pen: 0, status: ["burning", 0.35, 3], ignite: true, verb: "spits embers at", desc: "Ranged. May set target and grass alight." },
  bubble: { name: "Bubble", element: "water", dice: [1, 5], range: 3, radius: 0, target: "enemy", cooldown: 1, acc: 1, pen: 0, status: ["soaked", 0.8, 3], verb: "bubbles", desc: "Ranged. Soaks the target." },
  gust: { name: "Gust", element: "air", dice: [1, 5], range: 3, radius: 0, target: "enemy", cooldown: 1, acc: 2, pen: 0, verb: "buffets", desc: "Ranged wind blast." },
  glimmer: { name: "Glimmer", element: "air", dice: [0, 0], range: 3, radius: 0, target: "enemy", cooldown: 3, acc: 3, pen: 0, status: ["blinded", 0.85, 2], verb: "flashes at", desc: "Blinds a target." },
  withdraw: { name: "Withdraw", element: "earth", dice: [0, 0], range: 0, radius: 0, target: "self", cooldown: 3, acc: 0, pen: 0, selfStatus: ["shelled", 3], verb: "withdraws into its shell", desc: "+4 AV for 3 turns." },
  harden: { name: "Harden", element: "earth", dice: [0, 0], range: 0, radius: 0, target: "self", cooldown: 3, acc: 0, pen: 0, selfStatus: ["shelled", 3], verb: "hardens its carapace", desc: "+4 AV for 3 turns." },
  howl: { name: "Howl", element: "neutral", dice: [0, 0], range: 0, radius: 2, target: "self", cooldown: 4, acc: 0, pen: 0, selfStatus: ["wary", 3], status: ["stunned", 0.3, 1], verb: "howls", desc: "May stun foes within 2. Grants Wary." },
  flame_dash: { name: "Flame Dash", element: "fire", dice: [2, 6], range: 3, radius: 0, target: "enemy", cooldown: 3, acc: 1, pen: 1, dash: true, ignite: true, status: ["burning", 0.4, 2], verb: "dashes through", desc: "Lunges to the target, leaving fire behind." },
  wildfire: { name: "Wildfire", element: "fire", dice: [2, 6], range: 3, radius: 1, target: "tile", cooldown: 5, acc: 0, pen: 0, ignite: true, status: ["burning", 0.6, 3], verb: "unleashes wildfire on", desc: "Area blaze. Fire spreads through grass." },
  vine_lash: { name: "Vine Lash", element: "nature", dice: [1, 8], range: 2, radius: 0, target: "enemy", cooldown: 1, acc: 0, pen: 0, status: ["rooted", 0.35, 2], verb: "lashes", desc: "Reach 2. May root." },
  quake: { name: "Quake", element: "earth", dice: [2, 5], range: 0, radius: 2, target: "self", cooldown: 4, acc: 0, pen: 1, status: ["stunned", 0.2, 1], verb: "shakes the ground beneath", desc: "Hits all foes within 2." },
  overgrowth: { name: "Overgrowth", element: "nature", dice: [1, 6], range: 3, radius: 1, target: "tile", cooldown: 5, acc: 0, pen: 0, status: ["rooted", 0.7, 2], verb: "smothers", desc: "Area root. Grows tall grass." },
  mend: { name: "Mend", element: "nature", dice: [0, 0], range: 3, radius: 0, target: "ally", cooldown: 2, acc: 0, pen: 0, heal: 14, verb: "mends", desc: "Heals an ally 14 + WIS/2." },
  bloom: { name: "Bloom", element: "nature", dice: [0, 0], range: 0, radius: 3, target: "self", cooldown: 6, acc: 0, pen: 0, heal: 12, verb: "blooms over", desc: "Heals all allies within 3." },
  cyclone: { name: "Cyclone", element: "air", dice: [2, 5], range: 3, radius: 1, target: "tile", cooldown: 4, acc: 1, pen: 0, verb: "whirls a cyclone over", desc: "Area wind. Puts out fires." },
  starfall: { name: "Starfall", element: "air", dice: [3, 6], range: 4, radius: 1, target: "tile", cooldown: 6, acc: 2, pen: 1, status: ["stunned", 0.25, 1], verb: "calls down starfall on", desc: "Heavy area damage." },
  goo: { name: "Goo", element: "water", dice: [1, 4], range: 2, radius: 0, target: "enemy", cooldown: 2, acc: 1, pen: 0, status: ["slowed", 0.7, 2], verb: "globs goo on", desc: "Slows the target." },
  regen: { name: "Reform", element: "water", dice: [0, 0], range: 0, radius: 0, target: "self", cooldown: 4, acc: 0, pen: 0, heal: 12, verb: "reforms its body", desc: "Heals self 12 + WIS/2." },
  tongue_lash: { name: "Tongue Lash", element: "water", dice: [1, 6], range: 2, radius: 0, target: "enemy", cooldown: 0, acc: 0, pen: 0, verb: "tongue-lashes", desc: "Reach 2." },
  mud_spit: { name: "Mud Spit", element: "earth", dice: [1, 4], range: 3, radius: 0, target: "enemy", cooldown: 2, acc: 0, pen: 0, status: ["slowed", 0.75, 2], verb: "spits mud at", desc: "Ranged. Slows." },
  bellow: { name: "Bellow", element: "neutral", dice: [0, 0], range: 0, radius: 2, target: "self", cooldown: 4, acc: 0, pen: 0, status: ["stunned", 0.35, 1], verb: "bellows", desc: "May stun foes within 2." },
  swamp_gas: { name: "Swamp Gas", element: "nature", dice: [1, 4], range: 3, radius: 1, target: "tile", cooldown: 4, acc: 1, pen: 0, status: ["poisoned", 0.75, 4], verb: "belches swamp gas at", desc: "Area poison." },
  hoot: { name: "Eerie Hoot", element: "air", dice: [0, 0], range: 3, radius: 0, target: "enemy", cooldown: 3, acc: 2, pen: 0, status: ["stunned", 0.5, 1], verb: "hoots eerily at", desc: "May stun." },
  dive: { name: "Talon Dive", element: "air", dice: [2, 6], range: 3, radius: 0, target: "enemy", cooldown: 3, acc: 2, pen: 1, dash: true, verb: "dives onto", desc: "Swoops to the target." },
  charge: { name: "Charge", element: "neutral", dice: [2, 5], range: 3, radius: 0, target: "enemy", cooldown: 3, acc: 0, pen: 1, dash: true, status: ["stunned", 0.2, 1], verb: "charges", desc: "Rushes in. May stun." },
  bramble: { name: "Bramble Snare", element: "nature", dice: [1, 4], range: 3, radius: 0, target: "enemy", cooldown: 3, acc: 1, pen: 0, status: ["rooted", 0.85, 2], verb: "snares", desc: "Roots the target." },
  thorn_volley: { name: "Thorn Volley", element: "nature", dice: [2, 4], range: 3, radius: 1, target: "tile", cooldown: 4, acc: 0, pen: 1, verb: "looses thorns at", desc: "Area piercing." },
  venom_sting: { name: "Venom Sting", element: "earth", dice: [1, 4], range: 1, radius: 0, target: "enemy", cooldown: 1, acc: 1, pen: 1, status: ["poisoned", 0.7, 4], verb: "stings", desc: "Poisons." },
  burrow: { name: "Burrow", element: "earth", dice: [0, 0], range: 0, radius: 0, target: "self", cooldown: 3, acc: 0, pen: 0, selfStatus: ["veiled", 2], verb: "burrows into the ground", desc: "+4 DV for 2 turns." },
  sand_veil: { name: "Sand Veil", element: "earth", dice: [0, 0], range: 0, radius: 2, target: "self", cooldown: 5, acc: 1, pen: 0, status: ["blinded", 0.65, 2], selfStatus: ["veiled", 2], verb: "kicks up a sand veil around", desc: "Blinds foes within 2." },
  icy_breath: { name: "Icy Breath", element: "frost", dice: [2, 4], range: 3, radius: 0, target: "enemy", cooldown: 2, acc: 0, pen: 0, status: ["slowed", 0.6, 2], verb: "breathes ice on", desc: "Ranged. Slows." },
  blizzard: { name: "Blizzard", element: "frost", dice: [2, 6], range: 3, radius: 1, target: "tile", cooldown: 5, acc: 0, pen: 0, status: ["slowed", 0.6, 2], verb: "summons a blizzard on", desc: "Area frost. Extinguishes fire." },
  dust: { name: "Gloam Dust", element: "shadow", dice: [1, 3], range: 2, radius: 0, target: "enemy", cooldown: 2, acc: 2, pen: 0, status: ["blinded", 0.75, 2], verb: "sheds dust on", desc: "Blinds." },
  dread_gaze: { name: "Dread Gaze", element: "shadow", dice: [1, 6], range: 3, radius: 0, target: "enemy", cooldown: 3, acc: 1, pen: 1, status: ["stunned", 0.4, 1], verb: "fixes its eyespots on", desc: "May stun with fear." },
  leech_wing: { name: "Leech Wing", element: "shadow", dice: [1, 8], range: 1, radius: 0, target: "enemy", cooldown: 2, acc: 0, pen: 1, drain: true, verb: "drains", desc: "Heals for half the damage." },
  eclipse: { name: "Eclipse", element: "shadow", dice: [3, 5], range: 3, radius: 1, target: "tile", cooldown: 6, acc: 1, pen: 1, status: ["blinded", 0.5, 2], verb: "darkens", desc: "Area shadow." },
  rockslide: { name: "Rockslide", element: "earth", dice: [2, 6], range: 3, radius: 1, target: "tile", cooldown: 4, acc: -1, pen: 2, verb: "brings rocks down on", desc: "Area. Heavy penetration." },
  omen: { name: "Ill Omen", element: "shadow", dice: [0, 0], range: 3, radius: 0, target: "enemy", cooldown: 3, acc: 3, pen: 0, status: ["blinded", 0.6, 2], verb: "croaks an ill omen at", desc: "Curses with blindness." },
  shadow_dive: { name: "Shadow Dive", element: "shadow", dice: [2, 6], range: 3, radius: 0, target: "enemy", cooldown: 3, acc: 2, pen: 1, dash: true, verb: "dives through shadow at", desc: "Swoops to the target." },
  reap: { name: "Reap", element: "shadow", dice: [3, 6], range: 1, radius: 0, target: "enemy", cooldown: 4, acc: 1, pen: 2, drain: true, verb: "reaps", desc: "Drains life." },
  royal_decree: { name: "Royal Decree", element: "neutral", dice: [0, 0], range: 0, radius: 3, target: "self", cooldown: 5, acc: 0, pen: 0, heal: 8, selfStatus: ["wary", 3], verb: "issues a royal decree to", desc: "Heals allies within 3." },
  tidal_crash: { name: "Tidal Crash", element: "water", dice: [3, 5], range: 3, radius: 1, target: "tile", cooldown: 5, acc: 0, pen: 1, status: ["soaked", 0.9, 3], verb: "crashes a wave over", desc: "Area water. Douses fire." },
  dragon_roar: { name: "Dragon Roar", element: "fire", dice: [1, 6], range: 0, radius: 2, target: "self", cooldown: 5, acc: 1, pen: 0, status: ["stunned", 0.45, 1], selfStatus: ["wary", 2], verb: "roars at", desc: "Stuns foes within 2." },
  solar_flare: { name: "Solar Flare", element: "fire", dice: [4, 6], range: 4, radius: 1, target: "tile", cooldown: 7, acc: 2, pen: 2, ignite: true, status: ["burning", 0.7, 3], verb: "calls a solar flare on", desc: "Devastating area fire." },
  pollen: { name: "Pollen Puff", element: "nature", dice: [0, 0], range: 3, radius: 1, target: "tile", cooldown: 4, acc: 2, pen: 0, status: ["stunned", 0.35, 1], verb: "puffs pollen over", desc: "May put foes to sleep." },
  talon_rake: { name: "Talon Rake", element: "air", dice: [2, 4], range: 1, radius: 0, target: "enemy", cooldown: 1, acc: 2, pen: 1, verb: "rakes", desc: "Twin talons in a flashing arc." },
  salty_spray: { name: "Salty Spray", element: "water", dice: [1, 4], range: 3, radius: 0, target: "enemy", cooldown: 1, acc: 1, pen: 0, status: ["soaked", 0.85, 3], verb: "sprays brine at", desc: "Ranged. Soaks the target." },
  club_smash: { name: "Club Smash", element: "earth", dice: [2, 5], range: 1, radius: 0, target: "enemy", cooldown: 2, acc: -1, pen: 2, status: ["stunned", 0.25, 1], verb: "club-smashes", desc: "A heavy spiked club. May stun." },
  maw_snap: { name: "Maw Snap", element: "nature", dice: [1, 8], range: 1, radius: 0, target: "enemy", cooldown: 0, acc: 0, pen: 1, verb: "snaps its maws at", desc: "Toothed maws clamp shut." },
  crystal_lance: { name: "Crystal Lance", element: "frost", dice: [2, 5], range: 3, radius: 0, target: "enemy", cooldown: 2, acc: 1, pen: 2, verb: "hurls a crystal lance at", desc: "Ranged. Pierces armor." },
  iron_fang: { name: "Iron Fang", element: "earth", dice: [2, 6], range: 1, radius: 0, target: "enemy", cooldown: 1, acc: 0, pen: 2, verb: "crushes with iron fangs", desc: "Armor-shredding bite." },

  /* ------------------------ Species-unique techniques ------------------------
     One signature-capable move known only by its species, learned as the
     final level-up entry. Every id below must appear in exactly one learnset. */
  pyre_fang: { name: "Pyre Fang", element: "fire", dice: [2, 6], range: 1, radius: 0, target: "enemy", cooldown: 2, acc: 1, pen: 1, status: ["burning", 0.5, 3], ignite: true, verb: "smites with burning fangs", desc: "A bite that lights what it closes on." },
  verdant_bulwark: { name: "Verdant Bulwark", element: "nature", dice: [0, 0], range: 0, radius: 0, target: "self", cooldown: 5, acc: 0, pen: 0, heal: 8, selfStatus: ["shelled", 3], verb: "draws a green bulwark around itself", desc: "Heals 8 + WIS/2 and gains +4 AV for 3 turns." },
  wisp_flare: { name: "Wisp Flare", element: "fire", dice: [1, 6], range: 3, radius: 0, target: "enemy", cooldown: 2, acc: 1, pen: 0, status: ["burning", 0.45, 3], ignite: true, verb: "flares its lantern at", desc: "The lantern burns. Ranged." },
  dew_share: { name: "Dew Share", element: "water", dice: [0, 0], range: 3, radius: 0, target: "ally", cooldown: 2, acc: 0, pen: 0, heal: 10, verb: "shares its dew with", desc: "Heals an ally 10 + WIS/2." },
  mire_pull: { name: "Mire Pull", element: "water", dice: [1, 4], range: 3, radius: 0, target: "enemy", cooldown: 3, acc: 1, pen: 0, status: ["rooted", 0.6, 2], verb: "drags into the mire", desc: "Ranged. Roots the target where it stands." },
  silent_fletch: { name: "Silent Fletch", element: "air", dice: [2, 4], range: 3, radius: 0, target: "enemy", cooldown: 2, acc: 3, pen: 0, verb: "strikes from silence at", desc: "A strike that makes no sound until it lands." },
  bramble_rush: { name: "Bramble Rush", element: "nature", dice: [2, 5], range: 3, radius: 0, target: "enemy", cooldown: 3, acc: 0, pen: 1, dash: true, status: ["rooted", 0.3, 2], verb: "rushes through bramble at", desc: "Charges through thorns, tangling the target." },
  glass_fang: { name: "Glass Fang", element: "earth", dice: [2, 4], range: 1, radius: 0, target: "enemy", cooldown: 2, acc: 1, pen: 3, verb: "stabs with a glass fang", desc: "A stinger fused to glass by heat. Ignores armor." },
  hoarfrost_glee: { name: "Hoarfrost Glee", element: "frost", dice: [2, 4], range: 3, radius: 0, target: "enemy", cooldown: 3, acc: 2, pen: 0, status: ["slowed", 0.8, 3], verb: "gambols through snow at", desc: "Ranged. The cold bites deep and lingers." },
  nightmare_veil: { name: "Nightmare Veil", element: "shadow", dice: [1, 3], range: 0, radius: 2, target: "self", cooldown: 4, acc: 1, pen: 0, status: ["blinded", 0.5, 2], verb: "unfolds a nightmare veil around", desc: "A waking dream blinds foes within 2." },
  millstone: { name: "Millstone", element: "earth", dice: [3, 5], range: 1, radius: 0, target: "enemy", cooldown: 3, acc: -1, pen: 2, verb: "grinds under millstone mandibles", desc: "Stone-crushing jaws. Slow but heavy." },
  ferrymans_toll: { name: "Ferryman's Toll", element: "shadow", dice: [2, 4], range: 2, radius: 0, target: "enemy", cooldown: 3, acc: 1, pen: 0, drain: true, verb: "collects a toll from", desc: "Reach 2. Heals for half the damage." },
  sovereign_surge: { name: "Sovereign Surge", element: "water", dice: [0, 0], range: 0, radius: 3, target: "self", cooldown: 6, acc: 0, pen: 0, heal: 12, selfStatus: ["wary", 3], verb: "surges sovereignly beneath", desc: "Heals allies within 3 and grants Wary." },
  corona_coil: { name: "Corona Coil", element: "fire", dice: [3, 5], range: 0, radius: 2, target: "self", cooldown: 5, acc: 0, pen: 1, status: ["burning", 0.5, 3], ignite: true, verb: "coils in living flame around", desc: "Burns everything within 2." },
  seed_volley: { name: "Seed Volley", element: "nature", dice: [2, 3], range: 3, radius: 0, target: "enemy", cooldown: 2, acc: 2, pen: 1, verb: "volleys hardened seeds at", desc: "Quick paired shots of petrified seed." },
  squall_dive: { name: "Squall Dive", element: "air", dice: [3, 5], range: 4, radius: 0, target: "enemy", cooldown: 4, acc: 2, pen: 1, dash: true, verb: "falls out of the squall onto", desc: "A long dive riding the wind." },
  riptide_hop: { name: "Riptide Hop", element: "water", dice: [2, 5], range: 3, radius: 0, target: "enemy", cooldown: 3, acc: 1, pen: 0, dash: true, status: ["soaked", 0.9, 2], verb: "hops through a riptide at", desc: "One huge wet hop. Soaks the target." },
  skullsplitter: { name: "Skullsplitter", element: "earth", dice: [3, 5], range: 1, radius: 0, target: "enemy", cooldown: 4, acc: 0, pen: 2, status: ["stunned", 0.3, 1], verb: "swings the skullsplitter at", desc: "A club wound for exactly one purpose." },
  fin_cutter: { name: "Fin Cutter", element: "water", dice: [2, 4], range: 1, radius: 0, target: "enemy", cooldown: 1, acc: 2, pen: 1, verb: "cuts with fin crests", desc: "Razor crests in a quick flash." },
  swallow_whole: { name: "Swallow Whole", element: "nature", dice: [3, 5], range: 1, radius: 0, target: "enemy", cooldown: 5, acc: -1, pen: 1, drain: true, verb: "swallows whole", desc: "Drains life. The vine-mouths close in agreement." },
  spike_wheel: { name: "Spike Wheel", element: "nature", dice: [2, 4], range: 0, radius: 2, target: "self", cooldown: 4, acc: 0, pen: 1, status: ["poisoned", 0.3, 3], verb: "wheels its spikes through", desc: "Rolls its spines through all foes within 2." },
  thunder_maned: { name: "Thundermane", element: "air", dice: [3, 5], range: 3, radius: 1, target: "tile", cooldown: 5, acc: 1, pen: 0, status: ["stunned", 0.3, 1], verb: "flares its mane over", desc: "The mane cracks like a storm front. May stun." },
  geode_burst: { name: "Geode Burst", element: "frost", dice: [3, 4], range: 3, radius: 1, target: "tile", cooldown: 5, acc: -1, pen: 2, verb: "bursts a geode over", desc: "Crystal shrapnel. Heavy penetration." },
  sundart: { name: "Sundart", element: "air", dice: [2, 6], range: 4, radius: 0, target: "enemy", cooldown: 3, acc: 3, pen: 1, verb: "throws a sundart at", desc: "A bolt of caught sunlight. Far and true." },
  tyrants_verdict: { name: "Tyrant's Verdict", element: "shadow", dice: [4, 6], range: 1, radius: 0, target: "enemy", cooldown: 5, acc: 0, pen: 3, verb: "passes verdict on", desc: "One blow, rendered without appeal." },
  shroud_charge: { name: "Shroud Charge", element: "shadow", dice: [2, 5], range: 3, radius: 0, target: "enemy", cooldown: 3, acc: 1, pen: 1, dash: true, status: ["blinded", 0.5, 2], verb: "charges out of the shroud at", desc: "Bursts from its own fur, blinding as it comes." },
  slag_belch: { name: "Slag Belch", element: "fire", dice: [2, 5], range: 3, radius: 1, target: "tile", cooldown: 4, acc: 0, pen: 0, status: ["burning", 0.5, 3], ignite: true, verb: "belches slag over", desc: "Area blaze from somewhere very internal." },
  glacial_snare: { name: "Glacial Snare", element: "frost", dice: [2, 3], range: 3, radius: 1, target: "tile", cooldown: 4, acc: 0, pen: 1, status: ["rooted", 0.75, 2], verb: "snares in glacial ice", desc: "Ice teeth close around the area." },
  lantern_snuff: { name: "Lantern Snuff", element: "shadow", dice: [2, 5], range: 3, radius: 0, target: "enemy", cooldown: 3, acc: 2, pen: 1, drain: true, verb: "snuffs the light from", desc: "Ranged drain. The glow goes somewhere." },
  crystal_garden: { name: "Crystal Garden", element: "earth", dice: [2, 4], range: 3, radius: 1, target: "tile", cooldown: 4, acc: 0, pen: 2, status: ["rooted", 0.4, 2], verb: "plants a crystal garden under", desc: "Crystals erupt, piercing and pinning." },
  hungering_helm: { name: "Hungering Helm", element: "shadow", dice: [3, 5], range: 1, radius: 0, target: "enemy", cooldown: 4, acc: 0, pen: 2, drain: true, status: ["stunned", 0.3, 1], verb: "bears down with the helm of hunger on", desc: "Drains life. May stun. The skull is always empty; the hunger is not." },
};

/* --------------------------------- Species ---------------------------------- */

export interface SpeciesDef {
  id: string;
  name: string;
  title: string;
  element: Element;
  family: Family;
  rarity: Rarity;
  base: Stats;
  traits: TraitId[];
  diet: Diet;
  likes: ItemId;
  fears: FearKind;
  activity: Activity;
  biomes: Partial<Record<BiomeId, number>>;
  learnset: [number, string][];
  desc: string;
  lore: string;
  size: number;
  /** Tile footprint side: 2 = Large (2×2), 3 = Huge (3×3), 4 = Titanic (4×4). Defaults by size: ≥4 → 4, ≥3 → 2, else 1. */
  tiles?: 1 | 2 | 3 | 4;
  /** false for species without biological sex (spirits, slimes, the golem, plants). Defaults to sexed (male/female). */
  sexed?: false;
  swims: boolean;
  tameBase: number;
  xp: number;
  aggression: number;
}

const S = (s: SpeciesDef): SpeciesDef => s;

/** Tile footprint width/height of a species (2 = Large 2×2, 3 = Huge 3×3, 4 = Titanic 4×4). */
export const footprintOf = (sp: SpeciesDef): number => sp.tiles ?? (sp.size >= 4 ? 4 : sp.size >= 3 ? 2 : 1);

/** Size tier label for the UI; null for normal (1×1) creatures. */
export const tierOf = (sp: SpeciesDef): "Large" | "Huge" | "Titanic" | null => {
  const f = footprintOf(sp);
  return f >= 4 ? "Titanic" : f === 3 ? "Huge" : f === 2 ? "Large" : null;
};

export const SPECIES: Record<string, SpeciesDef> = {
  cindermaw: S({ id: "cindermaw", name: "Cindermaw", title: "Ember Hound", element: "fire", family: "Beast", rarity: "uncommon", base: { hp: 24, atk: 14, def: 9, agi: 11, wis: 7 }, traits: ["warm_blooded"], diet: "carnivore", likes: "roasted_nuts", fears: "water", activity: "diurnal", biomes: { steppe: 2, hills: 1, desert: 1 }, learnset: [[1, "bite"], [1, "ember"], [5, "howl"], [9, "flame_dash"], [15, "wildfire"], [20, "pyre_fang"]], desc: "A fierce but loyal hound with a heart that never cools.", lore: "Born from burning fields, Cindermaw runs toward adventure, and never leaves a friend behind.", size: 2, swims: false, tameBase: 0.22, xp: 14, aggression: 0.55 }),
  mossback: S({ id: "mossback", name: "Mossback", title: "Grove Tortoise", element: "earth", family: "Beast", rarity: "uncommon", base: { hp: 30, atk: 10, def: 15, agi: 5, wis: 9 }, traits: ["mossy_shell"], diet: "herbivore", likes: "berries", fears: "fire", activity: "diurnal", biomes: { forest: 1, marsh: 1, meadow: 0.5 }, learnset: [[1, "shell_bash"], [1, "withdraw"], [5, "vine_lash"], [10, "quake"], [15, "overgrowth"], [20, "verdant_bulwark"]], desc: "Steady, patient, and wise. Carries a forest wherever it goes.", lore: "Old Mossbacks are mistaken for hillocks. Some have had cottages built on them.", size: 3, tiles: 1, swims: true, tameBase: 0.24, xp: 15, aggression: 0.1 }),
  pipwisp: S({ id: "pipwisp", name: "Pipwisp", title: "Lantern Wisp", element: "air", family: "Spirit", rarity: "uncommon", base: { hp: 18, atk: 9, def: 7, agi: 16, wis: 15 }, traits: ["flutter"], diet: "omnivore", likes: "honeycomb", fears: "dark", activity: "crepuscular", biomes: { meadow: 1, hills: 1 }, learnset: [[1, "gust"], [1, "glimmer"], [4, "mend"], [9, "cyclone"], [15, "starfall"], [20, "wisp_flare"]], desc: "A curious spirit drawn to light, always seeking new places.", lore: "Travellers once followed Pipwisps home. Most of them arrived.", sexed: false, size: 1, swims: false, tameBase: 0.24, xp: 14, aggression: 0.15 }),
  slimekin: S({ id: "slimekin", name: "Slimekin", title: "Dew Slime", element: "water", family: "Slime", rarity: "common", base: { hp: 16, atk: 8, def: 8, agi: 9, wis: 8 }, traits: ["slick"], diet: "omnivore", likes: "berries", fears: "heat", activity: "diurnal", biomes: { meadow: 4, river: 4, forest: 1.5, marsh: 2, beach: 2 }, learnset: [[1, "tackle"], [1, "bubble"], [4, "goo"], [8, "regen"], [13, "tidal_crash"], [20, "dew_share"]], desc: "A small, water-loving creature. It bounces with gentle curiosity.", lore: "Slimekin gather in dew-wet meadows at dawn. Two that meet often merge into one, larger, prouder slime.", sexed: false, size: 1, swims: true, tameBase: 0.4, xp: 8, aggression: 0.15 }),
  boglurk: S({ id: "boglurk", name: "Boglurk", title: "Mire Toad", element: "water", family: "Beast", rarity: "common", base: { hp: 26, atk: 13, def: 11, agi: 6, wis: 6 }, traits: ["slick"], diet: "carnivore", likes: "fish", fears: "cold", activity: "crepuscular", biomes: { marsh: 5, river: 1.5, lake: 0 }, learnset: [[1, "tongue_lash"], [1, "mud_spit"], [6, "bellow"], [10, "swamp_gas"], [20, "mire_pull"]], desc: "A swamp-dwelling brute. Its skin secretes a slippery film that turns blades aside.", lore: "Boglurks sit motionless for days. The marsh grows over them, and then something steps too close.", size: 2, swims: true, tameBase: 0.32, xp: 11, aggression: 0.6 }),
  nimbletuft: S({ id: "nimbletuft", name: "Nimbletuft", title: "Puff Owl", element: "air", family: "Bird", rarity: "common", base: { hp: 17, atk: 10, def: 7, agi: 15, wis: 12 }, traits: ["night_eyes", "flutter"], diet: "carnivore", likes: "meat", fears: "light", activity: "nocturnal", biomes: { forest: 3, taiga: 3, gloomwood: 1 }, learnset: [[1, "peck"], [1, "gust"], [5, "hoot"], [8, "dive"], [14, "cyclone"], [20, "silent_fletch"]], desc: "A round, fluffy owl. Readies a gust when startled.", lore: "Nimbletufts can turn their heads all the way around, and occasionally do so just to unsettle you.", size: 1, swims: false, tameBase: 0.36, xp: 9, aggression: 0.3 }),
  thornhog: S({ id: "thornhog", name: "Thornhog", title: "Bramble Boar", element: "nature", family: "Beast", rarity: "common", base: { hp: 22, atk: 14, def: 12, agi: 8, wis: 6 }, traits: ["thorny"], diet: "omnivore", likes: "nuts", fears: "fire", activity: "diurnal", biomes: { forest: 4, meadow: 1.5, hills: 1.5, taiga: 1 }, learnset: [[1, "tusk"], [3, "charge"], [7, "bramble"], [12, "thorn_volley"], [20, "bramble_rush"]], desc: "Stocky and stubborn. Its bristles are living bramble.", lore: "Where a Thornhog sleeps, blackberries grow the next spring.", size: 2, swims: false, tameBase: 0.34, xp: 10, aggression: 0.5 }),
  dunescuttle: S({ id: "dunescuttle", name: "Dunescuttle", title: "Sand Stinger", element: "earth", family: "Bug", rarity: "common", base: { hp: 20, atk: 13, def: 14, agi: 9, wis: 5 }, traits: ["stoneskin"], diet: "carnivore", likes: "meat", fears: "cold", activity: "diurnal", biomes: { desert: 5, steppe: 1, beach: 1.5 }, learnset: [[1, "pinch"], [1, "venom_sting"], [6, "burrow"], [10, "sand_veil"], [20, "glass_fang"]], desc: "Armored and patient. Its turquoise stinger glows at noon.", lore: "Caravans read the sand for Dunescuttle tracks the way sailors read clouds.", size: 2, swims: false, tameBase: 0.3, xp: 11, aggression: 0.55 }),
  frostnib: S({ id: "frostnib", name: "Frostnib", title: "Snow Kit", element: "frost", family: "Beast", rarity: "common", base: { hp: 19, atk: 12, def: 8, agi: 14, wis: 10 }, traits: ["frost_coat"], diet: "carnivore", likes: "fish", fears: "heat", activity: "crepuscular", biomes: { tundra: 4, snow: 4, taiga: 2 }, learnset: [[1, "frost_nip"], [1, "bite"], [5, "icy_breath"], [12, "blizzard"], [20, "hoarfrost_glee"]], desc: "A mischievous snow fox. Its breath freezes mid-air.", lore: "Frostnibs bury their kills in snowbanks and forget where. The tundra is full of their little secrets.", size: 1, swims: false, tameBase: 0.32, xp: 10, aggression: 0.4 }),
  gloamoth: S({ id: "gloamoth", name: "Gloamoth", title: "Dusk Moth", element: "shadow", family: "Bug", rarity: "uncommon", base: { hp: 18, atk: 9, def: 8, agi: 13, wis: 14 }, traits: ["night_eyes", "flutter"], diet: "herbivore", likes: "honeycomb", fears: "light", activity: "nocturnal", biomes: { gloomwood: 5, marsh: 1, forest: 0.5 }, learnset: [[1, "dust"], [1, "peck"], [5, "dread_gaze"], [8, "leech_wing"], [14, "eclipse"], [20, "nightmare_veil"]], desc: "Its eyespots never blink. Its dust tastes like old dreams.", lore: "Those who sleep in the Gloomwood wake with grey powder on their eyelids, and cannot remember why they are crying.", size: 1, swims: false, tameBase: 0.25, xp: 13, aggression: 0.35 }),
  cragjaw: S({ id: "cragjaw", name: "Cragjaw", title: "Stone Beetle", element: "earth", family: "Bug", rarity: "uncommon", base: { hp: 30, atk: 15, def: 18, agi: 4, wis: 5 }, traits: ["stoneskin"], diet: "lithovore", likes: "ore", fears: "water", activity: "diurnal", biomes: { mountain: 4, hills: 1.5 }, learnset: [[1, "crunch"], [1, "harden"], [7, "rockslide"], [12, "quake"], [20, "millstone"]], desc: "A boulder with legs and opinions. Eats stone.", lore: "Miners follow Cragjaw tunnels to the richest veins, then flee the Cragjaw.", size: 3, tiles: 2, swims: false, tameBase: 0.24, xp: 15, aggression: 0.45 }),
  hollowcrow: S({ id: "hollowcrow", name: "Hollowcrow", title: "Bone-Masked Raven", element: "shadow", family: "Bird", rarity: "rare", base: { hp: 20, atk: 14, def: 8, agi: 15, wis: 12 }, traits: ["night_eyes", "flutter"], diet: "carnivore", likes: "meat", fears: "light", activity: "nocturnal", biomes: { gloomwood: 2.5, taiga: 0.4, tundra: 0.3 }, learnset: [[1, "peck"], [1, "omen"], [6, "shadow_dive"], [12, "reap"], [20, "ferrymans_toll"]], desc: "It wears the skull of something it outlived.", lore: "A Hollowcrow on your roof means a visitor. Nobody agrees on whether the visitor is welcome.", size: 1, swims: false, tameBase: 0.14, xp: 20, aggression: 0.5 }),
  regalslime: S({ id: "regalslime", name: "Regal Slimekin", title: "Crowned Slime", element: "water", family: "Slime", rarity: "rare", base: { hp: 34, atk: 13, def: 14, agi: 10, wis: 13 }, traits: ["slick", "regal"], diet: "omnivore", likes: "honeycomb", fears: "heat", activity: "diurnal", biomes: { lake: 0, river: 0.2, meadow: 0.1 }, learnset: [[1, "tackle"], [1, "bubble"], [1, "royal_decree"], [6, "goo"], [10, "tidal_crash"], [20, "sovereign_surge"]], desc: "Two slimes became one, and one became a monarch.", lore: "The crown is not metal. Nobody knows what it is, and the Slimekin will not say.", sexed: false, size: 2, swims: true, tameBase: 0.12, xp: 22, aggression: 0.2 }),
  sunwyrm: S({ id: "sunwyrm", name: "Sunwyrm", title: "Young Dragon", element: "fire", family: "Dragon", rarity: "legendary", base: { hp: 36, atk: 19, def: 15, agi: 13, wis: 14 }, traits: ["sunborn"], diet: "carnivore", likes: "meat", fears: "cold", activity: "diurnal", biomes: { mountain: 0.15, desert: 0.08 }, learnset: [[1, "bite"], [1, "ember"], [4, "dragon_roar"], [8, "flame_dash"], [12, "wildfire"], [18, "solar_flare"], [20, "corona_coil"]], desc: "Proud, hot-tempered, and still growing into its wings.", lore: "Sunwyrms nest in cooling lava and hatch only on the longest day of the year.", size: 4, tiles: 4, swims: false, tameBase: 0.06, xp: 32, aggression: 0.6 }),
  bloomwisp: S({ id: "bloomwisp", name: "Bloomwisp", title: "Petal Spirit", element: "nature", family: "Spirit", rarity: "uncommon", base: { hp: 20, atk: 8, def: 9, agi: 12, wis: 16 }, traits: ["photosynth", "flutter"], diet: "herbivore", likes: "honeycomb", fears: "fire", activity: "diurnal", biomes: { meadow: 1.2, forest: 0.4 }, learnset: [[1, "pollen"], [1, "mend"], [5, "vine_lash"], [10, "overgrowth"], [15, "bloom"], [20, "seed_volley"]], desc: "A seed that refused to stay in the ground.", lore: "Bloomwisps drift toward grief. Where they settle, flowers come up through the cracks.", sexed: false, size: 1, swims: false, tameBase: 0.26, xp: 13, aggression: 0.05 }),
  zephyr_hawk: S({ id: "zephyr_hawk", name: "Zephyr Hawk", title: "Gale Raptor", element: "air", family: "Bird", rarity: "uncommon", base: { hp: 21, atk: 15, def: 8, agi: 17, wis: 10 }, traits: ["flutter"], diet: "carnivore", likes: "meat", fears: "cold", activity: "diurnal", biomes: { steppe: 2, hills: 1.5, meadow: 0.6, mountain: 0.5 }, learnset: [[1, "peck"], [1, "gust"], [6, "talon_rake"], [10, "dive"], [15, "cyclone"], [20, "squall_dive"]], desc: "A proud aerial hunter in brilliant blue and white. Dives with a piercing cry, then is gone.", lore: "Zephyr Hawks mate for exactly one hunting season, then exchange long, scolding letters by wind.", size: 2, swims: false, tameBase: 0.2, xp: 14, aggression: 0.45 }),
  tidefin_toad: S({ id: "tidefin_toad", name: "Tidefin Toad", title: "Brine Hopper", element: "water", family: "Beast", rarity: "common", base: { hp: 24, atk: 12, def: 10, agi: 12, wis: 8 }, traits: ["slick"], diet: "carnivore", likes: "fish", fears: "cold", activity: "crepuscular", biomes: { river: 3, marsh: 3, beach: 1, lake: 0.4 }, learnset: [[1, "tongue_lash"], [1, "bubble"], [5, "salty_spray"], [9, "goo"], [14, "tidal_crash"], [20, "riptide_hop"]], desc: "A lively blue amphibian with fin crests and glowing eyes. Hops faster than you'd think.", lore: "Tidefin Toads sing to the tide. Inland ponds are, apparently, disappointing.", size: 2, swims: true, tameBase: 0.34, xp: 10, aggression: 0.5 }),
  skullclub_orc: S({ id: "skullclub_orc", name: "Skullclub Orc", title: "Bone-Helm Brute", element: "earth", family: "Brute", rarity: "uncommon", base: { hp: 28, atk: 16, def: 12, agi: 9, wis: 6 }, traits: ["warm_blooded"], diet: "carnivore", likes: "meat", fears: "light", activity: "nocturnal", biomes: { gloomwood: 2, hills: 1.5, steppe: 1, mountain: 0.4 }, learnset: [[1, "bite"], [1, "charge"], [5, "club_smash"], [10, "bellow"], [15, "quake"], [20, "skullsplitter"]], desc: "A blue-skinned brute in a horned bone helm. Swings a heavy club and never stops bellowing.", lore: "A Skullclub Orc earns the skull on its helm from the first thing that tried to take ITS skull. It usually works out.", size: 2, swims: false, tameBase: 0.16, xp: 15, aggression: 0.7 }),
  crested_wyrm: S({ id: "crested_wyrm", name: "Crested Wyrm", title: "Finback Skitterer", element: "water", family: "Dragon", rarity: "uncommon", base: { hp: 26, atk: 15, def: 11, agi: 13, wis: 9 }, traits: ["slick"], diet: "carnivore", likes: "fish", fears: "cold", activity: "diurnal", biomes: { river: 1.5, marsh: 1.2, beach: 1, lake: 0.4 }, learnset: [[1, "bite"], [1, "bubble"], [6, "maw_snap"], [10, "dive"], [15, "tidal_crash"], [20, "fin_cutter"]], desc: "A bipedal blue reptile with bright orange fins. Lashes its tail and snaps in a playful frenzy.", lore: "Crested Wyrms practice roaring at their own reflections. The reflections always blink first.", size: 2, swims: true, tameBase: 0.2, xp: 15, aggression: 0.55 }),
  mandrake_maw: S({ id: "mandrake_maw", name: "Mandrake Maw", title: "Snapvine Horror", element: "nature", family: "Beast", rarity: "rare", base: { hp: 30, atk: 15, def: 13, agi: 7, wis: 11 }, traits: ["thorny", "photosynth"], diet: "carnivore", likes: "mushroom", fears: "fire", activity: "diurnal", biomes: { marsh: 2, gloomwood: 2, forest: 0.6 }, learnset: [[1, "vine_lash"], [1, "bite"], [6, "maw_snap"], [10, "bramble"], [15, "overgrowth"], [20, "swallow_whole"]], desc: "A grotesque green plant-beast. Every vine ends in a snapping mouth, and the tongue is worse.", lore: "Mandrake Maws root where battles were fought. They are why old fields are never truly quiet.", sexed: false, size: 2, tiles: 2, swims: false, tameBase: 0.14, xp: 18, aggression: 0.6 }),
  jade_spikeon: S({ id: "jade_spikeon", name: "Jade Spikeon", title: "Thornback Charger", element: "nature", family: "Dragon", rarity: "common", base: { hp: 24, atk: 14, def: 13, agi: 10, wis: 7 }, traits: ["thorny"], diet: "herbivore", likes: "nuts", fears: "fire", activity: "diurnal", biomes: { forest: 2, hills: 2, meadow: 1 }, learnset: [[1, "tusk"], [1, "charge"], [6, "thorn_volley"], [12, "quake"], [20, "spike_wheel"]], desc: "A stout green lizard-dragon with purple spines and a wide, toothy grin. Charges headfirst.", lore: "Jade Spikeons grin for the same reason dogs pant: it means everything is going wonderfully.", size: 2, tiles: 2, swims: false, tameBase: 0.3, xp: 11, aggression: 0.5 }),
  stormmane_drake: S({ id: "stormmane_drake", name: "Stormmane Drake", title: "Mane of the Gale", element: "air", family: "Dragon", rarity: "rare", base: { hp: 32, atk: 17, def: 13, agi: 14, wis: 13 }, traits: ["flutter"], diet: "carnivore", likes: "meat", fears: "water", activity: "diurnal", biomes: { mountain: 0.8, steppe: 0.5, hills: 0.3 }, learnset: [[1, "gust"], [1, "bite"], [6, "dive"], [10, "cyclone"], [15, "starfall"], [20, "thunder_maned"]], desc: "A majestic blue dragon crowned with a fiery orange mane. Its wingbeats arrive before its roar.", lore: "When a Stormmane grounds itself, shepherds count the quiet days. The wind always pays it back.", size: 3, tiles: 3, swims: false, tameBase: 0.1, xp: 22, aggression: 0.6 }),
  crystal_golem: S({ id: "crystal_golem", name: "Crystal Golem", title: "Geode Behemoth", element: "earth", family: "Spirit", rarity: "rare", base: { hp: 38, atk: 15, def: 20, agi: 4, wis: 8 }, traits: ["stoneskin", "frost_coat"], diet: "lithovore", likes: "ore", fears: "heat", activity: "diurnal", biomes: { mountain: 2, snow: 0.8, tundra: 0.5 }, learnset: [[1, "crunch"], [1, "harden"], [6, "crystal_lance"], [10, "rockslide"], [15, "blizzard"], [20, "geode_burst"]], desc: "A towering rocky behemoth encrusted with jagged blue crystals. A living fortress of earth and ice.", lore: "Crystal Golems sleep for centuries, growing. Chip one and it keeps the shard in a very slow grudge.", sexed: false, size: 3, tiles: 3, swims: false, tameBase: 0.12, xp: 22, aggression: 0.4 }),
  skyhorn_dragon: S({ id: "skyhorn_dragon", name: "Skyhorn Dragon", title: "Goldhorn Dart", element: "air", family: "Dragon", rarity: "uncommon", base: { hp: 25, atk: 14, def: 11, agi: 16, wis: 12 }, traits: ["flutter"], diet: "carnivore", likes: "meat", fears: "dark", activity: "diurnal", biomes: { mountain: 1, hills: 0.6, steppe: 0.4 }, learnset: [[1, "peck"], [1, "gust"], [6, "dive"], [11, "glimmer"], [15, "starfall"], [20, "sundart"]], desc: "A graceful young dragon with golden horns. Quick and clever, it strikes with precise claws and breath.", lore: "Skyhorn Dragons race the sunset home. No one has ever seen one lose. No one has ever seen one arrive.", size: 2, tiles: 2, swims: false, tameBase: 0.18, xp: 15, aggression: 0.35 }),
  ironfang_tyrant: S({ id: "ironfang_tyrant", name: "Ironfang Tyrant", title: "Pale-Tusked Doom", element: "shadow", family: "Dragon", rarity: "legendary", base: { hp: 42, atk: 21, def: 18, agi: 10, wis: 9 }, traits: ["stoneskin", "night_eyes"], diet: "carnivore", likes: "meat", fears: "light", activity: "nocturnal", biomes: { gloomwood: 0.25, mountain: 0.35, tundra: 0.15 }, learnset: [[1, "bite"], [1, "charge"], [6, "iron_fang"], [12, "dragon_roar"], [18, "reap"], [20, "tyrants_verdict"]], desc: "A heavily armored dark dragon with massive white tusks and glowing green eyes. A living battering ram.", lore: "Ironfang Tyrants do not guard territory. Territory guards itself out of respect.", size: 4, tiles: 4, swims: false, tameBase: 0.05, xp: 34, aggression: 0.75 }),

  /* Hybrid lines — crossbreed-only: no wild biome weight, born only from a
     recipe pairing of two different species (wild or at the shrine). */
  gravewool: S({ id: "gravewool", name: "Gravewool", title: "Shroud Hog", element: "shadow", family: "Beast", rarity: "rare", base: { hp: 28, atk: 15, def: 12, agi: 9, wis: 12 }, traits: ["night_eyes", "thorny"], diet: "carnivore", likes: "meat", fears: "light", activity: "nocturnal", biomes: {}, learnset: [[1, "dust"], [1, "tusk"], [6, "dread_gaze"], [10, "bramble"], [15, "eclipse"], [20, "shroud_charge"]], desc: "A shroud of dead-moth fur wrapped around a tusked hunger. Its wings remember being beautiful.", lore: "Gravewools graze where gloam moths settle and boars root. Neither claims the thing that walks away.", size: 2, tiles: 2, swims: false, tameBase: 0.12, xp: 18, aggression: 0.65 }),
  slagtoad: S({ id: "slagtoad", name: "Slagtoad", title: "Cauldron Toad", element: "fire", family: "Beast", rarity: "rare", base: { hp: 30, atk: 16, def: 12, agi: 7, wis: 8 }, traits: ["warm_blooded", "slick"], diet: "carnivore", likes: "roasted_nuts", fears: "cold", activity: "diurnal", biomes: {}, learnset: [[1, "tongue_lash"], [1, "ember"], [6, "maw_snap"], [10, "swamp_gas"], [15, "wildfire"], [20, "slag_belch"]], desc: "A warty cauldron of a toad, cracked to the magma beneath. Its croak hisses like a quenched forge.", lore: "Slagtoads spawn in quench-pools of old forges. Blacksmiths leave the puddle alone; the toad repays the courtesy.", size: 2, tiles: 2, swims: true, tameBase: 0.13, xp: 18, aggression: 0.7 }),
  rimefang: S({ id: "rimefang", name: "Rimefang", title: "Hoar Scuttler", element: "frost", family: "Bug", rarity: "rare", base: { hp: 24, atk: 15, def: 15, agi: 11, wis: 7 }, traits: ["stoneskin", "frost_coat"], diet: "carnivore", likes: "ore", fears: "fire", activity: "crepuscular", biomes: {}, learnset: [[1, "pinch"], [1, "frost_nip"], [6, "burrow"], [10, "icy_breath"], [15, "blizzard"], [20, "glacial_snare"]], desc: "Frozen chitin over a fox's cunning, and pincers with icicle teeth. It burrows up, not down.", lore: "Sand stingers that drifted north grew a white coat and lost whatever mercy the desert had left them.", size: 2, tiles: 2, swims: false, tameBase: 0.12, xp: 18, aggression: 0.7 }),
  wispwraith: S({ id: "wispwraith", name: "Wispwraith", title: "Lantern Reaper", element: "shadow", family: "Spirit", rarity: "legendary", base: { hp: 20, atk: 13, def: 7, agi: 17, wis: 16 }, traits: ["night_eyes", "flutter"], diet: "carnivore", likes: "honeycomb", fears: "light", activity: "nocturnal", biomes: {}, learnset: [[1, "glimmer"], [1, "omen"], [6, "shadow_dive"], [10, "leech_wing"], [15, "eclipse"], [20, "lantern_snuff"]], desc: "A lantern soul in a borrowed ribcage. The glow is warm; nothing else about it is.", lore: "A wisp that followed a hollow crow home kept the light and left the crow. Lanterns burn longer without bodies.", sexed: false, size: 1, swims: false, tameBase: 0.08, xp: 24, aggression: 0.55 }),
  geodeback: S({ id: "geodeback", name: "Geodeback", title: "Split-Shell Ancient", element: "earth", family: "Beast", rarity: "rare", base: { hp: 40, atk: 13, def: 21, agi: 4, wis: 10 }, traits: ["stoneskin", "mossy_shell"], diet: "lithovore", likes: "ore", fears: "heat", activity: "diurnal", biomes: {}, learnset: [[1, "shell_bash"], [1, "harden"], [6, "crystal_lance"], [12, "rockslide"], [18, "overgrowth"], [20, "crystal_garden"]], desc: "A tortoise whose shell cracked open ages ago and grew a garden of crystal instead. It does not mind.", lore: "Geodebacks remember hills that are now valleys. Chip a crystal from a shell and the whole hill might notice.", sexed: false, size: 3, tiles: 2, swims: true, tameBase: 0.11, xp: 20, aggression: 0.3 }),
  mawbrand: S({ id: "mawbrand", name: "Mawbrand", title: "Helm of Hunger", element: "shadow", family: "Brute", rarity: "legendary", base: { hp: 44, atk: 22, def: 17, agi: 10, wis: 8 }, traits: ["stoneskin", "night_eyes", "warm_blooded"], diet: "carnivore", likes: "meat", fears: "light", activity: "nocturnal", biomes: {}, learnset: [[1, "bite"], [1, "club_smash"], [6, "iron_fang"], [12, "dragon_roar"], [18, "reap"], [20, "hungering_helm"]], desc: "The skullhelm grew into the brow. What started as a trophy became a face, and then a reputation.", lore: "Orcs still tell how the first Mawbrand simply outlasted the tyrant it tried to rob — then apologized, out of respect.", size: 4, tiles: 4, swims: false, tameBase: 0.05, xp: 34, aggression: 0.8 }),
};

export const STARTERS = ["cindermaw", "mossback", "pipwisp"] as const;
export const SPECIES_LIST = Object.values(SPECIES);

/** Species with no wild biome weights: born only from a recipe pairing. */
export const CROSSBREED_ONLY = Object.values(SPECIES)
  .filter((s) => Object.keys(s.biomes).length === 0)
  .map((s) => s.id);
/** Chance a generated lair belongs to a crossbreed-only alpha instead of a local species. */
export const HYBRID_ALPHA_CHANCE = 0.02;

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "#c9b99a",
  uncommon: "#3fb8a5",
  rare: "#f2c14e",
  legendary: "#e8742a",
};

export const STAT_LABEL: Record<StatKey, string> = { hp: "HP", atk: "ATK", def: "DEF", agi: "AGI", wis: "WIS" };

/* -------------------------------- Synthesis --------------------------------- */

export const RECIPES: [string, string, string][] = [
  ["slimekin", "slimekin", "regalslime"],
  ["cindermaw", "cragjaw", "sunwyrm"],
  ["cindermaw", "dunescuttle", "sunwyrm"],
  ["pipwisp", "thornhog", "bloomwisp"],
  ["pipwisp", "mossback", "bloomwisp"],
  ["nimbletuft", "gloamoth", "hollowcrow"],
  ["frostnib", "cindermaw", "pipwisp"],
  ["mossback", "boglurk", "thornhog"],
  ["slimekin", "boglurk", "mossback"],
  ["gloamoth", "bloomwisp", "pipwisp"],
  ["nimbletuft", "pipwisp", "zephyr_hawk"],
  ["frostnib", "boglurk", "tidefin_toad"],
  ["dunescuttle", "thornhog", "skullclub_orc"],
  ["boglurk", "dunescuttle", "crested_wyrm"],
  ["bloomwisp", "boglurk", "mandrake_maw"],
  ["thornhog", "mossback", "jade_spikeon"],
  ["pipwisp", "sunwyrm", "stormmane_drake"],
  ["cragjaw", "frostnib", "crystal_golem"],
  ["zephyr_hawk", "sunwyrm", "skyhorn_dragon"],
  ["crystal_golem", "sunwyrm", "ironfang_tyrant"],
  // crossbreed-only hybrid lines (the offspring has no wild biome)
  ["gloamoth", "thornhog", "gravewool"],
  ["boglurk", "cindermaw", "slagtoad"],
  ["dunescuttle", "frostnib", "rimefang"],
  ["hollowcrow", "pipwisp", "wispwraith"],
  ["mossback", "crystal_golem", "geodeback"],
  ["skullclub_orc", "ironfang_tyrant", "mawbrand"],
];

export const SYNTH_MIN_LEVEL = 6;

/* -------------------------- Reproductive strategy ---------------------------- */

/** Families that bear live young; every other species lays eggs into nests. */
const LIVE_BEARING = new Set<Family>(["Beast", "Brute"]);

/**
 * The reproductive development a species produces: live gestation, or an egg
 * that must be laid in a nest. Asexual pairings bud without a nest. Future
 * species fields can override this family default per species.
 */
export function developmentTypeFor(speciesId: string, pairing: ReproPairing): DevelopmentType {
  if (pairing === "asexual") return "gestation";
  return LIVE_BEARING.has(SPECIES[speciesId].family) ? "gestation" : "egg";
}

/* --------------------------------- Naming ----------------------------------- */

export const NAME_A = ["Moss", "Ember", "Hollow", "Thistle", "Bram", "Cinder", "Wren", "Ash", "Fen", "Gold", "Rook", "Brier", "Ivy", "Mire", "Elder", "Dusk", "Frost", "Sun", "Lark", "Oak", "Willow", "Stone", "Hearth", "Bell", "Glim", "Nettle", "Pike", "Raven", "Salt", "Tansy"];
export const NAME_B = ["fen", "brook", "ford", "wick", "mere", "dale", "holt", "stead", "combe", "hollow", "barrow", "shaw", "ridge", "moor", "wold", "fold", "gate", "thorn", "well", "hearth"];
export const HAMLET_SUFFIX = ["", " Crossing", " Green", " End", " Mill"];
export const TOWN_SUFFIX = [" Borough", " Market", " Crossing", " Ward", " Reach"];
export const CITY_SUFFIX = [" City", " Freehold", " Gate", " Spire"];
export const RUIN_NAMES = ["Sunken Chapel", "Broken Tower", "Old Aqueduct", "Fallen Keep", "Wardstone Ring", "Bone Orchard", "Lantern Hall"];
export const SHRINE_NAMES = ["Shrine of Twin Roots", "Shrine of the Kindled", "Mirror Shrine", "Shrine of First Light", "Shrine of Quiet Wings"];
export const LAIR_NAMES = ["Den", "Burrow", "Roost", "Hollow", "Nest", "Warren"];
