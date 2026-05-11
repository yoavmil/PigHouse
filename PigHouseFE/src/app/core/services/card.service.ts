import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Card, CreateCardRequest, UpdateCardRequest } from 'shared/types';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CardService {
  private http = inject(HttpClient);
  private BASE = `${environment.apiUrl}/api/cards`;

  getAll()                                   { return this.http.get<Card[]>(this.BASE); }
  getById(id: string)                        { return this.http.get<Card>(`${this.BASE}/${id}`); }
  create(req: CreateCardRequest)             { return this.http.post<Card>(this.BASE, req); }
  update(id: string, req: UpdateCardRequest) { return this.http.put<Card>(`${this.BASE}/${id}`, req); }
  delete(id: string)                         { return this.http.delete<void>(`${this.BASE}/${id}`); }
  takeCard(id: string)                       { return this.http.patch<Card>(`${this.BASE}/${id}/state`, { state: 'taken' }); }
  markPending(id: string)                    { return this.http.patch<Card>(`${this.BASE}/${id}/state`, { state: 'pending' }); }
  toggleSubtask(cardId: string, subtaskId: string, done: boolean) {
    return this.http.patch<{ id: string; text: string; done: boolean }>(
      `${this.BASE}/${cardId}/subtasks/${subtaskId}`, { done }
    );
  }
}
