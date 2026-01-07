import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import BodyWithTheme from "@/components/BodyWithTheme"; // Importe seu componente novo

export const metadata = {
  title: "Marikota Laços",
  description: "Acessórios artesanais feitos com amor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
      </head>
      
      {/* ORDEM CORRETA (ESSENCIAL):
         1. ThemeProvider vem primeiro (cria o contexto).
         2. BodyWithTheme vem dentro dele (usa o contexto).
         3. CartProvider e Children vêm dentro do Body.
      */}
      <ThemeProvider>
        <BodyWithTheme>
          <CartProvider>
            {children}
          </CartProvider>
        </BodyWithTheme>
      </ThemeProvider>
      
    </html>
  );
}