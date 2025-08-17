export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GasStation {
  id: string;
  name: string;
  address: string;
  price: number;
  coordinates: Coordinates;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGasStationData {
  name: string;
  address: string;
  price: number;
  coordinates: Coordinates;
}

export interface UpdateGasStationData {
  name?: string;
  address?: string;
  price?: number;
  coordinates?: Coordinates;
}

// UI Component Props
export interface GasStationFormData {
  name: string;
  address: string;
  price: string; // String for form input, converted to number
  coordinates: {
    lat: string; // String for form input, converted to number
    lng: string;
  };
}

export interface MapMarkerProps {
  station: GasStation;
  onClick?: (station: GasStation) => void;
  isSelected?: boolean;
}

export interface TableRowProps {
  station: GasStation;
  onView: (station: GasStation) => void;
  onEdit: (station: GasStation) => void;
  onDelete: (station: GasStation) => void;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Filter and sort types
export interface TableFilters {
  search: string;
  sortBy: 'name' | 'address' | 'price' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}