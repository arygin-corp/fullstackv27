import { Component } from '@angular/core';
import { DirectionService } from '../../@shared/services/direction.service';
import { team } from 'src/data/team/team';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})

export class TeamComponent {
  team = team;

  carouselOptions = {
    nav: false,
    dots: true,
    responsive: {
      580: {items: 6, margin: 32},
      480: {items: 4, margin: 24},
      280: {items: 2, margin: 24},
      0: {items: 1}
    },
    rtl: this.direction.isRTL()
  };

  carouselOptions2 = {
    nav: false,
    dots: true,
    responsive: {
      580: {items: 6, margin: 32},
      480: {items: 4, margin: 24},
      280: {items: 2, margin: 24},
      0: {items: 1}
    },
    rtl: this.direction.isRTL()
  };

  carouselOptionsDefault = {
    nav: false,
    dots: true,
    responsive: {
        580: {items: 6, margin: 32},
        280: {items: 2, margin: 24},
        0: {items: 1}
    },
    rtl: this.direction.isRTL()
  };

  constructor(
      private direction: DirectionService
  ) { 
    
  }

}
