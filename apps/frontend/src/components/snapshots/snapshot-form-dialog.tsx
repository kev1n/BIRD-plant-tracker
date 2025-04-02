import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/datepicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { Observation, Snapshot } from 'types/database_types';
import SnapshotObservation from './snapshot-plant-information';


export default function SnapshotFormDialog({
    newSnapshot,
    patchID,
    snapshotTemplate,
    observationsTemplate,
} :{
    newSnapshot: boolean;
    patchID: string;
    snapshotTemplate?: Snapshot | null;
    observationsTemplate?: Observation[] | null;
}){
  const [open, setOpen ] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<Date|null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  
    useEffect(() => {
        if (snapshotTemplate) {
        setNotes(snapshotTemplate.notes || '');
        setDate(new Date(snapshotTemplate.dateCreated));
        }else {
            setNotes('');
            setDate(null);
        }
    }, [snapshotTemplate]);

    useEffect(() => {
        if (observationsTemplate) {
            setObservations(observationsTemplate);
        } else {
            setObservations([]);
        }
    }, [observationsTemplate]);

  function onSubmit() {
    if (!date) {
      alert("Please select a date for the snapshot.");
      return;
    }
    if (notes.trim() === '') {
      alert("Please enter notes for the snapshot.");
      return;
    }
    
    // Create a new snapshot object
    const newSnapshotData: Snapshot = {
      snapshotID: snapshotTemplate ? snapshotTemplate.snapshotID : '',
      dateCreated: date,
      patchID: patchID,
      notes: notes.trim(),
      userID: '', // Assuming userID is handled elsewhere
    };
    try{
        const token = localStorage.getItem('authToken');
        const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
        const api_path = baseUrl + (newSnapshot ? '/snapshot/new' : `/snapshot/${snapshotTemplate?.snapshotID}`);
        const response = fetch(api_path, {
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
        console.log("Snapshot data submitted successfully.");
        // If it's a new snapshot, we need to handle observations as well
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
                        plantID: obs.plantID,
                        soilType: obs.soilType || null,
                        datePlanted: obs.datePlanted || null,
                        dateBloomed: obs.dateBloomed || null,
                    }),
                });
            });

            return Promise.all(obsPromises)
                .then(() => console.log("All observations submitted successfully."))
                .catch(err => {
                    console.error("Error submitting observations:", err);
                    alert("Failed to submit some observations. Please try again.");
                });
        }
        console.log("All snapshot and observation data submitted successfully.");
        // If not a new snapshot, we just need to close the dialog
    }catch (error) {
      console.error("Error submitting snapshot data:", error);
      alert("Failed to submit snapshot data. Please try again.");
      return;
    }
    

    submit_callback(patchID, newSnapshot ? null : snapshotTemplate?.snapshotID || '');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{newSnapshot ? 'New Snapshot' : 'Editing Snapshot'}</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex flex-row justify-between">
            <div className="flex-1 text-left">
              <DialogTitle>Patch {patchID}</DialogTitle>
            </div>
            <div className="flex-1 text-right">
              Snapshot Date:
              <DatePicker date={date} setDate={d => setDate(d)} pickerName="Select Date" />
            </div>
          </div>
        </DialogHeader>

        <SnapshotObservation
          observations={observations}
          editing={true}
        />

        <div className="border border-gray-300 rounded-lg p-4">
          <textarea
            className="w-full h-24"
            placeholder={ "Notes about this snapshot..."}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
};