import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss']
})
export class MultiSelectComponent implements OnInit {
  itemList: { id: number; itemName: string; name: string; }[] = [];
  selectedItems: { id: number; itemName: string; name: string; }[] = [];
  settings = {};
  count = 6;

  constructor() { }

  ngOnInit() {
    this.itemList = [
      {"id":1,"itemName":"Data","name":"IN"},
      {"id":2,"itemName":"Singapore","name":"SN"},
      {"id":3,"itemName":"Australia","name":"AU"},
      {"id":4,"itemName":"Canada","name":"CA"},
      {"id":5,"itemName":"South Korea","name":"SK"},    
      {"id":6,"itemName":"Brazil","name":"BR"}    
    ];

    this.selectedItems = [];

    this.settings = {
      singleSelection: false,
      position: 'bottom',
      text: "Select Tags or Add Additional Tags",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      addNewItemOnFilter: true,
      lazyLoading: true,
      noDataLabel: 'No Data Available'
    };

  }
  
  onAddItem(data:string){
    this.count++;
    this.itemList.push({"id": this.count,"itemName":data,"name":data});
    this.selectedItems.push({"id": this.count,"itemName":data,"name":data});
  }
  onItemSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems);
  }
  OnItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  onDeSelectAll(items: any) {
    console.log(items);
  }

}
