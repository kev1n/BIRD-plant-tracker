import { Button } from '@/components/ui/button';
import { useGeolocated } from "react-geolocated";
import { useState, useEffect } from 'react';
import { LatLngTuple } from 'leaflet';

// recalculations for the patchname
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

export default function WhereAmI() {
  const [patchName, setPatchName] = useState<string>("Detecting your location...");
  
  const { coords } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    userDecisionTimeout: 5000,
    watchPosition: true,
  });

  useEffect(() => {
    if (coords?.latitude && coords?.longitude) {
      let matchedPatchLabel: string | null = null;

      // Calculate which patch the user is in
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

          const label = `${String.fromCharCode(65 + col)}${row + 1}`;

          // Check if user coordinates are within this patch
          if (coords.latitude <= topLeft[0] && coords.latitude >= bottomRight[0] &&
              coords.longitude >= topLeft[1] && coords.longitude <= bottomRight[1]) {
            matchedPatchLabel = label;
            break;
          }
        }
      }

      if (matchedPatchLabel) {
        setPatchName(`You are on the ${matchedPatchLabel} patch`);
          }
      else if (coords?.latitude && coords?.longitude) {
        setPatchName("You are not on a patch right now");
      }
      else {
        setPatchName("Detecting your location...");
      }
    }
  }, [coords]);

  return (
    <div className="p-4 bg-white rounded shadow-md z-12">
      <h2 className="text-lg font-bold">Where Am I?</h2>
      <p className="text-sm text-gray-600">According to your GPS</p>
      <p className="text-sm text-gray-600">you are standing on:</p>
      <p className="text-sm text-gray-600">Patch: {patchName}</p>
      <Button>Inspect Patch</Button>
    </div>
  );
}