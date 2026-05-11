import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApproveResponse } from 'shared/types';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApprovalsService {
  private http = inject(HttpClient);
  private BASE = `${environment.apiUrl}/api/approvals`;

  approve(cardId: string) {
    return this.http.post<ApproveResponse>(`${this.BASE}/${cardId}/approve`, {});
  }
}
