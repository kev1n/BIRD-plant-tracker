import csvParser from 'csv-parser';
import { Request, Response } from 'express';
import { Readable } from 'stream';
import supabase from '../config/supabase.js';
import { CsvError, Plant } from '../types.js';

export async function importPlants(req: Request, res: Response){
  try {
    if (!req.file || !req.file.buffer) {
      res.status(400).json({ error: 'Missing file upload' });
      return;
    }
  
    const stream = Readable.from([ req.file.buffer ]);

    const results: Plant[] = [];
    const errors: CsvError[] = [];

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
            res.status(500).json({ error: error.message });
            return;
          }

          res.status(200).json({
            message: 'Imported successfully',
            imported: results.length,
            failed: errors.length,
            errors
          });
        } catch (err) {
          res.status(500).json({ message: 'Unexpected error', error: err });
          return;
        }
      });


  } catch (error) {
    res.status(500).json({ message: `Internal server error: ${error}` });
    return;
  }
}
