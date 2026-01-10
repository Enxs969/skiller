interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number;
  maxEntries: number;
}

const DEFAULT_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000,
  maxEntries: 100,
};

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  generateKey(endpoint: string, params: Record<string, any> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}?${sortedParams}`;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    if (this.cache.size >= this.config.maxEntries) {
      this.evictOldest();
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + (ttl ?? this.config.ttl),
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const apiCache = new APICache({
  ttl: 5 * 60 * 1000,
  maxEntries: 200,
});

export const searchCache = new APICache({
  ttl: 2 * 60 * 1000,
  maxEntries: 50,
});

class RateLimiter {
  private lastRequest = new Map<string, number>();
  private minInterval: number;

  constructor(minIntervalMs: number = 500) {
    this.minInterval = minIntervalMs;
  }

  canRequest(key: string): boolean {
    const now = Date.now();
    const last = this.lastRequest.get(key) || 0;
    return now - last >= this.minInterval;
  }

  recordRequest(key: string): void {
    this.lastRequest.set(key, Date.now());
  }

  getWaitTime(key: string): number {
    const now = Date.now();
    const last = this.lastRequest.get(key) || 0;
    const wait = this.minInterval - (now - last);
    return Math.max(0, wait);
  }
}

export const scrollRateLimiter = new RateLimiter(500);

export const searchRateLimiter = new RateLimiter(300);

class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    const existing = this.pendingRequests.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  hasPending(key: string): boolean {
    return this.pendingRequests.has(key);
  }
}

export const requestDeduplicator = new RequestDeduplicator();

class ConcurrencyLimiter {
  private activeCount = 0;
  private queue: Array<() => void> = [];
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  async acquire(): Promise<void> {
    if (this.activeCount < this.maxConcurrent) {
      this.activeCount++;
      return;
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    this.activeCount--;
    const next = this.queue.shift();
    if (next) {
      this.activeCount++;
      next();
    }
  }

  getStats(): { active: number; queued: number } {
    return { active: this.activeCount, queued: this.queue.length };
  }
}

export const apiConcurrencyLimiter = new ConcurrencyLimiter(3);

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = 'Request timeout'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

class RequestCounter {
  private counts = new Map<string, { success: number; error: number; total: number }>();
  private windowStart = Date.now();
  private windowMs = 60000;

  record(endpoint: string, success: boolean): void {
    if (Date.now() - this.windowStart > this.windowMs) {
      this.counts.clear();
      this.windowStart = Date.now();
    }

    const current = this.counts.get(endpoint) || { success: 0, error: 0, total: 0 };
    current.total++;
    if (success) {
      current.success++;
    } else {
      current.error++;
    }
    this.counts.set(endpoint, current);
  }

  getStats(): Record<string, { success: number; error: number; total: number }> {
    return Object.fromEntries(this.counts);
  }

  getTotalInWindow(): number {
    let total = 0;
    for (const stats of this.counts.values()) {
      total += stats.total;
    }
    return total;
  }
}

export const requestCounter = new RequestCounter();
