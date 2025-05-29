// recalculations for the patchname

import { LatLngTuple } from "leaflet";

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

export { CENTER, LABEL_OFFSET_LAT, LABEL_OFFSET_LNG, numCols, numRows, patchSizeLat, patchSizeLng, TOP_LEFT };

