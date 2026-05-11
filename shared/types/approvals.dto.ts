import { Card, User } from './models';

// GET /api/approvals       -> Card[]  (all cards in 'pending' state)

// POST /api/approvals/:id/approve
export interface ApproveResponse {
  card:        Card; // state is now 'available'
  updatedUser: User; // kid's updated balance + completedCards
}

// POST /api/approvals/:id/reject -> Card  (state is now 'taken')
