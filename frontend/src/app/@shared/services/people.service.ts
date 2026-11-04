import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { FormBuilder, FormControl } from '@angular/forms';

export interface User {
  id: string;
  displayName: string;
  givenName: string;
  surname: string;
  companyName: string;
  department: string;
  mail: string;
  accountEnabled: boolean;
}

interface UserDto {
  context: string;
  count: number;
  nextLink: string;
  value: User[];
}

@Injectable({
    providedIn: 'root'
})

export class PeopleService {
    @Input() control: FormControl;  // Changed from UntypedFormControl to FormControl
    userList = [];
    selectedUser: number;
    users: User[] = [];
    searchInput: string;
    inputValue: string;
    pageNo: number = 1;
    fieldHasFocus: boolean = false;
    response: UserDto = {          // object literal
        context: '',
        count: 0,
        nextLink: '',
        value: []
    };
  getUsersObservable: any;

    constructor(
        private http: HttpClient,
        public fb: FormBuilder  // Changed from UntypedFormBuilder to FormBuilder
        // Removed the duplicate fu parameter
    ) { }

    filterSeries(value: any) {
        this.getUsers(value);
        this.pageNo = 1
    }

    getUser() {
        return this.http.get<User[]>('');
    }

    getUsers(search = ''): Observable<User[]> {
        const url = `${environment.gdx.users}${encodeURIComponent(search)}`;
        return this.http.get<UserDto>(url).pipe(map(dto => dto.value || []));
    }

    onFocus() {
        this.response = {      
            context: '',
            count: 0,
            nextLink: '',
            value: []
        };
        this.fieldHasFocus = true;
    }

    onBlur() {
        this.fieldHasFocus = false;
    }

    onPageChange(event: number) {
        this.pageNo = event;
    }

    itemSelected(item: User) {
        this.fieldHasFocus = false;
        this.searchInput = item.id;
        this.inputValue = item.givenName + ' ' + item.surname + ' | ' + item.mail;
    }

    onSearch(item: any) {
        console.log('search called' + item.term);
    }

    userSearch(term: string, item: any) {
        console.log(item);
        console.log(term);
        return item.name.startsWith(term);
    }
}