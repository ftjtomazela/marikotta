"use client";

import { useTheme } from "@/context/ThemeContext";
// 1. Adicionei Josefin_Sans na importação
import { Inter, Playfair_Display, Dancing_Script, Josefin_Sans } from "next/font/google";

// Configuração das fontes
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const handwriting = Dancing_Script({ subsets: ["latin"], variable: "--font-hand" });

// 2. Configurei a Josefin aqui
const josefin = Josefin_Sans({ 
  subsets: ["latin"], 
  weight: ["300", "400", "600", "700"], // Pesos variados para ficar bonito
  variable: "--font-josefin" 
});

export default function BodyWithTheme({ children }: { children: React.ReactNode }) {
  const { font } = useTheme();

  // 3. Adicionei a opção no mapa de fontes
  const fontClass = {
    sans: sans.className,
    serif: serif.className,
    handwriting: handwriting.className,
    josefin: josefin.className, // <--- NOVA FONTE
  }[font];

  return (
    <body className={`${fontClass} transition-all duration-300`}>
      {children}
    </body>
  );
}