// define the brew categories
export const BREW_CATEGORIES = [
    { value: "MEAD", label: "Mead" },
    { value: "WINE", label: "Wine" },
    { value: "CIDER", label: "Cider" },
    { value: "BEER", label: "Beer" },
    { value: "KOMBUCHA", label: "Kombucha" },
    { value: "OTHER", label: "Other" },
  ] as const;

// type for the brew categories
export type BrewCategory = (typeof BREW_CATEGORIES)[number]["value"];

// define the mead subtypes
export const MEAD_SUBCATEGORIES = [
  {
    value: "ACERGLYN",
    label: "Acerglyn",
    description:
      "Brewed with maple syrup.",
  },
  {
    value: "BRAGGOT",
    label: "Braggot",
    description:
      "Brewed with both honey and grains.",
  },
  {
    value: "BOCHET",
    label: "Bochet",
    description:
      "Brewed with caramelized honey.",
  },
  {
    value: "CAPSICUMEL",
    label: "Capsicumel",
    description:
      "Brewed with spicy peppers.",
  },
  {
    value: "CYSER",
    label: "Cyser",
    description: "Brewed with apples or apple juice.",
  },
  {
    value: "SACK_MEAD",
    label: "Sack Mead (Great Mead)",
    description:
      "Brewed with a high honey-to-water ratio.",
  },
  {
    value: "HIPPOCRAS",
    label: "Hippocras",
    description:
      "Brewed with wine, cinnamon, spices, and sugar.",
  },
  {
    value: "HYDROMEL",
    label: "Hydromel",
    description:
      "Brewed with a low-ABV session mead.",
  },
  {
    value: "METHEGLIN",
    label: "Metheglin",
    description:
      "Brewed with spices such as cinnamon, nutmeg, or vanilla beans.",
  },
  {
    value: "MORAT",
    label: "Morat",
    description: "Brewed with mulberries.",
  },
  {
    value: "MELOMEL",
    label: "Melomel",
    description:
      'Brewed with fruit, whether fermented with or added after fermentation.',
  },
  {
    value: "MULLED_MEAD",
    label: "Mulled Mead",
    description:
      "Mead that is heated when served.",
  },
  {
    value: "OMPHACOMEL",
    label: "Omphacomel",
    description:
      "Brewed with the juice of unripened grapes to add sourness.",
  },
  {
    value: "OXYMEL",
    label: "Oxymel",
    description:
      "Brewed with vinegar, sometimes used as a base for medicinal purposes.",
  },
  {
    value: "PYMENT",
    label: "Pyment",
    description:
      "Brewed with grapes or blended with wine and mead components.",
  },
  {
    value: "RHODOMEL",
    label: "Rhodomel",
    description:
      "Brewed with rosehips, rose petals, or rose attar.",
  },
  {
    value: "SHORT_MEAD",
    label: "Short Mead (Hydromel)",
    description:
      "Quick-to-make, typically low-ABV mead.",
  },
  {
    value: "SHOW_MEAD",
    label: "Show Mead / Traditional Mead",
    description:
      "Classic mead of honey, water, and yeast — the standard traditional style.",
  },
  {
    value: "SPARKLING_MEAD",
    label: "Sparkling Mead",
    description:
      "Carbonated mead, either bottle-conditioned with added sugar/honey or force-carbonated.",
  },
  {
    value: "SOUR_MEAD",
    label: "Sour Mead",
    description:
      "Mead using wild yeasts and lactic bacteria to achieve a sour profile.",
  },
] as const;

// type for the mead subcategories
export type MeadSubcategory = (typeof MEAD_SUBCATEGORIES)[number]["value"];