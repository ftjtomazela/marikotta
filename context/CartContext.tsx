"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image_url?: string;
  description?: string;
  quantity: number;
  weight?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  // <--- NOVAS FUNÇÕES PARA O FRETE
  shippingCost: number;
  shippingType: string;
  addShippingCost: (cost: number, type: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  
  // <--- NOVO ESTADO DO FRETE
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingType, setShippingType] = useState("");

  useEffect(() => {
    const savedCart = localStorage.getItem("marikota-cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("marikota-cart", JSON.stringify(items));
    }
  }, [items, mounted]);

  const addToCart = (product: any) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setShippingCost(0); // Limpa o frete também
    setShippingType("");
  };

  // <--- NOVA FUNÇÃO PARA DEFINIR FRETE
  const addShippingCost = (cost: number, type: string) => {
    setShippingCost(cost);
    setShippingType(type);
  };

  // O total agora soma os produtos + o frete escolhido
  const cartTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  ) + shippingCost;

  return (
    <CartContext.Provider
      value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        clearCart, 
        cartTotal,
        // Exportando as novidades
        shippingCost,
        shippingType,
        addShippingCost
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}