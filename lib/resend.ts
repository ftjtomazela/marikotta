// lib/resend.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  orderId: string,
  items: any[],
  total: number,
  trackingCode?: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`,
      to: [to],
      subject: `✅ Pedido #${orderId} Confirmado! - Marikota Laços`,
      html: generateOrderEmailHTML(name, orderId, items, total, trackingCode),
      // Opcional: versão em texto simples
      text: generateOrderEmailText(name, orderId, items, total, trackingCode),
    });

    if (error) {
      console.error('Erro ao enviar e-mail:', error);
      return { success: false, error };
    }

    console.log('E-mail enviado com sucesso:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Erro no envio de e-mail:', error);
    return { success: false, error };
  }
}

function generateOrderEmailHTML(
  name: string,
  orderId: string,
  items: any[],
  total: number,
  trackingCode?: string
) {
  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.image_url}" alt="${item.title}" width="60" style="border-radius: 8px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">R$ ${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">R$ ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #ec4899, #db2777); color: white; padding: 30px; text-align: center; border-radius: 15px 15px 0 0; }
        .content { background: #fff; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .order-id { background: #fce7f3; color: #db2777; padding: 10px 20px; border-radius: 50px; display: inline-block; font-weight: bold; }
        .btn { background: #ec4899; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .total { font-size: 24px; color: #db2777; font-weight: bold; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎀 Obrigada pela sua compra!</h1>
          <p>Seu pedido foi confirmado e já estamos preparando com carinho!</p>
        </div>
        
        <div class="content">
          <p>Olá, <strong>${name}</strong>!</p>
          <p>Estamos muito felizes com sua compra na Marikota. Aqui estão os detalhes do seu pedido:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span class="order-id">Pedido #${orderId}</span>
          </div>
          
          <table>
            <thead>
              <tr style="background: #fce7f3;">
                <th style="padding: 10px; text-align: left;">Produto</th>
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: left;">Qtd</th>
                <th style="padding: 10px; text-align: left;">Preço</th>
                <th style="padding: 10px; text-align: left;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div style="text-align: right;">
            <p><strong>Total do pedido:</strong></p>
            <p class="total">R$ ${total.toFixed(2)}</p>
          </div>
          
          ${trackingCode ? `
          <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #0369a1; margin-top: 0;">📦 Código de Rastreio</h3>
            <p>Seu pedido já foi enviado! Use o código abaixo para acompanhar:</p>
            <div style="background: white; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 18px; letter-spacing: 2px;">
              ${trackingCode}
            </div>
            <a href="https://www.melhorrastreio.com.br/rastreio/${trackingCode}" style="color: #0369a1; display: inline-block; margin-top: 10px;">
              👉 Clique aqui para rastrear
            </a>
          </div>
          ` : `
          <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">⏳ Status do Pedido</h3>
            <p>Seu pedido está sendo preparado. Enviaremos atualizações por e-mail.</p>
            <p style="margin-top: 10px; font-size: 14px; color: #92400e;">
              <strong>Prazo de produção:</strong> 1-3 dias úteis<br>
              <strong>Entrega:</strong> 3-10 dias úteis (dependendo da região)
            </p>
          </div>
          `}
          
          <div style="text-align: center;">
            <a href="https://seusite.com.br/rastreio" class="btn">Acompanhar Pedido</a>
            <br>
            <a href="https://seusite.com.br" style="color: #ec4899; text-decoration: none; display: inline-block; margin-top: 10px;">
              Continuar comprando
            </a>
          </div>
          
          <div class="footer">
            <p><strong>Dúvidas?</strong> Entre em contato:</p>
            <p>📱 (15) 98185-1484 (WhatsApp)<br>
               ✉️ contato@marikota.com.br<br>
               ⏰ Seg a Sex, 9h às 18h</p>
            <p style="margin-top: 20px;">
              Este e-mail foi enviado automaticamente. Por favor, não responda.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateOrderEmailText(
  name: string,
  orderId: string,
  items: any[],
  total: number,
  trackingCode?: string
) {
  const itemsText = items.map(item => 
    `- ${item.title} (x${item.quantity}): R$ ${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');

  return `
    Olá ${name}!

    ✅ Pedido Confirmado - Marikota Laços
    
    Número do pedido: #${orderId}
    
    Itens do pedido:
    ${itemsText}
    
    Total: R$ ${total.toFixed(2)}
    
    ${trackingCode ? 
      `📦 Código de rastreio: ${trackingCode}
      Acompanhe seu pedido: https://www.melhorrastreio.com.br/rastreio/${trackingCode}` 
      : 
      `⏳ Status: Em preparação
      Prazo de produção: 1-3 dias úteis
      Entrega: 3-10 dias úteis`
    }
    
    Acompanhe seu pedido: https://seusite.com.br/rastreio
    
    Dúvidas? Entre em contato:
    📱 (15) 98185-1484 (WhatsApp)
    ✉️ contato@marikota.com.br
    
    Obrigada por escolher a Marikota! 💕
  `;
}