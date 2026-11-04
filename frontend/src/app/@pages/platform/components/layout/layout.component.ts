import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  links: {label: string; url: string}[] = [
    {label: 'Overview', url: './overview'},
    {label: 'ROI', url: './roi'},
    {label: 'Presence', url: './presence'},
    {label: 'Engagement', url: './engagement'},
    {label: 'AI', url: './ai'},
    {label: 'Content', url: './content'},
    {label: 'Ads', url: './ads'},
    {label: 'Tracking', url: './tracking'},
    {label: 'Analytics', url: './analytics'},
    {label: 'Enablement', url: './enablement'},
    {label: 'Loyalty', url: './loyalty'},
    {label: 'Industries', url: './industries'},
    {label: 'Enterprise', url: './enterprise'},
    {label: 'Summary', url: './summary'},
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
