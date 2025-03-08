import { LatLngTuple, LayerGroup, Marker, Rectangle, divIcon } from 'leaflet';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

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
const BOTTOM_RIGHT: LatLngTuple = [42.0485898, -87.6727095];
const CENTER: LatLngTuple = [42.04937, -87.673388];

// Calculate grid dimensions
const latDiff = TOP_LEFT[0] - BOTTOM_RIGHT[0];
const lngDiff = BOTTOM_RIGHT[1] - TOP_LEFT[1];
const cellSizeLat = GRID_SIZE_FEET * FEET_TO_DEGREES_LAT;
const cellSizeLng = GRID_SIZE_FEET * FEET_TO_DEGREES_LNG;

// Calculate number of cells
const numCols = Math.ceil(lngDiff / cellSizeLng);
const numRows = Math.ceil(latDiff / cellSizeLat);

// Label offset from grid (in degrees)
const LABEL_OFFSET_LAT = cellSizeLat * 0.5; // Half a cell above the grid
const LABEL_OFFSET_LNG = cellSizeLng * 0.5; // Half a cell to the left of the grid

function GridOverlay() {
  const map = useMap();
  const gridRef = useRef<LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create a new LayerGroup
    gridRef.current = new LayerGroup();
    map.addLayer(gridRef.current);

    // Create grid cells
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const topLeft: LatLngTuple = [
          TOP_LEFT[0] - row * cellSizeLat,
          TOP_LEFT[1] + col * cellSizeLng,
        ];
        const bottomRight: LatLngTuple = [
          TOP_LEFT[0] - (row + 1) * cellSizeLat,
          TOP_LEFT[1] + (col + 1) * cellSizeLng,
        ];

        // Create rectangle for grid cell
        const rect = new Rectangle([topLeft, bottomRight], {
          color: '#666',
          weight: 1,
          fillColor: '#666',
          fillOpacity: 0.1,
        });

        rect.addTo(gridRef.current);
      }
    }

    // Add column labels (A-Z)
    for (let col = 0; col < numCols; col++) {
      const labelPos: LatLngTuple = [
        TOP_LEFT[0] + LABEL_OFFSET_LAT,
        TOP_LEFT[1] + col * cellSizeLng + cellSizeLng / 2,
      ];
      const marker = new Marker(labelPos, {
        icon: divIcon({
          className: 'grid-label',
          html: String.fromCharCode(65 + col),
        }),
      });
      marker.addTo(gridRef.current);
    }

    // Add row labels (1-1000)
    for (let row = 0; row < numRows; row++) {
      const labelPos: LatLngTuple = [
        TOP_LEFT[0] - row * cellSizeLat - cellSizeLat / 2,
        TOP_LEFT[1] - LABEL_OFFSET_LNG,
      ];
      const marker = new Marker(labelPos, {
        icon: divIcon({
          className: 'grid-label',
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
  }, [map]);

  return null;
}

export default function MapView() {
  return (
    <>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
        />
        <style>
          {`
            .grid-label {
              background: none;
              border: none;
              box-shadow: none;
              font-size: 12px;
              font-weight: bold;
              color: #333;
              text-align: center;
              line-height: 1;
              white-space: nowrap;
            }
          `}
        </style>
      </head>

      <MapContainer center={CENTER} zoom={30} scrollWheelZoom={true} className="h-[500px]">
        <TileLayer
          attribution='&copy; <a href="https://www.google.com/permissions/geoguidelines/attr-guide.html">Google</a>'
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
        />
        <GridOverlay />
      </MapContainer>
    </>
  );
}
