import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ReactNode, useState } from 'react';
import { Observation } from 'types/database_types';
import ObservationForm from './observation-form';

export default function ObservationFormDialog({
  newObservation,
  observation,
  submitCallback,
  trigger,
}: {
  observation?: Observation;
  newObservation: boolean;
  submitCallback: (observation: Observation) => void;
  trigger?: ReactNode;
}) {
  const [open, setopen] = useState(false);

  const defaultTrigger = (
    <Button variant={newObservation ? 'outline' : 'ghost'}>
      {newObservation ? (
        'New Observation'
      ) : (
        <img src="/icons/pen.svg" className="w-4 h-4" alt="Edit" />
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setopen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>

      <DialogContent className="overflow-y-scroll max-h-[80vh]">
        <DialogHeader>
          {newObservation ? (
            <DialogTitle>New Observation</DialogTitle>
          ) : (
            <DialogTitle>Edit Observation</DialogTitle>
          )}
        </DialogHeader>

        <ObservationForm
          observation={observation} // Pass the existing observation if editing
          submitCallback={values => {
            submitCallback(values); // Call the provided submit callback
            setopen(false); // Close the dialog after submission
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
