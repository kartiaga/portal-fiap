import Constants from 'expo-constants';

const API_PORT = 3001; // porta publicada pelo docker-compose
const REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(
    message: string,
    /** Status HTTP; 0 quando a API não pôde ser alcançada. */
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Mostra a mensagem de falha de conexão, que orienta o usuário; nos demais casos, o texto da tela. */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError && error.status === 0 ? error.message : fallback;
}

// "localhost" no celular é o próprio celular, então por padrão usamos o IP da
// máquina que está servindo o Metro, que é onde a API roda em desenvolvimento.
export function getApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/+$/, '');

  const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
  return `http://${host}:${API_PORT}`;
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

/** Faz uma chamada à API enviando o token da sessão atual, quando houver. */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const tokenAtRequest = authToken;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...(tokenAtRequest ? { Authorization: `Bearer ${tokenAtRequest}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };

  let response: Response;
  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError('Não foi possível conectar à API. Tente novamente em instantes.', 0);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    // Só encerra a sessão se o 401 for do token atual: a resposta atrasada de um
    // token antigo não pode derrubar um login feito depois.
    if (response.status === 401 && tokenAtRequest && tokenAtRequest === authToken) {
      onUnauthorized?.();
    }
    const body: { message?: string } | null = await response.json().catch(() => null);
    throw new ApiError(body?.message ?? 'Não foi possível concluir a operação.', response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json().catch(() => undefined)) as T;
}
