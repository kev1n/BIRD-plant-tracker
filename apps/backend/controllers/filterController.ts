import { Request, Response } from 'express';
import supabase from '../config/supabase.js';

const { data: patches, error: patchError } = await supabase.from('PatchInfo').select();

let patchIDs = patches && !patchError ? patches.map(patch => patch.patchID) : [];

export async function getFromFilter(req: Request, res: Response) {
  try {
    const {
      plantName,
      hasBloomed,
      subcatagory,
      datePlantedStart,
      datePlantedEnd,
      isNative,
      patchID,
      soilType,
    } = req.query;

    let query = supabase.from('Observations').select('*').is('deletedOn', null);

    if (patchError) {
      res.status(400).json({ error: patchError.message });
      return;
    }

    if (soilType) {
      patchIDs =
        patches && !patchError
          ? patches.filter(patch => patch.soilType === soilType).map(patch => patch.patchID)
          : [];
    }

    if (patchID) {
      if (patchIDs.includes(patchID)) {
        const { data, error } = await supabase
          .from('Snapshots')
          .select('snapshotID')
          .eq('patchID', patchID)
          .order('dateCreated', { ascending: false })
          .limit(1);

        if (error) {
          throw new Error(`Error fetching snapshot for patch ${patchID}: ${error.message}`);
        }

        query = query.eq('snapshotID', data[0].snapshotID);
      } else {
        res.status(200).json({ observations: [] });
      }
    } else {
      const latestSnapshots = await Promise.all(
        patchIDs.map(async patchID => {
          const { data, error } = await supabase
            .from('Snapshots')
            .select('snapshotID')
            .eq('patchID', patchID)
            .order('dateCreated', { ascending: false })
            .limit(1);

          if (error) {
            throw new Error(`Error fetching snapshot for patch ${patchID}: ${error.message}`);
          }
          return data && data.length > 0 ? data[0].snapshotID : null;
        })
      );

      const snapshotIDs = latestSnapshots.filter(id => id !== null);
      query = query.in('snapshotID', snapshotIDs);
    }

    if (plantName) {
      const { data: plant, error: plantError } = await supabase
        .from('PlantInfo')
        .select()
        .eq('plantCommonName', plantName)
        .limit(1);

      if (plantError) {
        res.status(400).json({ error: plantError.message });
        return;
      }

      if (plant) {
        const plantData = plant[0];

        const plantID = plantData.plantID;

        query = query.eq('plantID', plantID);
      }
    }

    if (hasBloomed) {
      query = query.eq('hasBloomed', hasBloomed === 'true');
    }

    if (isNative) {
      const { data: plants, error: plantError } = await supabase
        .from('PlantInfo')
        .select('plantID')
        .eq('isNative', isNative === 'true');

      if (plantError) {
        res.status(400).json({ error: plantError.message });
        return;
      }

      const plantIDs = plants.map(plant => plant.plantID);

      query = query.in('plantID', plantIDs);
    }

    if (subcatagory) {
      const { data: plants, error: plantError } = await supabase
        .from('PlantInfo')
        .select('plantID')
        .eq('subcategory', subcatagory);

      if (plantError) {
        res.status(400).json({ error: plantError.message });
        return;
      }

      const plantIDs = plants.map(plant => plant.plantID);

      query = query.in('plantID', plantIDs);
    }

    if (datePlantedStart && datePlantedEnd) {
      query = query.gte('datePlanted', datePlantedStart).lte('datePlanted', datePlantedEnd);
    } else if (datePlantedStart) {
      query = query.gte('datePlanted', datePlantedStart);
    } else if (datePlantedEnd) {
      query = query.lte('datePlanted', datePlantedEnd);
    }

    const { data: observations, error: error2 } = await query;

    if (error2) {
      res.status(400).json({ error: error2.message });
      return;
    }

    res.status(200).json({ observations });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}

export async function getHighlightedPatches(req: Request, res: Response) {
  try {
    const {plants, soilTypes, latest, beginDate, endDate } = req.query;

    if (typeof plants !== 'string' || typeof soilTypes !== 'string') {
      res.status(400).json({ error: 'Invalid query parameters' });
      return;
    }
    let plantIDs = plants ? JSON.parse(decodeURIComponent(plants)) : [];
    let soilTypeArray = soilTypes ? JSON.parse(decodeURIComponent(soilTypes)) : [];

    if (!Array.isArray(plantIDs) || !Array.isArray(soilTypeArray)) {
      res.status(400).json({ error: 'Invalid plant IDs or soil types format' });
      return;
    }

    if (plantIDs.length === 0)
      plantIDs = null;
    soilTypeArray = soilTypeArray.map(type => type.toLowerCase());
    if (soilTypeArray.length === 0 || soilTypeArray.length === 3)
      soilTypeArray = null;

    const date_latest = latest === 'true';
    let date_start = null;
    let date_end = null;

    if (!date_latest){
      if (beginDate && typeof beginDate === 'string') {
        date_start = new Date(beginDate);
        if (isNaN(date_start.getTime())) {
          date_start = null;
        }
      }

      if (endDate && typeof endDate === 'string') {
        date_end = new Date(endDate);
        if (isNaN(date_end.getTime())) {
          date_end = null;
        }
      }
    }

    const params = {
        latest: date_latest,
        plant_ids: plantIDs,
        soil_types: soilTypeArray,
        start_date: date_start,
        end_date: date_end,
      }
    const { data, error } = await supabase
      .rpc('filter_patches', params);
    if (error) {
      res.status(400).json({ error: `Error fetching highlighted patches: ${error.message}` });
      return;
    }
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}
