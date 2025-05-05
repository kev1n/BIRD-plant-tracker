import { Request, Response } from 'express';
import supabase from '../config/supabase.js';
import { AuthRequest, UpdateSnapshotBody } from '../types.js';
import { isValidParam, isValidPatch } from '../utils.js';

export async function newSnapshot(req: AuthRequest, res: Response) {
  try {
    const { dateCreated, patchID, notes } = req.body;

    const userID = req.user?.id;

    if (!userID || !dateCreated || !patchID) {
      res.status(400).json({ error: 'Required fields missing' });
      return;
    }

    const { data: snapshotID, error: error } = await supabase
      .from('Snapshots')
      .insert([
        {
          userID: userID,
          dateCreated,
          patchID,
          notes: notes || null,
        },
      ])
      .select('snapshotID')
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({
      message: 'Snapshot created successfully',
      snapshotID: snapshotID,
    });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}

export async function delSnapshot(req: AuthRequest, res: Response) {
  try {
    const userID = req.user?.id;
    const { snapshotID } = req.params;

    if (!userID) {
      res.status(400).json({ error: userID });
      return;
    }

    if (!snapshotID) {
      // if snapshotID not passed
      res.status(400).json({ error: 'Missing snapshot ID' });
      return;
    }

    if (!isValidParam(snapshotID)) {
      // if snapshotID not an integer
      res.status(400).json({ error: 'Snapshot ID must be an integer' });
      return;
    }

    const currentTimestampz = new Date().toISOString(); // current time

    const { data, error } = await supabase
      .from('Snapshots')
      .update({ deletedOn: currentTimestampz })
      .eq('snapshotID', snapshotID)
      .select();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (data.length == 0) {
      // snapshot does not exist
      res.status(400).json({ error: `Snapshot ID: ${snapshotID} is not valid` });
      return;
    }

    res.status(200).json({
      message: 'Snapshot deleted successfully',
      deletedOn: currentTimestampz,
    });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}

export async function updateSnapshot(req: AuthRequest, res: Response) {
  try {
    const authID = req.user?.id;

    if (!authID) {
      res.status(400).json({ error: authID });
      return;
    }

    const { dateCreated, notes, patchID, userID } = req.body;

    const { snapshotID } = req.params;

    if (!snapshotID) {
      // if snapshotID not passed
      res.status(400).json({ error: 'Missing snapshot ID' });
      return;
    }

    if (!isValidParam(snapshotID)) {
      // if snpashotID not an integer
      res.status(400).json({ error: 'Snapshot ID must be an integer' });
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

    const { error } = await supabase.from('Snapshots').update(updates).eq('snapshotID', snapshotID);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ message: 'Snapshot updated successfully' });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}

export async function getSnapshot(req: Request, res: Response) {
  try {
    const { snapshotID } = req.params;

    if (!snapshotID) {
      // if snapshotID not passed
      res.status(400).json({ error: 'Missing snapshot ID' });
      return;
    }

    if (!isValidParam(snapshotID)) {
      // if snapshotID not an integer
      res.status(400).json({ error: 'Snapshot ID must be an integer' });
      return;
    }

    const { data, error } = await supabase // find snapshot to make sure it exists
      .from('Snapshots')
      .select('*, users(username)')
      .eq('snapshotID', snapshotID)
      .is("deletedOn", null)
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (data.length == 0) {
      // snapshot does not exist
      res.status(400).json({ error: `Snapshot ID: ${snapshotID} is not valid` });
      return;
    }

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}

export async function getLatestPatchSnapshot(req: Request, res: Response) {
  try {
    const { patchID } = req.params;

    if (!patchID) {
      // if snapshotID not passed
      res.status(400).json({ error: 'Missing snapshot ID' });
      return;
    }

    if (!isValidPatch(patchID)) {
      // if patchID not proper
      res.status(400).json({ error: 'Patch ID is invalid' });
      return;
    }

    const { data, error } = await supabase // find snapshot to make sure it exists
      .from('Snapshots')
      .select('*, users(username)') // join with users to get username
      .eq('patchID', patchID)
      .is('deletedOn', null)
      .order('dateCreated', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (!data) {
      // no snapshots for patchid
      res.status(404).json({ error: `Patch ID: ${patchID} does not have any snapshots` });
      return;
    }

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}

export async function getAllSnapshots(req: Request, res: Response) {
  try {
    const { data: snapshots, error: error } = await supabase
      .from('Snapshots')
      .select()
      .is('deletedOn', null);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (!snapshots) {
      // no snapshots exist
      res.status(400).json({ error: `No snapshotss` });
      return;
    }

    res.status(200).json({ data: snapshots });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}

export async function getAllSnapshotsDatesForPatch(req: Request, res: Response) {
  try {
    const { patchID } = req.params;
    if (!patchID) {
      // if patchID not passed
      res.status(400).json({ error: 'Missing patch ID' });
      return;
    }
    if (!isValidPatch(patchID)) {
      // if patchID not proper
      res.status(400).json({ error: 'Patch ID is invalid' });
      return;
    }

    const { data: snapshots, error: error } = await supabase
      .from('Snapshots')
      .select('snapshotID, dateCreated') // only select necessary fields
      .eq('patchID', patchID)
      .is('deletedOn', null)
      .order('dateCreated', { ascending: false });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (!snapshots || snapshots.length === 0) {
      res.status(404).json({ error: `No snapshots found for Patch ID: ${patchID}` });
      return;
    }

    res.status(200).json({
      data: snapshots,
    });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}
