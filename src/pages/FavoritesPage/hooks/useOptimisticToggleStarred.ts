import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleStarred } from '../../../tools/api/api';
import { getAccessToken } from '../../../tools/storageHelpers';
import { jwtDecode } from 'jwt-decode';

type InfiniteShape<T> = { pages: T[]; pageParams: unknown[] } | undefined;

function getUserId(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode<{ sub?: string }>(token);
    return decoded?.sub ?? null;
  } catch {
    return null;
  }
}

export function useOptimisticToggleStarred() {
  const qc = useQueryClient();
  const userId = getUserId();
  const key = ['shortlist', userId] as const;

  const mutation = useMutation({
    mutationKey: ['toggle-starred', userId],
    mutationFn: async ({ id, prevStarred }: { id: string | number; prevStarred: boolean }) => {
      await toggleStarred(prevStarred, String(id));
      return { id };
    },
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: key });
      const snapshot = qc.getQueryData<InfiniteShape<any>>(key);
      qc.setQueryData<InfiniteShape<any>>(key, (old) => {
        if (!old) return old;
        const pages = old.pages.map((p: any) => {
          if (Array.isArray(p)) {
            return p.map((e: any) => (String(e.id) === String(id) ? { ...e, starred: !e.starred } : e));
          }
          if (p && typeof p === 'object' && Array.isArray((p as any).items)) {
            return { ...p, items: (p.items as any[]).map((e: any) => (String(e.id) === String(id) ? { ...e, starred: !e.starred } : e)) };
          }
          return p;
        });
        return { ...old, pages };
      });
      return { snapshot };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(key, ctx.snapshot);
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: key });
    },
  });

  const toggle = (id: string | number, prevStarred: boolean) => mutation.mutateAsync({ id, prevStarred });
  return { toggle };
}


