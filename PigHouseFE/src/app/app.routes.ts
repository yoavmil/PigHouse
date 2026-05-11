import { Routes } from '@angular/router';
import { LoginComponent }      from './features/auth/login';
import { RegisterComponent }   from './features/auth/register';
import { BoardComponent }      from './features/board/board';
import { TasksBoardComponent } from './features/tasks/tasks-board';
import { TaskDetailComponent } from './features/tasks/task-detail';

export const routes: Routes = [
  { path: '',           component: LoginComponent },
  { path: 'register',  component: RegisterComponent },
  { path: 'board',     component: BoardComponent },      // parent editor
  { path: 'tasks',     component: TasksBoardComponent }, // kid card list
  { path: 'tasks/:id', component: TaskDetailComponent }, // kid active task
  { path: '**',        redirectTo: '' },
];
