export interface PlantInfo {
  plantID: number;
  plantCommonName: string;
  plantScientificName: string | null;
  isNative: boolean | null;
  subcategory?: string | null;
}

/**
 * Update with the remaining fields when needed
 */
export interface Snapshots {
  dateCreated: string;
  patchID: string;
  notes: string | null;
  users: {
    username: string;
  };
}

export interface Observation {
  tempKey: number;
  isNew: boolean;
  modified: boolean;
  observationID: number;
  snapshotID: number;
  PlantInfo: PlantInfo;
  Snapshots?: Snapshots;
  plantQuantity: number;
  datePlanted: Date | null;
  hasBloomed: boolean | null;
  deletedOn: Date | null;
}

export interface Snapshot {
  snapshotID?: number;
  dateCreated: Date;
  patchID: string;
  notes: string | null;
  userID: string;
}
