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

import { ApiError, apiFetch, setAuthToken, setUnauthorizedHandler } from '@/lib/api';
import { parseSessionToken, type SessionUser } from '@/lib/jwt';

const TOKEN_KEY = 'portal-fiap.session-token';

type SessionContextValue = {
  user: SessionUser | null;
  /** true enquanto o token salvo no aparelho ainda está sendo lido. */
  isRestoring: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => void signOut());
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

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
    setUser(signedIn);
  }, []);

  const value = useMemo(
    () => ({ user, isRestoring, signIn, signOut }),
    [user, isRestoring, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession precisa estar dentro de SessionProvider');
  return context;
}
