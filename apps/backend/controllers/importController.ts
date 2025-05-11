import csvParser from 'csv-parser';
import { Request, Response } from 'express';
import { Readable } from 'stream';
import supabase from '../config/supabase.js';
import { CsvError, Plant } from '../types.js';

export async function importPlants(req: Request, res: Response){
  try {
    const csvText = req.body;

    if (!csvText || typeof csvText !== 'string') {
      res.status(400).json({ error: 'Invalid CSV content'});
      return;
    }

    const results: Plant[] = [];
    const errors: CsvError[] = [];

    const stream = Readable.from(csvText);

    stream
      .pipe(csvParser())
      .on('data', (row) => {
        try {
          if (!row.plantCommonName){
            throw new Error('Missing required fields');
          }

          const parsedRow: Plant = {
            plantCommonName: row.plantCommonName,
            plantScientificName: row.plantScientificName || null,
            isNative: row.isNative ? (row.isNative.trim().toLowerCase() === "true") : null,
            subcategory: row.subcategory || null,
          };

          results.push(parsedRow);

        } catch (err: any) {
          errors.push({ row, error: err.message });
        }
      })
      .on('end', async () => {
        try {
          const { error } = await supabase
            .from('PlantInfo')
            .insert(results);
          
          if (error) {
            return res.status(500).json({ error: error.message });
          }

          res.status(200).json({
            message: 'Imported successfully',
            imported: results.length,
            failed: errors.length,
            errors
          });
        } catch (err) {
          res.status(500).json({ message: 'Unexpected error', error: err });
        }
      });


  } catch (error) {
    res.status(500).json({ message: `Internal server error: ${error}` });
    return;
  }
}
