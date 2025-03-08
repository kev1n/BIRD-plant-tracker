import { Request, Response } from 'express';
import supabase from '../config/supabase.js';
import {
  ObservationBody,
  UpdateObservationBody,
  UpdateObservationParams
} from '../types.js';

export async function newObservation( req: Request<object, object, ObservationBody>, res: Response ){
  try {

    // TODO: authentication and authorization

    const { snapshotID, plantQuantity, plantID, soilType, dateBloomed, datePlanted } = req.body;

    if (!snapshotID || !plantQuantity || !plantID){
      res.status(400).json({ error: 'Required fields are missing'});
      return;
    }

    const { data: obsID, error: obsError } = await supabase
      .from('Observations')
      .insert([
        {
          snapshotID,
          plantQuantity,
          plantID,
          soilType: soilType || null,
          dateBloomed: dateBloomed || null,
          datePlanted: datePlanted || null,
        },
      ])
      .select('observationID')
      .single();

    if (obsError) {
      res.status(400).json({ error: obsError.message });
      return;
    }

    res.status(201).json({
      message: 'Observation created successfully',
      obsID: obsID,
    });

  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` })
  }
}

export async function delObservation( req: Request, res: Response ){
  try {

    // TODO: authentication and authorization

    const { obsID } = req.params;

    if (!obsID) { // if obsID not passed
      res.status(400).json({ error: 'Missing observation ID'});
      return;
    }

    if (!/^\d+$/.test(obsID)){ // if obsID not an integer
      res.status(400).json({ error: 'Observation ID must be an integer'});
      return;
    }

    const { data: observation, error: obsError1 } = await supabase // find observation to make sure it exists
      .from('observations')
      .select()
      .eq('observationID', obsID)
      .single();

    if (obsError1) {
      res.status(400).json({ error: obsError1.message });
      return;
    }
    
    if (!observation) { // observation does not exist
      res.status(400).json({ error: `Observation ID: ${obsID} is not valid`})
      return;
    }

    const currentTimestampz = new Date().toISOString(); // current time

    const { error: obsError2 } = await supabase
      .from('observations')
      .update({ deletedOn: currentTimestampz })
      .eq('observationID', obsID);

    if (obsError2) {
      res.status(400).json({ error: obsError2.message });
      return;
    }

    res.status(200).json({ 
      message: "Observation deleted successfully",
      deletedOn: currentTimestampz,
    })

  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` })
  }
}

export async function updateObservation( req: Request<UpdateObservationParams, object, UpdateObservationBody>, res: Response ){
  try {
    // TODO: authentication and authorization

    const { snapshotID, plantQuantity, plantID, soilType, dateBloomed, datePlanted } = req.body;

    const { obsID } = req.params;

    if (!obsID) { // if obsID not passed
      res.status(400).json({ error: 'Missing observation ID'});
      return;
    }

    if (!/^\d+$/.test(obsID)){ // if obsID not an integer
      res.status(400).json({ error: 'Observation ID must be an integer'});
      return;
    }

    const updates: UpdateObservationBody = {};

    if (snapshotID !== undefined) updates.snapshotID = snapshotID;
    if (plantQuantity !== undefined) updates.plantQuantity = plantQuantity;
    if (plantID !== undefined) updates.plantID = plantID;
    if (soilType !== undefined) updates.soilType = soilType;
    if (dateBloomed !== undefined) updates.dateBloomed = dateBloomed;
    if (datePlanted !== undefined) updates.datePlanted = datePlanted;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields provided to update' });
      return;
    }

    const { error } = await supabase
      .from('observations')
      .update(updates)
      .eq('observationID', obsID);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ message: 'Observation updated successfully'})

  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` })
  }
}

export async function getObservation(req: Request, res: Response){
  try{
    // TODO: authentication and authorization

    const { obsID } = req.params;

    if (!obsID) { // if obsID not passed
      res.status(400).json({ error: 'Missing observation ID'});
      return;
    }

    if (!/^\d+$/.test(obsID)){ // if obsID not an integer
      res.status(400).json({ error: 'Observation ID must be an integer'});
      return;
    }

    const { data: observation, error: obsError1 } = await supabase // find observation to make sure it exists
      .from('observations')
      .select()
      .eq('observationID', obsID)
      .single();

    if (obsError1) {
      res.status(400).json({ error: obsError1.message });
      return;
    }
    
    if (!observation) { // observation does not exist
      res.status(400).json({ error: `Observation ID: ${obsID} is not valid`})
      return;
    }

    res.status(200).json({ observation })
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` })
  }
}

export async function getAllObservation(req: Request, res: Response){
  try{
    // TODO: authentication and authorization

    const { data: observations, error: obsError1 } = await supabase // find observation to make sure it exists
      .from('observations')
      .select()

    if (obsError1) {
      res.status(400).json({ error: obsError1.message });
      return;
    }
    
    if (!observations) { // observation does not exist
      res.status(400).json({ error: `No observations`})
      return;
    }

    res.status(200).json({ data: observations })
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` })
  }
}