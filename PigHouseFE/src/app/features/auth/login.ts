import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  private router = inject(Router);
  private auth   = inject(AuthService);

  error   = signal<string | null>(null);
  loading = signal(false);

  form = new FormGroup({
    familyName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    userName:   new FormControl('', [Validators.required, Validators.minLength(2)]),
  });

  ngOnInit(): void {
    if (this.auth.currentUser()) {
      this.router.navigate(['/board']);
    }
  }

  login(): void {
    if (this.form.invalid || this.loading()) return;

    const familyName = this.form.value.familyName!.trim();
    const userName   = this.form.value.userName!.trim();
    this.loading.set(true);
    this.error.set(null);

    this.auth.login({ familyName, userName }).subscribe({
      next: res => this.router.navigate([res.user.role === 'parent' ? '/board' : '/tasks']),
      error: err => {
        this.error.set(err.error?.error ?? 'שם משפחה או שם משתמש שגויים');
        this.loading.set(false);
      },
    });
  }

  createFamily(): void {
    this.router.navigate(['/register']);
  }
}
