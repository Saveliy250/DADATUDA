export type CachedFeedback = {
  like?: boolean;
  starred?: boolean;
  viewedSeconds?: number;
  moreOpened?: boolean;
  referralLinkOpened?: boolean;
  updatedAt?: number;
};

const key = (userId: string, eventId: string) => `feedback:${userId}:${eventId}`;

export function readCachedFeedback(userId: string, eventId: string): CachedFeedback {
  try {
    const raw = localStorage.getItem(key(userId, eventId));
    return raw ? (JSON.parse(raw) as CachedFeedback) : {};
  } catch {
    return {};
  }
}

export function writeCachedFeedback(
  userId: string,
  eventId: string,
  patch: CachedFeedback,
): CachedFeedback {
  const prev = readCachedFeedback(userId, eventId);

  const next: CachedFeedback = {
    like: patch.like ?? prev.like,
    starred: patch.starred ?? prev.starred,
    viewedSeconds: (prev.viewedSeconds ?? 0) + (patch.viewedSeconds ?? 0),
    moreOpened: (prev.moreOpened ?? false) || (patch.moreOpened ?? false),
    referralLinkOpened: (prev.referralLinkOpened ?? false) || (patch.referralLinkOpened ?? false),
    updatedAt: Date.now(),
  };

  localStorage.setItem(key(userId, eventId), JSON.stringify(next));
  return next;
}

export function replaceCachedFeedback(userId: string, eventId: string, data: CachedFeedback): void {
  localStorage.setItem(key(userId, eventId), JSON.stringify({ ...data, updatedAt: Date.now() }));
}

export function clearCachedFeedback(userId: string, eventId: string): void {
  localStorage.removeItem(key(userId, eventId));
}