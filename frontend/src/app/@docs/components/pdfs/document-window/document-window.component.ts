import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-document-window',
  template: `
    <div class="document-window" *ngIf="safeUrl">
      <iframe [src]="safeUrl" title="Document"></iframe>
    </div>
  `,
  styles: [`
    .document-window { height: calc(100vh - 220px); min-height: 640px; }
    iframe { width: 100%; height: 100%; border: 0; background: #fff; }
  `]
})
export class DocumentWindowComponent implements OnInit {
  safeUrl: SafeResourceUrl;

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    const url = this.route.snapshot.queryParamMap.get('url') || '';
    if (/^https?:\/\//i.test(url)) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }
}
