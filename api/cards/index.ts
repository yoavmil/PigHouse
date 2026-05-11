import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../../lib/db';
import { withAuth, withParent } from '../../lib/auth';
import { toCard } from '../../lib/transform';
import { fetchCard, fetchCards } from '../../lib/queries';
import { setCors } from '../../lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (setCors(req, res)) return;

  if (req.method === 'GET') {
    await withAuth(req, res, async (user) => {
      const cards = await fetchCards(user.family_id);
      res.json(cards.map(toCard));
    });
    return;
  }

  if (req.method === 'POST') {
    await withParent(req, res, async (user) => {
      const { title, price, subtasks } = req.body ?? {};

      const { rows } = await sql`
        INSERT INTO cards (family_id, title, price, state)
        VALUES (${user.family_id}, ${title ?? ''}, ${price ?? 10}, 'available')
        RETURNING id
      `;
      const cardId = rows[0].id as string;

      const tasks: { text: string }[] = subtasks ?? [];
      for (let i = 0; i < tasks.length; i++) {
        await sql`INSERT INTO subtasks (card_id, text, position) VALUES (${cardId}, ${tasks[i].text}, ${i})`;
      }

      const card = await fetchCard(cardId, user.family_id);
      res.status(201).json(toCard(card!));
    });
    return;
  }

  res.status(405).end();
}
