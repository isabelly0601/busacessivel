import { NextRequest, NextResponse } from 'next/server';
import { confirmarSolicitacao } from '../../../realtime-store';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Marca no Realtime Store
    confirmarSolicitacao(id);

    // 2. Tenta notificar o backend Fastify se disponível
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:3001';
      await fetch(`${backendUrl}/api/telemetry/notificar/${id}`, {
        method: 'PATCH',
        signal: AbortSignal.timeout(1500)
      });
    } catch {
      // Backend offline
    }

    return NextResponse.json({ ok: true, id, status: 'NOTIFICADO' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro interno ao notificar', details: error.message }, { status: 500 });
  }
}
