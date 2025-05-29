import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DatePicker from '@/components/ui/datepicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, Copy, FileText } from 'lucide-react';
import { ReactNode, useContext, useEffect, useState } from 'react';
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
  trigger,
}: {
  newSnapshot: boolean;
  patchID: string;
  snapshotTemplate?: Snapshot | null;
  observationsTemplate?: Observation[] | null;
  trigger?: ReactNode;
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
    if (!user || !user.id) {
      toast.error('You must be logged in to submit a snapshot. Please log in and try again.');
      return;
    }
    const newSnapshotData: Snapshot = {
      snapshotID: snapshotTemplate && snapshotTemplate.snapshotID!=-1 ? snapshotTemplate.snapshotID : undefined,
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
        {trigger || <Button variant={newSnapshot ? 'default' : 'outline'}>{newSnapshot ? 'New Snapshot' : 'Edit'}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{newSnapshot ? 'New Snapshot' : 'Edit Snapshot'}</DialogTitle>
              <p className="text-muted-foreground">Patch {patchID}</p>
            </div>
            {newSnapshot && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={duplicateLatestData}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicate Latest Data
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base justify-between">
                <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Snapshot Date
                </div>
                <Badge className="text-xs">Required</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DatePicker date={date} setDate={d => setDate(d)} pickerName="Select Date" />
            </CardContent>
          </Card>

          {/* Plant Observations */}
          <ObservationsSection
            observations={observations}
            editing={true}
            setObservations={setObservations}
          />

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notes
                </div>  
                <Badge className="text-xs">Required</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full min-h-24 p-3 border border-border rounded-md resize-vertical"
                placeholder="Enter notes about this snapshot..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit}>
              {newSnapshot ? 'Create Snapshot' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
