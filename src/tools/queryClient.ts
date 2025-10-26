import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient, type Persister, type PersistedClient } from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
      retry: 1,
    },
  },
});

try {
  const key = 'tanstack-query-cache';
  const persister: Persister = {
    persistClient: (client: PersistedClient) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(client));
      } catch {}
    },
    restoreClient: () => {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : undefined;
      } catch {
        return undefined;
      }
    },
    removeClient: () => {
      try {
        window.localStorage.removeItem(key);
      } catch {}
    },
  };
  persistQueryClient({ queryClient, persister });
} catch {}


