import { Card, CardState, Subtask } from './models';

// POST /api/cards
export interface CreateCardRequest {
  title:    string;
  subtasks: { text: string }[];
  price:    number;
}

// PUT /api/cards/:id
export interface UpdateCardRequest {
  title?:    string;
  price?:    number;
  subtasks?: {
    id?:  string; // omit to add new; include to update existing
    text: string;
  }[];
}

// PATCH /api/cards/:id/state
export interface StateTransitionRequest {
  state: CardState;
}

// PATCH /api/cards/:id/subtasks/:subtaskId
export interface ToggleSubtaskRequest {
  done: boolean;
}

// GET /api/cards           -> Card[]
// POST /api/cards          -> Card
// PUT /api/cards/:id       -> Card
// DELETE /api/cards/:id    -> 204 no body
// PATCH .../state          -> Card
// PATCH .../subtasks/:id   -> Subtask

export type GetCardsResponse        = Card[];
export type ToggleSubtaskResponse   = Subtask;
