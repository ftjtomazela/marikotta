"use client";

import { useCart } from "../../context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, removeFromCart, cartTotal } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header Simples */}
      <header className="p-4 bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-gray-500 hover:text-pink-500 flex items-center gap-2">
            <i className="fa-solid fa-arrow-left"></i> Continuar Comprando
          </Link>
          <span className="font-bold text-pink-500 uppercase tracking-widest">Meu Carrinho</span>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-gray-700">Seus Produtos</h1>

        {items.length === 0 ? (
          // CARRINHO VAZIO
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 text-lg">Seu carrinho está vazio.</p>
            <Link href="/" className="mt-4 inline-block bg-pink-500 text-white px-6 py-2 rounded-full font-bold hover:bg-pink-600 transition-colors">
              Voltar para a Loja
            </Link>
          </div>
        ) : (
          // LISTA DE PRODUTOS
          <div className="grid md:grid-cols-3 gap-8">
            {/* Coluna da Esquerda: Itens */}
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center">
                  <img src={item.image_url} alt={item.title} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{item.title}</h3>
                    <p className="text-gray-500 text-sm">Quantidade: {item.quantity}</p>
                    <p className="text-pink-600 font-bold mt-1">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}
                    </p>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-400 hover:text-red-600 p-2"
                    title="Remover item"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>

            {/* Coluna da Direita: Resumo */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
                <h2 className="font-bold text-lg mb-4 border-b pb-2">Resumo do Pedido</h2>
                
                <div className="flex justify-between mb-2 text-gray-600">
                  <span>Subtotal</span>
                  <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cartTotal)}</span>
                </div>
                
                <div className="flex justify-between mb-6 text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cartTotal)}</span>
                </div>

                {/* --- AQUI ESTÁ O BOTÃO QUE FALTAVA --- */}
                <Link href="/checkout" className="w-full block">
                  <button className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200">
                    Finalizar Compra
                  </button>
                </Link>
                {/* ------------------------------------- */}

                <div className="mt-4 text-center">
                   <img src="https://img.shields.io/badge/Mercado_Pago-Secured-blue" alt="Compra Segura" className="mx-auto h-6" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}