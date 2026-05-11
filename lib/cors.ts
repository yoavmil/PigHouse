import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN ??
  (process.env.NODE_ENV === 'production'
    ? 'https://yoavmil.github.io'
    : 'http://localhost:4200');

// Returns true if request was an OPTIONS preflight (already handled).
export function setCors(req: VercelRequest, res: VercelResponse): boolean {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-user-id');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
