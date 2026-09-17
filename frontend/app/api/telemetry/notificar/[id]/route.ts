import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const backendRes = await fetch(`http://api:3001/api/telemetry/notificar/${id}`, {
      method: 'PATCH'
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      return NextResponse.json({ error: errText || 'Erro no backend' }, { status: backendRes.status });
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno ao conectar ao backend', details: error.message }, { status: 500 });
  }
}
