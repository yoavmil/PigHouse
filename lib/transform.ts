import type { Card, User, Subtask, CompletedCard } from 'shared/types';
import type { CardWithSubtasksRow, CompletedCardRow, SubtaskRow, UserRow } from './db';

export function toSubtask(row: SubtaskRow): Subtask {
  return { id: row.id, text: row.text, done: row.done };
}

export function toCard(row: CardWithSubtasksRow): Card {
  return {
    id:        row.id,
    familyId:  row.family_id,
    title:     row.title,
    price:     Number(row.price),
    state:     row.state,
    takenBy:   row.taken_by,
    subtasks:  (row.subtasks ?? []).map(toSubtask),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toUser(row: UserRow, completedCards: CompletedCardRow[] = []): User {
  return {
    id:             row.id,
    familyId:       row.family_id,
    name:           row.name,
    role:           row.role,
    balance:        Number(row.balance),
    completedCards: completedCards.map(toCompletedCard),
    createdAt:      row.created_at,
  };
}

function toCompletedCard(row: CompletedCardRow): CompletedCard {
  return {
    cardId:      row.card_id ?? '',
    cardTitle:   row.card_title,
    amount:      Number(row.amount),
    completedAt: row.completed_at,
  };
}
