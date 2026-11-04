import { Component } from '@angular/core';

@Component({
    selector: 'app-faq',
    templateUrl: './page-faq.component.html',
    styleUrls: ['./page-faq.component.scss']
})
export class PageFaqComponent {
    
    constructor() { }

    data: any = [
        {
            "parentName": "Parent One",
            "childProperties":
            [
                { "propertyName": "Property One" }
            ]
        }, 
        {
            "parentName": "Parent Two",
            "childProperties":
            [
                { "propertyName": "Property Three" }
            ]
        }, 
        {
            "parentName": "Parent Three",
            "childProperties":
            [
                { "propertyName": "Property Six" }
            ]
        }
    ];
    
    toggleAccordian(event, index) {
        const element = event.target;
        element.classList.toggle("active");
        if (this.data[index].isActive) {
            this.data[index].isActive = false;
        } else {
            this.data[index].isActive = true;
        }
        const panel = element.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
        }
    }
}
