import { Request, Response } from 'express';
import supabase from '../config/supabase.js';


export async function getPlant(req: Request, res: Response)
{
    try {
        // TODO: authentication and authorization 

        const {plantID} = req.params;

        if (!plantID) {
            // if plantID not passed
            res.status(400).json({ error: 'Missing plant ID'})
            return;
        }

        const {data: plant, error: plantError} = await supabase
            .from('PlantInfo')
            .select()
            .eq('plantID', plantID)
            .single();
        
        if (plantError) {
            // error retrieving from database
            res.status(400).json({ error: plantError.message });
            return;
        }
        
        if (!plant) {
            // plant does not exist
            res.status(404).json({ error: `Plant ID: ${plantID} is not valid` });
            return;
        }

        // success, plant retrieved
        res.status(200).json({ plant });

    } catch (error) {
        // another unexpected server error
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
};

// Get all plants based on name. Name CAN BE A SUBSTRING of the full name. If name is empty,
// return all plants. Searches based on the common name, NOT the scientific name. 
export async function getPlants(req: Request, res: Response) {
    try {
        // TODO: authentication and authorization

        const { name } = req.query;

        const { data: plants, error: plantsError } = await supabase
            .from('PlantInfo')
            .select()
            .ilike('plantCommonName', `%${name || ''}%`); // Case-insensitive search

        if (plantsError) {
            // Error retrieving from database
            res.status(400).json({ error: plantsError.message });
            return;
        }

        if (!plants || plants.length === 0) {
            // No plants found
            res.status(404).json({ error: 'No plants found' });
            return;
        }

        // Success, plants retrieved
        res.status(200).json({ plants });

    } catch (error) {
        // Another unexpected server error
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
}