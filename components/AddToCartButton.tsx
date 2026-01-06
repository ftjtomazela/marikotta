"use client";

import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart();

  return (
    <button
      onClick={() => addToCart(product)}
      className="w-full bg-pink-600 text-white font-bold text-lg py-5 rounded-2xl hover:bg-pink-700 transition-all shadow-lg shadow-pink-200 hover:shadow-pink-300 flex items-center justify-center gap-3"
    >
      <span>Adicionar ao Carrinho</span>
      <i className="fa-solid fa-cart-plus"></i>
    </button>
  );
}