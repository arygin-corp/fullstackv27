import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, query: string): SafeHtml {
    if (!query) return value;
    
    // Create a regular expression to find the query (case-insensitive)
    const re = new RegExp(`(${query})`, 'gi');
    
    // Wrap matches in <b> tags with a specific color if desired
    const highlightedValue = value.replace(re, '<span style="color: #28a745;">$1</span>');
    
    return this.sanitizer.bypassSecurityTrustHtml(highlightedValue);
  }
}