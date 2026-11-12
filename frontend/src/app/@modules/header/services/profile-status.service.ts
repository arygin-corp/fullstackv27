import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ProfileStatus = 'online' | 'away' | 'busy' | 'unavailable' | 'offline';

export interface ProfileStatusOption {
    id: ProfileStatus;
    label: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileStatusService {
    private readonly storageKey = 'gdx.profileStatus';
    readonly options: ProfileStatusOption[] = [
        { id: 'online', label: 'Online' },
        { id: 'away', label: 'Away' },
        { id: 'busy', label: 'Busy' },
        { id: 'unavailable', label: 'Unavailable' },
        { id: 'offline', label: 'Offline' }
    ];
    private readonly current = new BehaviorSubject<ProfileStatus>(this.read());
    readonly current$ = this.current.asObservable();

    set(status: ProfileStatus): void {
        this.write(status);
        this.current.next(status);
    }

    labelFor(status: ProfileStatus): string {
        return this.options.find(option => option.id === status)?.label || 'Online';
    }

    private read(): ProfileStatus {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (this.options.some(option => option.id === saved)) {
                return saved as ProfileStatus;
            }
        } catch {
            return 'online';
        }
        return 'online';
    }

    private write(status: ProfileStatus): void {
        try {
            localStorage.setItem(this.storageKey, status);
        } catch {
            return;
        }
    }
}
