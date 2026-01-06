// app/api/checkout/route.ts - VERSÃO ATUALIZADA (SDK v2)
import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(request: Request) {
  try {
    // 1. Configura o cliente do Mercado Pago (Versão Nova)
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN || "" 
    });

    const body = await request.json();
    const { items, frete, order_id, comprador } = body;

    // 2. Prepara os itens no formato que o Mercado Pago exige
    const mpItems = items.map((item: any) => ({
      id: item.id,
      title: item.title,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: "BRL",
      description: item.description || "Acessório Marikota",
      category_id: "fashion", // Categoria opcional
    }));

    // 3. Adiciona o Frete como um item separado (se houver valor)
    if (frete && Number(frete) > 0) {
      mpItems.push({
        id: "frete",
        title: "Frete / Envio",
        quantity: 1,
        unit_price: Number(frete),
        currency_id: "BRL",
        description: "Custo de envio",
      });
    }

    // 4. Cria a preferência de pagamento
    const preference = new Preference(client);
    
    const result = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: comprador?.nome?.split(" ")[0] || "Cliente",
          surname: comprador?.nome?.split(" ").slice(1).join(" ") || "",
          email: comprador?.email || "email@teste.com",
          phone: {
            area_code: "11", // Idealmente extrair do telefone
            number: comprador?.celular?.replace(/\D/g, "") || "",
          },
        },
        external_reference: order_id ? String(order_id) : `TEMP-${Date.now()}`,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/sucesso`,
          failure: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/checkout`,
          pending: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/checkout`,
        },
        auto_return: "approved",
        statement_descriptor: "MARIKOTA", // O que aparece na fatura do cartão
        payment_methods: {
          excluded_payment_types: [
            { id: "ticket" } // Opcional: Remove boleto se quiser só Pix/Cartão
          ],
          installments: 6 // Máximo de parcelas
        }
      }
    });

    // 5. Retorna o Link de Pagamento (init_point)
    return NextResponse.json({ url: result.init_point });

  } catch (error: any) {
    console.error("❌ Erro Mercado Pago:", error);
    return NextResponse.json(
      { error: "Erro ao criar preferência de pagamento", details: error.message }, 
      { status: 500 }
    );
  }
}