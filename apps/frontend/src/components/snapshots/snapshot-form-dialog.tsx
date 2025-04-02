import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/datepicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useEffect, useState , useContext} from 'react';
import { useUser } from '../../hooks/useUser';
import { Observation, Snapshot } from 'types/database_types';
import ObservationsSection from '../observations/observations-section';
import { z } from 'zod';
import LatestSnapshotContext from './latest-snapshot-context';

const snapshotSchema = z.object({
  snapshotID: z.number().optional(),
  dateCreated: z.date(),
  patchID: z.string(),
  notes: z.string(),
  userID: z.string().optional(),
});

const observationSchema = z.object({
  observationID: z.number().optional(),
  snapshotID: z.number(),
  PlantID: z.number(),
  plantQuantity: z.number().int().min(1, 'Plant quantity must be at least 1'),
  soilType: z.string().optional(),
  datePlanted: z.date().optional(),
  dateBloomed: z.date().optional(),
  hasBloomed: z.boolean().optional(),
  deletedOn: z.date().optional(),
});

export default function SnapshotFormDialog({
  newSnapshot,
  patchID,
  snapshotTemplate,
  observationsTemplate,
}: {
  newSnapshot: boolean;
  patchID: string;
  snapshotTemplate?: Snapshot | null;
  observationsTemplate?: Observation[] | null;
}) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<Date | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const { user } = useUser();
  const {fetchLatestSnapshot} = useContext(LatestSnapshotContext);

  useEffect(() => {
    if (snapshotTemplate && newSnapshot === false) {
      setNotes(snapshotTemplate.notes || '');
      setDate(new Date(snapshotTemplate.dateCreated));
    } else {
      setNotes('');
      setDate(null);
    }
  }, [snapshotTemplate, newSnapshot]);

  useEffect(() => {
    if (observationsTemplate && newSnapshot === false) {
      setObservations(observationsTemplate);
    } else {
      setObservations([]);
    }
  }, [observationsTemplate, newSnapshot]);

  async function onSubmit() {
    if (!date) {
      alert('Please select a date for the snapshot.');
      return;
    }
    if (notes.trim() === '') {
      alert('Please enter notes for the snapshot.');
      return;
    }
    if (!user || !user.id) {
      console.error('User is not authenticated or missing user ID.');
      alert('You must be logged in to submit a snapshot. Please log in and try again.');
      return;
    }
    const newSnapshotData: Snapshot = {
      snapshotID: snapshotTemplate ? snapshotTemplate.snapshotID : undefined,
      dateCreated: date,
      patchID: patchID,
      notes: notes.trim(),
      userID: user.id,
    };

    const validation = snapshotSchema.safeParse(newSnapshotData);
    if (!validation.success) {
      console.error('Snapshot validation failed:', validation.error);
      alert(
        'Failed to submit snapshot data due to validation errors. Please check the input and try again.'
      );
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const api_path =
        baseUrl + (newSnapshotData ? '/snapshot/' : `/snapshot/${snapshotTemplate?.snapshotID}`);
      const response = await fetch(api_path, {
        method: newSnapshot ? 'POST' : 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSnapshotData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit snapshot data');
      }

      if (newSnapshot) {
        const obsPromises = observations.map(obs => {
          return fetch(`${baseUrl}/observation/new`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              snapshotID: newSnapshotData.snapshotID,
              plantQuantity: obs.plantQuantity,
              plantID: obs.PlantInfo.plantID,
              soilType: obs.soilType || null,
              datePlanted: obs.datePlanted || null,
              dateBloomed: obs.dateBloomed || null,
            }),
          });
        });

        return Promise.all(obsPromises)
          .then(() =>{
            fetchLatestSnapshot(patchID, null);
            setNotes(''); 
            setDate(null);
            setObservations([]);
            setOpen(false)
          })
          .catch(err => {
            console.error('Error submitting observations:', err);
            alert('Failed to submit some observations. Please try again.');
          });
      }
    } catch (error) {
      console.error('Error submitting snapshot data:', error);
      alert('Failed to submit snapshot data. Please try again.');
      return;
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{newSnapshot ? 'New Snapshot' : 'Edit'}</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex flex-row justify-between">
            <div className="flex-1 text-left">
              <DialogTitle>Patch {patchID}</DialogTitle>
              <span>New Snapshot!</span>
            </div>
            <div className="flex-1 text-right">
              Snapshot Date:
              <DatePicker date={date} setDate={d => setDate(d)} pickerName="Select Date" />
            </div>
          </div>
        </DialogHeader>

        <ObservationsSection observations={observations} editing={false} />

        <div className="border border-gray-300 rounded-lg p-4">
          <textarea
            className="w-full h-24"
            placeholder={'Notes about this snapshot...'}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex-1 text-left">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
          <div className="flex-1 text-right">
            <Button variant="outline" onClick={onSubmit}>
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
