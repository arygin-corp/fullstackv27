import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, from, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { PeopleService } from '../../../@shared/services/people.service';

@Component({
  selector: 'app-people-finder',
  templateUrl: './people-finder.component.html',
  styleUrls: ['./people-finder.component.scss']
})
export class PeopleFinderComponent implements OnInit, OnDestroy {
  @ViewChild('inputEl', { static: false }) inputEl: ElementRef;

  public peopleInput$ = new Subject<string>();
  private subs = new Subscription();

  myGroup: FormGroup;

  users: any[] = [];
  allUsers: any[] = [];
  bufferSize = 50;
  loading = false;

  selectedUser: any = null;
  dropdownOpen = false;
  highlightedIndex = -1;

  constructor(private peopleService: PeopleService, private elementRef: ElementRef) {}

  ngOnInit() {
    this.myGroup = new FormGroup({
      v_dar_objectid_reqfor: new FormControl()
    });

    this.loadUsers();

    this.subs.add(
      this.peopleInput$
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(q => from(this.peopleService.getUsers(q)))
        )
        .subscribe((result: any[]) => {
          this.allUsers = result || [];
          this.users = this.allUsers.slice(0, this.bufferSize);
          this.loading = false;
          this.highlightedIndex = this.users.length ? 0 : -1;
        })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private loadUsers() {
    from(this.peopleService.getUsers('')).subscribe((users: any[]) => {
      this.allUsers = users || [];
      this.users = this.allUsers.slice(0, this.bufferSize);
    });
  }

  onInput(value: string) {
    this.loading = true;
    this.peopleInput$.next(value || '');
    this.openDropdown();
  }

  openDropdown() {
    this.dropdownOpen = true;
    setTimeout(() => { try { this.inputEl?.nativeElement?.focus(); } catch (e) {} }, 0);
  }

  closeDropdown() {
    this.dropdownOpen = false;
    this.highlightedIndex = -1;
  }

  clearSelection() {
    this.selectedUser = null;
    this.myGroup.get('v_dar_objectid_reqfor').setValue(null);
    this.openDropdown();
  }

  selectUser(u: any) {
    this.selectedUser = u;
    this.myGroup.get('v_dar_objectid_reqfor').setValue(u?.id || null);
    this.closeDropdown();
  }

  onContainerScroll(evt: Event) {
    const el = evt.target as HTMLElement;
    const reachedEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    if (reachedEnd) {
      this.fetchMore();
    }
  }

  private fetchMore() {
    if (this.loading || this.users.length >= this.allUsers.length) { return; }
    const len = this.users.length;
    const more = this.allUsers.slice(len, len + this.bufferSize);
    this.loading = true;
    setTimeout(() => {
      this.users = [...this.users, ...more];
      this.loading = false;
    }, 150);
  }

  onKeydown(event: KeyboardEvent) {
    if (!this.dropdownOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      this.openDropdown();
      event.preventDefault();
      return;
    }

    if (!this.dropdownOpen) { return; }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.highlightedIndex = Math.min(this.users.length - 1, Math.max(0, this.highlightedIndex + 1));
      this.scrollToHighlighted();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.highlightedIndex = Math.max(0, this.highlightedIndex - 1);
      this.scrollToHighlighted();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.highlightedIndex >= 0 && this.users[this.highlightedIndex]) {
        this.selectUser(this.users[this.highlightedIndex]);
      }
    } else if (event.key === 'Escape') {
      this.closeDropdown();
    }
  }

  private scrollToHighlighted() {
    setTimeout(() => {
      const list = document.querySelector('.pf-list') as HTMLElement;
      if (!list) { return; }
      const items = list.querySelectorAll('.pf-item');
      if (!items || items.length === 0) { return; }
      const el = items[Math.max(0, Math.min(items.length - 1, this.highlightedIndex))] as HTMLElement;
      if (!el) { return; }
      const elTop = el.offsetTop;
      const elBottom = elTop + el.offsetHeight;
      if (elTop < list.scrollTop) {
        list.scrollTop = elTop;
      } else if (elBottom > list.scrollTop + list.clientHeight) {
        list.scrollTop = elBottom - list.clientHeight;
      }
    }, 0);
  }

  trackById(index: number, item: any) { return item.id; }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.dropdownOpen) { return; }
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.closeDropdown();
    }
  }
}