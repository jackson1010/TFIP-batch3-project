import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { StorageServices } from './storageServices';

export const loginGuard: CanActivateFn = (route, state) => {
  const AutheSvc = inject(AuthService);
  const router = inject(Router);
  const storageService = inject(StorageServices);

  if (AutheSvc.haslogin()) {
    return true;
  }

  return router.createUrlTree(['index']);
};
