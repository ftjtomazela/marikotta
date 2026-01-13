"use client";

import { useCart } from "../../context/CartContext";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  // Adicionei updateQuantity aqui
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // --- CÁLCULOS TOTAIS ---
  const totalPix = cartTotal * 0.95; // 5% de desconto
  const valorParcela = cartTotal / 3; // 3x sem juros

  // Função auxiliar para evitar quantidades menores que 1
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (updateQuantity) {
        updateQuantity(id, newQuantity);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Header Simplificado */}
      <header className="bg-white p-4 shadow-sm sticky top-0 z-20">
        <div className="container mx-auto flex justify-between items-center max-w-6xl">
          <Link 
            href="/" 
            className="text-gray-500 hover:text-pink-500 flex items-center gap-2 transition-colors font-medium group"
          >
            <i className="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"></i> 
            Continuar Comprando
          </Link>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-lock text-pink-500 text-sm"></i>
            <span className="font-bold text-gray-700 text-sm uppercase tracking-wider">Carrinho Seguro</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Título e Contador */}
        <div className="flex items-end gap-3 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Seu Carrinho</h1>
          <span className="text-gray-500 mb-1 font-medium">{items.length} itens</span>
        </div>

        {items.length === 0 ? (
          // --- ESTADO VAZIO ---
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 animate-fadeIn">
            <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-basket-shopping text-4xl text-pink-300"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Seu carrinho está vazio</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Parece que você ainda não escolheu seus laços favoritos. Explore nossa coleção e encha de fofura!
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Começar a Comprar
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        ) : (
          // --- CONTEÚDO DO CARRINHO ---
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* COLUNA ESQUERDA: ITENS */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Barra de Progresso */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-100 flex items-center gap-3 mb-6">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  <i className="fa-solid fa-truck-fast text-pink-500"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 font-medium">
                    <span className="text-pink-600 font-bold">Ótima escolha!</span> Complete a compra para garantir seus produtos.
                  </p>
                  <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-pink-50 to-purple-500 h-full w-[80%] rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Lista de Produtos */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 sm:gap-6 items-center group"
                  >
                    {/* Imagem do Produto */}
                    <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <i className="fa-solid fa-image text-2xl"></i>
                        </div>
                      )}
                    </div>
                    
                    {/* Detalhes */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-800 text-lg truncate pr-4">{item.title}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Remover item"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                      
                      <p className="text-gray-500 text-sm mb-3 line-clamp-1">{item.description || "Acessório exclusivo Marikota"}</p>
                      
                      <div className="flex justify-between items-end">
                        
                        {/* --- CONTROLE DE QUANTIDADE --- */}
                        <div className="inline-flex items-center border border-gray-200 rounded-lg bg-gray-50 overflow-hidden h-9">
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className={`w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors ${item.quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={item.quantity <= 1}
                          >
                            <i className="fa-solid fa-minus text-xs"></i>
                          </button>
                          
                          <span className="w-8 h-full flex items-center justify-center font-bold text-gray-800 text-sm bg-white border-x border-gray-200">
                            {item.quantity}
                          </span>
                          
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                          >
                            <i className="fa-solid fa-plus text-xs"></i>
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-pink-600 font-bold text-xl">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price * item.quantity)}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            ou 3x de {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((item.price * item.quantity) / 3)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUNA DIREITA: RESUMO */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 sticky top-24">
                <h2 className="font-bold text-xl mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-receipt text-gray-400"></i>
                  Resumo do Pedido
                </h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.length} itens)</span>
                    <span className="font-medium">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cartTotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Desconto no Pix (5%)</span>
                    <span className="font-medium">- {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cartTotal - totalPix)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 mb-8">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-800 text-lg">Total</span>
                    <div className="text-right">
                        <span className="block text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cartTotal)}
                        </span>
                        
                        <p className="text-sm font-bold text-green-600 mt-1">
                            ou {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalPix)} no Pix
                        </p>
                        
                        <p className="text-xs text-gray-500 mt-1">
                           ou 3x de {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valorParcela)} sem juros
                        </p>
                    </div>
                  </div>
                </div>

                {/* BOTÃO FINALIZAR */}
                <Link href="/checkout" className="block w-full">
                  <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 rounded-xl hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-pink-200 flex items-center justify-center gap-2 group relative overflow-hidden">
                    <span className="relative z-10">Finalizar Compra</span>
                    <i className="fa-solid fa-arrow-right relative z-10 group-hover:translate-x-1 transition-transform"></i>
                    {/* Efeito de brilho */}
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </button>
                </Link>

                {/* Selos de Segurança */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-center text-xs text-gray-400 mb-3 flex items-center justify-center gap-1">
                    <i className="fa-solid fa-lock"></i> Compra 100% Segura
                  </p>
                  <div className="flex justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <i className="fa-brands fa-cc-visa text-2xl text-blue-600"></i>
                    <i className="fa-brands fa-cc-mastercard text-2xl text-red-600"></i>
                    <i className="fa-brands fa-pix text-2xl text-green-600"></i>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}