"use client";

import { useState, ChangeEvent, useEffect } from "react";
// AJUSTE AQUI: Mantendo o padrão que funcionou antes
import { useCart } from "../../context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, cartTotal } = useCart();
  const router = useRouter();
  
  // --- ESTADOS DO CLIENTE (Formulário Real) ---
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [complemento, setComplemento] = useState("");

  // --- ESTADOS DO FRETE ---
  const [cep, setCep] = useState("");
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [opcoesFrete, setOpcoesFrete] = useState<any[]>([]);
  const [freteSelecionado, setFreteSelecionado] = useState<any>(null);
  const [loadingPagamento, setLoadingPagamento] = useState(false);

  // --- ANIMAÇÃO DO CARRINHO ---
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationItem, setAnimationItem] = useState("");

  // Efeito para animação quando itens mudam
  useEffect(() => {
    if (items.length > 0) {
      // Pega o último item adicionado
      const lastItem = items[items.length - 1];
      setAnimationItem(lastItem.title);
      setShowAnimation(true);
      
      // Remove a animação após 2 segundos
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [items]);

  // --- 1. LÓGICA DE FRETE ---
  async function calcularFrete(cepDigitado: string) {
    if (cepDigitado.length !== 8) return;

    setLoadingFrete(true);
    setOpcoesFrete([]);
    setFreteSelecionado(null);

    try {
      const res = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cepDestino: cepDigitado,
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            weight: 0.3,
            width: 15,
            height: 10,
            length: 20
          }))
        }),
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        const validos = data.filter((f: any) => !f.error);
        setOpcoesFrete(validos);
        if (validos.length > 0) setFreteSelecionado(validos[0]);
      }
    } catch (error) {
      console.error("Erro frete:", error);
      alert("Erro ao calcular frete. Tente novamente.");
    } finally {
      setLoadingFrete(false);
    }
  }

  const handleCepChange = (e: ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, "");
    setCep(valor);
    if (valor.length === 8) calcularFrete(valor);
  };

  async function handleFinalizarCompra() {
    // Validações básicas
    if (!nome || !email || !rua || !numero || !cep || !bairro) {
      return alert("Por favor, preencha todos os dados de entrega.");
    }
    if (!freteSelecionado) {
      return alert("Selecione uma opção de frete antes de pagar.");
    }

    setLoadingPagamento(true);

    try {
      // 1. Primeiro salva o pedido no banco
      const orderData = {
        items: items,
        shipping: {
          price: freteSelecionado.price,
          service_id: freteSelecionado.id,
          company: freteSelecionado.company?.name || freteSelecionado.name,
          delivery_time: freteSelecionado.delivery_time
        },
        shipping_address: {
          cep,
          rua,
          numero,
          complemento,
          bairro,
          cidade: cidade || "São Paulo",
          estado: "SP"
        },
        comprador: { 
          nome, 
          email, 
          celular 
        }
      };

      // Salvar pedido no banco
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      let orderId = null;
      if (orderResponse.ok) {
        const orderResult = await orderResponse.json();
        orderId = orderResult.orderId;
      }

      // 2. Criar checkout no Mercado Pago
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items,
          frete: freteSelecionado.price,
          comprador: { nome, email, celular },
          order_id: orderId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Erro ao criar pagamento: " + (data.error || "Erro desconhecido"));
        console.error("Erro detalhado:", data);
      } else if (data.url) {
        // Sucesso: Redireciona para pagamento
        window.location.href = data.url;
      }

    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de conexão. Tente novamente.");
    } finally {
      setLoadingPagamento(false);
    }
  }

  const valorTotal = cartTotal + (freteSelecionado ? parseFloat(freteSelecionado.price) : 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-josefin-sophia">
      {/* ANIMAÇÃO DO ITEM ADICIONADO AO CARRINHO */}
      {showAnimation && (
        <div className="fixed top-20 right-4 z-50 animate-slideInRight">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3">
            <div className="animate-bounce">
              <i className="fa-solid fa-check-circle text-xl"></i>
            </div>
            <div>
              <p className="font-bold">{animationItem}</p>
              <p className="text-xs opacity-90">Adicionado ao carrinho!</p>
            </div>
            <div className="ml-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fa-solid fa-cart-plus"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        .animate-pulse-slow {
          animation: pulse 2s infinite;
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>

      <div className="max-w-6xl mx-auto">
        
        {/* Topo com animação */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <Link 
              href="/" 
              className="text-gray-500 hover:text-pink-500 flex items-center gap-2 transition-all duration-300 hover:gap-3 group"
            >
              <i className="fa-solid fa-arrow-left text-sm transition-transform group-hover:-translate-x-1"></i>
              <span className="font-medium">Voltar para Loja</span>
            </Link>
            
            {/* Badge animado do carrinho */}
            <div className="relative">
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
                <i className="fa-solid fa-cart-shopping text-pink-500 animate-float"></i>
                <span className="font-bold text-gray-700">{items.length} itens</span>
              </div>
              
              {items.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center animate-pulse-slow">
                  <span className="text-white text-xs font-bold">{items.length}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <h1 className="text-3xl font-bold text-gray-800 relative z-10">Finalizar Pedido</h1>
              <div className="absolute -bottom-1 left-0 w-32 h-2 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-60"></div>
            </div>
            <div className="hidden md:flex gap-1">
              {[1, 2, 3].map((step) => (
                <div 
                  key={step}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 animate-pulse-slow"
                  style={{ animationDelay: `${step * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
          
          <p className="text-gray-500 mt-2 flex items-center gap-2">
            <i className="fa-solid fa-sparkles text-yellow-500"></i>
            Último passo para garantir seus acessórios!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
          {/* --- ESQUERDA: FORMULÁRIO COMPLETO --- */}
          <div className="md:col-span-2 space-y-6 animate-slideUp">
                
            {/* 1. DADOS PESSOAIS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-pink-100">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-gradient-to-r from-pink-500 to-pink-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-pink-200 animate-slideUp">
                  1
                </span>
                <div>
                  <h2 className="font-bold text-gray-800 text-xl">Seus Dados</h2>
                  <p className="text-sm text-gray-500">Preencha suas informações pessoais</p>
                </div>
              </div>
                    
              <div className="space-y-5">
                <div className="transition-all duration-300 hover:scale-[1.01]">
                  <label className="block text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <i className="fa-solid fa-user text-pink-500 text-xs"></i>
                    Nome Completo *
                  </label>
                  <input 
                    type="text" 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Maria da Silva" 
                    className="w-full border-2 border-gray-100 rounded-xl p-4 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all duration-300 text-gray-700 placeholder-gray-400 font-medium" 
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="transition-all duration-300 hover:scale-[1.01]">
                    <label className="block text-sm text-gray-500 mb-2 flex items-center gap-1">
                      <i className="fa-solid fa-envelope text-pink-500 text-xs"></i>
                      E-mail *
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com" 
                      className="w-full border-2 border-gray-100 rounded-xl p-4 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all duration-300 text-gray-700 placeholder-gray-400 font-medium" 
                      required
                    />
                  </div>
                  <div className="transition-all duration-300 hover:scale-[1.01]">
                    <label className="block text-sm text-gray-500 mb-2 flex items-center gap-1">
                      <i className="fa-solid fa-phone text-pink-500 text-xs"></i>
                      Celular *
                    </label>
                    <input 
                      type="text" 
                      value={celular}
                      onChange={(e) => setCelular(e.target.value.replace(/\D/g, ""))}
                      placeholder="(11) 99999-9999" 
                      className="w-full border-2 border-gray-100 rounded-xl p-4 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all duration-300 text-gray-700 placeholder-gray-400 font-medium" 
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ENDEREÇO DE ENTREGA */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-pink-100 animate-slideUp" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-200 animate-slideUp">
                  2
                </span>
                <div>
                  <h2 className="font-bold text-gray-800 text-xl">Endereço de Entrega</h2>
                  <p className="text-sm text-gray-500">Onde entregaremos sua compra</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="transition-all duration-300 hover:scale-[1.01]">
                  <label className="block text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <i className="fa-solid fa-map-pin text-pink-500 text-xs"></i>
                    CEP *
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="00000-000" 
                      maxLength={9}
                      value={cep.replace(/(\d{5})(\d{3})/, "$1-$2")}
                      onChange={handleCepChange}
                      className="w-full border-2 border-pink-100 rounded-xl p-4 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 font-bold text-gray-700 bg-white pr-12 transition-all duration-300" 
                    />
                    {loadingFrete && (
                      <div className="absolute right-4 top-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                      </div>
                    )}
                    <div className="absolute right-4 top-4 text-gray-400">
                      <i className="fa-solid fa-truck"></i>
                    </div>
                  </div>
                  {loadingFrete && (
                    <div className="mt-2 flex items-center gap-2 text-pink-600 font-medium text-sm">
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                      Buscando opções de frete...
                    </div>
                  )}
                </div>
                <div className="transition-all duration-300 hover:scale-[1.01]">
                  <label className="block text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <i className="fa-solid fa-city text-pink-500 text-xs"></i>
                    Cidade
                  </label>
                  <input 
                    type="text" 
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Sua cidade"
                    className="w-full border-2 border-gray-100 rounded-xl p-4 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all duration-300 text-gray-700 placeholder-gray-400 font-medium" 
                  />
                </div>
              </div>

              {/* OPÇÕES DE FRETE ANIMADAS */}
              {opcoesFrete.length > 0 && (
                <div className="mt-6 mb-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-sm animate-fadeIn">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse-slow">
                      <i className="fa-solid fa-rocket text-white"></i>
                    </div>
                    <div>
                      <p className="font-bold text-green-800 text-lg">Escolha o envio:</p>
                      <p className="text-sm text-green-600">Selecione a melhor opção para você</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {opcoesFrete.map((frete, index) => (
                      <div 
                        key={frete.id}
                        onClick={() => setFreteSelecionado(frete)}
                        className={`flex justify-between items-center p-4 rounded-xl border cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                          freteSelecionado?.id === frete.id 
                          ? "bg-gradient-to-r from-pink-50 to-pink-100 border-pink-300 ring-4 ring-pink-100 shadow-lg" 
                          : "bg-white border-gray-200 hover:border-green-300 hover:shadow-md"
                        } animate-slideUp`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-4">
                          {frete.company?.picture ? (
                            <img src={frete.company.picture} alt={frete.name} className="h-8 w-auto" />
                          ) : (
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              freteSelecionado?.id === frete.id 
                              ? "bg-pink-500 text-white" 
                              : "bg-green-100 text-green-600"
                            }`}>
                              <i className="fa-solid fa-box text-lg"></i>
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-800">{frete.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <i className="fa-solid fa-clock"></i>
                              Chega em {frete.delivery_time} dias úteis
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-800">R$ {parseFloat(frete.price).toFixed(2).replace('.', ',')}</p>
                          {freteSelecionado?.id === frete.id && (
                            <p className="text-xs text-pink-600 font-medium mt-1 flex items-center justify-end gap-1">
                              <i className="fa-solid fa-check-circle"></i>
                              Selecionado
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CAMPOS DE ENDEREÇO */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
                <div className="md:col-span-3 transition-all duration-300 hover:scale-[1.01]">
                  <label className="block text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <i className="fa-solid fa-road text-pink-500 text-xs"></i>
                    Rua / Avenida *
                  </label>
                  <input 
                    type="text" 
                    value={rua}
                    onChange={(e) => setRua(e.target.value)}
                    placeholder="Nome da rua"
                    className="w-full border-2 border-gray-100 rounded-xl p-4 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all duration-300 text-gray-700 placeholder-gray-400 font-medium" 
                    required
                  />
                </div>
                <div className="transition-all duration-300 hover:scale-[1.01]">
                  <label className="block text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <i className="fa-solid fa-hashtag text-pink-500 text-xs"></i>
                    Número *
                  </label>
                  <input 
                    type="text" 
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="123"
                    className="w-full border-2 border-gray-100 rounded-xl p-4 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all duration-300 text-gray-700 placeholder-gray-400 font-medium" 
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="transition-all duration-300 hover:scale-[1.01]">
                  <label className="block text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <i className="fa-solid fa-compass text-pink-500 text-xs"></i>
                    Bairro *
                  </label>
                  <input 
                    type="text" 
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Seu bairro"
                    className="w-full border-2 border-gray-100 rounded-xl p-4 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all duration-300 text-gray-700 placeholder-gray-400 font-medium" 
                    required
                  />
                </div>
                <div className="transition-all duration-300 hover:scale-[1.01]">
                  <label className="block text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <i className="fa-solid fa-building text-pink-500 text-xs"></i>
                    Complemento
                  </label>
                  <input 
                    type="text" 
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    placeholder="Apto, bloco, etc."
                    className="w-full border-2 border-gray-100 rounded-xl p-4 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-50 transition-all duration-300 text-gray-700 placeholder-gray-400 font-medium" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- DIREITA: RESUMO E PAGAMENTO --- */}
          <div className="animate-slideUp" style={{ animationDelay: "0.2s" }}>
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-6 transition-all duration-300 hover:shadow-2xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="fa-solid fa-receipt text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-gray-800">Resumo da Compra</h3>
                  <p className="text-sm text-gray-500">Revise seus itens</p>
                </div>
              </div>
                    
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fa-solid fa-cart-shopping text-2xl opacity-50"></i>
                    </div>
                    <p className="font-medium">Carrinho vazio</p>
                    <Link href="/" className="text-pink-500 hover:text-pink-600 font-medium mt-3 inline-block transition-all hover:gap-2 group">
                      Continuar comprando
                      <i className="fa-solid fa-arrow-right ml-1 group-hover:translate-x-1 transition-transform"></i>
                    </Link>
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="flex justify-between text-sm items-center p-3 rounded-lg border border-gray-100 hover:border-pink-200 hover:bg-pink-50 transition-all duration-300 animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="bg-gradient-to-r from-pink-500 to-pink-600 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                            {item.quantity}
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <i className="fa-solid fa-check text-white text-[8px]"></i>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 line-clamp-1">{item.title}</span>
                          <p className="text-xs text-gray-500">R$ {item.price.toFixed(2)} cada</p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-800 text-lg">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-100 pt-5 space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-800 font-bold text-lg">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Frete</span>
                  {freteSelecionado ? (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-bold text-lg animate-pulse-slow">+ R$ {parseFloat(freteSelecionado.price).toFixed(2).replace('.', ',')}</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  ) : opcoesFrete.length === 0 ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <i className="fa-solid fa-map-marker-alt"></i>
                      <span>Digite o CEP</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 animate-pulse-slow">
                      <span className="text-pink-500 font-bold bg-pink-50 px-3 py-1 rounded-full">Selecione acima</span>
                      <i className="fa-solid fa-hand-point-up text-pink-500"></i>
                    </div>
                  )}
                </div>
              </div>

              {/* TOTAL ANIMADO */}
              <div className="flex justify-between items-end border-t border-gray-100 pt-6 mb-8 animate-slideUp">
                <div>
                  <span className="font-bold text-xl text-gray-800 block">Total</span>
                  <span className="text-sm text-gray-500">Inclui todos os impostos</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-3xl text-transparent bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text animate-pulse-slow">
                    R$ {valorTotal.toFixed(2).replace('.', ',')}
                  </span>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <div className="w-1 h-1 bg-pink-500 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-1 h-1 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    <span className="text-xs text-gray-500 ml-2">Valor final</span>
                  </div>
                </div>
              </div>

              {/* BOTÃO FINALIZAR COM ANIMAÇÃO */}
              <button 
                onClick={handleFinalizarCompra}
                disabled={!freteSelecionado || loadingPagamento || items.length === 0}
                className={`w-full py-5 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg transform ${
                  freteSelecionado && !loadingPagamento && items.length > 0
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] shadow-pink-200/50" 
                  : "bg-gradient-to-r from-gray-300 to-gray-400 cursor-not-allowed"
                } relative overflow-hidden group`}
              >
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                {loadingPagamento ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                    <span className="animate-pulse">Processando...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock text-lg group-hover:scale-110 transition-transform"></i>
                    <span className="text-lg">Ir para Pagamento</span>
                    <i className="fa-solid fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
                  </>
                )}
              </button>

              {/* SEGURANÇA */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-pulse-slow">
                    <i className="fa-solid fa-shield-halved text-white"></i>
                  </div>
                  <div>
                    <p className="font-bold text-green-800">Pagamento 100% Seguro</p>
                    <p className="text-xs text-green-600">Processado pelo Mercado Pago</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-credit-card"></i>
                    Cartões aceitos
                  </span>
                  <div className="flex gap-1">
                    <i className="fa-brands fa-cc-visa text-blue-500"></i>
                    <i className="fa-brands fa-cc-mastercard text-red-500"></i>
                    <i className="fa-brands fa-cc-amex text-blue-700"></i>
                    <i className="fa-brands fa-pix text-green-600"></i>
                  </div>
                </div>
              </div>

              {/* INFORMAÇÕES ADICIONAIS */}
              <div className="mt-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="fa-solid fa-info text-white text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700 font-medium">
                      Após o pagamento, enviaremos atualizações por e-mail e WhatsApp.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Dúvidas? <a href="https://wa.me/5511999999999" target="_blank" className="font-bold hover:underline">Fale conosco no WhatsApp</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER DO CHECKOUT */}
        <div className="mt-12 pt-8 border-t border-gray-200 animate-fadeIn">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-truck-fast text-green-500"></i>
                <span className="text-sm text-gray-600">Entrega Rápida</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-rotate-left text-blue-500"></i>
                <span className="text-sm text-gray-600">7 Dias para Troca</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-shield-heart text-pink-500"></i>
                <span className="text-sm text-gray-600">Compra Garantida</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              © 2024 Marikota Acessórios. Todos os direitos reservados.
              <br className="hidden sm:block" />
              <a href="#" className="hover:text-pink-500 transition-colors">Política de Privacidade</a> • 
              <a href="#" className="hover:text-pink-500 transition-colors mx-2">Termos de Uso</a> • 
              <a href="#" className="hover:text-pink-500 transition-colors">FAQ</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}