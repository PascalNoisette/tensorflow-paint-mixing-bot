'use client';

import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ApplicationColor, ApplicationContextType, ApplicationContextProviderProps, ApplicationReceipe } from './types'
import { alternativeCoordinate } from './lib/convertion';


// Create the context with default values
const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationContextProvider({ children }: ApplicationContextProviderProps) {
  // Add your context state and functions here
  // For example:
  const [computation, setComputation] = useState<number>(0);
  const [targetColor, setTargetColor] = useState<string>('#844c7e');
  const [recipes, setRecipes] = useState<ApplicationReceipe[]>([]);
  const target: ApplicationColor = useMemo(() => alternativeCoordinate({ css: targetColor }), [targetColor]);
  useEffect(() => setRecipes([]), [targetColor]);
  const [allowedPrimaries, setAllowedPrimaries] = useState([
    { colorName: "Black", css: '#000000', checked: true },
    { colorName: "White", css: '#ffffff', checked: true },
    { colorName: "Cadmium Yellow Medium", css: "#FFF600", checked: true },
    { colorName: "Hansa Yellow", css: '#fcd300' },
    { colorName: "Burnt Sienna", css: "#7b4800", checked: true },
    { colorName: "Cadmium Red", css: "#ff2702", checked: true },
    { colorName: "Cobalt Blue", css: "#002185" },
    { colorName: "Cadmium Orange", css: "#ED872D" },
    { colorName: "Cadmium Red Medium", css: "#E30022" },
    { colorName: "Quinacridone Magenta", css: "#8E3A59" },
    { colorName: "Prism Violet", css: "#5B3A80" },
    { colorName: "Ultramarine Blue", css: "#4166F5", checked: true },
    { colorName: "Phthalo Blue", css: "#000F89" },
    { colorName: "Phthalo Green", css: "#123524" },
    { colorName: "Permanent Green", css: "#4B6256" },
    { colorName: "Sap Green", css: "#6b9404", checked: true },
    { colorName: "Cyan", css: "#00FFFF" },
    { colorName: "Magenta", css: "#FF00FF" },



  ].map(alternativeCoordinate));
  const maxIngredients = 5;
  const resolution = 40;
  const pageSize = 10;


  return (
    <ApplicationContext.Provider value={{ targetColor, setTargetColor, target: target, allowedPrimaries, setAllowedPrimaries, maxIngredients, resolution, pageSize, recipes, setRecipes, computation, setComputation }}>
      {children}
    </ApplicationContext.Provider>
  );
}

// Custom hook to use the context
export function useApplication() {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error('useApplicationContext must be used within an ApplicationContextProvider');
  }
  return context;
}
