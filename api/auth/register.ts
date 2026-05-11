import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, UserRow } from '../../lib/db';
import { toUser } from '../../lib/transform';
import { setCors } from '../../lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (setCors(req, res)) return;
  if (req.method !== 'POST') { res.status(405).end(); return; }

  const { familyName, dadName, momName, kidNames } = req.body ?? {};
  if (!familyName || !dadName || !momName || !Array.isArray(kidNames) || kidNames.length === 0) {
    res.status(400).json({ error: 'familyName, dadName, momName and at least one kidName are required' });
    return;
  }

  const { rows: existing } = await sql`SELECT id FROM families WHERE name = ${familyName}`;
  if (existing[0]) { res.status(409).json({ error: 'Family already exists' }); return; }

  const { rows: families } = await sql`INSERT INTO families (name) VALUES (${familyName}) RETURNING id`;
  const familyId = families[0].id as string;

  const { rows: dads } = await sql<UserRow>`
    INSERT INTO users (family_id, name, role) VALUES (${familyId}, ${dadName}, 'parent') RETURNING *
  `;
  await sql`INSERT INTO users (family_id, name, role) VALUES (${familyId}, ${momName}, 'parent')`;

  for (const name of kidNames as string[]) {
    await sql`INSERT INTO users (family_id, name, role) VALUES (${familyId}, ${name}, 'kid')`;
  }

  res.status(201).json({ user: toUser(dads[0], []) });
}
