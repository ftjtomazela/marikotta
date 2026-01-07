"use client";

import { createContext, useContext, useState, useEffect } from "react";

type FontType = "sans" | "serif" | "handwriting" | "josefin";

interface ThemeContextType {
  font: FontType;
  changeFont: (newFont: FontType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [font, setFont] = useState<FontType>("sans");

  // Carregar a fonte salva quando abrir o site
  useEffect(() => {
    const savedFont = localStorage.getItem("site-font") as FontType;
    if (savedFont) {
      setFont(savedFont);
    }
  }, []);

  const changeFont = (newFont: FontType) => {
    setFont(newFont);
    localStorage.setItem("site-font", newFont);
  };

  return (
    <ThemeContext.Provider value={{ font, changeFont }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  return context;
}