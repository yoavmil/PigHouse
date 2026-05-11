import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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
  private authService = inject(AuthService);

  nameControl = new FormControl('', [Validators.required, Validators.minLength(2)]);

  ngOnInit(): void {
    if (this.authService.currentUser()) {
      this.router.navigate(['/board']);
    }
  }

  login(): void {
    // TODO: wire up to backend
  }

  createFamily(): void {
    // TODO: wire up to backend
  }
}
