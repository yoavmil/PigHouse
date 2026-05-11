import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const user = inject(AuthService).currentUser();
  if (!user) return next(req);

  return next(req.clone({ setHeaders: { 'X-User-Id': user.id } }));
};
