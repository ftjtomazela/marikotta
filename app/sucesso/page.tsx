// app/checkout/success/page.tsx
export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ✅ Pagamento Aprovado!
        </h1>
        <p className="text-gray-600">
          Seu pedido foi processado com sucesso.
        </p>
        <a href="/" className="mt-6 inline-block text-pink-500 hover:underline">
          Voltar para a loja
        </a>
      </div>
    </div>
  );
}