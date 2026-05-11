import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  template: `
    <div class="placeholder" dir="rtl">
      <h2>ניהול משפחה</h2>
      <p>בקרוב...</p>
    </div>
  `,
  styles: [`
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: 8px;
      color: #888;
    }
    h2 { margin: 0; }
    p  { margin: 0; }
  `],
})
export class AdminComponent {}
