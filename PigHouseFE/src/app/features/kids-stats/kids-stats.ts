import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsersService } from '../../core/services/users.service';
import { CardService } from '../../core/services/card.service';
import { Card, User } from 'shared/types';

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
            <mat-expansion-panel [class.active-kid]="takenCards.has(kid.id)">

              <mat-expansion-panel-header>
                <mat-panel-title class="header-title">
                  <span class="kid-name">{{ kid.name }}</span>
                  @if (takenCards.has(kid.id)) {
                    <span class="working-badge">🔨</span>
                  }
                  @if (kid.balance > 0) {
                    <span class="debt">חוב: {{ kid.balance }}₪</span>
                    <button mat-flat-button class="pay-btn"
                          [disabled]="paying()[kid.id]"
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

              @if (takenCards.has(kid.id)) {
                <p class="active-task">עכשיו עובד על: <strong>{{ takenCards.get(kid.id)!.title }}</strong></p>
              }

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

    .active-kid { border-right: 4px solid #1565c0 !important; }

    .header-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 10px;
    }
    .kid-name { font-weight: 700; font-size: 1rem; flex: 1; }
    .working-badge { font-size: 0.8rem; color: #1565c0; }
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

    .active-task {
      font-size: 0.9rem;
      color: #1565c0;
      margin: 0 0 12px;
    }

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
  private cardService  = inject(CardService);

  kids       = signal<User[]>([]);
  loading    = signal(true);
  error      = signal<string | null>(null);
  paying     = signal<Record<string, boolean>>({});
  takenCards = new Map<string, Card>();

  ngOnInit(): void {
    forkJoin({
      kids:  this.usersService.getKids(),
      cards: this.cardService.getAll(),
    }).subscribe({
      next: ({ kids, cards }) => {
        this.kids.set(kids);
        this.takenCards = new Map(
          cards
            .filter(c => c.state === 'taken' && c.takenBy)
            .map(c => [c.takenBy!, c])
        );
        this.loading.set(false);
      },
      error: () => { this.error.set('שגיאה בטעינת הנתונים'); this.loading.set(false); },
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
