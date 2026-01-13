import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { items, frete, comprador, order_id } = await request.json();

    // 1. Validação da Chave Secreta
    if (!process.env.PAGARME_SECRET_KEY) {
      console.error("❌ PAGARME_SECRET_KEY não configurada.");
      return NextResponse.json({ error: "Configuração de pagamento incompleta" }, { status: 500 });
    }

    // 2. Formatar Itens para Pagar.me (Valor em centavos - Inteiro)
    const pagarmeItems = items.map((item: any) => ({
      amount: Math.round(Number(item.price) * 100), // Converte R$ 10,00 para 1000 centavos
      description: item.title,
      quantity: Number(item.quantity),
      code: String(item.id).substring(0, 50)
    }));

    // Adiciona Frete como item se houver valor
    if (frete && Number(frete) > 0) {
      pagarmeItems.push({
        amount: Math.round(Number(frete) * 100),
        description: "Frete de Envio",
        quantity: 1,
        code: "FRETE"
      });
    }

    // 3. Formatar Telefones (Pagar.me V5 exige formato rigoroso)
    const rawPhone = comprador.celular?.replace(/\D/g, "") || "11999999999";
    const ddd = rawPhone.substring(0, 2);
    const number = rawPhone.substring(2);

    // 4. Montar Payload do Pedido Pagar.me V5
    const payload = {
      customer: {
        name: comprador.nome,
        email: comprador.email,
        document: comprador.cpf.replace(/\D/g, ""), // CPF Limpo
        type: "individual",
        phones: {
          mobile_phone: {
            country_code: "55",
            area_code: ddd,
            number: number
          }
        }
      },
      items: pagarmeItems,
      shipping: {
        amount: Math.round(Number(frete) * 100),
        description: "Entrega Loja",
        recipient_name: comprador.nome,
        address: {
          line_1: `${comprador.rua}, ${comprador.numero}`,
          line_2: comprador.complemento || "",
          zip_code: comprador.cep?.replace(/\D/g, ""),
          city: comprador.cidade,
          state: comprador.estado || "SP",
          country: "BR"
        }
      },
      // --- AQUI ESTÁ A CONFIGURAÇÃO DO PAGAMENTO ---
      checkout: {
        expires_in: 120, // Link expira em 120 minutos
        billing_address_editable: false,
        customer_editable: true,
        // Define quais métodos o cliente pode escolher
        accepted_payment_methods: ["credit_card", "pix", "boleto"],
        
        // Redirecionamento após sucesso
        success_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/sucesso`,
        skip_checkout_success_page: false,

        // CONFIGURAÇÃO DE PARCELAMENTO (3x Sem Juros)
        credit_card: {
            authentication: {
                type: "threed_secure", // Segurança extra (3DS)
            },
            installments: {
                enabled: true,
                max_installments: 3, // O cliente só consegue parcelar em até 3x
                free_installments: 3 // Até 3x o lojista assume os juros (Sem juros pro cliente)
                // Se o cliente tentar parcelar em 4x (se você aumentar o max), ele pagaria juros a partir da 4ª.
            }
        },
        // Configuração do PIX (Opcional, define tempo de expiração do código Pix)
        pix: {
            expires_in: 3600 // Código Pix vale por 1 hora
        }
      },
      metadata: {
        internal_order_id: order_id
      }
    };

    // 5. Chamada à API da Pagar.me V5
    const response = await fetch("https://api.pagar.me/core/v5/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${Buffer.from(process.env.PAGARME_SECRET_KEY + ":").toString("base64")}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erro Pagar.me:", JSON.stringify(data, null, 2));
      const errorMsg = data.message || "Erro ao criar pedido na Pagar.me";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    // 6. Retorna a URL de Checkout
    const checkoutUrl = data.checkouts?.[0]?.payment_url;

    if (!checkoutUrl) {
      return NextResponse.json({ error: "URL de pagamento não gerada pela Pagar.me" }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });

  } catch (error: any) {
    console.error("❌ Erro Interno:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}