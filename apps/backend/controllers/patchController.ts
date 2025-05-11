import { Request, Response } from 'express';
import supabase from '../config/supabase.js';
import { AuthRequest, UpdatePatchBody } from '../types.js';

export async function newPatch(req: AuthRequest, res: Response) {
  try {
    
    const {patchID, latitude, longitude, soilType} = req.body;

    if (!patchID){
      res.status(400).json({ error: 'patchID is missing' });
      return;
    }

    const { error } = await supabase
      .from('PatchInfo')
      .insert([
        {
          patchID,
          latitude: latitude || null,
          longitude: longitude || null,
          soilType: soilType,
        },
      ])

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({
      message: 'Patch created successfully',
    });
  } catch (error){
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}

export async function deletePatch(req: AuthRequest, res: Response){
  try {
    const {patchID} = req.params;

    const currentTimestampz = new Date().toISOString();

    const { data, error } = await supabase
      .from('PatchInfo')
      .update({ deletedOn: currentTimestampz })
      .eq('patchID', patchID)
      .select();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (data.length == 0) {
      res.status(400).json({ error: `Patch ID: ${patchID} is not valid` });
      return;
    }

    res.status(200).json({
      message: 'Patch deleted successfully',
      deletedOn: currentTimestampz,
    });

  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}

export async function updatePatch(req: AuthRequest, res: Response){
  try {
    const { patchID } = req.params;
    const { latitude, longitude, soilType } = req.body;

    if (!patchID) {
      res.status(400).json({ error: 'Missing patch ID' });
      return;
    }

    const updates: UpdatePatchBody = {};

    if (latitude !== undefined) updates.latitude = latitude;
    if (longitude !== undefined) updates.longitude = longitude;
    if (soilType !== undefined) updates.soilType = soilType;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No fields provided to update' });
      return;
    }

    const { error } = await supabase
      .from('PatchInfo')
      .update(updates)
      .eq('patchID', patchID);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ message: 'Patch updated successfully' });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}

export async function getPatch(req: AuthRequest, res: Response){
  try {
    const { patchID } = req.params;

    if (!patchID) {
      res.status(400).json({ error: 'Missing patch ID' });
      return;
    }

    const { data, error } = await supabase
      .from('PatchInfo')
      .select()
      .eq('patchID', patchID)
      .is('deletedOn', null) 
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (!data) {
      res.status(400).json({ error: `Patch ID: ${patchID} is not valid` });
      return;
    }

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}

export async function getAllPatches(req: Request, res: Response) {
  try {
    const { data, error } = await supabase
      .from('PatchInfo')
      .select()
      .is('deletedOn', null);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (!data) {
      res.status(400).json({ error: `No patches` });
      return;
    }

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}
