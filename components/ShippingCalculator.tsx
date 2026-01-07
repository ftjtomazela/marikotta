"use client";

import { useState } from "react";
// CORREÇÃO: Importando o useCart que faltava
import { useCart } from "../context/CartContext";

export default function ShippingCalculator() {
  const [cep, setCep] = useState("");
  const [fretes, setFretes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Agora isso funciona porque atualizamos o Contexto no Passo 1
  const { addShippingCost, shippingCost, shippingType, items } = useCart();

  async function calcular() {
    setFretes([]);
    setErrorMsg("");

    if (cep.length < 8) {
        setErrorMsg("CEP inválido (digite 8 números)");
        return;
    }

    // Se o carrinho estiver vazio, não faz sentido calcular peso
    if (items.length === 0) {
        setErrorMsg("Adicione itens ao carrinho primeiro.");
        return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/frete", {
        method: "POST",
        body: JSON.stringify({ 
            cepDestino: cep,
            items: items // Enviamos os itens reais para calcular o peso certo
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Erro na conexão");
      
      if (Array.isArray(data)) {
        const validos = data.filter((f: any) => !f.error);
        
        if (validos.length === 0) {
            setErrorMsg("Nenhuma opção de entrega encontrada.");
        } else {
            setFretes(validos);
        }
      } else {
        setErrorMsg("Erro desconhecido ao calcular.");
      }

    } catch (e: any) {
      console.error(e);
      setErrorMsg("Erro: Verifique o CEP ou tente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  function selecionar(frete: any) {
    const valor = parseFloat(frete.price);
    addShippingCost(valor, frete.name);
  }

  return (
    <div className="mt-6 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <h4 className="text-md font-bold text-gray-700 mb-3 flex items-center gap-2">
        <i className="fa-solid fa-truck-fast text-pink-500"></i> Estimar Frete e Prazo
      </h4>
      
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          maxLength={9}
          placeholder="Digite seu CEP"
          className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:border-pink-500 outline-none transition-colors"
          value={cep}
          onChange={(e) => setCep(e.target.value.replace(/\D/g, ""))}
        />
        <button
          onClick={calcular}
          disabled={loading}
          className="bg-pink-500 text-white font-bold px-6 py-2 rounded-xl text-sm hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
             <i className="fa-solid fa-circle-notch fa-spin"></i>
          ) : (
             "Calcular"
          )}
        </button>
      </div>

      {errorMsg && <p className="text-xs text-red-500 mb-2 font-medium">{errorMsg}</p>}

      {fretes.length > 0 && (
          <div className="space-y-2 mt-4 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            <p className="text-xs text-gray-400 mb-2">Selecione uma opção para adicionar ao total:</p>
            {fretes.map((f: any) => {
                const isSelected = shippingType === f.name && shippingCost === parseFloat(f.price);
                
                return (
                  <div 
                    key={f.id} 
                    onClick={() => selecionar(f)}
                    className={`flex justify-between items-center text-sm p-3 rounded-lg cursor-pointer border transition-all ${
                        isSelected
                        ? "border-pink-500 bg-pink-50 ring-1 ring-pink-500" 
                        : "border-gray-100 hover:border-pink-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {f.company?.picture ? (
                          <img src={f.company.picture} alt={f.name} className="h-6 w-auto object-contain" />
                      ) : (
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                             <i className="fa-solid fa-box"></i>
                          </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-bold text-xs">{f.name}</span>
                        <span className="text-[11px] text-gray-500">Chega em {f.delivery_time} dias úteis</span>
                      </div>
                    </div>
                    <div className="text-right">
                        <span className="block font-bold text-pink-600">R$ {parseFloat(f.price).toFixed(2).replace('.', ',')}</span>
                        {isSelected && <span className="text-[10px] text-pink-500 font-bold"><i className="fa-solid fa-check"></i> Aplicado</span>}
                    </div>
                  </div>
                )
            })}
          </div>
      )}
    </div>
  );
}