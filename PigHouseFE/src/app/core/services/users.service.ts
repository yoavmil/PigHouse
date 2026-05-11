import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from 'shared/types';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private BASE = `${environment.apiUrl}/api/users`;

  getKids()          { return this.http.get<User[]>(this.BASE); }
  pay(id: string)    { return this.http.patch<User>(`${this.BASE}/${id}/pay`, {}); }
}
