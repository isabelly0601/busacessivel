// modulos/embarque/cliente.ts
// Hooks e chamadas HTTP do domínio Embarque

import { useState, useCallback } from 'react';
import { SolicitacaoEmbarque, PayloadSolicitacao, montarDescricaoPonto } from './modelo';
import { httpPost, httpGet } from '../../compartilhado/http';

export function useSolicitarEmbarque() {
  const [solicitando, setSolicitando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const solicitar = useCallback(async (
    payload: PayloadSolicitacao
  ): Promise<SolicitacaoEmbarque | null> => {
    setSolicitando(true);
    setErro(null);
    try {
      const data = await httpPost<{ ok: boolean; solicitacao: SolicitacaoEmbarque }>(
        '/boarding/simular',
        payload
      );
      return data.solicitacao;
    } catch (err: any) {
      setErro(err.message || 'Erro ao solicitar embarque');
      return null;
    } finally {
      setSolicitando(false);
    }
  }, []);

  return { solicitar, solicitando, erro };
}

export function useStatusEmbarque(id: string | null) {
  const [status, setStatus] = useState<SolicitacaoEmbarque | null>(null);

  const verificar = useCallback(async () => {
    if (!id) return;
    try {
      const data = await httpGet<SolicitacaoEmbarque>(`/boarding/${id}/status`);
      setStatus(data);
    } catch {
      // silencioso
    }
  }, [id]);

  return { status, verificar };
}

export { montarDescricaoPonto };
