export interface SampleData {
    sampleid: number;
    axonid: number;
    name: string;
    value: string;
    sort: string;
    // Add these optional properties
    showPop?: boolean;
    popupText?: string;
    popupName?: string;
}