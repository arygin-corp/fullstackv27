import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab-layout',
  templateUrl: './tab-layout.component.html',
  styleUrls: ['./tab-layout.component.scss']
})

export class TabLayoutComponent implements OnInit {
  links: {label: string; url: string}[] = [
    { label: 'Resources', url: './' },
    { label: 'Brands', url: './brands' },
    { label: 'Documents', url: './docs' },
    { label: 'Policies', url: './policies' },
    { label: 'Processes', url: './processes' },
    { label: 'Media', url: './media' },
    { label: 'Mind Map', url: './mind-map' },
  ];

  constructor() { }

  ngOnInit(): void {
  }

}