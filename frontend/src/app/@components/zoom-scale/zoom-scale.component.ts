import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';

@Component({
  selector: 'app-zoom-scale',
  template: `
    <div class="zoom-container">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .zoom-container {
      width: 100%;
      min-width: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZoomScaleComponent {}
