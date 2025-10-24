// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Error handling types
export interface ErrorResponse {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

// Generic error handler type
export type ErrorHandler = (error: ErrorResponse) => void;

// Search and filter types
export interface SearchFilters {
  query: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

// Sort value types
export type SortableValue = string | number | boolean | Date;

// Product comparison types
export interface ComparisonFeature {
  key: string;
  label: string;
}

// Form field types
export type FormFieldValue = string | number | boolean | File | null;

// Event handler types
export type InputChangeHandler = (field: string, value: FormFieldValue) => void;
export type FormSubmitHandler = (e: React.FormEvent) => void;
export type ButtonClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;

// Async operation types
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Redux action types
export interface AsyncThunkConfig {
  state: unknown;
  dispatch: unknown;
  extra: unknown;
  rejectValue: string;
  serializedErrorType: unknown;
  pendingMeta: unknown;
  fulfilledMeta: unknown;
  rejectedMeta: unknown;
}



