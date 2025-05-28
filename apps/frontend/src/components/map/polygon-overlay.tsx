import { LayerGroup, Polygon } from 'leaflet';
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { PatchPolygonOverlap, StudyAreaPolygon } from '../../../types/polygon.types';

interface PolygonOverlayProps {
  polygons: StudyAreaPolygon[];
  patchOverlaps: PatchPolygonOverlap[];
  onPatchHover?: (patchId: string, polygonId: string) => void;
  onPatchLeave?: () => void;
}

export default function PolygonOverlay({ 
  polygons, 
  patchOverlaps, 
  onPatchHover, 
  onPatchLeave 
}: PolygonOverlayProps) {
  const map = useMap();
  const polygonLayerRef = useRef<LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create a new LayerGroup for polygons
    polygonLayerRef.current = new LayerGroup();
    map.addLayer(polygonLayerRef.current);

    // Create polygon outlines
    polygons.forEach(polygon => {
      const leafletPolygon = new Polygon(polygon.coordinates, {
        color: polygon.color,
        weight: 3,
        fillColor: polygon.color,
        fillOpacity: polygon.opacity,
        className: 'polygon-overlay'
      });

      // Add hover events for polygon identification
      leafletPolygon.on('mouseover', () => {
        leafletPolygon.setStyle({ weight: 4 });
      });

      leafletPolygon.on('mouseout', () => {
        leafletPolygon.setStyle({ weight: 3 });
      });

      leafletPolygon.addTo(polygonLayerRef.current!);
    });

    // Apply styling to patches that overlap with polygons
    patchOverlaps.forEach(overlap => {
      const primaryPolygon = polygons.find(p => p.id === overlap.polygonIds[0]);
      if (!primaryPolygon) return;

      // Create a visual indicator for patches within polygons
      // This would normally be handled by the grid overlay component
      // but we can add custom styling classes here if needed
    });

    // Cleanup function
    return () => {
      if (polygonLayerRef.current) {
        map.removeLayer(polygonLayerRef.current);
        polygonLayerRef.current = null;
      }
    };
  }, [map, polygons, patchOverlaps, onPatchHover, onPatchLeave]);

  return null; // This is a map effect component, no DOM rendered
} 