"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define o formato do produto
interface Product {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  quantity: number;
}

interface CartContextType {
  items: Product[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  // 1. Carregar carrinho salvo ao abrir o site
  useEffect(() => {
    const savedCart = localStorage.getItem("@marikota:cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // 2. Salvar carrinho sempre que mudar
  useEffect(() => {
    localStorage.setItem("@marikota:cart", JSON.stringify(items));
  }, [items]);

  // Função de Adicionar
  const addToCart = (product: any) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      // Se já existe, aumenta a quantidade
      if (existing) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      // Se não existe, adiciona novo com qtd 1
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Função de Remover
  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Função de Limpar (usada no sucesso)
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("@marikota:cart");
  };

  // Calcula o Total
  const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook para usar o carrinho em qualquer lugar
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}