import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {
  docURL = 'assets/docs/protected/TDSP_Data_Access_Onboarding.pdf';
  constructor() { }

  ngOnInit(): void {
  }

}
