import "./globals.css";
// Aqui estava o erro: só pode ter UMA linha de importação
import { CartProvider } from "@/context/CartContext"; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Link do FontAwesome para os ícones funcionarem */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <CartProvider>
            {children}
        </CartProvider>
      </body>
    </html>
  );
}