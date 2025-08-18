// src/types/index.ts

// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// Location type
export interface Location {
  latitude: number;
  longitude: number;
}

// Gas Station types
export interface GasStation {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  location: Location;
  services: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Form data types
export interface CreateGasStationData {
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  location: Location;
  services: string[];
}

export interface UpdateGasStationData extends Partial<CreateGasStationData> {
  isActive?: boolean;
}

// Form types
export interface GasStationFormData {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  services: string[];
  latitude: number;
  longitude: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter types
export interface GasStationFilters {
  city?: string;
  services?: string[];
  isActive?: boolean;
  search?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon?: any;
  current?: boolean;
}

// Component prop types
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Toast notification types
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}