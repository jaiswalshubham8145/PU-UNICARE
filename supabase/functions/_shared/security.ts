// Security Headers Middleware for Supabase Edge Functions

export const securityHeaders: Record<string, string> = {
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // XSS Protection
  'X-XSS-Protection': '1; mode=block',

  // Clickjacking Protection
  'X-Frame-Options': 'DENY',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',

  // Strict Transport Security
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',

  // Server info hiding
  'X-Powered-By': 'PU UNICARE',
};

export function getSecurityHeaders(): HeadersInit {
  return { ...securityHeaders };
}

export function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    'https://unicare.pu.edu',
    'https://pu-unicare.vercel.app',
    'http://localhost:8080',
    'http://localhost:3000',
  ];

  const isAllowed = !origin || allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function createSecureResponse(
  body: string | object,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getSecurityHeaders(),
    ...additionalHeaders,
  };

  return new Response(
    typeof body === 'string' ? body : JSON.stringify(body),
    { status, headers }
  );
}
