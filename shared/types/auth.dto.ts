import { User } from './models';

// POST /api/auth/register
export interface RegisterRequest {
  familyName: string;
  dadName:    string;
  momName:    string;
  kidNames:   string[];
}

export interface RegisterResponse {
  user: User; // the dad is logged in after registration
}

// POST /api/auth/login
export interface LoginRequest {
  familyName: string;
  userName:   string;
}

export interface LoginResponse {
  user: User;
}
