import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class StoreService {
    address = '6565 Headquarters Dr, Plano, TX 75024 | USA';
    email = 'datamarketplace@toyota.com';
    phone = ['(800) 060-0730' + ' | ' + '(800) 060-0730'];
    hours = 'Mon - Fri | 9:00AM - 5:00PM EST';

    get primaryPhone(): string|null {
        return this.phone.length > 0 ? this.phone[0] : null;
    }

    constructor() { }
}
