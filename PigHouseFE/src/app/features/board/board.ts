import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { Card, CardState } from 'shared/types';
import { CardService } from '../../core/services/card.service';
import { ApprovalsService } from '../../core/services/approvals.service';

type SubtaskControl = FormControl<string | null>;
type CardGroup = FormGroup<{
  title:    FormControl<string | null>;
  price:    FormControl<number | null>;
  state:    FormControl<CardState | null>;
  subtasks: FormArray<SubtaskControl>;
}>;

@Component({
  selector: 'app-board',
  imports: [
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinner,
  ],
  templateUrl: './board.html',
  styleUrl:    './board.css',
})
export class BoardComponent {
  private cardService      = inject(CardService);
  private approvalsService = inject(ApprovalsService);
  private router           = inject(Router);
  private destroyRef       = inject(DestroyRef);

  loading            = signal(true);
  error              = signal<string | null>(null);
  confirmDeleteIndex = signal<number | null>(null);

  cardIds: string[]       = [];
  cards = new FormArray<CardGroup>([]);

  constructor() {
    this.cardService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next:  cards => { cards.forEach(c => this.pushCard(c)); this.loading.set(false); },
        error: ()    => { this.error.set('שגיאה בטעינת הכרטיסים'); this.loading.set(false); },
      });
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  private pushCard(card: Card): void {
    const group = new FormGroup({
      title:    new FormControl<string | null>(card.title),
      price:    new FormControl<number | null>(card.price),
      state:    new FormControl<CardState | null>(card.state),
      subtasks: new FormArray<SubtaskControl>(
        [...card.subtasks.map(s => s.text), ''].map(t => new FormControl(t))
      ),
    });

    this.cardIds.push(card.id);
    this.cards.push(group);

    group.valueChanges.pipe(
      debounceTime(800),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => this.saveCard(card.id));
  }

  private saveCard(id: string): void {
    const ci = this.cardIds.indexOf(id);
    if (ci === -1) return;

    const { title, price, state, subtasks } = this.cards.at(ci).value;
    const filteredSubtasks = (subtasks ?? [])
      .filter(t => !!t?.trim())
      .map(text => ({ text: text! }));

    this.cardService.update(id, { title: title ?? '', price: price ?? 0, state: state ?? undefined, subtasks: filteredSubtasks })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  getSubtasks(ci: number): FormArray<SubtaskControl> {
    return this.cards.at(ci).controls.subtasks;
  }

  cardTitle(ci: number): string {
    return this.cards.at(ci).controls.title.value?.trim() || 'כרטיס חדש';
  }

  // ── subtask events ─────────────────────────────────────────────────────────

  onSubtaskInput(ci: number, si: number): void {
    const subtasks = this.getSubtasks(ci);
    if (si === subtasks.length - 1 && subtasks.at(si).value) {
      subtasks.push(new FormControl(''));
    }
  }

  onSubtaskBlur(ci: number, si: number): void {
    const subtasks = this.getSubtasks(ci);
    const isLast   = si === subtasks.length - 1;
    if (!isLast && !subtasks.at(si).value?.trim()) {
      subtasks.removeAt(si);
    }
  }

  // ── card actions ───────────────────────────────────────────────────────────

  addCard(): void {
    this.cardService.create({ title: '', price: 10, subtasks: [] })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: card => this.pushCard(card) });
  }

  goToKids(): void { this.router.navigate(['/kids']); }

  approve(ci: number, event: MouseEvent): void {
    event.stopPropagation();
    const id = this.cardIds[ci];
    this.approvalsService.approve(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cards.at(ci).controls.state.setValue('suspended', { emitEvent: false });
        },
      });
  }

  requestDelete(ci: number): void { this.confirmDeleteIndex.set(ci); }
  cancelDelete():  void           { this.confirmDeleteIndex.set(null); }

  confirmDelete(ci: number): void {
    const id = this.cardIds[ci];
    this.cardService.delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.cards.removeAt(ci);
          this.cardIds.splice(ci, 1);
          this.confirmDeleteIndex.set(null);
        },
      });
  }
}
