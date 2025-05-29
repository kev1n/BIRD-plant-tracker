import { LatLngTuple } from 'leaflet';
import { Observation, Snapshot } from './database_types';

export interface StudyAreaPolygon {
  id: string;
  name: string;
  coordinates: LatLngTuple[];
  color: string;
  opacity: number;
}

export interface PatchPolygonOverlap {
  patchId: string;
  polygonIds: string[];
  isCompletelyInside: boolean;
  overlapPercentage: number;
}

export interface PolygonHoverData {
  patchId: string;
  polygonId: string;
  isLoading: boolean;
  snapshot?: Snapshot;
  observations?: Observation[];
  error?: string;
} 