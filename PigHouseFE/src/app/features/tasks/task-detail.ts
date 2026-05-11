import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CardService } from '../../core/services/card.service';
import { Card } from 'shared/types';

@Component({
  selector: 'app-task-detail',
  imports: [MatCheckboxModule, MatProgressBarModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="container" dir="rtl">

      <button mat-icon-button class="back-btn" (click)="back()">
        <mat-icon>arrow_forward</mat-icon>
      </button>

      @if (loading()) {
        <div class="center"><mat-spinner diameter="48" /></div>
      } @else if (error()) {
        <p class="error">{{ error() }}</p>
      } @else if (card()) {

        <h2 class="title">{{ card()!.title }}</h2>

        <div class="progress-row">
          <mat-progress-bar mode="determinate" [value]="progress()" />
          <span class="progress-label">{{ doneCount() }}/{{ card()!.subtasks.length }}</span>
        </div>

        <ul class="subtask-list">
          @for (sub of card()!.subtasks; track sub.id) {
            <li class="subtask-item">
              <mat-checkbox
                [checked]="sub.done"
                (change)="toggle(sub.id, $event.checked)"
                color="primary">
                <span [class.done-text]="sub.done">{{ sub.text }}</span>
              </mat-checkbox>
            </li>
          }
        </ul>

        @if (submitError()) {
          <p class="error">{{ submitError() }}</p>
        }
        @if (giveUpError()) {
          <p class="error">{{ giveUpError() }}</p>
        }

        <button mat-flat-button color="primary" class="done-btn"
                [disabled]="!allDone() || submitting()"
                (click)="markDone()">
          @if (submitting()) {
            <mat-spinner diameter="20" />
          } @else {
            סיימתי! 🐷
          }
        </button>

        <button mat-stroked-button color="warn" class="give-up-btn"
                [disabled]="givingUp()"
                (click)="giveUp()">
          @if (givingUp()) {
            <mat-spinner diameter="20" />
          } @else {
            ויתרתי
          }
        </button>

      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 16px;
    }
    .back-btn { margin-bottom: 8px; }
    .center { display: flex; justify-content: center; padding: 48px 0; }
    .title {
      text-align: center;
      font-size: 1.5rem;
      margin: 0 0 16px;
    }
    .progress-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .progress-row mat-progress-bar { flex: 1; height: 10px; border-radius: 5px; }
    .progress-label { font-size: 0.9rem; color: #555; white-space: nowrap; }
    .subtask-list {
      list-style: none;
      padding: 0;
      margin: 0 0 32px;
    }
    .subtask-item {
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 1.05rem;
    }
    .done-text {
      text-decoration: line-through;
      color: #aaa;
    }
    .done-btn {
      width: 100%;
      font-size: 1.1rem;
      padding: 12px;
      height: auto;
    }
    .give-up-btn {
      width: 100%;
      margin-top: 10px;
      font-size: 1rem;
      padding: 10px;
      height: auto;
    }
    .error { color: #c62828; text-align: center; }
    mat-spinner { display: inline-block; }
  `],
})
export class TaskDetailComponent implements OnInit {
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);
  private cardService = inject(CardService);

  card        = signal<Card | null>(null);
  loading     = signal(true);
  error       = signal<string | null>(null);
  submitting  = signal(false);
  submitError = signal<string | null>(null);
  givingUp    = signal(false);
  giveUpError = signal<string | null>(null);

  doneCount = computed(() => this.card()?.subtasks.filter(s => s.done).length ?? 0);
  allDone   = computed(() => { const c = this.card(); return !!c && c.subtasks.length > 0 && this.doneCount() === c.subtasks.length; });
  progress  = computed(() => {
    const c = this.card();
    if (!c || !c.subtasks.length) return 0;
    return (this.doneCount() / c.subtasks.length) * 100;
  });

  private get cardId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.cardService.getById(this.cardId).subscribe({
      next:  card => { this.card.set(card); this.loading.set(false); },
      error: ()   => { this.error.set('שגיאה בטעינת המשימה'); this.loading.set(false); },
    });
  }

  toggle(subtaskId: string, done: boolean): void {
    this.card.update(c => c
      ? { ...c, subtasks: c.subtasks.map(s => s.id === subtaskId ? { ...s, done } : s) }
      : c
    );
    this.cardService.toggleSubtask(this.cardId, subtaskId, done).subscribe({
      error: () => {
        this.card.update(c => c
          ? { ...c, subtasks: c.subtasks.map(s => s.id === subtaskId ? { ...s, done: !done } : s) }
          : c
        );
      },
    });
  }

  markDone(): void {
    this.submitting.set(true);
    this.submitError.set(null);
    this.cardService.markPending(this.cardId).subscribe({
      next:  () => this.router.navigate(['/tasks']),
      error: () => {
        this.submitError.set('שגיאה, נסה שוב');
        this.submitting.set(false);
      },
    });
  }

  giveUp(): void {
    this.givingUp.set(true);
    this.giveUpError.set(null);
    this.cardService.giveUpCard(this.cardId).subscribe({
      next:  () => this.router.navigate(['/tasks']),
      error: () => {
        this.giveUpError.set('שגיאה, נסה שוב');
        this.givingUp.set(false);
      },
    });
  }

  back(): void {
    this.router.navigate(['/tasks']);
  }
}
