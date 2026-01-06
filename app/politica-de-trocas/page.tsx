import Link from "next/link";

export default function PolicyPage() {
  const whatsappNumber = "5515981851484"; // Mesmo número da Home

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-700">
      
      {/* 1. NAVEGAÇÃO (BOTÃO VOLTAR) */}
      <nav className="p-6 bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-pink-600 transition-colors font-bold text-sm">
                <i className="fa-solid fa-arrow-left"></i> Voltar para a Loja
            </Link>
        </div>
      </nav>

      {/* 2. CONTEÚDO */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        
        <div className="text-center mb-10">
            <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                <i className="fa-solid fa-sync"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Política de Trocas e Devoluções</h1>
            <p className="text-gray-500">
                Queremos que sua experiência com a Marikota seja incrível. <br/>
                Confira abaixo como funcionam nossas trocas.
            </p>
        </div>

        <div className="space-y-6">
            
            {/* BLOCO 1: ARREPENDIMENTO */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="bg-pink-100 text-pink-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Troca por Arrependimento (7 dias)
                </h2>
                <p className="leading-relaxed mb-4 text-sm">
                    De acordo com o Código de Defesa do Consumidor, você tem o direito de desistir da compra em até <strong>7 dias corridos</strong> após o recebimento do produto.
                </p>
                <ul className="list-disc list-inside text-sm text-gray-500 space-y-2 bg-gray-50 p-4 rounded-lg">
                    <li>O produto deve estar sem uso e na embalagem original.</li>
                    <li>Não pode haver indícios de lavagem ou modificação.</li>
                    <li>O reembolso é feito no valor integral do produto.</li>
                </ul>
            </div>

            {/* BLOCO 2: DEFEITO */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="bg-pink-100 text-pink-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    Produto com Defeito
                </h2>
                <p className="leading-relaxed mb-4 text-sm">
                    Nossos laços são feitos à mão com rigoroso controle de qualidade. Porém, se notar algum defeito de fabricação, entre em contato em até <strong>30 dias</strong> após o recebimento.
                </p>
                <p className="text-sm">
                    Faremos a análise e, confirmado o defeito, você poderá escolher entre:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-500 mt-2 ml-4">
                    <li>Trocar por um produto igual (se houver estoque).</li>
                    <li>Trocar por outro produto de mesmo valor.</li>
                    <li>Receber o dinheiro de volta.</li>
                </ul>
            </div>

            {/* BLOCO 3: COMO SOLICITAR */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="bg-pink-100 text-pink-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    Como Solicitar a Troca?
                </h2>
                <p className="mb-6 text-sm">
                    Para agilizar seu atendimento, entre em contato pelo nosso WhatsApp informando:
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm font-medium text-gray-600 mb-6">
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">✅ Número do Pedido</div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">✅ Motivo da Troca</div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">✅ Foto do Produto (se tiver defeito)</div>
                </div>

                <a 
                    href={`https://wa.me/${whatsappNumber}?text=Olá! Gostaria de solicitar uma troca/devolução.`}
                    target="_blank"
                    className="w-full bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                >
                    <i className="fa-brands fa-whatsapp text-xl"></i>
                    Solicitar Troca no WhatsApp
                </a>
            </div>

            {/* NOTA IMPORTANTE */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded text-sm text-yellow-800">
                <strong>Atenção:</strong> Não envie produtos de volta sem antes contatar nossa equipe. Devoluções não autorizadas poderão ser recusadas.
            </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white py-8 text-center border-t border-gray-200 mt-12">
        <p className="text-gray-400 text-xs">© 2025 Marikota Laços - Conchas/SP</p>
      </footer>
    </div>
  );
}