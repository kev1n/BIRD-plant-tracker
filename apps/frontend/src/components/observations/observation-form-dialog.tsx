import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Observation } from 'types/database_types';
import ObservationForm from './observation-form';

export default function ObservationFormDialog({
  newObservation,
  observation,
  submitCallback,
}: {
  observation?: Observation;
  newObservation: boolean;
  submitCallback: (observation: Observation) => void;
}) {
  const [open, setopen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setopen}>
      <DialogTrigger asChild>
        <Button variant="outline">{newObservation ? 'New Plant' : 'Editing Plant'}</Button>
      </DialogTrigger>

      <DialogContent className="overflow-y-scroll max-h-[80vh]">
        <DialogHeader>
          {newObservation ? (
            <DialogTitle>New Plant</DialogTitle>
          ) : (
            <DialogTitle>Editing Plant</DialogTitle>
          )}
        </DialogHeader>

        <ObservationForm 
          observation={observation} // Pass the existing observation if editing
          submissionCallback={
            (obs: Observation) => {
              submitCallback(obs); // Call the parent callback with the new/updated observation
              setopen(false); // Close the dialog after submission
            }
          }
        />
      </DialogContent>
    </Dialog>
  );
}
