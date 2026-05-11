import { Component, inject, OnInit, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsersService } from '../../core/services/users.service';
import { User } from 'shared/types';

@Component({
  selector: 'app-kids-stats',
  imports: [MatExpansionModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="container" dir="rtl">

      <h2 class="page-title">סטטיסטיקות ילדים</h2>

      @if (loading()) {
        <div class="center"><mat-spinner diameter="48" /></div>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else if (kids().length === 0) {
        <p class="empty">אין ילדים במשפחה עדיין</p>
      } @else {
        <mat-accordion>
          @for (kid of kids(); track kid.id) {
            <mat-expansion-panel>

              <mat-expansion-panel-header>
                <mat-panel-title class="header-title">
                  <span class="kid-name">{{ kid.name }}</span>
                  @if (kid.balance > 0) {
                    <span class="debt">חוב: {{ kid.balance }}₪</span>
                    <button mat-flat-button class="pay-btn"
                          [disabled]="kid.balance === 0 || paying()[kid.id]"
                          (click)="pay(kid, $event)">
                    @if (paying()[kid.id]) {
                      <mat-spinner diameter="16" />
                    } @else {
                      שולם
                    }
                  </button>
                  }
                  
                </mat-panel-title>
              </mat-expansion-panel-header>

              <div class="stats-row">
                <div class="stat">
                  <span class="stat-value">{{ totalEarned(kid) }}₪</span>
                  <span class="stat-label">סה"כ הרוויח</span>
                </div>
                <div class="stat">
                  <span class="stat-value">{{ kid.completedCards.length }}</span>
                  <span class="stat-label">משימות שהשלים</span>
                </div>
              </div>

            </mat-expansion-panel>
          }
        </mat-accordion>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 16px;
    }
    .page-title { margin: 0 0 16px; font-size: 1.3rem; }
    .center { display: flex; justify-content: center; padding: 48px 0; }
    .empty, .error { text-align: center; color: #888; margin-top: 48px; }
    .error { color: #c62828; }

    .header-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 10px;
    }
    .kid-name { font-weight: 700; font-size: 1rem; flex: 1; }
    .debt { color: #c62828; font-weight: 600; font-size: 0.9rem; }
    .pay-btn {
      background-color: #1565c0 !important;
      color: white !important;
      font-size: 0.85rem;
      height: 32px;
      line-height: 32px;
      padding: 0 12px;
      min-width: unset;
    }
    .pay-btn:disabled { opacity: 0.4; }

    .stats-row {
      display: flex;
      gap: 24px;
      padding: 8px 0;
    }
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .stat-value { font-size: 1.4rem; font-weight: 700; color: #1565c0; }
    .stat-label { font-size: 0.8rem; color: #888; }
    mat-spinner { display: inline-block; }
  `],
})
export class KidsStatsComponent implements OnInit {
  private usersService = inject(UsersService);

  kids    = signal<User[]>([]);
  loading = signal(true);
  error   = signal<string | null>(null);
  paying  = signal<Record<string, boolean>>({});

  ngOnInit(): void {
    this.usersService.getKids().subscribe({
      next:  kids => { this.kids.set(kids); this.loading.set(false); },
      error: ()   => { this.error.set('שגיאה בטעינת הנתונים'); this.loading.set(false); },
    });
  }

  totalEarned(kid: User): number {
    return kid.completedCards.reduce((sum, c) => sum + c.amount, 0);
  }

  pay(kid: User, event: MouseEvent): void {
    event.stopPropagation();
    this.paying.update(p => ({ ...p, [kid.id]: true }));
    this.usersService.pay(kid.id).subscribe({
      next: updated => {
        this.kids.update(list => list.map(k => k.id === updated.id ? updated : k));
        this.paying.update(p => ({ ...p, [kid.id]: false }));
      },
      error: () => this.paying.update(p => ({ ...p, [kid.id]: false })),
    });
  }

}
