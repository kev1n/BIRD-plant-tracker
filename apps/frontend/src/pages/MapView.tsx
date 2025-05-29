import FiltersList from '@/components/filters/filters-list';
import { CENTER, LABEL_OFFSET_LAT, LABEL_OFFSET_LNG, numCols, numRows, patchSizeLat, patchSizeLng, TOP_LEFT } from '@/components/map-navigation/constants';
import LocationPermissionDialog from '@/components/map-navigation/location-permission-dialog';
import WhereAmI from '@/components/map-navigation/where-am-i';
import PatchHoverPreview from '@/components/map/patch-hover-preview';
import PolygonOverlay from '@/components/map/polygon-overlay';
import SnapshotView from '@/components/snapshots/snapshot-view';
import { LocationPermissionStatus, useLocationPermission } from '@/hooks/useLocationPermission';
import { usePatchHover } from '@/hooks/usePatchHover';
import { usePolygonData } from '@/hooks/usePolygonData';
import { divIcon, LatLngTuple, LayerGroup, Marker, Rectangle } from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PatchPolygonOverlap } from '../../types/polygon.types';
import LeafletAssets from '../components/LeafletAssets';

// Sidebar component to display tools and patch information
interface SidebarProps {
  patchInfo: {
    row: number;
    col: number;
    label: string;
  } | null;
  coords?: { latitude: number; longitude: number } | null;
  locationPermissionStatus: LocationPermissionStatus;
  onPanToLocation?: (coords: { latitude: number; longitude: number }) => void;
  filtersOn: boolean;
  setFiltersOn: (on: boolean) => void;
  plantToColor: Map<number, string>;
  setPlantToColor: (map: Map<number, string>) => void;
  patchesToColors: Map<string, string[]>;
  setPatchesToColors: (map: Map<string, string[]>) => void;
}

function Sidebar({ patchInfo, coords, locationPermissionStatus, onPanToLocation , filtersOn, 
  setFiltersOn, plantToColor, setPlantToColor, patchesToColors, setPatchesToColors
}: SidebarProps) {
  return (
    <div className="w-full md:w-80 bg-gray-50 h-full overflow-y-auto shadow-md flex flex-col">
      {/* WhereAmI and FiltersList - always shown */}
      <div className="p-4 space-y-4">
        <WhereAmI 
          coords={coords} 
          locationPermissionStatus={locationPermissionStatus}
          onPanToLocation={onPanToLocation}
        />
        <FiltersList 
          filtersOn={filtersOn}
          setFiltersOn={setFiltersOn}
          plantToColor={plantToColor}
          setPlantToColor={setPlantToColor}
          patchesToColors={patchesToColors}
          setPatchesToColors={setPatchesToColors}
        />
      </div>
      
      {/* Patch info - only shown on mobile when a patch is selected, but without the snapshot view */}
      <div className="md:hidden flex-1">
        {patchInfo && (
          <div className="p-4 border-t border-gray-200">
            <h2 className="mt-0 border-b border-gray-200 pb-2 text-lg font-bold">
              Grid patch: {patchInfo.label}
            </h2>
            <div className="mt-4">
              <p className="mb-2">Row: {patchInfo.row}</p>
              <p className="mb-2">
                Column: {String.fromCharCode(65 + patchInfo.col)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GridOverlay({ 
  patchOverlaps, 
  onPatchHover, 
  onPatchLeave,
  coords,
  patchesToColors,
  filtersOn,
}: { 
  patchOverlaps: PatchPolygonOverlap[]; 
  onPatchHover?: (patchId: string, polygonId: string) => void;
  onPatchLeave?: () => void;
  coords?: { latitude: number; longitude: number } | null;
  patchesToColors: Map<string, string[]>;
  filtersOn: boolean;
}) {

  // initialize variables
  const map = useMap();
  const navigate = useNavigate();
  const location = useLocation();
  const gridRef = useRef<LayerGroup | null>(null);

  // Extract grid patch from URL params
  const { patch } = useParams<{ patch?: string }>();

  const make_rectangle_stripes = (
    colors: string[],
    topLeft: LatLngTuple,
    bottomRight: LatLngTuple
  ) => {
    if (colors.length === 0) return [];
    const [lat1, lng1] = topLeft;
    const [lat2, lng2] = bottomRight;
    const lngStep = (lng2 - lng1) / colors.length;
    const rects: Rectangle[] = [];

    colors.forEach((color, i) => {
      const rectTopLeft: LatLngTuple = [lat1, lng1 + i * lngStep];
      const rectBottomRight: LatLngTuple = [lat2, lng1 + (i + 1) * lngStep];
      const rect = new Rectangle([rectTopLeft, rectBottomRight], {
        color: '#000000',
        weight: 0.5,
        fillColor: color,
        fillOpacity: 0.7,
      });
      rects.push(rect);
    });
    return rects;
  };

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

        let striping = false;
        let filtering_colors:string[] = [];

        if (isUserHere) {
          fillColor = '#4CAF50';
          fillOpacity = 0.9;
        } else if (isSelected) {
          fillColor = '#4a90e2';
          fillOpacity = 0.9;
        } 
        else if (filtersOn && patchesToColors.has(label) && patchesToColors.get(label)?.length) {
          filtering_colors = patchesToColors?.get(label) || [];
          striping = true;
        }
        else if (isInPolygon) {
          // Use different colors based on polygon
          fillColor = polygonId === 'northern-section' ? '#4CAF50' : '#FF9800';
          fillOpacity = 0.3;
        }
        // Create rectangle for grid patch
        const base_rect = new Rectangle([topLeft, bottomRight], {
          color: '#000000',
          weight: 0.5,
          fillColor,
          fillOpacity,
        });
        
        let rects_list:Rectangle[] = [];
        if (striping && filtering_colors) {
          rects_list = make_rectangle_stripes(filtering_colors, topLeft, bottomRight);
        }

        // Add each rectangle to the grid layer
        for (const rect of rects_list) {
          rect.addTo(gridRef.current);
        }

        // Make patchs clickable
          base_rect.on('click', () => {
            navigate(`/map/${label}`, { replace: true });
          });

          // Add hover events for patches within polygons
          if (isInPolygon && onPatchHover && onPatchLeave && polygonId) {
            base_rect.on('mouseover', () => {
              onPatchHover(label, polygonId);
              base_rect.setStyle({ weight: 2 });
            });

            base_rect.on('mouseout', () => {
              onPatchLeave();
              base_rect.setStyle({ weight: 1 });
            });
          }

          base_rect.addTo(gridRef.current);

        
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
          html: `<div style="color: white; text-shadow: 1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black;">${String.fromCharCode(65 + col)}</div>`,
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
          html: `<div style="color: white; text-shadow: 1px 1px 2px black, -1px -1px 2px black, 1px -1px 2px black, -1px 1px 2px black;">${(row + 1).toString()}</div>`,
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
  }, [map, navigate, patch, location, coords, patchOverlaps, onPatchHover, onPatchLeave, filtersOn, patchesToColors]);

  return null;
}

// Component to handle map panning functionality
function MapPanHandler({ 
  panToCoords, 
  setPanToCoords 
}: { 
  panToCoords: { latitude: number; longitude: number } | null;
  setPanToCoords: (coords: { latitude: number; longitude: number } | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (panToCoords && map) {
      map.setView([panToCoords.latitude, panToCoords.longitude], 19);
      setPanToCoords(null); // Reset after panning
    }
  }, [panToCoords, map, setPanToCoords]);

  return null;
}

export default function MapView() {
  const { patch } = useParams<{ patch?: string }>();
  const [showSidebar, setShowSidebar] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [panToCoords, setPanToCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [plantToColor, setPlantToColor] = useState<Map<number, string>>(new Map());
  const [patchesToColors, setPatchesToColors] = useState<Map<string, string[]>>(new Map());
  const [filtersOn, setFiltersOn] = useState(false);
  
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

  // Handle panning to user location
  const handlePanToLocation = (coords: { latitude: number; longitude: number }) => {
    setPanToCoords(coords);
  };

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
    <div className="flex h-full w-full relative py-4">
      <LeafletAssets />

      {/* Location Permission Dialog */}
      {hasCheckedPermissions && (
        <LocationPermissionDialog 
          open={showLocationDialog}
          onAccept={handleLocationAccept}
          onDecline={handleLocationDecline}
          onClose={handleLocationDecline}
        />
      )}

      {/* Mobile sidebar toggle button */}
      <button 
        className="md:hidden absolute top-2 left-2 z-20 bg-white p-2 rounded-full shadow-md"
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showSidebar ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Desktop sidebar - always visible */}
      <div className="hidden md:block">
        <Sidebar 
          patchInfo={patchInfo} 
          coords={coords} 
          locationPermissionStatus={locationPermissionStatus}
          onPanToLocation={handlePanToLocation}
          filtersOn={filtersOn}
          setFiltersOn={setFiltersOn}
          plantToColor={plantToColor}
          setPlantToColor={setPlantToColor}
          patchesToColors={patchesToColors}
          setPatchesToColors={setPatchesToColors}
        />
      </div>
      
      {/* Mobile sidebar - slides in from left */}
      {showSidebar && (
        <div className="md:hidden fixed inset-y-0 left-0 z-20 bg-white shadow-lg max-w-[90vw] w-80">
          <div className="flex justify-end p-2">
            <button onClick={() => setShowSidebar(false)} className="p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <Sidebar 
            patchInfo={patchInfo} 
            coords={coords} 
            locationPermissionStatus={locationPermissionStatus}
            onPanToLocation={handlePanToLocation}
            filtersOn={filtersOn}
            setFiltersOn={setFiltersOn}
            plantToColor={plantToColor}
            setPlantToColor={setPlantToColor}
            patchesToColors={patchesToColors}
            setPatchesToColors={setPatchesToColors}
          />
        </div>
      )}

      {/* Map container */}
      <div className="flex-1 h-full z-10">
        <MapContainer center={CENTER} zoom={19} scrollWheelZoom={true} zoomSnap={0.5} className="h-full">
          <TileLayer
            maxNativeZoom={20}
            maxZoom={20}
            attribution='&copy; <a href="https://www.google.com/permissions/geoguidelines/attr-guide.html">Google</a>'
            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          />
          <MapPanHandler 
            panToCoords={panToCoords}
            setPanToCoords={setPanToCoords}
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
                patchesToColors={patchesToColors}
                filtersOn={filtersOn}
              />
            </>
          )}
        </MapContainer>
      </div>

      {/* Hover preview - only on desktop since mobile doesn't have hover */}
      {hoveredPatch && (
        <div className="hidden md:block">
          <PatchHoverPreview 
            hoverData={hoveredPatch} 
            position={mousePosition}
          />
        </div>
      )}

      {/* Hidden desktop auto-opening snapshot view - triggers when patch is selected */}
      {patchInfo && (
        <div className="hidden md:block" style={{ position: 'absolute', left: '-9999px' }}>
          <SnapshotView 
            patch={patchInfo.label} 
            triggerTitle="View Latest Snapshot" 
            autoOpen={true}
          />
        </div>
      )}

      {/* Mobile bottom snapshot view - auto-shows when patch is selected on mobile */}
      {patchInfo && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-300 shadow-lg">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Patch {patchInfo.label} Selected</h3>
              <span className="text-sm text-gray-500">
                Row {patchInfo.row}, Column {String.fromCharCode(65 + patchInfo.col)}
              </span>
            </div>
            <SnapshotView 
              patch={patchInfo.label} 
              triggerTitle="View Latest Snapshot" 
              autoOpen={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
