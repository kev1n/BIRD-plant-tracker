import FiltersList from '@/components/filters/filters-list';
import { CENTER, LABEL_OFFSET_LAT, LABEL_OFFSET_LNG, numCols, numRows, patchSizeLat, patchSizeLng, TOP_LEFT } from '@/components/map-navigation/constants';
import LocationPermissionDialog from '@/components/map-navigation/location-permission-dialog';
import WhereAmI from '@/components/map-navigation/where-am-i';
import PatchHoverPreview from '@/components/map/patch-hover-preview';
import PolygonOverlay from '@/components/map/polygon-overlay';
import SnapshotView from '@/components/snapshots/snapshot-view';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { usePatchHover } from '@/hooks/usePatchHover';
import { usePolygonData } from '@/hooks/usePolygonData';
import { divIcon, LatLngTuple, LayerGroup, Marker, Rectangle } from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PatchPolygonOverlap } from '../../types/polygon.types';
import LeafletAssets from '../components/LeafletAssets';

// Sidebar component to display grid patch information
interface SidebarProps {
  patchInfo: {
    row: number;
    col: number;
    label: string;
  } | null;
}

// TODO: Move into seperate component, call it inspection details
function Sidebar({ patchInfo }: SidebarProps) {
  return (
    <div className="w-full md:w-50 p-5 bg-gray-50 h-full overflow-y-auto shadow-md">
      <h2 className="mt-0 border-b border-gray-200 pb-2 text-lg font-bold">
        Grid patch: {patchInfo ? patchInfo.label : 'Not Selected'}
      </h2>
      <div className="mt-4">
        <p className="mb-2">Row: {patchInfo ? patchInfo.row : 'Not Selected'}</p>
        <p className="mb-2">
          Column: {patchInfo ? String.fromCharCode(65 + patchInfo.col) : 'Not Selected'}
        </p>
      </div>

      {patchInfo && <SnapshotView patch={patchInfo.label} triggerTitle="View Latest Snapshot" />}
    </div>
  );
}

function GridOverlay({ 
  patchOverlaps, 
  onPatchHover, 
  onPatchLeave,
  coords
}: { 
  patchOverlaps: PatchPolygonOverlap[]; 
  onPatchHover?: (patchId: string, polygonId: string) => void;
  onPatchLeave?: () => void;
  coords?: { latitude: number; longitude: number } | null;
}) {

  // initialize variables
  const map = useMap();
  const navigate = useNavigate();
  const location = useLocation();
  const gridRef = useRef<LayerGroup | null>(null);

  // Extract grid patch from URL params
  const { patch } = useParams<{ patch?: string }>();

  useEffect(() => {
    if (!map) return;

    // Create a new LayerGroup
    gridRef.current = new LayerGroup();
    map.addLayer(gridRef.current);

    // Track if user is on any valid patch
    let userOnValidPatch = false;

    // Create grid patchs
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const topLeft: LatLngTuple = [
          TOP_LEFT[0] - row * patchSizeLat,
          TOP_LEFT[1] + col * patchSizeLng,
        ];
        const bottomRight: LatLngTuple = [
          TOP_LEFT[0] - (row + 1) * patchSizeLat,
          TOP_LEFT[1] + (col + 1) * patchSizeLng,
        ];

        // Create patch label
        const label = `${String.fromCharCode(65 + col)}${row + 1}`;
        const isSelected = patch === label;

        const isUserHere = coords?.latitude && coords?.longitude &&
          coords?.latitude <= topLeft[0] && coords?.latitude >= bottomRight[0] &&
          coords?.longitude >= topLeft[1] && coords?.longitude <= bottomRight[1]

        if (isUserHere) {
          userOnValidPatch = true;
        }

        // Check if patch overlaps with any polygon
        const patchOverlap = patchOverlaps.find(overlap => overlap.patchId === label);
        const isInPolygon = !!patchOverlap;
        const polygonId = patchOverlap?.polygonIds[0];

        // Determine fill color based on polygon membership
        let fillColor = '#000000'; // Default
        let fillOpacity = 0;

        if (isUserHere) {
          fillColor = '#4CAF50';
          fillOpacity = 0.9;
        } else if (isSelected) {
          fillColor = '#4a90e2';
          fillOpacity = 0.9;
        } else if (isInPolygon) {
          // Use different colors based on polygon
          fillColor = polygonId === 'northern-section' ? '#4CAF50' : '#FF9800';
          fillOpacity = 0.3;
        }

        // Create rectangle for grid patch
        const rect = new Rectangle([topLeft, bottomRight], {
          color: '#000000',
          weight: 1,
          fillColor,
          fillOpacity,
        });

        // Make patchs clickable
        rect.on('click', () => {
          navigate(`/map/${label}`, { replace: true });
        });

        // Add hover events for patches within polygons
        if (isInPolygon && onPatchHover && onPatchLeave && polygonId) {
          rect.on('mouseover', () => {
            onPatchHover(label, polygonId);
            rect.setStyle({ weight: 2 });
          });

          rect.on('mouseout', () => {
            onPatchLeave();
            rect.setStyle({ weight: 1 });
          });
        }

        rect.addTo(gridRef.current);
      }
    }

    // Add user location marker if they're not on a valid patch but have GPS coordinates
    if (coords?.latitude && coords?.longitude && !userOnValidPatch) {
      const userLocationMarker = new Marker([coords.latitude, coords.longitude], {
        icon: divIcon({
          className: 'user-location-marker',
          html: `<div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <circle cx="12" cy="12" r="8" fill="#FF4444" stroke="#FFFFFF" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" fill="#FFFFFF"/>
            </svg>
          </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      });
      userLocationMarker.addTo(gridRef.current);
    }

    // Add column labels (A-Z)
    for (let col = 0; col < numCols; col++) {
      const labelPos: LatLngTuple = [
        TOP_LEFT[0] + LABEL_OFFSET_LAT,
        TOP_LEFT[1] + col * patchSizeLng + patchSizeLng / 2,
      ];
      const marker = new Marker(labelPos, {
        icon: divIcon({
          className: 'text-xs font-bold text-center',
          html: String.fromCharCode(65 + col),
        }),
      });
      marker.addTo(gridRef.current);
    }

    // Add row labels (1-1000)
    for (let row = 0; row < numRows; row++) {
      const labelPos: LatLngTuple = [
        TOP_LEFT[0] - row * patchSizeLat - patchSizeLat / 2,
        TOP_LEFT[1] - LABEL_OFFSET_LNG,
      ];
      const marker = new Marker(labelPos, {
        icon: divIcon({
          className: 'text-xs font-bold text-center',
          html: (row + 1).toString(),
        }),
      });
      marker.addTo(gridRef.current);
    }

    // Cleanup function
    return () => {
      if (gridRef.current) {
        map.removeLayer(gridRef.current);
      }
    };
  }, [map, navigate, patch, location, coords, patchOverlaps, onPatchHover, onPatchLeave]);

  return null;
}

export default function MapView() {
  const { patch } = useParams<{ patch?: string }>();
  const [showTools, setShowTools] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Use the custom location permission hook
  const {
    coords,
    locationPermissionStatus,
    showLocationDialog,
    hasCheckedPermissions,
    handleLocationAccept,
    handleLocationDecline,
  } = useLocationPermission();

  // Polygon data and hover management
  const { polygons, patchOverlaps, isLoading: polygonLoading } = usePolygonData();
  const { hoveredPatch, handlePatchHover, handlePatchLeave } = usePatchHover();

  // Handle mouse movement for hover preview positioning
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    if (hoveredPatch) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [hoveredPatch]);

  // Parse patch into row and column if patch is defined
  let patchInfo = null;
  if (patch) {
    const colChar = patch.charAt(0);
    const row = parseInt(patch.substring(1)) - 1;
    const col = colChar.charCodeAt(0) - 65; // A=0, B=1, etc.
    patchInfo = { row: row + 1, col, label: patch };
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full relative py-4">
      <LeafletAssets />

      {/* Location Permission Dialog - only show if we've checked permissions and need to show it */}
      {hasCheckedPermissions && (
        <LocationPermissionDialog 
          open={showLocationDialog}
          onAccept={handleLocationAccept}
          onDecline={handleLocationDecline}
        />
      )}

      {/* Tools toggle button - visible only on mobile */}
      <button 
        className="md:hidden absolute top-2 left-2 z-20 bg-white p-2 rounded-full shadow-md"
        onClick={() => setShowTools(!showTools)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showTools ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Desktop tools panel */}
      <div className='hidden md:block absolute top-12 left-0 p-4 z-12'>
        <WhereAmI coords={coords} locationPermissionStatus={locationPermissionStatus} />
        <FiltersList />
      </div>
      
      {/* Mobile tools panel - slides in from bottom */}
      {showTools && (
        <div className='md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white shadow-lg rounded-t-lg max-h-[80vh] overflow-y-auto'>
          <div className="flex justify-end p-2">
            <button onClick={() => setShowTools(false)} className="p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col gap-2 p-2">
            <WhereAmI coords={coords} locationPermissionStatus={locationPermissionStatus} />
            <FiltersList />
          </div>
        </div>
      )}

      <div className="flex-1 h-full z-10">
        <MapContainer center={CENTER} zoom={30} scrollWheelZoom={true} className="h-full">
          <TileLayer
            maxNativeZoom={30}
            attribution='&copy; <a href="https://www.google.com/permissions/geoguidelines/attr-guide.html">Google</a>'
            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          />
          {!polygonLoading && (
            <>
              <PolygonOverlay 
                polygons={polygons} 
                patchOverlaps={patchOverlaps}
                onPatchHover={handlePatchHover}
                onPatchLeave={handlePatchLeave}
              />
              <GridOverlay 
                patchOverlaps={patchOverlaps}
                onPatchHover={handlePatchHover}
                onPatchLeave={handlePatchLeave}
                coords={coords}
              />
            </>
          )}
        </MapContainer>
      </div>

      {/* Hover preview */}
      {hoveredPatch && (
        <PatchHoverPreview 
          hoverData={hoveredPatch} 
          position={mousePosition}
        />
      )}

      <div className="w-full md:w-auto">
        <Sidebar patchInfo={patchInfo} />
      </div>
    </div>
  );
}

