import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-pink-50 font-sans text-gray-800">
      
      {/* 1. NAVEGAÇÃO SIMPLES */}
      <nav className="p-6">
        <div className="container mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-600 transition-colors font-bold">
                <i className="fa-solid fa-arrow-left"></i> Voltar para a Loja
            </Link>
        </div>
      </nav>

      {/* 2. CONTEÚDO PRINCIPAL */}
      <main className="container mx-auto px-4 pb-20 max-w-4xl">
        
        {/* Título e Introdução */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-pink-100 text-center mb-10">
            <span className="bg-pink-100 text-pink-500 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">
                Nossa História
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-6">
                Transformando fitas em <span className="text-pink-500">amor.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
                A Marikota Laços nasceu de um sonho e da vontade de empreender. 
                Mais do que acessórios, criamos peças que marcam a infância e deixam as princesas ainda mais lindas.
            </p>
        </div>

        {/* Bloco da História (Imagem + Texto) */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 items-center">
            <div className="relative h-80 rounded-3xl overflow-hidden shadow-lg transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                {/* FOTO DA DONA OU DE UM LAÇO BONITO */}
                <img 
                    src="https://images.unsplash.com/photo-1596464716127-f9a0859b4b1c?q=80&w=1000&auto=format&fit=crop" 
                    alt="Ateliê Marikota" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-bold text-lg">Feito à mão</p>
                    <p className="text-sm opacity-90">Em Conchas - SP</p>
                </div>
            </div>
            
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <i className="fa-solid fa-heart text-pink-500"></i> Como tudo começou
                </h2>
                <p className="text-gray-600 leading-relaxed">
                    Tudo começou com a paixão pelo artesanato e pelo universo infantil. 
                    Percebemos que as mães procuravam não apenas beleza, mas <strong>conforto</strong>. 
                    Muitos laços apertavam ou incomodavam as crianças.
                </p>
                <p className="text-gray-600 leading-relaxed">
                    Foi aí que decidimos criar a <strong>Marikota</strong>: focada em acabamento impecável, 
                    materiais de alta qualidade e aquele toque de carinho que só quem é mãe entende.
                    Hoje, enviamos amor em forma de laços para todo o Brasil! 🚚
                </p>
            </div>
        </div>

        {/* Diferenciais (3 Colunas) */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-50 text-center hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    <i className="fa-solid fa-hand-sparkles"></i>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">100% Artesanal</h3>
                <p className="text-sm text-gray-500">Cada peça é produzida manualmente, garantindo exclusividade e perfeição nos detalhes.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-50 text-center hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    <i className="fa-solid fa-feather"></i>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Conforto Total</h3>
                <p className="text-sm text-gray-500">Usamos meias de seda e materiais que não apertam e não machucam a cabecinha.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-50 text-center hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                    <i className="fa-solid fa-truck-fast"></i>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Envio Rápido</h3>
                <p className="text-sm text-gray-500">Produção ágil e envio seguro para que a encomenda chegue rapidinho até você.</p>
            </div>
        </div>

        {/* Finalização */}
        <div className="bg-pink-500 rounded-3xl p-10 text-center text-white shadow-xl shadow-pink-200">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Faça parte da nossa família!</h2>
            <p className="mb-8 opacity-90 max-w-lg mx-auto">
                Acompanhe nossas novidades no Instagram e veja as princesas usando nossos laços.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
                <a href="https://www.instagram.com/marikotalacoseacessorios" target="_blank" className="bg-white text-pink-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <i className="fa-brands fa-instagram"></i> Siga no Insta
                </a>
                <Link href="/" className="bg-pink-700 text-white border border-pink-400 px-6 py-3 rounded-full font-bold hover:bg-pink-800 transition-colors">
                    Ver Produtos
                </Link>
            </div>
        </div>

      </main>

      {/* Footer Simples */}
      <footer className="bg-white py-6 text-center text-gray-400 text-xs border-t border-pink-100">
        <p>© 2025 Marikota Laços - Conchas/SP</p>
      </footer>
    </div>
  );
}