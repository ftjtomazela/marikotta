"use client";

import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";

export default function ConfigPage() {
  const { font, changeFont } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Aparência do Site</h1>
          <Link href="/" className="text-pink-500 hover:underline">
            Voltar para Loja
          </Link>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">Escolha a Fonte Principal</h2>
          <p className="text-gray-500">Isso mudará os textos de todo o site imediatamente.</p>

          <div className="grid grid-cols-1 gap-4">
            {/* Opção 1: Moderna (Sans) */}
            <button
              onClick={() => changeFont("sans")}
              className={`p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                font === "sans" 
                  ? "border-pink-500 bg-pink-50 ring-2 ring-pink-200" 
                  : "border-gray-200 hover:border-pink-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'sans-serif' }}>Moderna & Limpa</h3>
                  <p className="text-gray-500">Ideal para leitura fácil e visual tecnológico.</p>
                </div>
                {font === "sans" && <i className="fa-solid fa-circle-check text-pink-500 text-2xl"></i>}
              </div>
              <div className="mt-4 bg-white p-3 rounded border border-gray-100 text-sm text-gray-600" style={{ fontFamily: 'sans-serif' }}>
                "Marikota Laços: A beleza nos detalhes."
              </div>
            </button>

            {/* Opção 2: Elegante (Serif) */}
            <button
              onClick={() => changeFont("serif")}
              className={`p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                font === "serif" 
                  ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200" 
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1 font-serif">Elegante & Clássica</h3>
                  <p className="text-gray-500">Traz um ar de sofisticação e luxo.</p>
                </div>
                {font === "serif" && <i className="fa-solid fa-circle-check text-purple-500 text-2xl"></i>}
              </div>
              <div className="mt-4 bg-white p-3 rounded border border-gray-100 text-sm text-gray-600 font-serif">
                "Marikota Laços: A beleza nos detalhes."
              </div>
            </button>

            {/* Opção 3: Manuscrita (Handwriting) */}
            <button
              onClick={() => changeFont("handwriting")}
              className={`p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                font === "handwriting" 
                  ? "border-green-500 bg-green-50 ring-2 ring-green-200" 
                  : "border-gray-200 hover:border-green-300"
              }`}
            >
                

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'cursive' }}>Artesanal & Divertida</h3>
                  <p className="text-gray-500">Perfeita para destacar o feito à mão.</p>
                </div>
                {font === "handwriting" && <i className="fa-solid fa-circle-check text-green-500 text-2xl"></i>}
              </div>
              <div className="mt-4 bg-white p-3 rounded border border-gray-100 text-xl text-gray-600" style={{ fontFamily: 'cursive' }}>
                "Marikota Laços: A beleza nos detalhes."
              </div>
            </button>

              {/* Opção 4: Josefin (Marikota Style) */}
            <button
              onClick={() => changeFont("josefin")}
              className={`p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                font === "josefin" 
                  ? "border-pink-500 bg-pink-50 ring-2 ring-pink-200" 
                  : "border-gray-200 hover:border-pink-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-josefin)' }}>Marikota (Josefin)</h3>
                  <p className="text-gray-500">Geométrica, moderna e feminina. A cara da loja!</p>
                </div>
                {font === "josefin" && <i className="fa-solid fa-circle-check text-pink-500 text-2xl"></i>}
              </div>
              <div className="mt-4 bg-white p-3 rounded border border-gray-100 text-lg text-gray-700 font-bold" style={{ fontFamily: 'var(--font-josefin)' }}>
                "Marikota Laços: A beleza nos detalhes."
              </div>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}