import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-popover',
  templateUrl: './product-popover.component.html',
  styleUrls: ['./product-popover.component.scss']
})
export class ProductPopoverComponent implements OnInit {
  private readonly BASE_API_URL:string=`${environment.gdx.baseURL}`;
  @Input() message: string;
  @Input() name: string;

  showPopA = true;
  showModalPopA = false;
  
  constructor(
    public router: Router,
  ) {}

  ngOnInit(): void {}
 
  ShowPopover(index: string): void {
    switch(index){
      case "A":{
        this.showPopA = !this.showPopA;
        if(this.showModalPopA)
          this.showPopA = false;
      }    
    }
  }

  ShowModalPopup(index: string): void {
    switch(index){
      case "A":{
        this.showPopA = false;
        this.showModalPopA = true;
        break;
      } 
    }
  }

  HideModalPopup(index: string):void {
    switch(index){
      case "A":{
        this.showModalPopA = false;
        break;
      } 
    }
  }
}
