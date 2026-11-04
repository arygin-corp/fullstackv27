import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZoomDetectionService {
  readonly zoomLevel$: Observable<number> = of(100);
  readonly isZoomed$: Observable<boolean> = of(false);
  readonly scaleAdjustment$: Observable<number> = of(1);

  getCurrentZoomLevel(): number {
    return 100;
  }

  isZoomedAboveThreshold(): boolean {
    return false;
  }

  getScaleAdjustment(): number {
    return 1;
  }

  setZoomThreshold(_threshold: number): void {
    // Intentionally unused.
    // Browser zoom should not be counteracted by application scaling.
  }
}