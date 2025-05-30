import { Request, Response } from 'express';
import supabase from '../config/supabase.js';
import { UpdatePlantBody } from '../types.js';

export async function postPlant(req: Request, res: Response) {
    try {
        // plant info
        const { plantCommonName, plantScientificName, isNative, subcategory } = req.body;
        if (!plantCommonName) {
            // missing the only required field
            res.status(400).json({ message: 'Bad request: Plant common name is required.'});
            return;
        }

        if (subcategory != null) {
            // ensure we have a valid subcategory
            const {data, error} = await supabase
                .from('ValidSubcategories')
                .select('subcategory')
                .eq('subcategory', subcategory);
            
            if (error) {
                res.status(500).json({ message: 'Server error validating subcategory:', error });
                return;
            }

            if (!data || data.length === 0) {
                // We didn't find a valid subcategory
                res.status(400).json({ 
                    message: 'Bad request: Invalid subcategory'
                });
                return;
            }
        }

        // insert plant
        const { data: plantID, error: plantError } = await supabase
            .from('PlantInfo')
            .insert([
                {
                    plantCommonName: plantCommonName,
                    plantScientificName: plantScientificName || null,
                    isNative: typeof isNative === 'boolean' ? isNative : null,
                    subcategory: subcategory || null,
                },
            ])
            .select('plantID')
            .single();

        if (plantError) {
            // error during insertion
            res.status(400).json({ message: `Bad request: ${plantError.message}` });
            return;
        }

        if (!plantID) {
            // data from insertion is missing
            res.status(400).json({
                message: `Expected plantID from insertion, recieved ${plantID}`
            });
            return;
        }

        res.status(201).json({ 
            message: 'Plant successfully added.', 
            plantID: plantID, 
        });
    } 
    catch (error) {
        res.status(500).json({ message: `Internal server error: ${error}` });
        return;
    }
}

export async function deletePlant(req: Request, res: Response) {
    try {
        const { plantID } = req.params;

        if (!plantID) {
            // plantID not given
            res.status(400).json({ message: 'Missing plant ID.' });
            return;
        }

        const currentTimestampz = new Date().toISOString(); // current time

        const { data, error } = await supabase // find plant to make sure it exists
            .from('PlantInfo')
            .update({ deletedOn: currentTimestampz })
            .eq('plantID', plantID)
            .select();
        
        if (error) {
            // error during soft delete
            res.status(400).json({ error: error.message });
            return;
        }

        if (data.length == 0) {
            // plant does not exist
            res.status(400).json({ error: `Plant ID: ${plantID} is not valid` });
            return;
        }

        res.status(200).json({
            message: 'Plant deleted successfully',
            deletedOn: currentTimestampz,
        });

    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
}

export async function updatePlant(req: Request, res: Response) {
    try {
        const { plantID } = req.params;
        const { plantCommonName, plantScientificName, isNative, subcategory } = req.body;

        if (!plantID) {
            // missing path param or required name field
            res.status(400).json({ message: 'Missing plant ID' });
            return;
        }

        if (subcategory != null) {
            // ensure we have a valid subcategory
            const {data, error} = await supabase
                .from('ValidSubcategories')
                .select('subcategory')
                .eq('subcategory', subcategory);
            
            if (error) {
                res.status(500).json({ message: 'Server error validating subcategory:', error });
                return;
            }

            if (!data || data.length === 0) {
                // We didn't find a valid subcategory
                res.status(400).json({ 
                    message: 'Bad request: Invalid subcategory'
                });
                return;
            }
        }

        // only update provided values
        const updates: UpdatePlantBody = Object.fromEntries(
            Object.entries({ plantCommonName, plantScientificName, isNative, subcategory })
                .filter(([_, value]) => value !== undefined)
        );

        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: 'No fields provided to update' });
            return;
        }

        const { data, error} = await supabase
            .from('PlantInfo')
            .update(updates)
            .eq('plantID', plantID)
            .select()
            .single();

        if (error) {
            res.status(400).json({ error: error.message });
            return;
        }

        if (!data || data.length === 0) {
            // data is null if no row is updated or found
            res.status(404).json({ error: 'No matching row updated' });
            return;
        }

        res.status(200).json({ message: 'Plant updated successfully '});
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
}

export async function getPlant(req: Request, res: Response) {
    try {
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
            .is('deletedOn', null) 
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

export async function getPlantName(req: Request, res: Response) {
    try {
        const {plantCommonName} = req.params;

        if (!plantCommonName) {
            // if plantname not passed
            res.status(400).json({ error: 'Missing plant ID'})
            return;
        }

        const {data: plant, error: plantError} = await supabase
            .from('PlantInfo')
            .select()
            .eq('plantCommonName', plantCommonName)
            .single();
        
        if (plantError) {
            // error retrieving from database
            res.status(400).json({ error: plantError.message });
            return;
        }
        
        if (!plant) {
            // plant does not exist
            res.status(404).json({ error: `Plant: ${plantCommonName} is not valid` });
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
        const { name } = req.query;

        const { data: plants, error: plantsError } = await supabase
            .from('PlantInfo')
            .select()
            .ilike('plantCommonName', `%${name || ''}%`)
            .is('deletedOn', null); // Case-insensitive search

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
