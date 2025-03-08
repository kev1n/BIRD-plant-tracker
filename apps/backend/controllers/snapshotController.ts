import { Request, Response } from 'express';
import supabase from '../config/supabase.js';
import {
  Snapshot
} from '../types.js';

export async function newSnapshot ( req: Request<object, object, Snapshot>, res: Response){
  try {

    // TODO: authentication and authorization

    const { userID, dateCreated, patchID, notes } = req.body;

    if (!userID || !dateCreated || !patchID) {
      res.status(400).json({ error: 'Required fields are missing'});
      return;
    }

    const { data: snapshotID, error: error } = await supabase
      .from('snapshots')
      .insert([
        {
          userID,
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