import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Changelog } from '../interfaces/changelog';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChangelogService {

  private apiUrl = `${environment.apiUrl}/api/changelog/public/releases/`;

  constructor(
    private http: HttpClient
  ) {}

  getChangelogs(): Observable<Changelog[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response =>
        response.results.map((release: any) => ({
          ...release,
          sections: release.sections.map((section: any) => ({
            category: section.category,
            subtitle: section.subtitle,
            content: section.html
          }))
        }))
      )
    );
  }
}

// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { Changelog } from '../interfaces/changelog';
// import { environment } from 'src/environments/environment';

// @Injectable({
//   providedIn: 'root'
// })
// export class ChangelogService {
//   private apiUrl = `${environment.apiUrl}/api/changelog/public/releases/`;

//   constructor(
//     private http: HttpClient
//   ) { }

//   getChangelogs(): Observable<Changelog[]> {
//     return this.http.get<Changelog[]>(this.apiUrl);
//   }
// }