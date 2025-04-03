import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterRolService {
  private filterRolSubject = new BehaviorSubject<string>('');
  filterRol$ = this.filterRolSubject.asObservable();

  constructor() {}

  setFilterRol(rol: string): void {
    this.filterRolSubject.next(rol);
  }

  getFilterRol(): string {
    return this.filterRolSubject.value;
  }
}
