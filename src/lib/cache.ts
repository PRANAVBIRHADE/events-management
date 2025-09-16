type CacheEntry<T> = { value: T; expiresAt: number };

const cacheStore = new Map<string, CacheEntry<any>>();

export const fetchWithCache = async <T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const existing = cacheStore.get(key);
  if (existing && existing.expiresAt > now) {
    return existing.value as T;
  }
  const value = await loader();
  cacheStore.set(key, { value, expiresAt: now + ttlMs });
  return value;
};

export const invalidateCache = (keyPrefix?: string) => {
  if (!keyPrefix) {
    cacheStore.clear();
    return;
  }
  for (const key of cacheStore.keys()) {
    if (key.startsWith(keyPrefix)) cacheStore.delete(key);
  }
};

export const revalidateOnFocus = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener('focus', handler);
  return () => window.removeEventListener('focus', handler);
};

export const useDebounced = <T>(value: T, delayMs: number): T => {
  // Simple hook-like helper for non-React usage not provided; implement inline where needed
  return value;
};


