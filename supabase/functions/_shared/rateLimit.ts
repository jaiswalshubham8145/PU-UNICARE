// Rate Limiting Middleware for Supabase Edge Functions
// Uses in-memory store (works for single instance)

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
}

export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, keyGenerator } = config;

  return {
    check: (req: Request): { allowed: boolean; remaining: number; resetAt: number } => {
      const key = keyGenerator ? keyGenerator(req) : getDefaultKey(req);
      const now = Date.now();
      const entry = rateLimitStore.get(key);

      if (!entry || entry.resetAt < now) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
      }

      if (entry.count >= maxRequests) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
      }

      entry.count++;
      return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
    },
  };
}

function getDefaultKey(req: Request): string {
  const url = new URL(req.url);
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `${ip}:${url.pathname}`;
}

// Pre-configured rate limiters
export const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
});

export const emailLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
});

export function applyRateLimit(req: Request, limiter: ReturnType<typeof createRateLimiter>): Response | null {
  const result = limiter.check(req);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetAt.toString(),
          'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null; // Allow request
}
