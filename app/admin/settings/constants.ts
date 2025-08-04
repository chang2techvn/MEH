import type { ThemeColor, ThemePreset } from "./types"

export const themeColors: ThemeColor[] = [
  { name: "purist-blue", value: "#3B82F6" },
  { name: "neo-mint", value: "#7FFFD4" },
  { name: "cassis", value: "#BB2649" },
  { name: "vibrant-orange", value: "#FF5722" },
  { name: "cantaloupe", value: "#FFA07A" },
  { name: "dark-blue", value: "#1E40AF" },
  { name: "mellow-yellow", value: "#F9D949" },
  { name: "coral-pink", value: "#FF6B6B" },
  { name: "lavender", value: "#9C27B0" },
  { name: "teal", value: "#009688" },
  { name: "amber", value: "#FFC107" },
  { name: "indigo", value: "#3F51B5" },
]

export const themePresets: ThemePreset[] = [
  { name: "Default", primary: "purist-blue", secondary: "neo-mint", accent: "cassis" },
  { name: "Sunset", primary: "vibrant-orange", secondary: "cantaloupe", accent: "cassis" },
  { name: "Ocean", primary: "dark-blue", secondary: "purist-blue", accent: "neo-mint" },
  { name: "Forest", primary: "#2E7D32", secondary: "#81C784", accent: "#FFC107" },
  { name: "Berry", primary: "#9C27B0", secondary: "#E1BEE7", accent: "#FF5722" },
]
