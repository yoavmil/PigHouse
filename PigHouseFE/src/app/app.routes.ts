import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login';
import { RegisterComponent } from './features/auth/register';

export const routes: Routes = [
  { path: '',         component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**',       redirectTo: '' },
];
