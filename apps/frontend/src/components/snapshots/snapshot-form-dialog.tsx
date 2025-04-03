import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/datepicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useContext, useEffect, useState } from 'react';
import { Observation, Snapshot } from 'types/database_types';
import { z } from 'zod';
import { useUser } from '../../hooks/useUser';
import ObservationsSection from '../observations/observations-section';
import HistoricalSnapshotContext from './historical-snapshot-context';
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
  datePlanted: z.date().optional(),
  dateBloomed: z.date().optional(),
  hasBloomed: z.boolean().optional(),
  deletedOn: z.date().optional(),
});

export default function SnapshotForm({
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
  const { fetchLatestSnapshot } = useContext(LatestSnapshotContext);
  const { fetchHistoricalSnapshotMetadata } = useContext(HistoricalSnapshotContext);

  useEffect(() => {
    if (snapshotTemplate && newSnapshot === false) {
      setNotes(snapshotTemplate.notes || '');
      setDate(new Date(snapshotTemplate.dateCreated)); // Ensure the date is in the correct format, fallback to empty string if null
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
    console.log('Submitting snapshot data:', newSnapshotData);
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
      console.log(
        `Submitting snapshot data to: ${baseUrl}/snapshot/${newSnapshot ? 'oop' : snapshotTemplate?.snapshotID}`
      );
      const api_path =
        baseUrl + (newSnapshot ? '/snapshot/' : `/snapshot/${snapshotTemplate?.snapshotID}`); // Use POST for new, PUT for existing
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

      let newSnapshotID: number | undefined = undefined;
      if (newSnapshot) {
        const responseData = await response.json();
        if (responseData && responseData.data && responseData.data.snapshotID) {
          newSnapshotID = responseData.data.snapshotID;
          console.log('New snapshot created with ID:', newSnapshotID);
        } else {
          console.error('Failed to retrieve new snapshot ID from response:', responseData);
          alert(
            'Failed to create a new snapshot. Please try again later or contact support.'
          );
          return;
        }
      } 
      const obsPromises = observations.map(obs => {
        if (obs.isNew) {
          return fetch(`${baseUrl}/observation/new`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              snapshotID: snapshotTemplate?.snapshotID || newSnapshotID,
              plantQuantity: obs.plantQuantity,
              plantID: obs.PlantInfo.plantID,
              datePlanted: obs.datePlanted || null,
              dateBloomed: obs.dateBloomed || null,
            }),
          });
        } else if (obs.modified) {
          return fetch(`${baseUrl}/observation/${obs.observationID}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              plantQuantity: obs.plantQuantity,
              plantID: obs.PlantInfo.plantID,
              datePlanted: obs.datePlanted || null,
              dateBloomed: obs.dateBloomed || null,
            }),
          });
        } else if (obs.deletedOn) {
          return fetch(`${baseUrl}/observation/${obs.observationID}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      });

      await Promise.all(obsPromises)
        .then(responses => {
          responses.forEach(response => {
            if (!response) {
              console.error('One of the observation requests failed to return a response');
              return;
            }
            if (!response.ok) {
              throw new Error('Failed to submit one or more observations');
            }
          });
        }
      ).catch(err => {
        console.error('Error submitting observations:', err);
        alert(
          'Failed to submit one or more observations. Please check your input and try again.'
        );
        return;
      });

      if (newSnapshot) {
        fetchLatestSnapshot(patchID, null);
        setNotes('');
        setDate(null);
        setObservations([]);
      } else {
        fetchHistoricalSnapshotMetadata(patchID);
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

              <div>
                {date?.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }) || 'No date selected'}
              </div>
              <span>{newSnapshot ? 'New Snapshot' : 'Editing Snapshot'}</span>
            </div>
            <div className="flex-1 text-right">
              Snapshot Date:
              <DatePicker date={date} setDate={d => setDate(d)} pickerName="Select Date" />
            </div>
          </div>
        </DialogHeader>

        <ObservationsSection
          observations={observations}
          editing={true}
          setObservations={setObservations}
        />
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
