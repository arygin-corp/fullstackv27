import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppService } from '../../../../app/@shared/services/app.service';
import { OrderHistoryService } from '../../../../app/@shared/services/order-history.service';
import { UserActivityService } from '../../../../app/@shared/services/user-activity.service';
import { Router } from '@angular/router';
import moment from 'moment-business-days';
import { environment } from "../../../../environments/environment";

@Component({
    selector: 'app-page-order-list',
    templateUrl: './page-order-list.component.html',
    styleUrls: ['./page-order-list.component.scss']
})
export class PageOrderListComponent implements OnInit, OnDestroy {
    private readonly BASE_API_URL: string = `${environment.gdx.requestProduct}`;
    noDataFoundMessage: string = 'No Orders Found';
    searchingMessage: string = 'Loading Your Orders....'
    requestedFor: string;
    catalogItem: string;
    limit: string;
    profile;
    requestNumbers: any;
    masterOrderList: any = [];
    orderList: any = [];
    pageNo: number = 1;
    request: any;
    todaysDate: Date = new Date();
    filterDuration: string = '3_MONTHS';
    isShow = false;
    noOrder = false;
    loader = false;
    apiTimer: any;
    searchText: any;
    sortDurationDays: any = '';
    filterItem: any = "";
    businessDays: string = "";
    orderDatestamp: string = "";
    pendingDate: any;
    orderDate: any;
    expandedId: string | null = null;
    itemsPerPage: number = 7;

    constructor(
      private appService: AppService,
      private orderHistoryService: OrderHistoryService,
      private ordersApi: UserActivityService,
      private _http: HttpClient,
      private router: Router
    ) {
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      setTimeout(() => { this.isShow = true; }, 15000)
      setTimeout(() => { this.noOrder = true; }, 5000)
      setTimeout(() => { this.loader = true; }, 1000)
    }

    ngOnInit(): void {
      this.requestedFor = this.appService?.userData?.id;
      this.catalogItem = "9a51d2dd1b03c490d96b11b92a4bcb99";
      this.limit = "500";
      this.GetRequestNumbers();
      moment.updateLocale('en', {
        holidays: [
          '01-02-2023','01-16-2023','05-29-2023','07-04-2023','09-04-2023',
          '11-23-2023','11-24-2023','12-22-2023','12-25-2023','12-26-2023',
          '12-27-2023','12-28-2023','12-29-2023'
        ],
        holidayFormat: 'MM-DD-YYYY',
      });
      const now = moment().format("YYYY-MM-DD HH:mm:ss");
      this.businessDays = now;
      this.orderDatestamp = now;
      this.orderDate = moment(this.orderDatestamp).toDate();
      this.pendingDate = moment(this.businessDays).businessAdd(3).toDate();
    }

    toggleDetails(item: any): void {
      this.expandedId = this.expandedId === item.id ? null : item.id;
    }

    isExpanded(item: any): boolean {
      return this.expandedId === item.id;
    }

    GetRequestNumbers(){
      this.ordersApi.recentOrders(100).subscribe((data: any[]) => {
        this.masterOrderList = data || [];
        this.postProcessOrders();
        this.noOrder = true;
      });
    }

    postProcessOrders(){
      this.orderList = [...this.masterOrderList];
      this.SortOrderList('DESC');
      this.ShowOrdersFor(this.filterDuration, false);
      if (this.searchText) {
        this.FilterOrderList(this.searchText, false);
      }
    }

    putApiRequestEvent(requestId){
      this.orderHistoryService.PutApiRequestEvent(requestId).subscribe(
        (response)=> {
          console.log(response);
        },
        (err)=> {
          console.log(err);
        }
      )
    }

      update() {
        setTimeout(() => {
          this.isShow = true;
        }, 5000);
      }
      
      SortOrderList(order: string){
        if(order === 'ASC'){
          this.masterOrderList = this.masterOrderList.sort((a, b) =>{
            return <any>new Date(a.createdAt) - <any>new Date(b.createdAt);
          });
        }
        else if(order === 'DESC'){
          this.masterOrderList = this.masterOrderList.sort((a, b) =>{
            return <any>new Date(b.createdAt) - <any>new Date(a.createdAt);
          });
        }
      }

      onPageChange(event: number) {
        this.pageNo = event;
      }

    FilterOrderList(txtSearch: any, actionChange:boolean){
        let filterText: any = typeof(txtSearch) == 'object' && txtSearch ? txtSearch.value : txtSearch;
        this.searchText = filterText;
        if(filterText == null || filterText === '')
        {
          this.orderList = [...this.masterOrderList];
          this.pageNo = this.pageNo;
          this.noDataFoundMessage = null;
          return;
        }
        filterText = filterText.toString().toLowerCase();
        this.filterItem = "search";
        this.orderList = this.masterOrderList.filter(item=>{
          const id = item && item.id ? item.id.toString().toLowerCase() : '';
          const number = item && item.number ? item.number.toString().toLowerCase() : '';
          const productName = item && item.product && item.product.name ? item.product.name.toLowerCase() : '';
          return (id.indexOf(filterText) !== -1) || (number.indexOf(filterText) !== -1) || (productName.indexOf(filterText) !== -1);
        });
        this.pageNo = this.pageNo;
        if(this.orderList.length == 0)
          this.noDataFoundMessage = `No Record found on applying <b><i>${filterText}</i></b> filter`;
    }

    ShowOrdersFor(e: any, actionChange:boolean){
        let durationDays: number = 0;
        let duration: string = '';
        if(typeof(e) === 'string')
            duration = e;
        else
            duration = e.target.value;
        this.filterDuration = duration;
        if(duration === OrderListDuration.DAYS_7){
            durationDays = 7;
        }
        else if(duration === OrderListDuration.DAYS_14){
            durationDays = 14;
        }
        else if(duration === OrderListDuration.MONTH_1){
            durationDays = 30;
        }
        else if(duration === OrderListDuration.MONTHS_3){
            durationDays = 90;
        }
        else if(duration === OrderListDuration.MONTHS_6){
            durationDays = 180;
        }
        else if(duration === OrderListDuration.YEAR_1){
            durationDays = 365;
        }
        else if(duration === OrderListDuration.ALL){
            durationDays = 0;
        }
        else{
            durationDays = 0;
        }
        this.sortDurationDays = durationDays;
        if(durationDays == 0){
            this.orderList = [...this.masterOrderList];
        }
        else {
            let today = new Date();
            let pastDate=new Date(today);
            pastDate.setDate(pastDate.getDate() - durationDays);
            this.orderList = this.masterOrderList.filter(item => {
                return (new Date(item.openedAt) <= today && new Date(item.openedAt) >= pastDate)
            });
        }
        if(actionChange){
            this.filterItem = "days";
        }
    }
    
    ShowEmpty(){
      if(this.filterItem=="search" && this.searchText != ''){
        if(this.orderList.length == 0)
          this.noDataFoundMessage = `No records match search for <b><i>${this.searchText}</i></b>`;
        else
          this.noDataFoundMessage = null;
        } else {
        if(this.orderList.length == 0)
          this.noDataFoundMessage = `No orders have been placed in the last <b><i>${this.sortDurationDays}</i></b> days`;
        else
        this.noDataFoundMessage = null;
      }
    }

  approve(item: any): void {
    item.approval = 'Approved';
    this.putApiRequestEvent(item.id);
  }

  deny(item: any): void {
    item.approval = 'Denied';
    this.putApiRequestEvent(item.id);
  }

  openTeams(item: any): void {
    const user = item.requestedFor || item.open_by || '';
    const encoded = encodeURIComponent(user);
    const url = `https://teams.microsoft.com/l/chat/0/0?users=${encoded}`;
    window.open(url, '_blank');
  }

  openOutlook(item: any): void {
    const to = item.requestedForEmail || item.requestedFor || '';
    const subject = encodeURIComponent(`Order ${item.id}`);
    const body = encodeURIComponent(`Details for order ${item.id}`);
    const mailto = `mailto:${to}?subject=${subject}&body=${body}`;
    window.open(mailto, '_blank');
  }

  uploadAttachment(item: any): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (ev: any) => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) {
        return;
      }
      const form = new FormData();
      form.append('file', file);
      form.append('orderId', item.id);
      this._http.post(`${this.BASE_API_URL}/attachments`, form).subscribe(
        () => {
          this.putApiRequestEvent(item.id);
        },
        () => {
          this.putApiRequestEvent(item.id);
        }
      );
    };
    input.click();
  }

  writeReview(item: any): void {
    this.router.navigate(['/account/write-review'], { queryParams: { orderId: item.id } });
  }

  ngOnDestroy(): void {
    clearInterval(this.apiTimer);
  }

  getStatusClass(status: any): string {
    const p = (status || '').toString().trim().toLowerCase();
    if (!p) return 'status-pill-default';
    if (p === 'cancelled') return 'status-pill-cancelled';
    if (p === 'completed') return 'status-pill-completed';
    if (p === 'pending') return 'status-pill-pending';
    if (p === 'progress') return 'status-pill-progress';
    if (p === 'hold') return 'status-pill-hold';
    return 'status-pill-default';
  }
  
  getApprovalClass(approval: any): string {
    const p = (approval || '').toString().trim().toLowerCase();
    if (!p) return 'approval-pill-default';
    if (p === 'requested') return 'approval-pill-requested';
    if (p === 'pending') return 'approval-pill-pending';
    if (p === 'approved') return 'approval-pill-approved';
    if (p === 'rejected') return 'approval-pill-rejected';
    return 'approval-pill-default';
  }

  getPriorityClass(approval: any): string {
    const p = (approval || '').toString().trim().toLowerCase();
    if (!p) return 'priority-pill-default';
    if (p === 'critical') return 'priority-pill-critical';
    if (p === 'high') return 'priority-pill-high';
    if (p === 'medium') return 'priority-pill-medium';
    if (p === 'low') return 'priority-pill-low';
    return 'priority-pill-default';
  }

}

export enum OrderListDuration {
  DAYS_7 = "7_DAYS",
  DAYS_14 = "14_DAYS",
  MONTH_1 = "1_MONTH",
  MONTHS_3 = "3_MONTHS",
  MONTHS_6 = "6_MONTHS",
  YEAR_1 = "1_YEAR",
  ALL = "ALL",
};