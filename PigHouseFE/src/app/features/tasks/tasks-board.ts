import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { CardService } from '../../core/services/card.service';
import { AuthService } from '../../core/auth/auth.service';
import { Card } from 'shared/types';

@Component({
  selector: 'app-tasks-board',
  imports: [MatExpansionModule, MatButtonModule, MatProgressSpinnerModule, MatProgressBarModule, MatIconModule],
  template: `
    <div class="container" dir="rtl">
      <h2 class="page-title">עבודות פרך</h2>

      @if (loading()) {
        <div class="center"><mat-spinner diameter="48" /></div>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else {

        <!-- Active task -->
        @if (activeCard()) {
          <p class="section-label">המשימה שלי כעת</p>
          <div class="active-card" (click)="goToActive()">
            <div class="active-header">
              <span class="active-title">{{ activeCard()!.title }}</span>
              <span class="active-price">{{ activeCard()!.price }}₪</span>
            </div>
            @if (activeCard()!.subtasks.length > 0) {
              <mat-progress-bar mode="determinate" [value]="activeProgress()" class="active-bar" />
              <span class="progress-text">{{ activeDone() }}/{{ activeCard()!.subtasks.length }} פריטים</span>
            }
            <div class="active-cta">
              <mat-icon>chevron_left</mat-icon>
            </div>
          </div>
        }

        <!-- Pending approval -->
        @if (pendingCards().length > 0) {
          <p class="section-label">ממתינות לאישור הורה</p>
          @for (card of pendingCards(); track card.id) {
            <div class="pending-card">
              <span class="pending-title">{{ card.title }}</span>
              <span class="pending-badge">ממתין לאישור ⏳</span>
            </div>
          }
        }

        <!-- Available tasks -->
        @if (availableCards().length > 0) {
          <p class="section-label">משימות פנויות</p>
          <mat-accordion>
            @for (card of availableCards(); track card.id) {
              <mat-expansion-panel>
                <mat-expansion-panel-header>
                  <mat-panel-title class="card-title">{{ card.title }}</mat-panel-title>
                  <mat-panel-description class="card-price">{{ card.price }}₪</mat-panel-description>
                </mat-expansion-panel-header>

                <ul class="subtask-list">
                  @for (sub of card.subtasks; track sub.id) {
                    <li>{{ sub.text }}</li>
                  }
                </ul>

                @if (takeError()[card.id]) {
                  <p class="take-error">{{ takeError()[card.id] }}</p>
                }

                <div class="actions">
                  <button mat-flat-button color="primary"
                          [disabled]="taking()[card.id]"
                          (click)="takeCard(card)">
                    @if (taking()[card.id]) {
                      <mat-spinner diameter="18" />
                    } @else {
                      לקחתי
                    }
                  </button>
                </div>
              </mat-expansion-panel>
            }
          </mat-accordion>
        }

        @if (!activeCard() && pendingCards().length === 0 && availableCards().length === 0) {
          <p class="empty">אין משימות כרגע 🐷</p>
        }

      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 16px;
    }
    .page-title {
      text-align: center;
      margin-bottom: 20px;
      font-size: 1.4rem;
    }
    .center { display: flex; justify-content: center; padding: 48px 0; }
    .empty, .error { text-align: center; color: #888; margin-top: 48px; }
    .error { color: #c62828; }

    .section-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 20px 0 8px;
    }

    /* Active card */
    .active-card {
      background: #e8f5e9;
      border: 1.5px solid #a5d6a7;
      border-radius: 12px;
      padding: 14px 16px;
      cursor: pointer;
      position: relative;
    }
    .active-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 10px;
    }
    .active-title { font-weight: 700; font-size: 1.05rem; }
    .active-price { color: #2e7d32; font-weight: 600; }
    .active-bar { border-radius: 4px; margin-bottom: 4px; }
    .progress-text { font-size: 0.8rem; color: #555; }
    .active-cta {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #2e7d32;
    }

    /* Pending card */
    .pending-card {
      background: #fff8e1;
      border: 1.5px solid #ffe082;
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .pending-title { font-weight: 600; font-size: 1rem; }
    .pending-badge { font-size: 0.8rem; color: #f57f17; white-space: nowrap; }

    /* Available accordion */
    .card-title { font-weight: 600; font-size: 1rem; }
    .card-price { color: #2e7d32; font-weight: 600; justify-content: flex-end; }
    .subtask-list {
      margin: 0 0 16px;
      padding-right: 20px;
      color: #555;
    }
    .subtask-list li { margin-bottom: 6px; }
    .actions { display: flex; justify-content: flex-end; }
    .take-error { color: #c62828; font-size: 0.85rem; margin: 0 0 8px; }
    mat-spinner { display: inline-block; }
  `],
})
export class TasksBoardComponent implements OnInit {
  private cardService = inject(CardService);
  private auth        = inject(AuthService);
  private router      = inject(Router);

  activeCard    = signal<Card | null>(null);
  pendingCards  = signal<Card[]>([]);
  availableCards = signal<Card[]>([]);
  loading       = signal(true);
  error         = signal<string | null>(null);
  taking        = signal<Record<string, boolean>>({});
  takeError     = signal<Record<string, string>>({});

  activeDone     = computed(() => this.activeCard()?.subtasks.filter(s => s.done).length ?? 0);
  activeProgress = computed(() => {
    const c = this.activeCard();
    if (!c || !c.subtasks.length) return 0;
    return (this.activeDone() / c.subtasks.length) * 100;
  });

  ngOnInit(): void {
    const uid = this.auth.currentUser()?.id;
    this.cardService.getAll().subscribe({
      next: all => {
        this.activeCard.set(all.find(c => c.state === 'taken'   && c.takenBy === uid) ?? null);
        this.pendingCards.set(all.filter(c => c.state === 'pending'  && c.takenBy === uid));
        this.availableCards.set(all.filter(c => c.state === 'available'));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('שגיאה בטעינת המשימות');
        this.loading.set(false);
      },
    });
  }

  goToActive(): void {
    this.router.navigate(['/tasks', this.activeCard()!.id]);
  }

  takeCard(card: Card): void {
    this.taking.update(t => ({ ...t, [card.id]: true }));
    this.takeError.update(e => ({ ...e, [card.id]: '' }));

    this.cardService.takeCard(card.id).subscribe({
      next: updated => this.router.navigate(['/tasks', updated.id]),
      error: err => {
        const msg = err.status === 409 ? 'הכרטיס כבר נלקח' : 'שגיאה, נסה שוב';
        this.takeError.update(e => ({ ...e, [card.id]: msg }));
        this.taking.update(t => ({ ...t, [card.id]: false }));
        if (err.status === 409) {
          this.availableCards.update(list => list.filter(c => c.id !== card.id));
        }
      },
    });
  }
}
