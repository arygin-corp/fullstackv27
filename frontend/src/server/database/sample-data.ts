import { SampleDataDef } from '../interfaces/sample-data-def';
import { SampleData } from '../../app/@shared/interfaces/sample-data';
import { Observable, of } from 'rxjs';

let lastSampleDataId = 0;

const sampleDataDef: SampleDataDef[] = [];

export const sampleData: SampleData[] = sampleDataDef.map(SampleDataDef => {
    return {
        ...SampleDataDef,
        id: ++lastSampleDataId,
    };
});

export function getSampleData(): Observable<SampleData[]> {
    return of(sampleData);
}

