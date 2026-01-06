import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Aqui virá sua lógica de envio de confirmação no futuro
    return NextResponse.json({ message: "Confirmação enviada" });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}