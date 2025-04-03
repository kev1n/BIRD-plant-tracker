export interface PlantInfo{
  plantID: number;
  plantCommonName: string;
  plantScientificName: string| null;
  isNative: boolean| null;
  subcategory: string;
}

export interface Observation {
  tempKey: number;
  isNew: boolean;
  modified: boolean;
  observationID: number;
  snapshotID: number;
  PlantInfo: PlantInfo;
  plantQuantity: number;
  datePlanted: Date | null;
  dateBloomed: Date | null;
  hasBloomed: boolean| null;
  deletedOn: Date | null;
}

export interface Snapshot {
  snapshotID?: number;
  dateCreated: Date;
  patchID: string;
  notes: string | null;
  userID: string;
  soilType: string|null;
}