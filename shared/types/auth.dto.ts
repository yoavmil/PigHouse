import { User } from './models';

// POST /api/auth/register
export interface RegisterRequest {
  familyName:  string;
  parentName:  string;
}

export interface RegisterResponse {
  user: User;
}

// POST /api/auth/login
export interface LoginRequest {
  familyName: string;
  userName:   string;
}

export interface LoginResponse {
  user: User;
}
