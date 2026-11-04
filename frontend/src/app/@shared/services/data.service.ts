import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map'

export interface Person {
    id: string;
    isActive: boolean;
    age: number;
    name: string;
    gender: string;
    company: string;
    email: string;
    phone: string;
    disabled?: boolean;
}

@Injectable({
    providedIn: 'root'
})

export class DataService {
    constructor(private http: HttpClient) { }

    getAlbums() {
        return this.http.get<Person[]>('https://mocki.io/v1/a550d172-0f75-44a3-9afd-cd5d544a7b95');
    }

    getAlbums2() {
        return this.http.get<Person[]>('https://mocki.io/v1/a550d172-0f75-44a3-9afd-cd5d544a7b95');
    }
}