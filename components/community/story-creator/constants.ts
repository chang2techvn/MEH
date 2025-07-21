import type { BackgroundOption } from './types'

export const backgroundOptions: BackgroundOption[] = [
  { id: "solid-white", type: "color", value: "#ffffff", name: "White" },
  { id: "solid-black", type: "color", value: "#000000", name: "Black" },
  { id: "solid-red", type: "color", value: "#ef4444", name: "Red" },
  { id: "solid-blue", type: "color", value: "#3b82f6", name: "Blue" },
  { id: "solid-green", type: "color", value: "#10b981", name: "Green" },
  { id: "solid-purple", type: "color", value: "#8b5cf6", name: "Purple" },
  { id: "solid-yellow", type: "color", value: "#f59e0b", name: "Yellow" },
  { id: "solid-pink", type: "color", value: "#ec4899", name: "Pink" },
  { id: "solid-indigo", type: "color", value: "#6366f1", name: "Indigo" },
  { id: "solid-orange", type: "color", value: "#f97316", name: "Orange" },
  { id: "solid-teal", type: "color", value: "#14b8a6", name: "Teal" },
  { id: "solid-gray", type: "color", value: "#6b7280", name: "Gray" },
  { id: "gradient-sunset", type: "gradient", value: "linear-gradient(135deg, #ff6b6b, #feca57)", name: "Sunset" },
  { id: "gradient-ocean", type: "gradient", value: "linear-gradient(135deg, #667eea, #764ba2)", name: "Ocean" },
  { id: "gradient-forest", type: "gradient", value: "linear-gradient(135deg, #11998e, #38ef7d)", name: "Forest" },
  { id: "gradient-purple", type: "gradient", value: "linear-gradient(135deg, #667eea, #764ba2)", name: "Purple" },
  { id: "gradient-pink", type: "gradient", value: "linear-gradient(135deg, #f093fb, #f5576c)", name: "Pink" },
  { id: "gradient-blue", type: "gradient", value: "linear-gradient(135deg, #4facfe, #00f2fe)", name: "Blue" },
  { id: "gradient-fire", type: "gradient", value: "linear-gradient(135deg, #ff9a56, #ff6b6b)", name: "Fire" },
  { id: "gradient-mint", type: "gradient", value: "linear-gradient(135deg, #84fab0, #8fd3f4)", name: "Mint" },
]

export const fontFamilies = [
  "Inter, sans-serif",
  "Arial, sans-serif", 
  "Georgia, serif",
  "Times New Roman, serif",
  "Helvetica, sans-serif",
  "Courier New, monospace",
  "Impact, sans-serif",
  "Comic Sans MS, cursive"
]

export const colorPalette = [
  "#ffffff", "#000000", "#ff6b6b", "#4ecdc4", "#45b7d1", 
  "#96ceb4", "#ffeaa7", "#dda0dd", "#98d8c8", "#f7dc6f"
]
