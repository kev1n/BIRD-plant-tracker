import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateInput } from '@/components/ui/date-input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { parseDateAsLocal } from '@/lib/date-utils';
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
  const [date, setDate] = useState<Date | null>(new Date());
  const [observations, setObservations] = useState<Observation[]>([]);
  const { user } = useUser();
  const { fetchLatestSnapshot } = useContext(LatestSnapshotContext);
  const { fetchHistoricalSnapshotMetadata } = useContext(HistoricalSnapshotContext);

  useEffect(() => {
    if (snapshotTemplate && newSnapshot === false) {
      setNotes(snapshotTemplate.notes || '');
      setDate(parseDateAsLocal(snapshotTemplate.dateCreated)); // Ensure the date is in the correct format, fallback to empty string if null
    } else {
      setNotes('');
      setDate(new Date());
    }
  }, [snapshotTemplate, newSnapshot]);

  useEffect(() => {
    // Only load observations when editing an existing snapshot (not when creating new or duplicating)
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
    // date should be the current date and time
    setDate(new Date());
    // Copy observations but mark them as new so they get new IDs
    const duplicatedObservations = observationsTemplate.map((obs, index) => ({
      ...obs,
      observationID: -(index + 1), // Use negative temporary IDs for new observations
      snapshotID: -1, // Will be set by backend to the new snapshot ID
      isNew: true, // Mark as new so backend creates new records
      modified: false, // Not modified since it's a new copy
      deletedOn: null,
    }));
    setObservations(duplicatedObservations);
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
    const snapshotData = {
      // Always create a new snapshot for both "new" and "duplicate" operations
      // Only use existing snapshotID when editing (newSnapshot === false and not duplicating)
      snapshotID: newSnapshot ? undefined : (snapshotTemplate?.snapshotID !== -1 ? snapshotTemplate?.snapshotID : undefined),
      dateCreated: date,
      patchID: patchID,
      notes: notes.trim(),
      userID: user.id,
    };
    const validation = snapshotSchema.safeParse(snapshotData);
    if (!validation.success) {
      toast.error('Failed to submit snapshot data due to validation errors. Please check the input and try again.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      
      // Use the new atomic endpoint
      const response = await fetch(`${baseUrl}/snapshot/with-observations`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          snapshot: snapshotData,
          observations: observations,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit snapshot and observations: ${errorText}`);
      }

      const responseData = await response.json();
      toast.success(responseData.message);

      // Reset form and refresh data
      if (newSnapshot) {
        fetchLatestSnapshot(patchID, null);
        fetchHistoricalSnapshotMetadata(patchID);
        setNotes('');
        setDate(new Date());
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
                <Badge className="text-xs" variant="secondary">Required</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DateInput 
                date={date} 
                setDate={(d) => setDate(d)} 
                placeholder="MM/DD/YYYY"
              />
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
