import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private router  = inject(Router);
  private auth    = inject(AuthService);

  error   = signal<string | null>(null);
  loading = signal(false);

  form = new FormGroup({
    familyName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    dadName:    new FormControl('', [Validators.required, Validators.minLength(2)]),
    momName:    new FormControl('', [Validators.required, Validators.minLength(2)]),
    kidCount:   new FormControl<number>(1, [Validators.required, Validators.min(1), Validators.max(10)]),
    kids:       new FormArray<FormControl<string | null>>(
      [new FormControl('', Validators.required)]
    ),
  });

  get kids()     { return this.form.controls.kids; }
  get kidCount() { return this.form.controls.kidCount; }

  kidControl(i: number): FormControl<string | null> {
    return this.kids.at(i) as FormControl<string | null>;
  }

  constructor() {
    this.kidCount.valueChanges.subscribe(count => {
      const n = count ?? 1;
      while (this.kids.length < n) this.kids.push(new FormControl('', Validators.required));
      while (this.kids.length > n) this.kids.removeAt(this.kids.length - 1);
    });
  }

  register(): void {
    if (this.form.invalid || this.loading()) return;

    const { familyName, dadName, momName, kids } = this.form.value;
    const kidNames = (kids ?? []).filter((n): n is string => !!n);

    this.loading.set(true);
    this.error.set(null);

    this.auth.register({
      familyName: familyName!,
      dadName:    dadName!,
      momName:    momName!,
      kidNames,
    }).subscribe({
      next: () => this.router.navigate(['/board']),
      error: err => {
        this.error.set(err.error?.error ?? 'שגיאה ביצירת המשפחה');
        this.loading.set(false);
      },
    });
  }

  back(): void {
    this.router.navigate(['/']);
  }
}
