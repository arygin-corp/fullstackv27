import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Newsroom } from '../interfaces/newsroom';
import { environment } from 'src/environments/environment';

interface NewsroomPage {
  results: Newsroom[];
}

@Injectable({ providedIn: 'root' })
export class NewsroomService {
  private apiUrl = `${environment.apiUrl}/api/site/newsroom/`;
  private posts: Newsroom[] = [];

  private selectedCategorySubject = new BehaviorSubject<string | null>(null);
  selectedCategory$ = this.selectedCategorySubject.asObservable();

  constructor(private http: HttpClient) {}

  setSelectedCategory(cat: string | null) {
    this.selectedCategorySubject.next(cat);
  }

  getNewsroom(): Observable<Newsroom[]> {
    return this.http.get<NewsroomPage>(this.apiUrl).pipe(
      map(page => (page.results || []).map(item => this.normalize(item))),
      tap(posts => { this.posts = posts; }),
      catchError(() => of([]))
    );
  }

  getNewsroomBySlug(slug: string): Observable<Newsroom | undefined> {
    const cached = this.posts.find(item => item.slug === slug);
    if (cached) {
      return of(cached);
    }
    return this.http.get<Newsroom>(`${this.apiUrl}${encodeURIComponent(slug)}/`).pipe(
      map(item => this.normalize(item)),
      catchError(() => of(undefined))
    );
  }

  getNewsroomById(id: string): Newsroom | undefined {
    return this.posts.find(item => item.id === id);
  }

  getByCategory(category: string): Newsroom[] {
    return this.posts.filter(item => item.category === category);
  }

  search(query: string): Newsroom[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return this.posts;
    }
    return this.posts.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      (item.content && item.content.toLowerCase().includes(q))
    );
  }

  private normalize(item: Newsroom): Newsroom {
    return {
      ...item,
      id: String(item.id),
      image: item.image || 'assets/images/cover/default.jpg',
      authorImage: item.authorImage || 'assets/icons/android-chrome-512x512.png',
    };
  }
}
