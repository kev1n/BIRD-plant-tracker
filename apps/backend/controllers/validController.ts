import { Request, Response } from 'express';
import supabase from '../config/supabase.js';

export async function validSoil(req: Request, res: Response){
  try {
    const { data: soils, error } = await supabase
      .from('ValidSoilTypes')
      .select()
      .is('deletedOn', null);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ data: soils });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}

export async function validRoles(req: Request, res: Response){
  try {
    const { data: roles, error } = await supabase
      .from('ValidRoles')
      .select()
      .is('deletedOn', null);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ data: roles });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}

export async function validSubcategories(req: Request, res: Response){
  try {
    const { data: categories, error } = await supabase
      .from('ValidSubcategories')
      .select()
      .is('deletedOn', null);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ data: categories });
  } catch (error) {
    res.status(500).json({ error: `Internal server error: ${error}` });
  }
}
