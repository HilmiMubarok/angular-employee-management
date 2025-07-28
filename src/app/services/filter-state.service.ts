import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterStateService {
  private filterState: { [key: string]: any } = {};

  constructor() { }

  saveFilterState(componentId: string, state: any): void {
    this.filterState[componentId] = { ...state };
  }

  getFilterState(componentId: string): any {
    return this.filterState[componentId] || null;
  }

  clearFilterState(componentId: string): void {
    if (this.filterState[componentId]) {
      delete this.filterState[componentId];
    }
  }

  hasFilterState(componentId: string): boolean {
    return !!this.filterState[componentId];
  }
}
