import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(request: Request) {
  try {
    // 1. Validação do Token
    if (!process.env.MP_ACCESS_TOKEN) {
      console.error("❌ Token do Mercado Pago (MP_ACCESS_TOKEN) não encontrado.");
      return NextResponse.json({ error: "Configuração de pagamento incompleta" }, { status: 500 });
    }

    // 2. Definição da URL Base (A Correção do Erro)
    // Tenta pegar da variável de ambiente, se não tiver, usa o link da Vercel hardcoded ou localhost
    const baseUrl = process.env.NEXT_PUBLIC_URL 
      ? process.env.NEXT_PUBLIC_URL 
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : "http://localhost:3000";

    console.log("🔗 URL Base para retorno:", baseUrl); // Para debug no painel da Vercel

    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN 
    });

    const body = await request.json();
    const { items, frete, order_id, comprador } = body;

    // 3. Montagem dos Itens
    const mpItems = items.map((item: any) => ({
      id: item.id,
      title: item.title,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: "BRL",
      description: item.description || "Produto Marikota",
      category_id: "fashion",
    }));

    if (frete && Number(frete) > 0) {
      mpItems.push({
        id: "frete",
        title: "Frete de Envio",
        quantity: 1,
        unit_price: Number(frete),
        currency_id: "BRL",
      });
    }

    // 4. Criação da Preferência
    const preference = new Preference(client);
    
    const result = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: comprador?.nome?.split(" ")[0] || "Cliente",
          surname: comprador?.nome?.split(" ").slice(1).join(" ") || "Marikota",
          email: comprador?.email || "email@teste.com",
          phone: {
            area_code: "11",
            number: comprador?.celular?.replace(/\D/g, "") || "999999999",
          },
        },
        external_reference: order_id ? String(order_id) : `TEMP-${Date.now()}`,
        
        // AQUI ESTÁ O SEGREDO: URLs completas e garantidas
        back_urls: {
          success: `${baseUrl}/sucesso`,
          failure: `${baseUrl}/checkout`,
          pending: `${baseUrl}/checkout`,
        },
        auto_return: "approved", // Isso exige que o success acima exista!
        
        statement_descriptor: "MARIKOTA",
        payment_methods: {
          excluded_payment_types: [{ id: "ticket" }], // Remove boleto (opcional)
          installments: 6
        }
      }
    });

    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error("❌ Erro Mercado Pago:", error);
    return NextResponse.json(
      { error: "Erro ao criar pagamento", details: error.message }, 
      { status: 500 }
    );
  }
}