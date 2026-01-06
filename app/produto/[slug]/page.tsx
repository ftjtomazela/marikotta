import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
// 1. IMPORTANTE: Trazendo o botão inteligente
import AddToCartButton from "@/components/AddToCartButton"; 

export const revalidate = 0;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!product) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Header Simples */}
      <header className="p-4 border-b container mx-auto flex justify-between items-center bg-white sticky top-0 z-10">
        <Link href="/" className="text-gray-500 hover:text-pink-500 flex items-center gap-2">
          <i className="fa-solid fa-arrow-left"></i> Voltar
        </Link>
        <span className="font-bold text-pink-500 uppercase tracking-widest">Marikota</span>
        
        {/* Ícone do Carrinho no Topo */}
        <Link href="/carrinho" className="bg-pink-100 p-2 rounded-full text-pink-600 hover:bg-pink-200 transition-colors">
            <i className="fa-solid fa-cart-shopping"></i>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10 items-start max-w-5xl mx-auto">
          
          {/* FOTO GRANDE */}
          <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-8 flex items-center justify-center">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-auto max-h-[500px] object-contain drop-shadow-xl"
            />
          </div>

          {/* DETALHES */}
          <div className="flex flex-col h-full justify-center">
            <div className="mb-2">
               <span className="bg-pink-100 text-pink-600 text-xs font-bold px-3 py-1 rounded-full uppercase">
                 {product.category || "Exclusivo"}
               </span>
            </div>
            
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              {product.title}
            </h1>

            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              {product.description || 
              "Peça exclusiva feita à mão com materiais premium. Perfeito para ocasiões especiais ou para dar aquele toque de charme no dia a dia."}
            </p>

            <div className="border-t border-b border-gray-100 py-6 mb-8 flex justify-between items-center">
                <div>
                    <span className="block text-gray-400 text-sm">Preço Total</span>
                    <span className="text-4xl font-bold text-gray-900">
                    {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    }).format(product.price)}
                    </span>
                </div>
                <div className="text-green-600 text-sm font-semibold bg-green-50 px-3 py-1 rounded-lg">
                    Em Estoque
                </div>
            </div>

            {/* 2. MÁGICA AQUI: Usamos o componente que funciona de verdade */}
            <AddToCartButton product={product} />
            
            <p className="text-center text-gray-400 text-xs mt-4">
               Envio imediato após confirmação do pagamento.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}