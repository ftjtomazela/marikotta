"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import AddToCartButton from "../components/AddToCartButton";
import ShippingCalculator from "../components/ShippingCalculator";

export default function Home() {
  // --- 1. ESTADOS (Memória do site) ---
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Busca e Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [trackingCode, setTrackingCode] = useState("");

  const whatsappNumber = "5515981851484";
  const whatsappMsg = "Olá! Vim pelo site e gostaria de tirar uma dúvida.";

  // --- 2. BUSCAR PRODUTOS ---
  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });
      
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  // --- 3. LÓGICA DE FILTRAGEM ---
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Função do Rastreio
  const handleTrackOrder = () => {
    if (!trackingCode) return alert("Digite o código de rastreio!");
    window.open(`https://melhorrastreio.com.br/rastreio/${trackingCode}`, '_blank');
  };

  const categories = [
    { name: "Todos", icon: "🎀" },
    { name: "Tiaras de Luxo", icon: "👑" },
    { name: "Bico de Pato", icon: "✨" },
    { name: "Faixinhas RN", icon: "👶" },
    { name: "Kits Escolares", icon: "🎒" },
    { name: "Promoções", icon: "🏷️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative flex flex-col">
      
      {/* 1. BARRA DE TOPO */}
      <div className="bg-gray-100 text-gray-500 text-xs py-2 border-b border-gray-200">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <p className="hidden md:block">Enviamos para todo o Brasil 🚚</p>
          <div className="flex gap-6 ml-auto md:ml-0">
             <Link href="/rastreio" className="hover:text-pink-600 flex items-center gap-1 transition-colors">
                <i className="fa-solid fa-truck-fast"></i> Rastrear Pedido
             </Link>
             <Link href={`https://wa.me/${whatsappNumber}`} target="_blank" className="hover:text-green-600 flex items-center gap-1 transition-colors">
                <i className="fa-brands fa-whatsapp"></i> (15) 98185-1484
             </Link>
          </div>
        </div>
      </div>

      {/* 2. HEADER PRINCIPAL */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center gap-4">
          
          {/* BLOCO DA LOGO */}
          <div className="relative flex items-center shrink-0">
             <div className="w-24 h-0"></div>
             <Link href="/" className="absolute top-1/2 -translate-y-[65%] -left-4 z-50">
                <img 
                  src="/logo.png" 
                  alt="Marikota Logo" 
                  className="h-58 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform" 
                />
             </Link>
          </div>

          {/* BARRA DE BUSCA */}
          <div className="hidden md:flex flex-1 max-w-lg mx-auto bg-gray-50 rounded-full px-5 py-2.5 border border-gray-100 focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-50 transition-all">
            <input 
              type="text" 
              placeholder="Buscar laços, tiaras..." 
              className="bg-transparent w-full outline-none text-gray-600 text-sm placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="text-gray-400 hover:text-pink-500">
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>

          <Link href="/carrinho" className="relative group shrink-0">
            <div className="bg-white p-2 rounded-full border border-gray-100 group-hover:border-pink-200 group-hover:bg-pink-50 transition-all text-gray-600 group-hover:text-pink-500 text-lg w-10 h-10 flex items-center justify-center">
              <i className="fa-solid fa-cart-shopping"></i>
            </div>
          </Link>
        </div>
      </header>

      {/* 3. BANNER PRINCIPAL */}
      {!searchTerm && selectedCategory === "Todos" && (
        <div className="bg-gradient-to-r from-pink-50 to-white py-12 mb-8 border-b border-pink-100">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            
            <div className="md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
                <span className="bg-white text-pink-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase mb-6 inline-block shadow-sm border border-pink-100 tracking-wider">
                ✨ Nova Coleção 2025
                </span>
                <h2 className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-6 leading-tight">
                Laços que <br/><span className="text-pink-500">encantam.</span>
                </h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto md:mx-0 text-lg leading-relaxed">
                Modelos exclusivos feitos à mão para deixar sua princesa ainda mais linda em qualquer ocasião.
                </p>
                <button onClick={() => setSelectedCategory("Promoções")} className="bg-pink-600 text-white px-8 py-4 rounded-full font-bold hover:bg-pink-700 transition-all shadow-xl shadow-pink-200 hover:-translate-y-1">
                Ver Ofertas
                </button>
            </div>

            <div className="md:w-1/2 flex justify-center relative">
                <div className="absolute w-80 h-80 bg-pink-300 rounded-full blur-3xl opacity-30 animate-pulse -z-10"></div>
                <div className="relative w-full max-w-md aspect-square rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl shadow-pink-100/50">
                    <video 
                        className="w-full h-full object-cover scale-105" 
                        autoPlay loop muted playsInline 
                    >
                        <source src="/banner-video.mp4" type="video/mp4" />
                        Seu navegador não suporta vídeos.
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-tr from-pink-100/20 to-transparent pointer-events-none"></div>
                </div>
            </div>

            </div>
        </div>
      )}

      <div className="container mx-auto px-4 pb-20 flex-grow">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* 4. SIDEBAR (FILTROS) */}
          <aside className="w-full md:w-64 shrink-0">
            
            {/* Busca Mobile */}
            <div className="md:hidden mb-6 bg-white p-2 rounded-full border border-gray-200 flex items-center shadow-sm">
                <i className="fa-solid fa-search text-gray-400 ml-3"></i>
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="w-full bg-transparent p-2 outline-none text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-28">
              <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider border-b pb-3">Categorias</h3>
              <ul className="space-y-2">
                {categories.map((cat, index) => (
                  <li key={index}>
                    <button 
                        onClick={() => {
                            setSelectedCategory(cat.name);
                            setSearchTerm("");
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all group font-medium text-sm text-left ${
                            selectedCategory === cat.name 
                            ? "bg-pink-500 text-white shadow-md shadow-pink-200" 
                            : "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                        }`}
                    >
                      <span className="w-6 text-center">{cat.icon}</span>
                      <span>{cat.name}</span>
                      {selectedCategory !== cat.name && (
                        <i className="fa-solid fa-chevron-right text-[10px] ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-pink-400"></i>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              {/* --- AQUI ESTÁ O FRETE NO LUGAR CERTO --- */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <ShippingCalculator />
              </div>

              <div className="mt-8 bg-gradient-to-b from-pink-50 to-white p-5 rounded-xl text-center border border-pink-100 hidden md:block">
                <div className="bg-white w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-pink-500">
                    <i className="fa-brands fa-whatsapp text-xl"></i>
                </div>
                <p className="text-gray-800 font-bold text-sm mb-1">Precisa de Ajuda?</p>
                <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`} target="_blank" className="text-xs bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors w-full block font-bold mt-2">
                  Chamar no Whats
                </a>
              </div>
            </div>
          </aside>

          {/* 5. LISTA DE PRODUTOS */}
          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                {searchTerm ? `Resultados: "${searchTerm}"` : selectedCategory}
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-normal">{filteredProducts.length} produtos</span>
              </h3>
            </div>

            {loading ? (
                 <div className="text-center py-20 text-gray-400">
                    <i className="fa-solid fa-spinner fa-spin text-3xl mb-2"></i>
                    <p>Carregando...</p>
                 </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-pink-50/50 transition-all hover:-translate-y-1 group flex flex-col h-full relative">
                    <Link href={`/produto/${product.slug}`} className="block">
                        <div className="relative w-full aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden">
                        <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {product.category === "Promoções" && (
                             <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">Oferta</div>
                        )}
                        </div>
                        <div className="px-1 mb-2">
                            <span className="text-[10px] text-pink-500 font-bold uppercase tracking-wide block mb-1">{product.category || "Acessório"}</span>
                            <h4 className="font-bold text-gray-800 line-clamp-2 leading-snug h-9 text-sm group-hover:text-pink-600 transition-colors">
                            {product.title}
                            </h4>
                        </div>
                    </Link>
                    <div className="mt-auto px-1 pt-2 border-t border-gray-50">
                        {/* --- ATUALIZAÇÃO DE PREÇOS AQUI --- */}
                        <div className="flex flex-col mb-3 text-center sm:text-left">
                            {/* Preço Normal */}
                            <p className="text-lg font-bold text-gray-900">
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price)}
                            </p>
                            
                            {/* Preço Pix (-5%) */}
                            <p className="text-sm font-bold text-pink-600">
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price * 0.95)}
                                <span className="text-xs font-normal text-gray-500 ml-1">com Pix</span>
                            </p>

                            {/* Parcelamento 3x sem juros */}
                            <p className="text-[10px] text-gray-400 mt-0.5">
                                3x de {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.price / 3)} sem juros
                            </p>
                        </div>
                        {/* --- FIM ATUALIZAÇÃO --- */}
                        <AddToCartButton product={product} />
                    </div>
                    </div>
                ))}
                </div>
            )}
            
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                <p className="text-4xl mb-4">😢</p>
                <p className="text-gray-500 font-bold">Nenhum laço encontrado.</p>
                <button onClick={() => {setSearchTerm(""); setSelectedCategory("Todos")}} className="mt-4 text-pink-500 underline text-sm">
                    Limpar filtros
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 6. RODAPÉ (FOOTER) - COMPLETO */}
      <footer className="bg-white border-t border-gray-200 mt-10">
        <div className="container mx-auto px-4 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* COLUNA 1: Sobre */}
            <div>
              <div className="relative mb-8 flex items-center">
                 <div className="h-10 w-1"></div>
                 <Link href="/" className="absolute top-1/2 -translate-y-1/2 left-0">
                    <img src="/logo.png" alt="Marikota Logo" className="h-28 w-auto object-contain" />
                 </Link>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Transformando fitas em amor desde 2025. Cada laço é produzido artesanalmente com materiais de alta qualidade para garantir conforto e beleza.
              </p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/marikotalacoseacessorios/#" target="_blank" className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors"><i className="fa-brands fa-instagram"></i></a>
                <a href="https://www.facebook.com/marikotalacoseacessorios/" target="_blank" className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors"><i className="fa-brands fa-facebook"></i></a>
                <a href="https://www.tiktok.com/@marikotamaniadelacos" target="_blank" className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-colors"><i className="fa-brands fa-tiktok"></i></a>
              </div>
            </div>

            {/* COLUNA 2: Institucional */}
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Institucional</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link href="/rastreio" className="hover:text-pink-500 transition-colors">Rastrear Pedido</Link></li>
                <li><Link href="/quem-somos"  className="hover:text-pink-500 transition-colors">Quem Somos</Link></li>
                <li><Link href="/politica-de-trocas" className="hover:text-pink-500 transition-colors">Política de Trocas</Link></li>
                <li><Link href="#" className="hover:text-pink-500 transition-colors">Prazos de Entrega</Link></li>
                <li><Link href="#" className="hover:text-pink-500 transition-colors">Fale Conosco</Link></li>
              </ul>
            </div>

            {/* COLUNA 3: Atendimento */}
            <div>
              <h4 className="font-bold text-gray-900 mb-6">Atendimento</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li className="flex gap-3">
                  <i className="fa-brands fa-whatsapp text-green-500 text-lg"></i>
                  <div>
                    <span className="block text-gray-800 font-bold">(15) 98185-1484</span>
                    <span className="text-xs">Seg. à Sex. das 9h às 18h</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <i className="fa-regular fa-envelope text-pink-500 text-lg"></i>
                  <div>
                    <a href="mailto:contato@marikota.com.br" className="block text-gray-800 font-bold hover:text-pink-500 transition-colors">
                      contato@marikota.com.br
                    </a>
                    <span className="text-xs">Respondemos em até 24h</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* COLUNA 4: Pagamento e Segurança */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Pagamento</h4>
              <div className="flex flex-wrap gap-2 mb-8">
                 <img src="https://logospng.org/download/mercado-pago/logo-mercado-pago-icone-1024.png" alt="Mercado Pago" className="h-8 opacity-70 grayscale hover:grayscale-0 transition-all"/>
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mastercard_2019_logo.svg/1200px-Mastercard_2019_logo.svg.png" alt="Mastercard" className="h-8 opacity-70 grayscale hover:grayscale-0 transition-all"/>
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-8 opacity-70 grayscale hover:grayscale-0 transition-all"/>
                 <img src="https://logopng.com.br/logos/pix-106.png" alt="Pix" className="h-8 opacity-70 grayscale hover:grayscale-0 transition-all"/>
              </div>

              <h4 className="font-bold text-gray-900 mb-4">Site 100% Seguro</h4>
              <div className="flex gap-3 items-center">
                 <div className="bg-gray-50 border border-gray-100 rounded px-2 py-1 flex items-center gap-1">
                   <i className="fa-solid fa-lock text-green-600"></i>
                   <div className="text-[10px] leading-tight text-gray-500 font-bold uppercase">
                     Ambiente<br/>Seguro
                   </div>
                 </div>
                 <div className="bg-gray-50 border border-gray-100 rounded px-2 py-1 flex items-center gap-1">
                   <i className="fa-brands fa-google text-blue-500"></i>
                   <div className="text-[10px] leading-tight text-gray-500 font-bold uppercase">
                     Google<br/>Safe
                   </div>
                 </div>
              </div>
            </div>

          </div>

          <div className="border-t border-gray-100 pt-8 text-center text-xs text-gray-400">
            <p className="mb-2">© 2025 Marikota Mania de Laços. Todos os direitos reservados.</p>
            <p>Conchas - SP | CNPJ: 00.000.000/0001-00</p>
          </div>
        </div>
      </footer>

      {/* Botão WhatsApp Flutuante */}
      <a 
        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`}
        target="_blank"
        className="fixed bottom-6 right-6 z-50 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-green-200 hover:bg-green-600 hover:scale-110 transition-all animate-bounce-slow"
      >
        <i className="fa-brands fa-whatsapp"></i>
        <span className="absolute top-0 right-0 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </a>
    </div>
  );
}