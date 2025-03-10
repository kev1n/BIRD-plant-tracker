export interface PlantInformation {
  commonName: string;
  plantType?: string | null;
  scientificName?: string | null;
  native?: boolean | null;
  dateBloomed?: Date | null;
  datePlanted?: Date | null;
  quantity?: number | null;
  soilType?: string | null;
}