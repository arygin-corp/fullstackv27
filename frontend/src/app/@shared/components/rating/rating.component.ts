import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-rating',
    templateUrl: './rating.component.html',
    styleUrls: ['./rating.component.scss']
})
export class RatingComponent {
    @Input() value = 0;
    @Input() interactive = false;
    @Output() valueChange = new EventEmitter<number>();

    pick(star: number): void {
        if (!this.interactive) {
            return;
        }
        this.value = star;
        this.valueChange.emit(star);
    }
}
