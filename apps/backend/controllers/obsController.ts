import { Request, Response } from 'express';
import supabase from '../config/supabase.js';
import {
  AuthRequest,
  UpdateObservationBody,
} from '../types.js';
import { isValidParam } from '../utils.js';

export async function newObservation( req: AuthRequest, res: Response ){
  try {

    // TODO: authentication and authorization

    const { snapshotID, plantQuantity, plantID, hasBloomed, datePlanted } = req.body;

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
          plantID: plantID,
          hasBloomed: hasBloomed || null,
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

export async function delObservation( req: AuthRequest, res: Response ){
  try {

    // TODO: authentication and authorization

    const { obsID } = req.params;

    if (!obsID) { // if obsID not passed
      res.status(400).json({ error: 'Missing observation ID'});
      return;
    }

    if (!isValidParam(obsID)){ // if obsID not an integer
      res.status(400).json({ error: 'Observation ID must be an integer'});
      return;
    }

    const currentTimestampz = new Date().toISOString(); // current time

    const { data, error } = await supabase // find observation to make sure it exists
      .from('Observations')
      .update({ deletedOn: currentTimestampz })
      .eq('observationID', obsID)
      .select();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (data.length == 0) { // observation does not exist
      res.status(400).json({ error: `Observation ID: ${obsID} is not valid`})
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

export async function updateObservation( req: AuthRequest, res: Response ){
  try {
    // TODO: authentication and authorization

    const { snapshotID, plantQuantity, plantID, hasBloomed, datePlanted } = req.body;

    const { obsID } = req.params;

    

    if (!obsID) { // if obsID not passed
      res.status(400).json({ error: 'Missing observation ID'});
      return;
    }

    if (!isValidParam(obsID)){ // if obsID not an integer
      res.status(400).json({ error: 'Observation ID must be an integer'});
      return;
    }

    const updates: UpdateObservationBody = {};

    if (snapshotID !== undefined) updates.snapshotID = snapshotID;
    if (plantQuantity !== undefined) updates.plantQuantity = plantQuantity;
    if (plantID !== undefined) updates.plantID = plantID;
    if (hasBloomed !== undefined) updates.hasBloomed = hasBloomed;
    if (datePlanted !== undefined) updates.datePlanted = datePlanted;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields provided to update' });
      return;
    }

    const { error } = await supabase
      .from('Observations')
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

    if (!isValidParam(obsID)){ // if obsID not an integer
      res.status(400).json({ error: 'Observation ID must be an integer'});
      return;
    }

    const { data: observation, error: obsError1 } = await supabase // find observation to make sure it exists
      .from('Observations')
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

    const { data: observations, error: obsError } = await supabase // find observation to make sure it exists
      .from('Observations')
      .select()

    if (obsError) {
      res.status(400).json({ error: obsError.message });
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

export async function getAllFromSnapshot(req: Request, res: Response){
  try{
    // TODO: authentication and authorization

    const { snapshotID } = req.params;

    if (!snapshotID) { // if obsID not passed
      res.status(400).json({ error: 'Missing snapshot ID'});
      return;
    }

    if (!/^\d+$/.test(snapshotID)){ // if snapshotID not an integer
      res.status(400).json({ error: 'Snapshot ID must be an integer'});
      return;
    }

    const { data: observations, error: obsError1 } = await supabase // find snapshot to make sure it exists
      .from('Observations')
      .select()
      .eq('snapshotID', snapshotID)

    if (obsError1) {
      res.status(400).json({ error: obsError1.message });
      return;
    }
    
    if (!observations) { // observation does not exist
      res.status(400).json({ error: `No observations for snapshot ID: ${snapshotID}`})
      return;
    }

    res.status(200).json({ observations })
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` })
  }
}
