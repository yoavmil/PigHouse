import { User } from './models';

// POST /api/auth/register
export interface RegisterRequest {
  familyName:  string;
  parentName:  string;
  password:    string;
}

export interface RegisterResponse {
  token: string;
  user:  User;
}

// POST /api/auth/login
export interface LoginRequest {
  familyName: string;
  userName:   string;
  password:   string;
}

export interface LoginResponse {
  token: string;
  user:  User;
}
