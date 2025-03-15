import { Request, Response } from 'express';
import supabase from '../config/supabase.js';
import {
  AuthRequest,
  UpdateSnapshotBody
} from '../types.js';

export async function newSnapshot ( req: AuthRequest, res: Response){
  try {

    // TODO: authentication and authorization
    const { dateCreated, patchID, notes } = req.body;

    const userID = req.user?.id;

    // const { data: tempID, error: userError } = await supabase   // DELETE
    //   .from('users')                                            // DELETE
    //   .select('userID')                                         // DELETE
    //   .eq('email', 'danielkramer2027@u.northwestern.edu')       // DELETE
    //   .single();                                                // DELETE

    // if (!tempID) {                                              // TEMPORARY
    //   res.status(400).json({ error: userError});
    //   return;
    // }

    if (!userID || !dateCreated || !patchID) {
      res.status(400).json({ error: "Required fields missing"});
      return;
    }

    const { data: snapshotID, error: error } = await supabase
      .from('Snapshots')
      .insert([
        {
          userID: userID, // switch to tempID.userID to test
          dateCreated,
          patchID,
          notes: notes || null,
        },
      ])
      .select('snapshotID')
      .single();
    

    if(error){
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({
      message: "Snapshot created successfully",
      snapshotID: snapshotID,
    });
    

  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` })
  }
}

export async function delSnapshot ( req: AuthRequest, res: Response){
  try {

    // TODO: authentication and authorization

    const userID = req.user?.id;
    const { snapshotID } = req.params;

    if (!userID) {
      res.status(400).json({ error: userID});
      return;
    }

    if (!snapshotID) { // if snapshotID not passed
      res.status(400).json({ error: 'Missing snapshot ID'});
      return;
    }

    if (!/^\d+$/.test(snapshotID)){ // if snapshotID not an integer
      res.status(400).json({ error: 'Snapshot ID must be an integer'});
      return;
    }

    const { data: snapshot, error: Error1 } = await supabase // find snapshot to make sure it exists
      .from('Snapshots')
      .select()
      .eq('snapshotID', snapshotID)
      .single();

    if (Error1) {
      res.status(400).json({ error: Error1.message });
      return;
    }
    
    if (!snapshot) { // snapshot does not exist
      res.status(400).json({ error: `Snapshot ID: ${snapshotID} is not valid`})
      return;
    }

    const currentTimestampz = new Date().toISOString(); // current time

    const { error: Error2 } = await supabase
      .from('Snapshots')
      .update({ deletedOn: currentTimestampz })
      .eq('snapshotID', snapshotID);

    if (Error2) {
      res.status(400).json({ error: Error2.message });
      return;
    }

    res.status(200).json({ 
      message: "Snapshot deleted successfully",
      deletedOn: currentTimestampz,
    })
    

  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` })
  }
}

export async function updateSnapshot( req: AuthRequest, res: Response ){
  try {
    // TODO: authentication and authorization
    const authID = req.user?.id;

    if (!authID) {
      res.status(400).json({ error: authID});
      return;
    }

    const { dateCreated, notes, patchID, userID } = req.body;

    const { snapshotID } = req.params;

    if (!snapshotID) { // if snapshotID not passed
      res.status(400).json({ error: 'Missing snapshot ID'});
      return;
    }

    if (!/^\d+$/.test(snapshotID)){ // if snpashotID not an integer
      res.status(400).json({ error: 'Snapshot ID must be an integer'});
      return;
    }

    const updates: UpdateSnapshotBody = {};

    if (dateCreated !== undefined) updates.dateCreated = dateCreated;
    if (notes !== undefined) updates.notes = notes;
    if (patchID !== undefined) updates.patchID = patchID;
    if (userID !== undefined) updates.userID = userID;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields provided to update' });
      return;
    }

    const { error } = await supabase
      .from('Snapshots')
      .update(updates)
      .eq('snapshotID', snapshotID);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ message: 'Snapshot updated successfully'})

  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` })
  }
}

export async function getSnapshot(req: Request, res: Response){
  try{
    // TODO: authentication and authorization

    const { snapshotID } = req.params;

    if (!snapshotID) { // if snapshotID not passed
      res.status(400).json({ error: 'Missing snapshot ID'});
      return;
    }

    if (!/^\d+$/.test(snapshotID)){ // if snapshotID not an integer
      res.status(400).json({ error: 'Snapshot ID must be an integer'});
      return;
    }

    const { data: snapshot, error: Error1 } = await supabase // find snapshot to make sure it exists
      .from('Snapshots')
      .select()
      .eq('snapshotID', snapshotID)
      .single();

    if (Error1) {
      res.status(400).json({ error: Error1.message });
      return;
    }
    
    if (!snapshot) { // snapshot does not exist
      res.status(400).json({ error: `Snapshot ID: ${snapshotID} is not valid`})
      return;
    }

    res.status(200).json({ snapshot })
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` })
  }
}

export async function getAllSnapshots(req: Request, res: Response){
  try{
    // TODO: authentication and authorization

    const { data: snapshots, error: error } = await supabase
      .from('Snapshots')
      .select()

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    
    if (!snapshots) { // no snapshots exist
      res.status(400).json({ error: `No snapshotss`})
      return;
    }

    res.status(200).json({ data: snapshots })
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` })
  }
}
