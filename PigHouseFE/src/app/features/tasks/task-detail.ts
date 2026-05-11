import { Component } from '@angular/core';

@Component({
  selector: 'app-task-detail',
  template: `
    <div class="placeholder">
      <span class="pig-emoji">📋</span>
      <h2>המשימה שלי</h2>
      <p>כאן תופיע רשימת הצ׳קליסט של המשימה הנוכחית</p>
    </div>
  `,
  styles: [`
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 12px;
      direction: rtl;
      color: #555;
    }
    .pig-emoji { font-size: 64px; margin-bottom: 3rem; }
    h2 { margin: 0; font-size: 1.5rem; }
    p  { margin: 0; color: #888; }
  `],
})
export class TaskDetailComponent {}
