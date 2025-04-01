export interface PlantInfo{
  plantID: string;
  plantCommonName: string;
  plantScientificName: string| null;
  isNative: boolean| null;
  subcategory: string;
}

export interface Observation {
  observationID: string;
  snapshotID: string;
  PlantInfo: PlantInfo;
  plantQuantity: number;
  soilType: string;
  datePlanted: Date | null;
  dateBloomed: Date | null;
  hasBloomed: boolean| null;
  deletedOn: Date | null;
}

export interface Snapshot {
  snapshotID: string;
  dateCreated: Date;
  patchID: string;
  notes: string | null;
  userID: string;
}