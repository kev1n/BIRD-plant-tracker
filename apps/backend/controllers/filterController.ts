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

export async function getPatchesFilteredByLatestPlants(req: Request, res: Response) {
  try {
    const plantIDJson = req.query.plants;
    if (!plantIDJson) {
      res.status(400).json({ error: 'Plant IDs are required' });
      return;
    }
    if (typeof plantIDJson !== 'string') {
      res.status(400).json({ error: 'Invalid plant IDs format' });
      return;
    }

    // convert the plantIDJson to string

    const plantIDs = JSON.parse(decodeURIComponent(plantIDJson));


    // check if plantids is an empty array, if so , 
    const functionName = plantIDs.length!=0? 'filter_patches_by_latest_snapshot_and_plants' : 'filter_patches_by_latest_snapshot';
    const parameters = plantIDs.length > 0 ? { plant_ids: plantIDs } : {};
    const { data, error } = await supabase.rpc(functionName, parameters);


    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (!data || data.length === 0) {
      res.status(200).json({ data: [] });
      return;
    }
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}

export async function getPatchesFilteredByDateRangePlants(req: Request, res: Response) {
  console.log('getPatchesFilteredByDateRangePlants');
  try {
    const plantIDJson = req.query.plants;
    if (!plantIDJson) {
      res.status(400).json({ error: 'Plant IDs are required' });
      return;
    }
    if (typeof plantIDJson !== 'string') {
      res.status(400).json({ error: 'Invalid plant IDs format' });
      return;
    }

    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'Start date and end date are required' });
      return;
    }
    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    // startdate and enddate should be in ISO format
    if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      res.status(400).json({ error: 'Start date cannot be after end date' });
      return;
    }

    const start_date = new Date(startDate).toISOString();
    const end_date = new Date(endDate).toISOString();
    const plantIDs = JSON.parse(decodeURIComponent(plantIDJson));


    // check if plantids is an empty array, if so , 
    const functionName = plantIDs.length!=0? 'filter_patches_by_date_range_and_plants' : 'filter_patches_by_date_range';
    const parameters = plantIDs.length > 0 ? { plant_ids: plantIDs, start_date: start_date, end_date:end_date} : { start_date: start_date, end_date:end_date};
    const { data, error } = await supabase.rpc(functionName, parameters);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    if (!data || data.length === 0) {
      res.status(404).json({ error: 'No patches found for the given plant IDs' });
      return;
    }
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}
