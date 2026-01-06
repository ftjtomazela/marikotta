// app/api/webhooks/mercado-pago/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('🔔 Webhook Mercado Pago recebido:', body);
    
    // Tipos de notificação
    const { type, data } = body;
    
    if (type === 'payment') {
      const paymentId = data.id;
      
      // Buscar detalhes do pagamento
      const token = process.env.MP_ACCESS_TOKEN;
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const payment = await paymentResponse.json();
      
      console.log('💰 Status do pagamento:', payment.status);
      console.log('📧 Email do cliente:', payment.payer?.email);
      console.log('💵 Valor:', payment.transaction_amount);
      
      // Atualizar pedido no seu banco de dados
      // await atualizarPedido(payment.external_reference, payment.status);
      
      // Enviar e-mail de confirmação
      // await enviarEmailConfirmacao(payment);
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ error: 'Erro no webhook' }, { status: 500 });
  }
}