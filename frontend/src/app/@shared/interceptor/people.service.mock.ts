import { of } from 'rxjs';

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function randomFrom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRandomUsers(count = 200) {
  const depts = ['HR', 'Sales', 'IT', 'R&D', 'Finance', 'Legal', 'Marketing'];
  const companies = Array.from({ length: 12 }).map((_, i) => `Company${i + 1}`);
  return Array.from({ length: count }).map((_, i) => {
    const idx = i + 1;
    const id = guid();
    const givenName = `User${idx}`;
    const surname = `Test${idx}`;
    const displayName = `${givenName} ${surname}`;
    const companyName = randomFrom(companies);
    const department = randomFrom(depts);
    const userPrincipalName = `user${idx}@example.com`;
    return { id, givenName, surname, displayName, companyName, department, userPrincipalName };
  });
}

export class MockPeopleService {
  private allUsers = generateRandomUsers(300);

  getUsers(filter = ''): Promise<any[]> {
    if (!filter) {
      return Promise.resolve([...this.allUsers]);
    }
    const f = filter.toLowerCase();
    const filtered = this.allUsers.filter(u =>
      u.displayName.toLowerCase().includes(f) ||
      u.companyName.toLowerCase().includes(f) ||
      u.userPrincipalName.toLowerCase().includes(f)
    );
    return Promise.resolve(filtered);
  }

  getUsersObservable(filter = '') {
    if (!filter) {
      return of([...this.allUsers]);
    }
    const f = filter.toLowerCase();
    const filtered = this.allUsers.filter(u =>
      u.displayName.toLowerCase().includes(f) ||
      u.companyName.toLowerCase().includes(f) ||
      u.userPrincipalName.toLowerCase().includes(f)
    );
    return of(filtered);
  }
}