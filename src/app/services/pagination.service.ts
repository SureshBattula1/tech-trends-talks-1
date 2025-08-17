import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PaginationConfig {
  pageSize: number;
  pageSizeOptions: number[];
  currentPage: number;
  totalItems: number;
  pageLength: number;
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  length: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaginationService {
  private readonly defaultPageSize = 10;
  private readonly defaultPageSizeOptions = [5, 10, 25, 50, 100];

  private paginationState = new BehaviorSubject<PaginationState>({
    pageIndex: 0,
    pageSize: this.defaultPageSize,
    length: 0
  });

  private pageSizeOptions = new BehaviorSubject<number[]>(this.defaultPageSizeOptions);

  constructor() {}

  /**
   * Get current pagination state
   */
  getPaginationState(): Observable<PaginationState> {
    return this.paginationState.asObservable();
  }

  /**
   * Get current pagination state value
   */
  getCurrentPaginationState(): PaginationState {
    return this.paginationState.value;
  }

  /**
   * Get page size options
   */
  getPageSizeOptions(): Observable<number[]> {
    return this.pageSizeOptions.asObservable();
  }

  /**
   * Update pagination state
   */
  updatePaginationState(state: Partial<PaginationState>): void {
    const currentState = this.paginationState.value;
    this.paginationState.next({ ...currentState, ...state });
  }

  /**
   * Set page size options
   */
  setPageSizeOptions(options: number[]): void {
    this.pageSizeOptions.next(options);
  }

  /**
   * Reset pagination to first page
   */
  resetToFirstPage(): void {
    this.updatePaginationState({ pageIndex: 0 });
  }

  /**
   * Get pagination config for API calls
   */
  getPaginationConfig(): PaginationConfig {
    const state = this.paginationState.value;
    return {
      pageSize: state.pageSize,
      pageSizeOptions: this.pageSizeOptions.value,
      currentPage: state.pageIndex + 1,
      totalItems: state.length,
      pageLength: state.pageSize
    };
  }

  /**
   * Handle page change event
   */
  onPageChange(event: any): void {
    this.updatePaginationState({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize
    });
  }

  /**
   * Get default pagination state
   */
  getDefaultPaginationState(): PaginationState {
    return {
      pageIndex: 0,
      pageSize: this.defaultPageSize,
      length: 0
    };
  }
}
