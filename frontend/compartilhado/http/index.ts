// compartilhado/http/index.ts
// Cliente HTTP base com tratamento de erros padronizado

const API_BASE = '/api';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'HttpError';
  }
}

export async function httpGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.text();
    throw new HttpError(res.status, err || `Erro ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function httpPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new HttpError(res.status, err || `Erro ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function httpPatch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'PATCH' });
  if (!res.ok) {
    const err = await res.text();
    throw new HttpError(res.status, err || `Erro ${res.status}`);
  }
  return res.json() as Promise<T>;
}
