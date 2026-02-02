export enum DisasterType {
  WILDFIRE = 'WILDFIRE',
  FLOOD = 'FLOOD',
  EARTHQUAKE = 'EARTHQUAKE',
  STORM = 'STORM',
  TORNADO = 'TORNADO',
  TSUNAMI = 'TSUNAMI',
  OTHER = 'OTHER'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DisasterEvent {
  id: string;
  title: string;
  type: DisasterType;
  description: string;
  locationName: string;
  coordinates: Coordinates;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
  sourceUrl?: string;
  timestamp: string;
  verified: boolean;
  detailedStatus?: string;
}

export interface SearchState {
  isSearching: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

export interface DisasterResponse {
  events: DisasterEvent[];
  searchCenter: Coordinates;
  zoomLevel: number;
}

export type ViewMode = 'MAP' | 'LIST';