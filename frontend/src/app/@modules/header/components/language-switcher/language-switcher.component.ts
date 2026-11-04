import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss']
})
export class LanguageSwitcherComponent implements OnInit {
  isDropdownOpen = false;

  languages = [
    { code: 'en', name: 'English', flag: 'assets/images/languages/en.svg' },
    { code: 'es', name: 'Spanish', flag: 'assets/images/languages/es.svg' },
    { code: 'fr', name: 'French', flag: 'assets/images/languages/fr.svg' },
    { code: 'ja', name: 'Japanese', flag: 'assets/images/languages/ja.svg' }
  ];
  selectedLanguage = this.languages[0];

  constructor() { }

  ngOnInit(): void {
    this.loadGoogleTranslate();
  }

  loadGoogleTranslate() {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    (window as any)['googleTranslateElementInit'] = () => {
      (new (window as any).google.translate.TranslateElement({
        pageLanguage: 'en',
        layout: (window as any).google.translate.TranslateElement
      }, 'google_translate_element'));
    };
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectLanguage(lang: any) {
    this.selectedLanguage = lang;
    this.isDropdownOpen = false;
    this.translateLanguage(lang.code);
  }

  translateLanguage(language: string) {
    // Function to find and trigger the hidden Google Translate dropdown
    const triggerTranslation = () => {
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (combo) {
        combo.value = language;
        combo.dispatchEvent(new Event('change')); // Triggers the actual translation
      }
    };

    // Force execution. If the combo isn't ready yet, we try again shortly.
    triggerTranslation();
    
    // Safety timeout to ensure translation triggers even if the widget was re-rendering
    setTimeout(() => triggerTranslation(), 100);
  }
}