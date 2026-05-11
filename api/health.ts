import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCors } from '../lib/cors';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (setCors(req, res)) return;
  res.json({ ok: true });
}
