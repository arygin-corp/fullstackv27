import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Page } from '../interfaces/pages';

@Injectable({
    providedIn: 'root'
})

export class PagesService {
    constructor(
        private http: HttpClient
    ) {}

    getPage(slug: string) {
        return this.http.get<Page>(`${environment.apiUrl}/api/pages/public/by-slug/${slug}/`);
    }
}