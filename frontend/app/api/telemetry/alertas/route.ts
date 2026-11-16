import { NextRequest, NextResponse } from 'next/server';
import { listarSolicitacoesPorLinha } from '../../realtime-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const linha = searchParams.get('linha') || '';
    const lat = searchParams.get('lat') || '';
    const lng = searchParams.get('lng') || '';

    // 1. Tenta buscar do backend Fastify caso esteja rodando
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:3001';
      const backendRes = await fetch(
        `${backendUrl}/api/telemetry/alertas?linha=${encodeURIComponent(linha)}&lat=${lat}&lng=${lng}`,
        { cache: 'no-store', signal: AbortSignal.timeout(1500) }
      );

      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data && Array.isArray(data.solicitacoes) && data.solicitacoes.length > 0) {
          return NextResponse.json(data);
        }
      }
    } catch {
      // Backend offline, cai no Realtime Store
    }

    // 2. Busca solicitações ativas do Realtime Store
    const pendentes = listarSolicitacoesPorLinha(linha);

    const formatados = pendentes.map(s => ({
      id: s.id,
      codigoLinhaDesejada: s.codigoLinhaDesejada,
      latitudePassageiro: s.latitudePassageiro,
      longitudePassageiro: s.longitudePassageiro,
      ponto: {
        id: `p-${s.id}`,
        nomeDescricao: s.pontoDescricao,
        latitude: s.latitudePassageiro,
        longitude: s.longitudePassageiro
      },
      passageiro: {
        user: {
          nome: s.nomePassageiro
        }
      },
      timestamp: s.timestamp
    }));

    return NextResponse.json({ solicitacoes: formatados });
  } catch (error: any) {
    return NextResponse.json({ solicitacoes: [] });
  }
}
