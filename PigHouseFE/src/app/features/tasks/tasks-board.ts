import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { CardService } from '../../core/services/card.service';
import { Card } from 'shared/types';

@Component({
  selector: 'app-tasks-board',
  imports: [MatExpansionModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  template: `
    <div class="container" dir="rtl">
      <h2 class="page-title">המשימות שלי</h2>

      @if (loading()) {
        <div class="center"><mat-spinner diameter="48" /></div>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else if (cards().length === 0) {
        <p class="empty">אין משימות פנויות כרגע 🐷</p>
      } @else {
        <mat-accordion>
          @for (card of cards(); track card.id) {
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
      margin-bottom: 16px;
      font-size: 1.4rem;
    }
    .center { display: flex; justify-content: center; padding: 48px 0; }
    .empty, .error { text-align: center; color: #888; margin-top: 48px; }
    .error { color: #c62828; }
    .card-title { font-weight: 600; font-size: 1rem; }
    .card-price { color: #2e7d32; font-weight: 600; justify-content: flex-end; }
    .subtask-list {
      margin: 0 0 16px 0;
      padding-right: 20px;
      color: #555;
    }
    .subtask-list li { margin-bottom: 6px; }
    .actions { display: flex; justify-content: flex-end; }
    .take-error { color: #c62828; font-size: 0.85rem; margin: 0 0 8px 0; }
    mat-spinner { display: inline-block; }
  `],
})
export class TasksBoardComponent implements OnInit {
  private cardService = inject(CardService);
  private router      = inject(Router);

  cards   = signal<Card[]>([]);
  loading = signal(true);
  error   = signal<string | null>(null);
  taking  = signal<Record<string, boolean>>({});
  takeError = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.cardService.getAll().subscribe({
      next: all => {
        this.cards.set(all.filter(c => c.state === 'available'));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('שגיאה בטעינת המשימות');
        this.loading.set(false);
      },
    });
  }

  takeCard(card: Card): void {
    this.taking.update(t => ({ ...t, [card.id]: true }));
    this.takeError.update(e => ({ ...e, [card.id]: '' }));

    this.cardService.takeCard(card.id).subscribe({
      next: updated => {
        this.router.navigate(['/tasks', updated.id]);
      },
      error: err => {
        const msg = err.status === 409
          ? 'הכרטיס כבר נלקח'
          : 'שגיאה, נסה שוב';
        this.takeError.update(e => ({ ...e, [card.id]: msg }));
        this.taking.update(t => ({ ...t, [card.id]: false }));

        if (err.status === 409) {
          this.cards.update(list => list.filter(c => c.id !== card.id));
        }
      },
    });
  }
}
