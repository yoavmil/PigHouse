import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { User } from 'shared/types';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from 'shared/types';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly STORAGE_KEY = 'pighouse_user';
  private readonly BASE = `${environment.apiUrl}/api/auth`;

  currentUser = signal<User | null>(this.loadFromStorage());

  private loadFromStorage(): User | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private persist(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  register(req: RegisterRequest) {
    return this.http
      .post<RegisterResponse>(`${this.BASE}/register`, req)
      .pipe(tap(res => this.persist(res.user)));
  }

  login(req: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${this.BASE}/login`, req)
      .pipe(tap(res => this.persist(res.user)));
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser.set(null);
  }
}
