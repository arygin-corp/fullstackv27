import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';
import { expand, map, reduce } from 'rxjs/operators';
import { Changelog } from '../interfaces/changelog';
import { environment } from 'src/environments/environment';

interface ChangelogPage {
  next_page: number | null;
  results: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ChangelogService {

  private apiUrl = `${environment.apiUrl}/api/changelog/public/releases/`;

  constructor(
    private http: HttpClient
  ) {}

  getChangelogs(): Observable<Changelog[]> {
    return this.fetchPage(1).pipe(
      expand(page => page.next_page ? this.fetchPage(page.next_page) : EMPTY),
      map(page => page.results.map(release => this.toChangelog(release))),
      reduce((all, releases) => all.concat(releases), [] as Changelog[]),
    );
  }

  private fetchPage(page: number): Observable<ChangelogPage> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('page_size', '100');
    return this.http.get<ChangelogPage>(this.apiUrl, { params });
  }

  private toChangelog(release: any): Changelog {
    const sections = Array.isArray(release.sections) ? release.sections : [];
    return {
      ...release,
      sections: sections.map((section: any) => ({
        category: section.category,
        subtitle: section.subtitle,
        content: section.html
      }))
    };
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