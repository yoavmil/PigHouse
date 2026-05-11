import { CompletedCard, User, UserRole } from './models';

// POST /api/users
export interface CreateUserRequest {
  name: string;
  role: UserRole;
}

// GET /api/users          -> User[]
// GET /api/users/:id      -> User
// GET /api/users/:id/history -> CompletedCard[]

export type GetUsersResponse       = User[];
export type GetUserHistoryResponse = CompletedCard[];
