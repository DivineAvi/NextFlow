export type AppTheme = "dark" | "light";

export const THEME_CANVAS = {
  dark: {
    canvasBg:     "#101010",
    gridColor:    "#262626",
    minimapBg:    "#1c1c1c",
    minimapBorder:"#27272a",
    minimapNode:  "#52525b",
    minimapMask:  "rgba(0,0,0,0.4)",
  },
  light: {
    canvasBg:     "#f0f0f0",
    gridColor:    "#d4d4d8",
    minimapBg:    "#f4f4f5",
    minimapBorder:"#e4e4e7",
    minimapNode:  "#a1a1aa",
    minimapMask:  "rgba(200,200,200,0.4)",
  },
} satisfies Record<AppTheme, Record<string, string>>;
