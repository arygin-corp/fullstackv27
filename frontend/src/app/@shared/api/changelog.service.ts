import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../interfaces/category';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // Assuming environment file exists

@Injectable({
    providedIn: 'root'
})
export class ChangelogService {
    private readonly apiBase = `${environment.apiUrl}/changelog`;

    constructor(private http: HttpClient) { }

    getCategories(parent: Partial<Category> | null = null, depth: number = 0): Observable<Category[]> {
        let params = new HttpParams();
        if (parent?.slug) params = params.set('parent', parent.slug);
        params = params.set('depth', depth.toString());

        return this.http.get<Category[]>(`${this.apiBase}/categories/`, { params });
    }
}