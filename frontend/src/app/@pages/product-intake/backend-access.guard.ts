import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { BackendAccessService } from '../../@shared/services/backend-access.service';

@Injectable({ providedIn: 'root' })
export class BackendAccessGuard implements CanActivate {
  constructor(
    private access: BackendAccessService,
    private router: Router,
  ) {}

  canActivate(): Promise<boolean | UrlTree> {
    return this.access.load().then(allowed => allowed || this.router.parseUrl('/'));
  }
}
