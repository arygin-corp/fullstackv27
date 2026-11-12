import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../../environments/environment';

interface ProductRequest {
  id: number;
  product_name: string;
  product_domain: string;
  product_type: string;
  status: string;
  work_status: string;
  submitted_at: string;
  created_at: string;
}

type ColumnKey = 'product_name' | 'product_domain' | 'product_type' | 'status' | 'work_status' | 'submitted';

interface TableColumn {
  key: ColumnKey;
  label: string;
  width: number;
  visible: boolean;
}

@Component({
  selector: 'app-product-intake',
  templateUrl: './product-intake.component.html',
  styleUrls: ['./product-intake.component.scss']
})
export class ProductIntakeComponent implements OnInit {
  items: ProductRequest[] = [];
  loading = true;
  error = '';

  search = '';
  domainFilter = '';
  typeFilter = '';
  statusFilter = '';
  workStatusFilter = '';
  dateFrom = '';
  dateTo = '';
  sortKey: ColumnKey = 'submitted';
  sortDir: 'asc' | 'desc' = 'desc';
  page = 1;
  pageSize = 10;
  readonly pageSizes = [10, 25, 50, 100];
  columnsOpen = false;

  readonly columns: TableColumn[] = [
    { key: 'product_name', label: 'Product', width: 280, visible: true },
    { key: 'product_domain', label: 'Domain', width: 220, visible: true },
    { key: 'product_type', label: 'Type', width: 160, visible: true },
    { key: 'status', label: 'Status', width: 150, visible: true },
    { key: 'work_status', label: 'Work Status', width: 180, visible: true },
    { key: 'submitted', label: 'Submitted', width: 150, visible: true },
  ];

  private resizing?: { column: TableColumn; startX: number; startWidth: number };

  constructor(private http: HttpClient, private msal: MsalService) {}

  ngOnInit(): void {
    this.load();
  }

  get visibleColumns(): TableColumn[] {
    return this.columns.filter(column => column.visible);
  }

  get domainOptions(): string[] {
    return this.unique('product_domain');
  }

  get typeOptions(): string[] {
    return this.unique('product_type');
  }

  get statusOptions(): string[] {
    return this.unique('status');
  }

  get workStatusOptions(): string[] {
    const options = this.unique('work_status');
    if (!options.includes('Completed')) {
      options.push('Completed');
      options.sort((a, b) => a.localeCompare(b));
    }
    return options;
  }

  get filteredItems(): ProductRequest[] {
    const query = this.search.trim().toLowerCase();
    const from = this.dateFrom ? new Date(`${this.dateFrom}T00:00:00`) : null;
    const to = this.dateTo ? new Date(`${this.dateTo}T23:59:59`) : null;
    const rows = this.items.filter(item => {
      if (this.domainFilter && (item.product_domain || '') !== this.domainFilter) {
        return false;
      }
      if (this.typeFilter && (item.product_type || '') !== this.typeFilter) {
        return false;
      }
      if ((item.status || '').toLowerCase() === 'archived' && this.workStatusFilter !== 'Completed') {
        return false;
      }
      if (this.statusFilter && (item.status || '') !== this.statusFilter) {
        return false;
      }
      if (this.workStatusFilter && (item.work_status || '') !== this.workStatusFilter) {
        return false;
      }
      const submitted = new Date(item.submitted_at || item.created_at);
      if (from && submitted < from) {
        return false;
      }
      if (to && submitted > to) {
        return false;
      }
      if (!query) {
        return true;
      }
      return this.searchText(item).includes(query);
    });
    const direction = this.sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      const a = this.sortValue(left);
      const b = this.sortValue(right);
      if (a < b) {
        return -1 * direction;
      }
      if (a > b) {
        return 1 * direction;
      }
      return 0;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredItems.length / this.pageSize));
  }

  get pagedItems(): ProductRequest[] {
    const page = Math.min(this.page, this.totalPages);
    const start = (page - 1) * this.pageSize;
    return this.filteredItems.slice(start, start + this.pageSize);
  }

  get rangeStart(): number {
    if (!this.filteredItems.length) {
      return 0;
    }
    return (Math.min(this.page, this.totalPages) - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.filteredItems.length, Math.min(this.page, this.totalPages) * this.pageSize);
  }

  statusLabel(status: string): string {
    return (status || 'draft').replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
  }

  cell(item: ProductRequest, key: ColumnKey): string {
    if (key === 'submitted') {
      return '';
    }
    if (key === 'status') {
      return this.statusLabel(item.status);
    }
    if (key === 'work_status') {
      return item.work_status || 'Open';
    }
    return item[key] || '—';
  }

  pillClass(key: ColumnKey, item: ProductRequest): string {
    if (key !== 'status' && key !== 'work_status') {
      return '';
    }
    const value = (key === 'work_status' ? item.work_status : item.status || '').toLowerCase();
    if (value.includes('progress') || value.includes('review') || value === 'under_review' || value === 'assigned' || value === 'approved' || value === 'accepted' || value === 'product_draft' || value.includes('draft product')) {
      return 'intake-pill intake-pill--progress';
    }
    if (value.includes('wait') || value === 'needs_information') {
      return 'intake-pill intake-pill--wait';
    }
    if (value === 'curated' || value.includes('ready')) {
      return 'intake-pill intake-pill--open';
    }
    if (value.includes('complet') || value === 'implemented') {
      return 'intake-pill intake-pill--done';
    }
    if (value.includes('clos') || value === 'rejected' || value === 'archived') {
      return 'intake-pill intake-pill--closed';
    }
    if (value === 'open' || value === 'submitted' || value === 'resubmitted') {
      return 'intake-pill intake-pill--open';
    }
    return 'intake-pill';
  }

  submitted(item: ProductRequest): string {
    return item.submitted_at || item.created_at;
  }

  onFiltersChange(): void {
    this.page = 1;
  }

  sort(key: ColumnKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = key === 'submitted' ? 'desc' : 'asc';
    }
    this.page = 1;
  }

  sortMark(key: ColumnKey): string {
    if (this.sortKey !== key) {
      return '';
    }
    return this.sortDir === 'asc' ? '▲' : '▼';
  }

  toggleColumn(column: TableColumn): void {
    if (column.visible && this.visibleColumns.length === 1) {
      return;
    }
    column.visible = !column.visible;
  }

  setPage(page: number): void {
    this.page = Math.min(Math.max(1, page), this.totalPages);
  }

  startResize(event: MouseEvent, column: TableColumn): void {
    event.preventDefault();
    event.stopPropagation();
    this.resizing = { column, startX: event.clientX, startWidth: column.width };
  }

  @HostListener('document:mousemove', ['$event'])
  onResizeMove(event: MouseEvent): void {
    if (!this.resizing) {
      return;
    }
    this.resizing.column.width = Math.max(110, this.resizing.startWidth + event.clientX - this.resizing.startX);
  }

  @HostListener('document:mouseup')
  onResizeEnd(): void {
    this.resizing = undefined;
  }

  @HostListener('document:click')
  closeColumns(): void {
    this.columnsOpen = false;
  }

  private unique(key: 'product_domain' | 'product_type' | 'status' | 'work_status'): string[] {
    return [...new Set(this.visibleItems.map(item => (item[key] || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  private get visibleItems(): ProductRequest[] {
    return this.items.filter(item => (item.status || '').toLowerCase() !== 'archived');
  }

  private searchText(item: ProductRequest): string {
    return [
      item.product_name,
      item.product_domain,
      item.product_type,
      this.statusLabel(item.status),
      item.work_status,
      item.submitted_at,
      item.created_at,
    ].join(' ').toLowerCase();
  }

  private sortValue(item: ProductRequest): string | number {
    if (this.sortKey === 'submitted') {
      return new Date(item.submitted_at || item.created_at).getTime() || 0;
    }
    if (this.sortKey === 'status') {
      return this.statusLabel(item.status).toLowerCase();
    }
    if (this.sortKey === 'work_status') {
      return (item.work_status || '').toLowerCase();
    }
    return (item[this.sortKey] || '').toLowerCase();
  }

  private async load(): Promise<void> {
    const headers = await this.authHeaders();
    if (!headers) {
      this.loading = false;
      this.error = 'Sign in is required to view product requests.';
      return;
    }

    const collected: ProductRequest[] = [];
    let url: string | null = `${environment.apiUrl}/api/new/product/intake/`;
    const readPage = () => new Promise<ProductRequest[] | { results?: ProductRequest[]; next?: string | null }>((resolve, reject) => {
      this.http.get<ProductRequest[] | { results?: ProductRequest[]; next?: string | null }>(url, { headers }).subscribe({
        next: resolve,
        error: reject
      });
    });

    try {
      while (url) {
        const response = await readPage();
        if (Array.isArray(response)) {
          collected.push(...response);
          url = null;
        } else {
          collected.push(...(response?.results || []));
          url = response?.next || null;
        }
      }
      this.items = collected;
      this.loading = false;
    } catch (err: any) {
      this.loading = false;
      this.error = err?.status === 401 || err?.status === 403
        ? 'Sign in is required to view product requests.'
        : 'Product requests could not be loaded.';
    }
  }

  private async authHeaders(): Promise<HttpHeaders | null> {
    let account = this.msal.instance.getActiveAccount()
      || this.msal.instance.getAllAccounts()[0];
    for (let attempt = 0; !account && attempt < 10; attempt += 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
      account = this.msal.instance.getActiveAccount()
        || this.msal.instance.getAllAccounts()[0];
    }
    if (!account) {
      return null;
    }
    try {
      const result = await this.msal.instance.acquireTokenSilent({
        scopes: ['openid', 'profile'],
        account
      });
      if (!result.idToken) {
        return null;
      }
      return new HttpHeaders({ Authorization: `Bearer ${result.idToken}` });
    } catch {
      return null;
    }
  }
}
