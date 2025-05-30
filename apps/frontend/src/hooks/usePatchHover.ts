import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Observation, Snapshot } from '../../types/database_types';
import { PolygonHoverData } from '../../types/polygon.types';

interface PatchHoverReturn {
  hoveredPatch: PolygonHoverData | null;
  handlePatchHover: (patchId: string, polygonId: string) => void;
  handlePatchLeave: () => void;
  isLoading: boolean;
}

export function usePatchHover(): PatchHoverReturn {
  const [hoveredPatch, setHoveredPatch] = useState<PolygonHoverData | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    };
  }, []);

  const fetchSnapshotData = useCallback(async (patchId: string) => {
    try {
      console.log('fetching snapshot data for patchId', patchId);
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      
      const snapshot_response = await fetch(`${baseUrl}/snapshot/patch/${patchId}/latest`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      
      if (snapshot_response.status === 404) {
        return null; // No snapshot available
      }

      if (!snapshot_response.ok) {
        throw new Error('Failed to fetch snapshot');
      }


      const snapshot_data = await snapshot_response.json();
      const snapshot: Snapshot = {
        snapshotID: snapshot_data.data.snapshotID,
        dateCreated: new Date(snapshot_data.data.dateCreated),
        patchID: snapshot_data.data.patchID,
        notes: snapshot_data.data.notes || 'No notes available for this patch.',
        userID: snapshot_data.data.userID,
      };

      // Fetch observations
      const observations_response = await fetch(
        `${baseUrl}/observation/detailed-all/${snapshot.snapshotID}`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let observations: Observation[] = [];
      if (observations_response.ok) {
        const observations_data = await observations_response.json();
        observations = observations_data.observations.map(
          (obs: Observation, index: number) => ({
            ...obs,
            tempKey: index,
            isNew: false,
            modified: false,
          })
        );
      }

      const result = { snapshot, observations, timestamp: Date.now() };
      
      return result;
    } catch (error) {
      toast.error('Error fetching snapshot data: ' + error);
      throw error;
    }
  }, []);

  const handlePatchHover = useCallback((patchId: string, polygonId: string) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Set loading state immediately
    setHoveredPatch({
      patchId,
      polygonId,
      isLoading: true,
    });

    // Debounce the data fetching
    hoverTimeoutRef.current = setTimeout(async () => {
      try {
        const snapshotData = await fetchSnapshotData(patchId);
        
        setHoveredPatch({
          patchId,
          polygonId,
          isLoading: false,
          snapshot: snapshotData?.snapshot,
          observations: snapshotData?.observations,
        });
      } catch (error) {
        setHoveredPatch({
          patchId,
          polygonId,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load snapshot data',
        });
      }
    }, 200); // 200ms debounce
  }, [fetchSnapshotData]);

  const handlePatchLeave = useCallback(() => {
    // Clear timeout if it exists
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    setHoveredPatch(null);
  }, []);

  return {
    hoveredPatch,
    handlePatchHover,
    handlePatchLeave,
    isLoading: hoveredPatch?.isLoading || false,
  };
} 