import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserActivityService } from './user-activity.service';

@Injectable({ providedIn: 'root' })
export class BackendAccessService {
  readonly allowed$ = new BehaviorSubject<boolean>(false);
  private pending?: Promise<boolean>;

  constructor(
    private http: HttpClient,
    private activity: UserActivityService,
  ) {}

  load(): Promise<boolean> {
    if (!this.pending) {
      this.pending = this.resolve();
    }
    return this.pending;
  }

  private async resolve(): Promise<boolean> {
    let headers = await this.activity.authorizationHeaders();
    for (let attempt = 0; !headers && attempt < 10; attempt += 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
      headers = await this.activity.authorizationHeaders();
    }
    if (!headers) {
      this.allowed$.next(false);
      this.pending = undefined;
      return false;
    }
    return new Promise<boolean>(resolve => {
      this.http.get<{ can_access_backend?: boolean }>(`${environment.apiUrl}/api/profiles/me/`, { headers }).subscribe({
        next: profile => {
          const allowed = !!profile?.can_access_backend;
          this.allowed$.next(allowed);
          resolve(allowed);
        },
        error: () => {
          this.allowed$.next(false);
          resolve(false);
        }
      });
    });
  }
}
