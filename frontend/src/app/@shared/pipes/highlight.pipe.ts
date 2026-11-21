import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, query: string): SafeHtml {
    const text = value == null ? '' : String(value);
    const needle = (query || '').trim();
    if (!needle) {
      return text;
    }
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const highlightedValue = text.replace(
      new RegExp(`(${escaped})`, 'gi'),
      '<span style="color: #28a745;">$1</span>'
    );
    return this.sanitizer.bypassSecurityTrustHtml(highlightedValue);
  }
}