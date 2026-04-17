type RateLimitInput = {
  key: string;
  route: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Bucket>();

function now() {
  return Date.now();
}

export function applyRateLimit(input: RateLimitInput): RateLimitResult {
  const current = now();
  const bucketKey = `${input.route}:${input.key}`;
  const existing = store.get(bucketKey);

  if (!existing || existing.resetAt <= current) {
    const resetAt = current + input.windowMs;
    store.set(bucketKey, { count: 1, resetAt });
    return { allowed: true, remaining: input.limit - 1, resetAt };
  }

  if (existing.count >= input.limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  store.set(bucketKey, existing);

  return {
    allowed: true,
    remaining: Math.max(input.limit - existing.count, 0),
    resetAt: existing.resetAt,
  };
}

