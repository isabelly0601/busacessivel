import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const backendRes = await fetch('http://api:3001/api/boarding/simular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      return NextResponse.json({ error: errText || 'Erro no backend' }, { status: backendRes.status });
    }

    const data = await backendRes.json();
    return NextResponse.json({ ok: true, solicitacao: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno ao conectar ao backend', details: error.message }, { status: 500 });
  }
}
