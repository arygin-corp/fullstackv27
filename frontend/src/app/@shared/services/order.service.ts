import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private mockOrders: any[] = Array.from({ length: 50 }).map((_, i) => {
    const idx = i + 1;
    const productList = [
      'Laptop','Monitor','Keyboard','Mouse','Docking Station','Headset','Webcam','Printer',
      'Tablet','Phone','Charger','SSD','Router','Switch','USB Hub','Graphics Card',
      'External HDD','Power Bank','Microphone','Scanner'
    ];
    const statusList = ['Pending','Completed','In Progress','Cancelled','On Hold'];
    const approvalList = ['Not Requested','Requested','Pending Approval','Approved','Rejected'];
    const priorityList = ['1 - Critical','2 - High','3 - Moderate','4 - Low','5 - Planning'];
    const firstNames = ['Alex','Taylor','Jordan','Morgan','Casey','Riley','Jamie','Cameron','Avery','Parker','Quinn','Skyler'];
    const lastNames = ['Smith','Johnson','Brown','Lee','Garcia','Martinez','Davis','Miller','Wilson','Anderson','Thomas','Moore'];
    const daysOffsets = [1,2,3,5,7,10,14,21,30,45,60,90,120,180,365];
    const daysAgo = daysOffsets[i % daysOffsets.length];
    const opened = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const created = new Date(opened.getTime() - (i % 6) * 60 * 60 * 1000);
    const first = firstNames[i % firstNames.length];
    const last = lastNames[(i + 3) % lastNames.length];
    const openByName = `${first} ${last}`;
    const approval = approvalList[i % approvalList.length];
    const rawPriority = priorityList[i % priorityList.length]; // e.g. '1 - Critical'
    const priorityLabel = rawPriority.replace(/^\d+\s*-\s*/, '');

    return {
      open_by: openByName,
      id: `REQ-${1000000 + idx}`,
      number: `RITM${String(idx).padStart(7, '0')}`,
      openedAt: opened.toISOString(),
      status: statusList[i % statusList.length],
      product: { name: productList[i % productList.length] },
      createdAt: created.toISOString(),
      requestedFor: `user-${(i % 12) + 1}`,
      quantity: ((i % 5) + 1),
      price: Number(((100 + (i % 20) * 5) + Math.random()).toFixed(2)),
      approval: approval,
      priority: priorityLabel
    };
  });

  getOrders(): Observable<any[]> {
    return of([...this.mockOrders]).pipe(delay(300));
  }

  getOrderById(id: string): Observable<any> {
    const found = this.mockOrders.find(o => o.id === id || o.number === id);
    return found ? of({ ...found }).pipe(delay(150)) : throwError(() => new Error('Order not found'));
  }

  searchOrders(query: string): Observable<any[]> {
    if (!query || !query.toString().trim()) {
      return of([...this.mockOrders]).pipe(delay(200));
    }
    const q = query.toString().toLowerCase().trim();
    const filtered = this.mockOrders.filter(item => {
      const id = item.id ? item.id.toString().toLowerCase() : '';
      const number = item.number ? item.number.toString().toLowerCase() : '';
      const productName = item.product && item.product.name ? item.product.name.toLowerCase() : '';
      const openBy = item.open_by ? item.open_by.toString().toLowerCase() : '';
      const approval = item.approval ? item.approval.toString().toLowerCase() : '';
      const priority = item.priority ? item.priority.toString().toLowerCase() : '';
      return id.includes(q) || number.includes(q) || productName.includes(q) || openBy.includes(q) || approval.includes(q) || priority.includes(q);
    });
    return of(filtered).pipe(delay(200));
  }

  filterByDuration(days: number): Observable<any[]> {
    if (!days || days <= 0) {
      return of([...this.mockOrders]).pipe(delay(200));
    }
    const now = new Date();
    const past = new Date(now);
    past.setDate(past.getDate() - days);
    const filtered = this.mockOrders.filter(item => {
      const opened = new Date(item.openedAt);
      return opened <= now && opened >= past;
    });
    return of(filtered).pipe(delay(200));
  }

  getPaged(page = 1, pageSize = 10, sourceList?: any[]): Observable<{ items: any[]; total: number }> {
    const list = sourceList ? [...sourceList] : [...this.mockOrders];
    const total = list.length;
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);
    return of({ items, total }).pipe(delay(200));
  }

  updateOrderStatus(id: string, status: string): Observable<any> {
    const idx = this.mockOrders.findIndex(o => o.id === id || o.number === id);
    if (idx === -1) {
      return throwError(() => new Error('Order not found'));
    }
    this.mockOrders[idx] = { ...this.mockOrders[idx], status };
    return of({ ...this.mockOrders[idx] }).pipe(delay(150));
  }
}