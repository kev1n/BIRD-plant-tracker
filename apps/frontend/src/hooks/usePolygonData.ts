import { useEffect, useMemo, useState } from 'react';
import { PatchPolygonOverlap, StudyAreaPolygon } from '../../types/polygon.types';
import { STUDY_AREA_POLYGONS, findPatchPolygonOverlaps } from '../utils/polygon-utils';

interface UsePolygonDataReturn {
  polygons: StudyAreaPolygon[];
  patchOverlaps: PatchPolygonOverlap[];
  isLoading: boolean;
  error: string | null;
}

export function usePolygonData(): UsePolygonDataReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate patch overlaps using memoization for performance
  const patchOverlaps = useMemo(() => {
    try {
      return findPatchPolygonOverlaps(STUDY_AREA_POLYGONS);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate patch overlaps';
      setError(errorMessage);
      return [];
    }
  }, []);

  useEffect(() => {
    // Simulate loading time for polygon processing
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return {
    polygons: STUDY_AREA_POLYGONS,
    patchOverlaps,
    isLoading,
    error
  };
} 