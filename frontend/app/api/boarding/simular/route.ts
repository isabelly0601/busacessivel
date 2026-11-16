import { NextRequest, NextResponse } from 'next/server';
import { adicionarSolicitacao } from '../../realtime-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Sempre registra no Realtime Store (sincronização instantânea na Vercel / local)
    const solicitacaoLocal = adicionarSolicitacao({
      codigoLinhaDesejada: body.codigoLinhaDesejada || '8106',
      nomePassageiro: body.nomePassageiro || 'Passageiro PCD',
      pontoDescricao: body.pontoDescricao || 'Ponto de Ônibus',
      latitudePassageiro: body.latitudePassageiro,
      longitudePassageiro: body.longitudePassageiro
    });

    // 2. Tenta repassar para o backend Fastify (se estiver ativo)
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:3001';
      const backendRes = await fetch(`${backendUrl}/api/boarding/simular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(1500) // Timeout rápido para não travar
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json({ ok: true, solicitacao: data }, { status: 201 });
      }
    } catch {
      // Backend Fastify offline ou em container diferente - segue com o realtime store com sucesso
    }

    return NextResponse.json({ 
      ok: true, 
      solicitacao: {
        id: solicitacaoLocal.id,
        codigoLinhaDesejada: solicitacaoLocal.codigoLinhaDesejada,
        status: solicitacaoLocal.status,
        ponto: { nomeDescricao: solicitacaoLocal.pontoDescricao },
        passageiro: { user: { nome: solicitacaoLocal.nomePassageiro } }
      } 
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erro ao processar solicitação', details: error.message }, { status: 500 });
  }
}
