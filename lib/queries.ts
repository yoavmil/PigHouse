import { sql, CardWithSubtasksRow } from './db';

export async function fetchCard(cardId: string, familyId: string): Promise<CardWithSubtasksRow | null> {
  const { rows } = await sql<CardWithSubtasksRow>`
    SELECT c.*,
      COALESCE(
        json_agg(
          json_build_object('id', s.id, 'card_id', s.card_id, 'text', s.text, 'done', s.done, 'position', s.position)
          ORDER BY s.position
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
      ) AS subtasks
    FROM cards c
    LEFT JOIN subtasks s ON s.card_id = c.id
    WHERE c.id = ${cardId} AND c.family_id = ${familyId}
    GROUP BY c.id
  `;
  return rows[0] ?? null;
}

export async function fetchCards(familyId: string): Promise<CardWithSubtasksRow[]> {
  const { rows } = await sql<CardWithSubtasksRow>`
    SELECT c.*,
      COALESCE(
        json_agg(
          json_build_object('id', s.id, 'card_id', s.card_id, 'text', s.text, 'done', s.done, 'position', s.position)
          ORDER BY s.position
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
      ) AS subtasks
    FROM cards c
    LEFT JOIN subtasks s ON s.card_id = c.id
    WHERE c.family_id = ${familyId}
    GROUP BY c.id
    ORDER BY c.created_at
  `;
  return rows;
}
