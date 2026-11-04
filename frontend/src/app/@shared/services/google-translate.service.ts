import { Injectable } from '@angular/core';

declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleTranslateService {

  constructor() { }

  loadGoogleTranslate(): void {
    if (typeof google !== 'undefined') {
      new google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element');
    }
  }
}