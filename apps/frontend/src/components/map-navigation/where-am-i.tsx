import { Button } from '@/components/ui/button';
import { LatLngTuple } from 'leaflet';
import { useEffect, useState } from 'react';
import { useGeolocated } from "react-geolocated";
import { numCols, numRows, patchSizeLat, patchSizeLng, TOP_LEFT } from './constants';

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
    <div className="p-4 bg-white rounded shadow-md z-12 border border-gray-300">
      <h2 className="text-lg font-bold">Where Am I?</h2>
      <p className="text-sm text-gray-600">According to your GPS</p>
      <p className="text-sm text-gray-600">you are standing on:</p>
      <p className="text-sm text-gray-600">Patch: {patchName}</p>
      <Button>Inspect Patch</Button>
    </div>
  );
}