"use client";

import { useState } from "react";
import Link from "next/link";

export default function RastreioPage() {
  const [trackingCode, setTrackingCode] = useState("");

  const handleTrackOrder = () => {
    if (!trackingCode) return alert("Por favor, digite o código de rastreio!");
    // Abre o Melhor Rastreio em uma nova aba
    window.open(`https://melhorrastreio.com.br/rastreio/${trackingCode}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col items-center justify-center p-4">
      
      {/* Botão de Voltar */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-pink-600 transition-colors font-bold text-sm">
            <i className="fa-solid fa-arrow-left"></i> Voltar
        </Link>
      </div>

      {/* Cartão de Rastreio */}
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-pink-100 max-w-lg w-full text-center border border-gray-100">
        
        <div className="w-20 h-20 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
            <i className="fa-solid fa-truck-fast"></i>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">Rastrear Pedido</h1>
        <p className="text-gray-500 mb-8">
            Ansiosa pelos seus laços? Digite o código de rastreio que enviamos no seu WhatsApp ou E-mail.
        </p>

        <div className="relative mb-6">
            <i className="fa-solid fa-barcode absolute left-4 top-4 text-gray-400"></i>
            <input 
                type="text" 
                placeholder="Ex: AA123456789BR" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-gray-700 outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 transition-all uppercase font-bold tracking-wide"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
            />
        </div>

        <button 
            onClick={handleTrackOrder}
            className="w-full bg-pink-500 text-white font-bold py-4 rounded-xl hover:bg-pink-600 hover:scale-[1.02] transition-all shadow-lg shadow-pink-200"
        >
            Localizar Pacote
        </button>

        <div className="mt-8 pt-8 border-t border-gray-50 text-xs text-gray-400">
            <p>Rastreamento integrado com <strong>Melhor Envio</strong>.</p>
            <p>Correios, Jadlog, Latam Cargo e Azul Cargo.</p>
        </div>

      </div>

    </div>
  );
}