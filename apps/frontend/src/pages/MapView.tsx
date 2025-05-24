import SnapshotView from '@/components/snapshots/snapshot-view';
import { LatLngTuple, LayerGroup, Marker, Rectangle, divIcon } from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import LeafletAssets from '../components/LeafletAssets';
import FiltersList from '@/components/filters/filters-list';
import WhereAmI from '@/components/map-navigation/where-am-i';
import { PlantInfo } from 'types/database_types';

// Constants for the grid
const GRID_SIZE_FEET = 15;
const EARTH_RADIUS_FEET = 20902231; // Earth's radius in feet
const CENTER_LAT = 42.04937; // Our center latitude

// Calculate accurate conversion factors
const FEET_TO_DEGREES_LAT = (1 / EARTH_RADIUS_FEET) * (180 / Math.PI); // For latitude
const FEET_TO_DEGREES_LNG =
  (1 / (EARTH_RADIUS_FEET * Math.cos((CENTER_LAT * Math.PI) / 180))) * (180 / Math.PI); // For longitude

// Grid boundaries
const TOP_LEFT: LatLngTuple = [42.0500576, -87.6739709];
const BOTTOM_RIGHT: LatLngTuple = [42.0485898, -87.6729095];
const CENTER: LatLngTuple = [42.04937, -87.673388];

// Calculate grid dimensions
const latDiff = TOP_LEFT[0] - BOTTOM_RIGHT[0];
const lngDiff = BOTTOM_RIGHT[1] - TOP_LEFT[1];
const patchSizeLat = GRID_SIZE_FEET * FEET_TO_DEGREES_LAT;
const patchSizeLng = GRID_SIZE_FEET * FEET_TO_DEGREES_LNG;

// Calculate number of patchs
const numCols = Math.ceil(lngDiff / patchSizeLng);
const numRows = Math.ceil(latDiff / patchSizeLat);

// Label offset from grid (in degrees)
const GRID_LABEL_OFFSET = 0.8;
const LABEL_OFFSET_LAT = patchSizeLat * GRID_LABEL_OFFSET;
const LABEL_OFFSET_LNG = patchSizeLng * GRID_LABEL_OFFSET;

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
    <div className="w-50 p-5 bg-gray-50 h-[500px] overflow-y-auto shadow-md">
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
  filteredStartDate,
  filteredEndDate,
  filteredLatest,
  filteredPlants,
}: {
  filteredStartDate?: Date;
  filteredEndDate?: Date;
  filteredLatest?: boolean;
  filteredPlants?: PlantInfo[];
}) {
  const map = useMap();
  const navigate = useNavigate();
  const location = useLocation();
  const gridRef = useRef<LayerGroup | null>(null);
  const { patch } = useParams<{ patch?: string }>();
  const patchRectangleRefs = useRef<Map<string, Rectangle>>(new Map());

  useEffect(() => {
    if (!map) return;
    // Create a new LayerGroup
    gridRef.current = new LayerGroup();
    map.addLayer(gridRef.current);

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

        // Create rectangle for grid patch
        // TODO: Match with color variables from project
        const rect = new Rectangle([topLeft, bottomRight], {
          color: '#000000',
          weight: 1,
          fillColor: isSelected ? '#4a90e2' : '#000000',
          fillOpacity: isSelected ? 0.7 : 0,
        });

        // Store the rectangle in the ref for later access
        patchRectangleRefs.current.set(label, rect);

        // Make patchs clickable
        rect.on('click', () => {
          navigate(`/map/${label}`, { replace: true });
        });

        rect.addTo(gridRef.current);
        // make the rectangle
      }
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

    return () => {
      if (gridRef.current) {
        map.removeLayer(gridRef.current);
      }
    };
  }, [map, navigate, patch, location]);

  useEffect(() => {
    if (!gridRef.current || !patchRectangleRefs.current) return;

    async function fetchHighlightedPatches() {
      try {
        const token = localStorage.getItem('authToken');
        const baseUrl = import.meta.env.VITE_BACKEND_URL || '';

        const encodedPlantIDsJson = JSON.stringify(
          filteredPlants ? filteredPlants.map(plant => plant.plantID) : []
        );
        console.log('Encoded Plant IDs JSON:', encodedPlantIDsJson);
        const plantList = encodeURIComponent(encodedPlantIDsJson);

        if (!filteredLatest && (!filteredStartDate || !filteredEndDate)) {
          return;
        }

        const url =
          baseUrl +
          (filteredLatest ? '/filter/latest-plant?plants=' : '/filter/date-range-plant?plants=') +
          plantList +
          ('&startDate=' +
            (filteredStartDate ? filteredStartDate.toISOString() : '') +
            '&endDate=' +
            (filteredEndDate ? filteredEndDate.toISOString() : ''));
        console.log('Fetching highlighted patches from:', url);
        const response = await fetch(`${url}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch highlighted patches');
        }
        const data = await response.json();
        const highlightedPatches: string[] = data.data.map(
          (value: { patchid: string }) => value.patchid
        );
        patchRectangleRefs.current.forEach((rect, label) => {
          if (label === patch) {
            rect.setStyle({
              fillColor: '#4a90e2',
              fillOpacity: 0.7,
            });
          } else if (highlightedPatches.includes(label)) {
            rect.setStyle({
              fillColor: '#f1c40f',
              fillOpacity: 0.5,
            });
          } else {
            rect.setStyle({
              fillColor: '#000000', // Default color for unhighlighted patches
              fillOpacity: 0,
            });
          }
        });
      } catch (error) {
        console.error('Error fetching highlighted patches:', error);
      }
    }
    fetchHighlightedPatches().catch(console.error);
  }, [patch, filteredStartDate, filteredEndDate, filteredLatest, filteredPlants]);

  return null;
}

export default function MapView() {
  const { patch } = useParams<{ patch?: string }>();

  const [beginDate, setBeginDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedPlants, setSelectedPlants] = useState<PlantInfo[]>([]);
  const [latest, setLatest] = useState(false);

  // Parse patch into row and column if patch is defined
  let patchInfo = null;
  if (patch) {
    const colChar = patch.charAt(0);
    const row = parseInt(patch.substring(1)) - 1;
    const col = colChar.charCodeAt(0) - 65; // A=0, B=1, etc.
    patchInfo = { row: row + 1, col, label: patch };
  }

  return (
    <div className="flex h-full w-full relative">
      <LeafletAssets />

      <div className="absolute top-12 left-0 p-4 z-12">
        <WhereAmI />
        <FiltersList
          beginDate={beginDate}
          setBeginDate={setBeginDate}
          endDate={endDate}
          setEndDate={setEndDate}
          selectedPlants={selectedPlants}
          setSelectedPlants={setSelectedPlants}
          latest={latest}
          setLatest={setLatest}
        />
      </div>

      <div className="flex-1 h-[500px] z-10">
        <MapContainer center={CENTER} zoom={30} scrollWheelZoom={true} className="h-full">
          <TileLayer
            maxNativeZoom={30}
            attribution='&copy; <a href="https://www.google.com/permissions/geoguidelines/attr-guide.html">Google</a>'
            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          />
          <GridOverlay
            filteredStartDate={beginDate}
            filteredEndDate={endDate}
            filteredLatest={latest}
            filteredPlants={selectedPlants}
          />
        </MapContainer>
      </div>

      <div>
        <Sidebar patchInfo={patchInfo} />
      </div>
    </div>
  );
}
