import { TeamDef } from '../interfaces/team-def';
import { Team } from '../../app/@shared/interfaces/team';
import { Observable, of } from 'rxjs';

let lastTeamId = 0;

const teamsDef: TeamDef[] = [
    { name: 'Data Marketplace Team', slug: 'data-marketplace-team', image: 'assets/images/logos/logo-1.png' },
    { name: 'EIG API Support Team', slug: 'eig-api-support-team', image: 'assets/images/logos/logo-2.png' },
];

export const teams: Team[] = teamsDef.map(teamDef => {
    return {
        ...teamDef,
        id: ++lastTeamId,
    };
});

export function getTeamss(): Observable<Team[]> {
    return of(teams);
}

