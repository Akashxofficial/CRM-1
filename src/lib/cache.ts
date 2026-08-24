/**
 * High-Performance In-Memory Cache for Sub-Millisecond Tab Switching & Queries.
 * Solves remote MongoDB Atlas network latency on repeated tab navigation.
 */

type CacheEntry<T> = {
  data: T;
  expiry: number;
};

const memoryCache = new Map<string, CacheEntry<any>>();

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 30_000 // 30 seconds default TTL
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(key);

  if (cached && cached.expiry > now) {
    return cached.data;
  }

  try {
    const freshData = await fetcher();
    memoryCache.set(key, {
      data: freshData,
      expiry: now + ttlMs,
    });
    return freshData;
  } catch (error) {
    // If fetcher fails but we have stale cache, serve stale cache as a resilient fallback
    if (cached) {
      console.warn(`Fetch failed for ${key}, serving stale cache:`, error);
      return cached.data;
    }
    throw error;
  }
}

export function invalidateCache(keyPrefix?: string): void {
  if (!keyPrefix) {
    memoryCache.clear();
    return;
  }

  for (const key of memoryCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      memoryCache.delete(key);
    }
  }
}
