import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { ApiError, apiFetch, setAuthToken, setUnauthorizedHandler } from '@/lib/api';
import { parseSessionToken, type SessionUser } from '@/lib/jwt';

const TOKEN_KEY = 'portal-fiap.session-token';
/** Maior atraso aceito por `setTimeout` (cerca de 24,8 dias). */
const MAX_TIMER_MS = 2 ** 31 - 1;

/**
 * Por que a sessão terminou nesta execução do app. `null` quando ninguém entrou ainda: aí a
 * primeira tela é a abertura. Depois de sair ou expirar, o app vai direto para o login.
 */
export type SessionEndReason = 'signedOut' | 'expired' | null;

type SessionContextValue = {
  user: SessionUser | null;
  /** true enquanto o token salvo no aparelho ainda está sendo lido. */
  isRestoring: boolean;
  endReason: SessionEndReason;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: (reason?: Exclude<SessionEndReason, null>) => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [endReason, setEndReason] = useState<SessionEndReason>(null);

  const signOut = useCallback(async (reason: Exclude<SessionEndReason, null> = 'signedOut') => {
    setAuthToken(null);
    setEndReason(reason);
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
  }, []);

  // Um 401 do token atual quer dizer que a sessão venceu ou foi revogada na API.
  useEffect(() => {
    setUnauthorizedHandler(() => void signOut('expired'));
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  // A validade vem no token: encerra a sessão quando ela vence com o app aberto, e confere de
  // novo ao voltar do segundo plano (o cronômetro não corre com o app suspenso).
  useEffect(() => {
    if (!user) return;
    const expireIfDue = () => {
      if (Date.now() >= user.expiresAt) void signOut('expired');
    };
    const timer = setTimeout(expireIfDue, Math.min(Math.max(user.expiresAt - Date.now(), 0), MAX_TIMER_MS));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') expireIfDue();
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [user, signOut]);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (cancelled || !token) return;

        const restored = parseSessionToken(token);
        if (restored) {
          setAuthToken(token);
          setUser(restored);
        } else {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
      } catch {
        // Sem acesso ao armazenamento seguro, o usuário apenas faz login de novo.
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token } = await apiFetch<{ token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const signedIn = parseSessionToken(token);
    if (!signedIn) throw new ApiError('A API retornou uma sessão inválida.', 200);

    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setAuthToken(token);
    setEndReason(null);
    setUser(signedIn);
  }, []);

  const value = useMemo(
    () => ({ user, isRestoring, endReason, signIn, signOut }),
    [user, isRestoring, endReason, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession precisa estar dentro de SessionProvider');
  return context;
}
