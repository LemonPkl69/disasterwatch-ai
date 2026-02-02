import { DisasterType } from './types';
import { Flame, Droplets, Activity, CloudLightning, Wind, Waves, AlertTriangle, ShieldCheck, AlertCircle, Siren, OctagonAlert } from 'lucide-react';

export const DISASTER_ICONS: Record<DisasterType, any> = {
  [DisasterType.WILDFIRE]: Flame,
  [DisasterType.FLOOD]: Droplets,
  [DisasterType.EARTHQUAKE]: Activity,
  [DisasterType.STORM]: CloudLightning,
  [DisasterType.TORNADO]: Wind,
  [DisasterType.TSUNAMI]: Waves,
  [DisasterType.OTHER]: AlertTriangle,
};

export const DISASTER_COLORS: Record<DisasterType, string> = {
  [DisasterType.WILDFIRE]: '#ef4444', // Red-500
  [DisasterType.FLOOD]: '#3b82f6', // Blue-500
  [DisasterType.EARTHQUAKE]: '#d97706', // Amber-600
  [DisasterType.STORM]: '#8b5cf6', // Violet-500
  [DisasterType.TORNADO]: '#6366f1', // Indigo-500
  [DisasterType.TSUNAMI]: '#06b6d4', // Cyan-500
  [DisasterType.OTHER]: '#9ca3af', // Gray-400
};

export const SEVERITY_ICONS: Record<string, any> = {
  LOW: ShieldCheck,
  MEDIUM: AlertCircle,
  HIGH: AlertTriangle,
  CRITICAL: Siren,
};

export const SEVERITY_COLORS: Record<string, string> = {
  LOW: '#10b981', // Emerald-500
  MEDIUM: '#f59e0b', // Amber-500
  HIGH: '#f97316', // Orange-500
  CRITICAL: '#ef4444', // Red-500
};

export const DEFAULT_CENTER = { lat: 34.0522, lng: -118.2437 }; // Los Angeles
export const DEFAULT_ZOOM = 5;

// Mock data to show before first search
export const INITIAL_MOCK_DATA = [];