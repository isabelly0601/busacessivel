import { NextRequest, NextResponse } from 'next/server';
import { buscarSolicitacao } from '../../../realtime-store';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Tenta buscar do backend Fastify caso esteja rodando
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:3001';
      const backendRes = await fetch(`${backendUrl}/api/boarding/${id}/status`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(1500)
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Backend offline, segue para consulta no Realtime Store
    }

    // 2. Consulta no Realtime Store local em memória
    const solicitacao = buscarSolicitacao(id);
    if (solicitacao) {
      return NextResponse.json({
        id: solicitacao.id,
        status: solicitacao.status,
        codigoLinhaDesejada: solicitacao.codigoLinhaDesejada,
        timestamp: solicitacao.timestamp
      });
    }

    return NextResponse.json({ id, status: 'CONFIRMADO' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao consultar status', details: error.message }, { status: 500 });
  }
}
