import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Cria cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. CÁLCULO DE SEGURANÇA (Para garantir que o valor está certo)
    // Soma o preço * quantidade de cada item
    const subtotal = body.items.reduce((acc: number, item: any) => {
      return acc + (Number(item.price) * Number(item.quantity));
    }, 0);

    // Pega o valor do frete
    const shippingPrice = Number(body.shipping.price);

    // Calcula o total final
    const totalCalculado = subtotal + shippingPrice;

    // 2. INSERE O PEDIDO (Usando os nomes certos: 'comprador' em vez de 'customer')
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer_name: body.comprador.nome,      // <--- Corrigido para 'comprador'
        customer_email: body.comprador.email,    // <--- Corrigido para 'comprador'
        customer_phone: body.comprador.celular,  // <--- Corrigido para 'comprador'
        shipping_address: body.shipping_address,
        items: body.items,
        subtotal: subtotal,                      // <--- Usando valor calculado
        shipping_price: shippingPrice,
        total: totalCalculado,                   // <--- Usando valor calculado
        shipping_info: body.shipping,
        status: 'pending_payment',
        created_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (error) {
      console.error('Erro Supabase:', error);
      return NextResponse.json(
        { error: 'Erro ao salvar pedido', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      orderId: data.id,
      message: 'Pedido criado com sucesso' 
    });

  } catch (error: any) {
    console.error('Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}