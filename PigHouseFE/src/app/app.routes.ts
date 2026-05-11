import { Routes } from '@angular/router';
import { LoginComponent }       from './features/auth/login';
import { RegisterComponent }    from './features/auth/register';
import { BoardComponent }       from './features/board/board';
import { KidsStatsComponent }   from './features/kids-stats/kids-stats';
import { AdminComponent }       from './features/admin/admin';
import { TasksBoardComponent }  from './features/tasks/tasks-board';
import { TaskDetailComponent }  from './features/tasks/task-detail';
import { parentGuard }          from './core/auth/parent.guard';

export const routes: Routes = [
  { path: '',           component: LoginComponent },
  { path: 'register',  component: RegisterComponent },
  { path: 'board',     component: BoardComponent,      canActivate: [parentGuard] },
  { path: 'kids',      component: KidsStatsComponent,  canActivate: [parentGuard] },
  { path: 'admin',     component: AdminComponent,      canActivate: [parentGuard] },
  { path: 'tasks',     component: TasksBoardComponent },
  { path: 'tasks/:id', component: TaskDetailComponent },
  { path: '**',        redirectTo: '' },
];
