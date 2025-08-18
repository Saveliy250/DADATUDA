export type CachedFeedback = {
  like?: boolean;
  starred?: boolean;
  viewedSeconds?: number;
  moreOpened?: boolean;
  referralLinkOpened?: boolean;
  updatedAt?: number;
};

const key = (eventId: string) => `feedback:${eventId}`;

export function readCachedFeedback(eventId: string): CachedFeedback {
  try {
    const raw = localStorage.getItem(key(eventId));
    return raw ? (JSON.parse(raw) as CachedFeedback) : {};
  } catch {
    return {};
  }
}

export function writeCachedFeedback(eventId: string, patch: CachedFeedback): CachedFeedback {
  const prev = readCachedFeedback(eventId);

  const next: CachedFeedback = {
    like: patch.like ?? prev.like,
    starred: patch.starred ?? prev.starred,
    viewedSeconds: (prev.viewedSeconds ?? 0) + (patch.viewedSeconds ?? 0),
    moreOpened: (prev.moreOpened ?? false) || (patch.moreOpened ?? false),
    referralLinkOpened: (prev.referralLinkOpened ?? false) || (patch.referralLinkOpened ?? false),
    updatedAt: Date.now(),
  };

  localStorage.setItem(key(eventId), JSON.stringify(next));
  return next;
}

export function replaceCachedFeedback(eventId: string, data: CachedFeedback): void {
  localStorage.setItem(key(eventId), JSON.stringify({ ...data, updatedAt: Date.now() }));
}

export function clearCachedFeedback(eventId: string): void {
  localStorage.removeItem(key(eventId));
}
