import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Event as CustomEvent } from '../../../shared/models/event';
import { getShortlist, unlikeEvent } from '../../../tools/api/api';
import { jwtDecode } from 'jwt-decode';
import { getAccessToken } from '../../../tools/storageHelpers';
import { logger } from '../../../tools/logger';

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

function pushIntoFirstPage(pages: any[], item: any): any[] {
  if (!Array.isArray(pages) || pages.length === 0) return [[item]];
  const first = pages[0];
  if (Array.isArray(first)) {
    const exists = first.some((e: any) => String(e.id) === String(item.id));
    return [exists ? first : [item, ...first], ...pages.slice(1)];
  }
  if (first && typeof first === 'object' && Array.isArray((first as any).items)) {
    const exists = (first as any).items.some((e: any) => String(e.id) === String(item.id));
    const updatedFirst = exists ? first : { ...first, items: [item, ...(first as any).items] };
    return [updatedFirst, ...pages.slice(1)];
  }
  return [[item], ...pages.slice(1)];
}

function removeFromAllPages(pages: any[], id: string | number): { next: any[]; removed?: any } {
  let removed: any | undefined;
  const next = pages.map((page: any) => {
    if (Array.isArray(page)) {
      const idx = page.findIndex((e: any) => String(e.id) === String(id));
      if (idx >= 0) removed = page[idx];
      return page.filter((e: any) => String(e.id) !== String(id));
    }
    if (page && typeof page === 'object' && Array.isArray((page as any).items)) {
      const items = (page as any).items as any[];
      const idx = items.findIndex((e: any) => String(e.id) === String(id));
      if (idx >= 0) removed = items[idx];
      return { ...page, items: items.filter((e: any) => String(e.id) !== String(id)) };
    }
    return page;
  });
  return { next, removed };
}

function toShortlistRawItem(ev: CustomEvent): any {
  return {
    id: ev.id,
    name: ev.name,
    date: ev.date,
    address: ev.address,
    imageURL: ev.imageURL,
    description: ev.description,
    starred: true,
  };
}

export function useOptimisticShortlist() {
  const qc = useQueryClient();
  const userId = getUserId();
  const key = ['shortlist', userId] as const;

  const addMutation = useMutation({
    mutationKey: ['shortlist-add', userId],
    mutationFn: async (event: CustomEvent) => event,
    onMutate: async (event) => {
      await qc.cancelQueries({ queryKey: key });
      const snapshot = qc.getQueryData<InfiniteShape<any>>(key);
      qc.setQueryData<InfiniteShape<any>>(key, (old) => {
        const pages = old?.pages ?? [];
        const pageParams = old?.pageParams ?? [0];
        const item = toShortlistRawItem(event);
        return { pages: pushIntoFirstPage(pages, item), pageParams };
      });
      return { snapshot, event };
    },
    onError: (_e, _event, ctx) => {
      if (ctx?.snapshot) qc.setQueryData(key, ctx.snapshot);
    },
    onSettled: async (_res, _err, event, _ctx) => {
      await qc.invalidateQueries({ queryKey: key });
      setTimeout(async () => {
        try {
          const serverFirstPage = await getShortlist(10, 0);
          const items = Array.isArray(serverFirstPage)
            ? serverFirstPage
            : Array.isArray((serverFirstPage as any).items)
            ? (serverFirstPage as any).items
            : [];
          const exists = items.some((e: any) => String(e.id) === String(event.id));
          if (!exists) {
            logger.error('[Shortlist] verification failed: event not added on server');
          }
        } catch {}
      }, 2000);
    },
  });

  const removeMutation = useMutation({
    mutationKey: ['shortlist-remove', userId],
    mutationFn: async (id: string | number) => {
      logger.info('[Shortlist] removeMutation start');
      await unlikeEvent(String(id));
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key });
      const snapshot = qc.getQueryData<InfiniteShape<any>>(key);
      let removedItem: any | undefined;
      qc.setQueryData<InfiniteShape<any>>(key, (old) => {
        const pages = old?.pages ?? [];
        const pageParams = old?.pageParams ?? [0];
        const { next, removed } = removeFromAllPages(pages, id);
        removedItem = removed;
        return { pages: next, pageParams };
      });
      return { snapshot, removedItem, id };
    },
    onError: (_e, _id, ctx) => {
      logger.error('[Shortlist] removeMutation error');
      if (ctx?.snapshot) qc.setQueryData(key, ctx.snapshot);
    },
    onSettled: async (_res, _err, id, ctx) => {
      logger.info('[Shortlist] removeMutation settled');
      await qc.invalidateQueries({ queryKey: key });
      setTimeout(async () => {
        try {
          const serverFirstPage = await getShortlist(10, 0);
          const items = Array.isArray(serverFirstPage)
            ? serverFirstPage
            : Array.isArray((serverFirstPage as any).items)
            ? (serverFirstPage as any).items
            : [];
          const stillPresent = items.some((e: any) => String(e.id) === String(id) && e.starred);
          if (stillPresent) {
            // сервер не удалил — вернём элемент в кэш
            const removedItem = ctx?.removedItem;
            if (removedItem) {
              qc.setQueryData<InfiniteShape<any>>(key, (old) => {
                const pagesOld = old?.pages ?? [];
                const pageParams = old?.pageParams ?? [0];
                const restored = pushIntoFirstPage(pagesOld, removedItem);
                return { pages: restored, pageParams };
              });
            }
            // eslint-disable-next-line no-console
            console.error('[Shortlist] verification failed: event not removed on server');
          }
        } catch {}
      }, 2000);
    },
  });

  const optimisticAdd = useCallback((event: CustomEvent) => addMutation.mutateAsync(event), [addMutation]);
  const optimisticRemove = useCallback((id: string | number) => removeMutation.mutateAsync(id), [removeMutation]);

  return { optimisticAdd, optimisticRemove };
}


