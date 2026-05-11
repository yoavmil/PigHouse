import { Injectable, signal } from '@angular/core';

export interface StoredUser {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'pighouse_user';

  currentUser = signal<StoredUser | null>(this.loadFromStorage());

  private loadFromStorage(): StoredUser | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredUser) : null;
    } catch {
      return null;
    }
  }

  login(name: string): void {
    const user: StoredUser = { name };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser.set(null);
  }
}
