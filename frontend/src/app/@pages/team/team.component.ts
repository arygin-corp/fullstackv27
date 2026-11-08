import { Component } from '@angular/core';

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent {
  members: TeamMember[] = [
    { name: 'Omar Casas', role: 'Product Owner', image: 'assets/images/leadership/omar.jpg' },
    { name: 'Giovanni Austin', role: 'Principle Engineer II', image: 'assets/images/leadership/giovanni.jpg' },
    { name: 'Ajay Sreedharan', role: 'Scrum Master', image: 'assets/images/leadership/ajay.jpg' },
    { name: 'Shannon Clasen', role: 'Content Manager', image: 'assets/images/leadership/shannon.jpg' },
    { name: 'Hali Crutchfield', role: 'Data Analyst', image: 'assets/images/leadership/hali.jpg' },
    { name: 'Shivasanajana Narla', role: 'FullStack Engineer', image: 'assets/images/leadership/sanju.jpg' }
  ];
}
