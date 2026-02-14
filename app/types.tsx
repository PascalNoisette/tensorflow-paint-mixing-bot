import { ReactNode } from "react";

export interface ApplicationColor {
  colorName?: string, css: string, checked?: boolean,
  latent?: string, cmyk?: { c: number, m: number, y: number, k: number }, rgb?: { r: number, g: number, b: number },
  ks?: { r: number, g: number, b: number },
  hsv?: { h: number, s: number, v: number }
}
export interface ApplicationReceipe {
  colors: ApplicationColor[];
  weights: number[];
  finalMix: ApplicationColor;
  finalDist: number;
  finalDistCmyk: number;
  finalDistKm: number;
  totalParts: number;
}

// Define the context type
export interface ApplicationContextType {
  // Add your context values here
  // For example:
  target: ApplicationColor;
  targetColor: string;
  setTargetColor: (color: string) => void;
  maxIngredients: number;
  resolution: number;
  allowedPrimaries: ApplicationColor[];
  setAllowedPrimaries: (a: ApplicationColor[]) => void;
  pageSize: number;
  recipes: ApplicationReceipe[];
  setRecipes: (rs: ApplicationReceipe[]) => void;
  computation: number;
  setComputation: (i: number) => void;
}

// Create the provider component
export interface ApplicationContextProviderProps {
  children: ReactNode;
}
