import { NextResponse } from 'next/server';

interface FreteFormatado {
  id: string;
  name: string;
  price: string;
  delivery_time: string;
  company?: {
    name: string;
    picture?: string;
  };
  error?: string;
}

export async function POST(request: Request) {
  try {
    console.log('🚚 Calculando frete...');
    
    // Tenta pegar o token (se não tiver, vai pro modo de emergência)
    const token = process.env.MELHOR_ENVIO_TOKEN;
    const cepOrigem = process.env.LOJA_CEP_ORIGEM || '18576062'; // CEP da Loja (padrão ou do .env)
    
    // MODO EMERGÊNCIA 1: Sem token configurado
    if (!token) {
      console.log('⚠️ Token não encontrado. Usando frete fixo.');
      return NextResponse.json([
        { 
          id: 'correios-pac-fixo', 
          name: 'Correios PAC', 
          price: '19.90', 
          delivery_time: '5-7', 
          company: { name: 'Correios', picture: 'https://logospng.org/download/correios/logo-correios-512.png' }
        },
        { 
          id: 'correios-sedex-fixo', 
          name: 'Correios Sedex', 
          price: '35.90', 
          delivery_time: '2-4', 
          company: { name: 'Correios', picture: 'https://logospng.org/download/correios/logo-correios-512.png' }
        }
      ]);
    }

    const body = await request.json();
    const { cepDestino, items } = body;
    
    if (!cepDestino || cepDestino.length !== 8) {
      return NextResponse.json(
        { error: 'CEP inválido' },
        { status: 400 }
      );
    }

    const pesoTotal = items.reduce((total: number, item: any) => {
      return total + (item.weight || 0.3) * (item.quantity || 1);
    }, 0);

    const payload = {
      from: { postal_code: cepOrigem },
      to: { postal_code: cepDestino },
      package: {
        weight: Math.max(pesoTotal, 0.1),
        width: 15,
        height: 10,
        length: 20,
      },
      options: {
        receipt: false,
        own_hand: false,
        insurance_value: items.reduce((total: number, item: any) => {
          return total + (item.price || 0) * (item.quantity || 1);
        }, 0),
      },
      services: '1,2,3,4', // PAC e SEDEX
    };

    // Tenta falar com o Melhor Envio
    const response = await fetch('https://www.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MarikotaAcessorios/1.0',
      },
      body: JSON.stringify(payload),
    });

    // MODO EMERGÊNCIA 2: Erro na API do Melhor Envio
    if (!response.ok) {
      console.error('❌ Erro na resposta do Melhor Envio');
      throw new Error('Falha na API externa');
    }

    const data = await response.json();
    let fretesFormatados: FreteFormatado[] = [];
    
    if (Array.isArray(data)) {
      const fretesFiltrados = data
        .filter((frete: any) => frete.price && !frete.error)
        .map((frete: any, index: number) => ({
          id: `frete-${index}-${Date.now()}`,
          name: frete.name || `Opção ${index + 1}`,
          price: String(frete.price), // Garante que é string
          delivery_time: String(frete.delivery_time),
          company: {
            name: frete.company?.name || 'Transportadora',
            picture: frete.company?.picture || 'https://cdn-icons-png.flaticon.com/512/3095/3095581.png'
          }
        }))
        .slice(0, 5); // Pega só as 5 melhores opções

      fretesFormatados = fretesFiltrados;
    }

    // MODO EMERGÊNCIA 3: API respondeu vazio
    if (fretesFormatados.length === 0) {
       throw new Error('Nenhum frete retornado');
    }

    return NextResponse.json(fretesFormatados);

  } catch (error: any) {
    console.error('💥 Usando fallback de frete:', error.message);
    // Retorna valores fixos se der qualquer erro acima
    return NextResponse.json([
      {
        id: 'correios-pac-fallback',
        name: 'Correios PAC',
        price: '18.90',
        delivery_time: '7-10',
        company: { name: 'Correios', picture: 'https://logospng.org/download/correios/logo-correios-512.png' }
      },
      {
        id: 'correios-sedex-fallback',
        name: 'Correios Sedex',
        price: '28.90',
        delivery_time: '3-5',
        company: { name: 'Correios', picture: 'https://logospng.org/download/correios/logo-correios-512.png' }
      }
    ]);
  }
}