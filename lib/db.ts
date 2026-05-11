import { sql } from '@vercel/postgres';
export { sql };

export interface FamilyRow {
  id: string;
  name: string;
  created_at: string;
}

export interface UserRow {
  id: string;
  family_id: string;
  name: string;
  role: 'parent' | 'kid';
  balance: number;
  created_at: string;
}

export interface SubtaskRow {
  id: string;
  card_id: string;
  text: string;
  done: boolean;
  position: number;
}

export interface CardRow {
  id: string;
  family_id: string;
  title: string;
  price: number;
  state: 'suspended' | 'available' | 'taken' | 'pending';
  taken_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CardWithSubtasksRow extends CardRow {
  subtasks: SubtaskRow[];
}

export interface CompletedCardRow {
  id: string;
  user_id: string;
  card_id: string | null;
  card_title: string;
  amount: number;
  completed_at: string;
}
