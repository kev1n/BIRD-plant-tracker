import { LatLngTuple } from 'leaflet';
import { PatchPolygonOverlap, StudyAreaPolygon } from '../../types/polygon.types';
import { TOP_LEFT, numCols, numRows, patchSizeLat, patchSizeLng } from '../components/map-navigation/constants';

/**
 * Parse KML coordinate string to LatLngTuple array
 * KML format: "lng,lat,altitude lng,lat,altitude ..."
 * Leaflet format: [lat, lng]
 */
export function parseKMLCoordinates(coordinateString: string): LatLngTuple[] {
  return coordinateString
    .trim()
    .split(' ')
    .filter(coord => coord.trim().length > 0)
    .map(coord => {
      const [lng, lat] = coord.split(',').map(Number);
      return [lat, lng] as LatLngTuple;
    })
    .filter(coord => !isNaN(coord[0]) && !isNaN(coord[1]));
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
export function isPointInPolygon(point: LatLngTuple, polygon: LatLngTuple[]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Calculate the overlap percentage of a rectangular patch with a polygon
 */
export function calculatePatchPolygonOverlap(
  patchTopLeft: LatLngTuple,
  patchBottomRight: LatLngTuple,
  polygon: LatLngTuple[]
): number {
  // Create sample points within the patch rectangle
  const samplePoints = 25; // 5x5 grid of sample points
  const latStep = (patchTopLeft[0] - patchBottomRight[0]) / 4;
  const lngStep = (patchBottomRight[1] - patchTopLeft[1]) / 4;
  
  let pointsInside = 0;
  
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const samplePoint: LatLngTuple = [
        patchTopLeft[0] - (i * latStep),
        patchTopLeft[1] + (j * lngStep)
      ];
      
      if (isPointInPolygon(samplePoint, polygon)) {
        pointsInside++;
      }
    }
  }
  
  return pointsInside / samplePoints;
}

/**
 * Get patch coordinates from patch label (e.g., "A1" -> coordinates)
 */
export function getPatchCoordinates(patchLabel: string): { topLeft: LatLngTuple; bottomRight: LatLngTuple } {
  const colChar = patchLabel.charAt(0);
  const row = parseInt(patchLabel.substring(1)) - 1;
  const col = colChar.charCodeAt(0) - 65; // A=0, B=1, etc.

  const topLeft: LatLngTuple = [
    TOP_LEFT[0] - row * patchSizeLat,
    TOP_LEFT[1] + col * patchSizeLng,
  ];
  const bottomRight: LatLngTuple = [
    TOP_LEFT[0] - (row + 1) * patchSizeLat,
    TOP_LEFT[1] + (col + 1) * patchSizeLng,
  ];

  return { topLeft, bottomRight };
}

/**
 * Find all patches that overlap with any polygon
 */
export function findPatchPolygonOverlaps(polygons: StudyAreaPolygon[]): PatchPolygonOverlap[] {
  const overlaps: PatchPolygonOverlap[] = [];

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const patchLabel = `${String.fromCharCode(65 + col)}${row + 1}`;
      const { topLeft, bottomRight } = getPatchCoordinates(patchLabel);
      
      const overlappingPolygons: string[] = [];
      let maxOverlap = 0;
      
      for (const polygon of polygons) {
        const overlapPercentage = calculatePatchPolygonOverlap(topLeft, bottomRight, polygon.coordinates);
        if (overlapPercentage > 0) {
          overlappingPolygons.push(polygon.id);
          maxOverlap = Math.max(maxOverlap, overlapPercentage);
        }
      }
      
      if (overlappingPolygons.length > 0) {
        overlaps.push({
          patchId: patchLabel,
          polygonIds: overlappingPolygons,
          isCompletelyInside: maxOverlap >= 0.8, // 80% threshold for "completely inside"
          overlapPercentage: maxOverlap
        });
      }
    }
  }

  return overlaps;
}

/**
 * Predefined polygon data extracted from KML
 */
export const STUDY_AREA_POLYGONS: StudyAreaPolygon[] = [
  {
    id: 'northern-section',
    name: 'Northern Study Area',
    color: '#4CAF50', // Green
    opacity: 0.0,
    coordinates: parseKMLCoordinates(
      '-87.67381894118843,42.0487214904568,0 -87.67376340710786,42.0486926936019,0 -87.67370660258783,42.04865106043587,0 -87.67365185166223,42.04860084306163,0 -87.67356356730849,42.04854503768136,0 -87.67352998980799,42.04856693083153,0 -87.6735158693777,42.04855815070886,0 -87.67342087904778,42.04863065211639,0 -87.67345832372597,42.04865958946923,0 -87.67340811325208,42.0486879654559,0 -87.67335880093202,42.04872561576402,0 -87.67334150398729,42.04878218701919,0 -87.67334483098026,42.04884392287354,0 -87.67337655240613,42.0488996863408,0 -87.67342829998391,42.04894038329563,0 -87.6734966021574,42.04896506976685,0 -87.67356820597831,42.04897084992163,0 -87.67363245241641,42.0489619542218,0 -87.67371876512821,42.04893718264169,0 -87.67381728701888,42.0489234825252,0 -87.67388921827148,42.04891699450956,0 -87.67393318816633,42.04890329569203,0 -87.67393308237565,42.04886279484571,0 -87.67390453631653,42.04881360621127,0 -87.67385925099201,42.04876359294468,0 -87.67381894118843,42.0487214904568,0'
    )
  },
  {
    id: 'southern-section',
    name: 'Southern Study Area', 
    color: '#FF9800', // Orange
    opacity: 0.0,
    coordinates: parseKMLCoordinates(
      '-87.67379808141905,42.0489675838944,0 -87.67369901497437,42.04899878097044,0 -87.67360468631459,42.04907280507256,0 -87.67355944180096,42.04914588392917,0 -87.67354813976182,42.04924193402527,0 -87.67355494689156,42.04932358002148,0 -87.67351377718717,42.0494381435654,0 -87.67343500822551,42.04951630128786,0 -87.67334017366314,42.0495621774656,0 -87.67325672092895,42.04958404612555,0 -87.67314668027197,42.04959244291432,0 -87.67305504791749,42.04958258312658,0 -87.67292720712298,42.04959686917915,0 -87.67293289352394,42.04962139744303,0 -87.67290351437266,42.04977591637072,0 -87.67291245948822,42.04988735554539,0 -87.67289148495958,42.04997788930297,0 -87.67286339402247,42.05000199498352,0 -87.67303201754815,42.05005099035767,0 -87.67305572799125,42.05003144291501,0 -87.67314073035782,42.04997831729582,0 -87.67329458532977,42.04992402192477,0 -87.6734247220125,42.04990710184264,0 -87.67351876140849,42.04990913062804,0 -87.67352408860772,42.0498613462214,0 -87.67359037460905,42.04987004432881,0 -87.67358060339969,42.04991830218848,0 -87.67384361023645,42.04998021011053,0 -87.67389675685715,42.04997676479498,0 -87.67396772370751,42.04993996520691,0 -87.67398848874015,42.04989861858976,0 -87.67398443859594,42.04983111931372,0 -87.67396254479972,42.04978803442843,0 -87.67395517235377,42.04971372841788,0 -87.67394253538194,42.04960529018523,0 -87.67390839496967,42.04954003701938,0 -87.67389146037445,42.04946973444386,0 -87.67389185629841,42.04937958008667,0 -87.67390408151338,42.04925832405637,0 -87.67383300835897,42.04925672258828,0 -87.67383551772564,42.04920251903784,0 -87.67390667725526,42.04920922539925,0 -87.67392867477055,42.04896172851593,0 -87.67379808141905,42.0489675838944,0'
    )
  }
]; 