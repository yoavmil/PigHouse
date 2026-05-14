export type UserRole = 'parent' | 'kid';

export type CardState = 'suspended' | 'available' | 'taken' | 'pending';

export interface CompletedCard {
  cardId:      string;
  cardTitle:   string;  // snapshot of title at approval time
  amount:      number;
  completedAt: string;  // ISO 8601
}

export interface User {
  id:             string;
  familyId:       string;
  name:           string;
  role:           UserRole;
  balance:        number;          // unpaid earnings — kids only, 0 for parents
  completedCards: CompletedCard[]; // full history  — kids only, [] for parents
  createdAt:      string;
}

export interface Subtask {
  id:   string;
  text: string;
  done: boolean;
}

export interface CardCompletionEntry {
  kidId:       string;
  kidName:     string;
  price:       number;
  completedAt: string;
}

export interface Card {
  id:                string;
  familyId:          string;
  title:             string;
  subtasks:          Subtask[];
  price:             number;
  state:             CardState;
  takenBy:           string | null; // userId of the kid holding it, null otherwise
  completionHistory: CardCompletionEntry[];
  createdAt:         string;
  updatedAt:         string;
}

export interface ApiError {
  error: string;
}
