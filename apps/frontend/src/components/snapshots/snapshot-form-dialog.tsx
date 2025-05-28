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
import { toast } from 'sonner';
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

  const duplicateLatestData = () => {
    if (!snapshotTemplate) {
      toast.error('No snapshot template to duplicate from');
      return;
    }
    if (!observationsTemplate) {
      toast.error('No observations template to duplicate from');
      return;
    }
    setNotes(snapshotTemplate.notes || '');
    setDate(new Date(snapshotTemplate.dateCreated));
    setObservations(observationsTemplate);
  };

  async function onSubmit() {
    if (!date) {
      toast.error('Please select a date for the snapshot.');
      return;
    }
    if (notes.trim() === '') {
      toast.error('Please enter notes for the snapshot.');
      return;
    }
    if (!user || !user.id) {
      toast.error('You must be logged in to submit a snapshot. Please log in and try again.');
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
      toast.error('Failed to submit snapshot data due to validation errors. Please check the input and try again.');
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
        if (responseData && responseData.snapshotID && responseData.snapshotID.snapshotID) {
          newSnapshotID = responseData.snapshotID.snapshotID;
        } else {
          toast.error('Failed to create a new snapshot. Please try again later or contact support.');
          return;
        }
      }
      const obsPromises = observations.map(obs => {
        if (obs.isNew) {
          return fetch(`${baseUrl}/observation`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              snapshotID: newSnapshot ? newSnapshotID : snapshotTemplate?.snapshotID, // Use the new snapshot ID if creating a new snapshot
              plantQuantity: obs.plantQuantity,
              plantID: obs.PlantInfo.plantID,
              datePlanted: obs.datePlanted || null,
              hasBloomed: obs.hasBloomed !== undefined ? obs.hasBloomed : null, // Ensure this is sent if available
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
              hasBloomed: obs.hasBloomed !== undefined ? obs.hasBloomed : null,
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
              toast.error('One of the observation requests failed to return a response');
              return;
            }
            if (!response.ok) {
              throw new Error('Failed to submit one or more observations');
            }
          });
        })
        .catch(err => {
          toast.error('Failed to submit one or more observations. Please check your input and try again. ' + err);
          return;
        });

      if (newSnapshot) {
        fetchLatestSnapshot(patchID, null);
        setNotes('');
        setDate(null);
        setObservations([]);
      } else {
        fetchLatestSnapshot(patchID, null);
        fetchHistoricalSnapshotMetadata(patchID);
      }
    } catch (error) {
      toast.error('Failed to submit snapshot data. Please try again: ' + error);
      return;
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{newSnapshot ? 'New Snapshot' : 'Edit'}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex flex-row justify-between">
            <div className="flex-1 text-left">
              <DialogTitle>Patch {patchID}</DialogTitle>
              <span>{newSnapshot ? 'New Snapshot' : 'Editing Snapshot'}</span>
              {newSnapshot && (
                <Button className="px-2 text-sm" onClick={duplicateLatestData} variant="secondary">
                  Duplicate Latest Data
                </Button>
              )}
            </div>
            <div className="flex-1 text-right">
              <span className="text-red-500 font-bold">*</span>Snapshot Date:
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
            <Button onClick={onSubmit}>Submit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
