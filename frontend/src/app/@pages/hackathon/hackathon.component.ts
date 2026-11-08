import { Component } from '@angular/core';

@Component({
  selector: 'app-hackathon',
  templateUrl: './hackathon.component.html',
  styleUrls: ['./hackathon.component.scss']
})
export class HackathonComponent {
  readonly year = new Date().getFullYear();
  readonly scores = [
    { label: 'Functionality and user experience', value: 40 },
    { label: 'Value, differentiation and innovation', value: 25 },
    { label: 'Roadmap, vision and clarity', value: 20 },
    { label: 'Technical feasibility', value: 10 },
    { label: 'Financial feasibility', value: 5 }
  ];
  readonly groups = [
    'GAIA for Manufacturing',
    'Equipment Data Collection (EDC)',
    'Connected Control Plan (CCP)',
    'Process Master',
    'GEMS'
  ];
  readonly partners = ['AWS', 'Google', 'Claude'];
  readonly gallery = [
    'Teams collaborating',
    'Coding and prototype development',
    'Technology demonstrations',
    'Beehive activity',
    'Judges and team presentations',
    'Prototype close-ups',
    'Team celebrations',
    'Closing and awards'
  ];
  readonly videos = [
    {
      title: 'Event highlights',
      text: 'Experience the energy of SWARM.',
      cta: 'Watch Event Highlights',
      url: 'https://myteams.toyota.com/sites/NA-116/SitePages/Videos.aspx?web=1'
    },
    {
      title: 'GEMS at SWARM',
      text: 'Hear the GEMS team’s favorite moments, new connections and takeaways from the event.',
      cta: 'Watch the GEMS SWARM Recap',
      url: 'https://engage.cloud.microsoft/main/threads/eyJfdHlwZSI6IlRocmVhZCIsImlkIjoiNDEwMDY1NTc1NzM2MTE1MiJ9'
    },
    {
      title: 'Tech Talk',
      text: 'Take a deeper dive into the technologies and expertise available to SWARM participants.',
      cta: `Watch ${new Date().getFullYear()} Tech Talks`,
      url: 'https://myteams.toyota.com/sites/NA-116/SitePages/Participant%20Information.aspx?web=1'
    }
  ];
}
