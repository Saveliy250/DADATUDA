import { useInfiniteQuery } from '@tanstack/react-query';
import { getShortlist } from '../../../tools/api/api';
import type { FavoritePageEvent } from '../types';
import { formatEventDateTime } from '../../../tools/FormatDate';
import { getAccessToken } from '../../../tools/storageHelpers';
import { jwtDecode } from 'jwt-decode';

const PAGE_SIZE = 10;

type Id = string | number;

function getUserIdFromToken(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode<{ sub?: string }>(token);
    return decoded?.sub ?? null;
  } catch {
    return null;
  }
}

function asArray<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v && typeof v === 'object' && Array.isArray((v as any).items)) return (v as any).items as T[];
  return [] as T[];
}

function getItemsCount(v: unknown): number {
  if (Array.isArray(v)) return v.length;
  if (v && typeof v === 'object' && Array.isArray((v as any).items)) return (v as any).items.length;
  return 0;
}

function adapt(rows: any[]): FavoritePageEvent[] {
  return rows.map((a: any) => {
    const { date, time } = formatEventDateTime(a.date);
    const imgs = Array.isArray(a.imageURL) ? a.imageURL : a.imageURL ? [a.imageURL] : [];
    return {
      id: a.id as Id,
      name: a.name,
      date: a.date,
      address: a.address,
      imageURL: imgs,
      description: a.description,
      isFavorite: Boolean(a.starred),
      starred: Boolean(a.starred),
      formattedDate: date,
      formattedTime: time,
      addedAt: a.addedAt,
      favoriteAddedAt: a.favoriteAddedAt,
      createdAt: a.createdAt,
    } as FavoritePageEvent;
  });
}

export function useShortlist() {
  const userId = getUserIdFromToken();

  const query = useInfiniteQuery({
    queryKey: ['shortlist', userId],
    enabled: Boolean(userId),
    queryFn: ({ pageParam = 0 }) => getShortlist(PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const count = getItemsCount(lastPage);
      return count === PAGE_SIZE ? allPages.length : undefined;
    },
    select: (data) => {
      const rows = data.pages.flatMap((p) => asArray<any>(p));
      const adapted = adapt(rows);
      return { ...data, flat: adapted } as typeof data & { flat: FavoritePageEvent[] };
    },
  });

  return query as typeof query & { data?: (typeof query.data) & { flat: FavoritePageEvent[] } };
}


